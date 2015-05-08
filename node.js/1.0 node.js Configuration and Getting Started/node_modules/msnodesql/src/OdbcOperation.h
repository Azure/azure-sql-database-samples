//---------------------------------------------------------------------------------------------------------------------------------
// File: OdbcOperation.h
// Contents: ODBC Operation objects called on background thread
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

#pragma once

#include "Operation.h"

#include <list>

namespace mssql
{
    using namespace std;
    using namespace v8;

    class OdbcConnection;

    class OdbcOperation : public Operation
    {

    protected:

        shared_ptr<OdbcConnection> connection;
        Persistent<Function> callback;

    private:

        bool failed;
        shared_ptr<OdbcError> failure;

    public:

        OdbcOperation(shared_ptr<OdbcConnection> connection, Handle<Object> callback)
            : connection(connection), 
              callback(Persistent<Function>::New(callback.As<Function>())),
              failed(false),
              failure(nullptr)
        {
        }

        virtual ~OdbcOperation()
        {
            callback.Dispose();
        }
 
        virtual bool TryInvokeOdbc() = 0;
        virtual Handle<Value> CreateCompletionArg() = 0;

        void InvokeBackground() override;
        void CompleteForeground() override;
    };

    class OpenOperation : public OdbcOperation
    {
    private:
        wstring connectionString;
        Persistent<Object> backpointer;

    public:
        OpenOperation(shared_ptr<OdbcConnection> connection, const wstring& connectionString, Handle<Object> callback, 
                      Handle<Object> backpointer)
            : OdbcOperation(connection, callback), 
              connectionString(connectionString), 
              backpointer(Persistent<Object>::New(backpointer))
        {
        }

        virtual ~OpenOperation( void )
        {
            backpointer.Dispose();
        }

        bool TryInvokeOdbc() override;

        Handle<Value> CreateCompletionArg() override;
    };
    
    class QueryOperation : public OdbcOperation
    {
    public:

        struct ParamBinding {

            SQLSMALLINT c_type;
            SQLSMALLINT sql_type;
            SQLULEN param_size;
            SQLSMALLINT digits;
            SQLPOINTER buffer;
            SQLLEN buffer_len;
            SQLLEN indptr;

            ParamBinding( void ) :
                buffer( NULL ),
                buffer_len( 0 ),
                digits( 0 ),
                indptr( SQL_NULL_DATA )
            {
            }

            ~ParamBinding()
            {
                if( c_type == SQL_C_WCHAR )  {
                    delete [] buffer;
                }
                else {
                    delete buffer;
                }
            }

            ParamBinding( ParamBinding&& other )
            {
                c_type = other.c_type;
                sql_type = other.sql_type;
                param_size = other.param_size;
                digits = other.digits;
                buffer = other.buffer;
                buffer_len = other.buffer_len;
                indptr = other.indptr;

                other.buffer = NULL;
                other.buffer_len = 0;
            }

        };

        typedef std::list<ParamBinding> param_bindings; // list because we only insert and traverse in-order

        QueryOperation(shared_ptr<OdbcConnection> connection, const wstring& query, Handle<Object> callback);

        bool BindParameters( Handle<Array> node_params );                      

        bool TryInvokeOdbc() override;

        Handle<Value> CreateCompletionArg() override;

    private:

        wstring query;

        param_bindings params;
    };
    
    class ReadRowOperation : public OdbcOperation
    {
    public:

        ReadRowOperation(shared_ptr<OdbcConnection> connection, Handle<Object> callback)
            : OdbcOperation(connection, callback)
        {
        }

        bool TryInvokeOdbc() override;

        Handle<Value> CreateCompletionArg() override;
    };
    
    class ReadColumnOperation : public OdbcOperation
    {
    private:

        int column;

    public:

        ReadColumnOperation(shared_ptr<OdbcConnection> connection, int column, Handle<Object> callback)
            : OdbcOperation(connection, callback),
              column(column)
        {
        }

        bool TryInvokeOdbc() override;

        Handle<Value> CreateCompletionArg() override;
    };
    
    class ReadNextResultOperation : public OdbcOperation
    {
    public:
        ReadNextResultOperation(shared_ptr<OdbcConnection> connection, Handle<Object> callback)
            : OdbcOperation(connection, callback)
        {
        }

        bool TryInvokeOdbc() override;

        Handle<Value> CreateCompletionArg() override;
    };

    class CloseOperation : public OdbcOperation
    {
    public:
        CloseOperation(shared_ptr<OdbcConnection> connection, Handle<Object> callback)
            : OdbcOperation(connection, callback)
        {
        }

        bool TryInvokeOdbc() override;

        Handle<Value> CreateCompletionArg() override;
    };

    class CollectOperation : public OdbcOperation
    {
    public:
        CollectOperation(shared_ptr<OdbcConnection> connection)
            : OdbcOperation(connection, Handle<Object>())
        {
        }

        bool TryInvokeOdbc() override;

        Handle<Value> CreateCompletionArg() override;

        // override to not call a callback
        void CompleteForeground() override;
    };

    class BeginTranOperation : public OdbcOperation
    {
    public:
        BeginTranOperation(shared_ptr<OdbcConnection> connection, Handle<Object> callback )
            : OdbcOperation(connection, callback)
        {
        }

        bool TryInvokeOdbc() override;

        Handle<Value> CreateCompletionArg() override;
    };

    class EndTranOperation : public OdbcOperation
    {
    private:

        SQLSMALLINT completionType;

    public:
        EndTranOperation(shared_ptr<OdbcConnection> connection, SQLSMALLINT completionType, Handle<Object> callback)
            : OdbcOperation(connection, callback), 
              completionType(completionType)
        {
        }

        bool TryInvokeOdbc() override;

        Handle<Value> CreateCompletionArg() override;
    };
}

