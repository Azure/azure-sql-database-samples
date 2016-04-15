//---------------------------------------------------------------------------------------------------------------------------------
// File: OdbcOperation.cpp
// Contents: Functions called by thread queue for background ODBC operations
// 
// Copyright Microsoft Corporation and contributors
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
//
// You may obtain a copy of the License at:
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//---------------------------------------------------------------------------------------------------------------------------------

#include "stdafx.h"
#include "OdbcOperation.h"
#include "OdbcConnection.h"

#include <limits>
#include <ctime>

// undo these tokens to use numeric_limits below
#undef min
#undef max

namespace mssql
{
    // default precision and scale for date/time parameters
    // (This may be updated for older server since they don't have as high a precision)
    const int SQL_SERVER_2008_DEFAULT_DATETIME_PRECISION = 34;
    const int SQL_SERVER_2008_DEFAULT_DATETIME_SCALE = 7;

    void OdbcOperation::InvokeBackground()
    {
        failed = !TryInvokeOdbc();

        if( failed ) {

            failure = connection->LastError();
        }
    }

    void OdbcOperation::CompleteForeground()
    {
        HandleScope scope;

        if (!callback->IsUndefined())
        {
            int argc;
            Local<Value> args[3];
            if( failed )
            {
                Local<Object> err = Local<Object>::Cast( Exception::Error( String::New( failure->Message() )));
                err->Set( String::NewSymbol( "sqlstate" ), String::New( failure->SqlState() ));
                err->Set( String::NewSymbol( "code" ), Integer::New( failure->Code() ));
                args[0] = err;
                argc = 1;
            }
            else
            {
                args[0] = Local<Value>::New( Boolean::New( false ));
                args[1] = Local<Value>::New( CreateCompletionArg() );
                argc = 2;
            }

			//DMGambone: Implementing the fix that clintwood documented
			//for issue #62 - Debugging query callback with node-inspector!
			//The original line:
			//  callback->Call(Undefined().As<Object>(), argc, args);
			//causes node-inspector to crash if breakpoints are added in any
			//query callback function
			callback->Call(Context::GetCurrent()->Global(), argc, args);
        }
    }

    bool OpenOperation::TryInvokeOdbc()
    {
        return connection->TryOpen(connectionString);
    }

    Handle<Value> OpenOperation::CreateCompletionArg()
    {
        HandleScope scope;
        return scope.Close(backpointer);
    }


    QueryOperation::QueryOperation(shared_ptr<OdbcConnection> connection, const wstring& query, Handle<Object> callback) :
        OdbcOperation(connection, callback), 
        query(query)
    {
    }

    bool QueryOperation::BindParameters( Handle<Array> node_params )
    {
        uint32_t count = node_params->Length();

        if( count > 0 ) {

            for( uint32_t i = 0; i < count; ++i ) {

                Local<Value> p = node_params->Get( i );
                ParamBinding binding;

                if( p->IsNull() ) {

                    binding.c_type = SQL_C_CHAR;
                    binding.sql_type = SQL_CHAR;
                    binding.param_size = 1;
                    binding.digits = 0;
                    binding.buffer = NULL;
                    binding.buffer_len = 0;
                    binding.indptr = SQL_NULL_DATA;
                }
                else if( p->IsString() ) {

                    binding.c_type = SQL_C_WCHAR;
                    binding.sql_type = SQL_WVARCHAR;
                    Local<String> str_param = p->ToString();
                    int str_len = str_param->Length();
                    binding.buffer = new uint16_t[ str_len + 1 ];   // null terminator
                    str_param->Write( static_cast<uint16_t*>( binding.buffer ));
                    if( str_len > 4000 ) {
                        binding.param_size = 0;     // max types require 0 precision
                    }
                    else {
                        binding.param_size = str_len;
                    }
                    binding.buffer_len = str_len * sizeof( uint16_t );
                    binding.digits = 0;
                    binding.indptr = binding.buffer_len;
                }
                else if( p->IsBoolean() ) {
                    
                    binding.c_type = SQL_C_BIT;
                    binding.sql_type = SQL_BIT;
                    binding.buffer = new uint16_t;
                    binding.buffer_len = sizeof( uint16_t );
                    *static_cast<uint16_t*>( binding.buffer ) = p->BooleanValue();
                    binding.param_size = 1;
                    binding.digits = 0;
                    binding.indptr = binding.buffer_len;
                }
                else if( p->IsInt32()) {

                    binding.c_type = SQL_C_SLONG;
                    binding.sql_type = SQL_INTEGER;
                    binding.buffer = new int32_t;
                    binding.buffer_len = sizeof( int32_t );
                    *static_cast<int32_t*>( binding.buffer ) = p->Int32Value();
                    binding.param_size = sizeof( int32_t );
                    binding.digits = 0;
                    binding.indptr = binding.buffer_len;
                }
                else if( p->IsUint32()) {

                    binding.c_type = SQL_C_ULONG;
                    binding.sql_type = SQL_BIGINT;
                    binding.buffer = new uint32_t;
                    binding.buffer_len = sizeof( uint32_t );
                    *static_cast<int32_t*>( binding.buffer ) = p->Uint32Value();
                    binding.param_size = sizeof( uint32_t );
                    binding.digits = 0;
                    binding.indptr = binding.buffer_len;
                }
                else if( p->IsNumber()) {

                    // numbers can be either integers or doubles.  We attempt to determine which it is through a simple
                    // cast and equality check
                    double d = p->NumberValue();
                    if( _isnan( d ) || !_finite( d ) ) {

                        params.clear();

                        int argc = 1;
                        Local<Value> args[1];
                        args[0] = Exception::Error( String::New( "IMNOD: [msnodesql]Invalid number parameter" ) );

                        // this is okay because we're still on the node.js thread, not on the background thread
                        callback->Call(Undefined().As<Object>(), argc, args);

                        return false;
                    }
                    else if( d == floor( d ) && 
                             d >= std::numeric_limits<int64_t>::min() && 
                             d <= std::numeric_limits<int64_t>::max() ) {

                        binding.c_type = SQL_C_SBIGINT;
                        binding.sql_type = SQL_BIGINT;
                        binding.buffer = new int64_t;
                        binding.buffer_len = sizeof( int64_t );
                        *static_cast<int64_t*>( binding.buffer ) = p->IntegerValue();
                        binding.param_size = sizeof( int64_t );
                        binding.digits = 0;
                        binding.indptr = binding.buffer_len;
                    }
                    else {

                        binding.c_type = SQL_C_DOUBLE;
                        binding.sql_type = SQL_DOUBLE;
                        binding.buffer = new double;
                        binding.buffer_len = sizeof( double );
                        *static_cast<double*>( binding.buffer ) = p->NumberValue();
                        binding.param_size = sizeof( double );
                        binding.digits = 0;
                        binding.indptr = binding.buffer_len;
                    }
                }
                else if( p->IsDate() ) {

                    // Since JS dates have no timezone context, all dates are assumed to be UTC
                    struct tm tm;
                    Handle<Date> dateObject = Handle<Date>::Cast<Value>( p );
                    assert( !dateObject.IsEmpty() );
                    // dates in JS are stored internally as ms count from Jan 1, 1970
                    double d = dateObject->NumberValue();
                    SQL_SS_TIMESTAMPOFFSET_STRUCT* sql_tm = new SQL_SS_TIMESTAMPOFFSET_STRUCT;
                    TimestampColumn sql_date( d );
                    sql_date.ToTimestampOffset( *sql_tm );

                    binding.c_type = SQL_C_BINARY;
                    // TODO: Determine proper SQL type based on version of server we're talking to
                    binding.sql_type = SQL_SS_TIMESTAMPOFFSET;
                    binding.buffer = sql_tm;
                    binding.buffer_len = sizeof( SQL_SS_TIMESTAMPOFFSET_STRUCT );
                    // TODO: Determine proper precision and size based on version of server we're talking to
                    binding.param_size = SQL_SERVER_2008_DEFAULT_DATETIME_PRECISION;
                    binding.digits = SQL_SERVER_2008_DEFAULT_DATETIME_SCALE;
                    binding.indptr = binding.buffer_len;
                }
                else {

                    params.clear();

                    int argc = 2;
                    Local<Value> args[2];
                    args[0] = Local<Value>::New(Boolean::New(true));
                    // TODO: Change this to return an object with 3 keys, message, sqlstate and code from the OdbcError
                    args[1] = Exception::Error( String::New( "IMNOD: [msnodesql]Invalid parameter type" ) );

                    // this is okay because we're still on the node.js thread, not on the background thread
                    callback->Call(Undefined().As<Object>(), argc, args);

                    return false;
                }

                params.push_back( move( binding ));
            }
        }

        return true;
    }

    bool QueryOperation::TryInvokeOdbc()
    {
        return connection->TryExecute( query, params );
    }

    Handle<Value> QueryOperation::CreateCompletionArg()
    {
        HandleScope scope;
        return scope.Close(connection->GetMetaValue());
    }

    bool ReadRowOperation::TryInvokeOdbc()
    {
        return connection->TryReadRow();
    }

    Handle<Value> ReadRowOperation::CreateCompletionArg()
    {
        HandleScope scope;
        return scope.Close(connection->EndOfRows());
    }

    bool ReadColumnOperation::TryInvokeOdbc()
    {
        return connection->TryReadColumn(column);
    }

    Handle<Value> ReadColumnOperation::CreateCompletionArg()
    {
        HandleScope scope;
        return scope.Close(connection->GetColumnValue());
    }

    bool ReadNextResultOperation::TryInvokeOdbc()
    {
        return connection->TryReadNextResult();
    }

    Handle<Value> ReadNextResultOperation::CreateCompletionArg()
    {
        HandleScope scope;

        Local<Object> more_meta = Object::New();

        more_meta->Set( String::NewSymbol( "endOfResults" ), connection->EndOfResults() );
        more_meta->Set( String::NewSymbol( "meta" ), connection->GetMetaValue() );

        return scope.Close( more_meta );
    }

    bool CloseOperation::TryInvokeOdbc()
    {
        return connection->TryClose();
    }

    Handle<Value> CloseOperation::CreateCompletionArg()
    {
        HandleScope scope;
        return scope.Close( Undefined() );
    }

    bool CollectOperation::TryInvokeOdbc()
    {
        return connection->TryClose();
    }

    Handle<Value> CollectOperation::CreateCompletionArg()
    {
        assert( false );
        HandleScope scope;
        return scope.Close( Undefined() );
    }

    // override to not call a callback
    void CollectOperation::CompleteForeground()
    {
    }

    bool BeginTranOperation::TryInvokeOdbc()
    {
        return connection->TryBeginTran();
    }

    Handle<Value> BeginTranOperation::CreateCompletionArg()
    {
        HandleScope scope;
        return scope.Close( Undefined() );
    }

    bool EndTranOperation::TryInvokeOdbc()
    {
        return connection->TryEndTran(completionType);
    }

    Handle<Value> EndTranOperation::CreateCompletionArg()
    {
        HandleScope scope;
        return scope.Close( Undefined() );
    }

}
