//---------------------------------------------------------------------------------------------------------------------------------
// File: OdbcConnection.cpp
// Contents: Async calls to ODBC done in background thread
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
#include "OdbcConnection.h"

#pragma intrinsic( memset )

// convenient macro to set the error for the handle and return false
#define RETURN_ODBC_ERROR( handle )                         \
    {                                                       \
        error = handle.LastError(); \
        handle.Free();                                      \
        return false;                                       \
    }

// boilerplate macro for checking for ODBC errors in this file
#define CHECK_ODBC_ERROR( r, handle ) { if( !SQL_SUCCEEDED( r ) ) { RETURN_ODBC_ERROR( handle ); } }

// boilerplate macro for checking if SQL_NO_DATA was returned for field data
#define CHECK_ODBC_NO_DATA( r, handle ) {                                                                 \
    if( r == SQL_NO_DATA ) {                                                                              \
        error = make_shared<OdbcError>( OdbcError::NODE_SQL_NO_DATA.SqlState(), OdbcError::NODE_SQL_NO_DATA.Message(), \
            OdbcError::NODE_SQL_NO_DATA.Code() );                                                         \
        handle.Free();                                                                                    \
        return false;                                                                                     \
     } }

// to use with numeric_limits below
#undef max

namespace mssql
{
    // internal constants
    namespace {

        // max characters within a (var)char field in SQL Server
        const int SQL_SERVER_MAX_STRING_SIZE = 8000;

        // default size to retrieve from a LOB field and we don't know the size
        const int LOB_PACKET_SIZE = 8192;
    }

    OdbcEnvironmentHandle OdbcConnection::environment;

    // bind all the parameters in the array
    // for now they are all treated as input parameters
    bool OdbcConnection::BindParams( QueryOperation::param_bindings& params )
    {
        int current_param = 1;
        for( QueryOperation::param_bindings::iterator i = params.begin(); i != params.end(); ++i ) {

            SQLRETURN r = SQLBindParameter( statement, current_param++, SQL_PARAM_INPUT, i->c_type, i->sql_type, i->param_size, 
                                            i->digits, i->buffer, i->buffer_len, &i->indptr );
            // no need to check for SQL_STILL_EXECUTING
            CHECK_ODBC_ERROR( r, statement );
        }

        return true;
    }

    bool OdbcConnection::InitializeEnvironment()
    {
        SQLRETURN ret = SQLSetEnvAttr(NULL, SQL_ATTR_CONNECTION_POOLING, (SQLPOINTER)SQL_CP_ONE_PER_HENV, 0);
        if (!SQL_SUCCEEDED(ret)) { return false; }

        if( !environment.Alloc() ) { return false; }

        ret = SQLSetEnvAttr(environment, SQL_ATTR_ODBC_VERSION, (SQLPOINTER)SQL_OV_ODBC3, 0);
        if (!SQL_SUCCEEDED(ret)) { return false; }
        ret = SQLSetEnvAttr(environment, SQL_ATTR_CP_MATCH, (SQLPOINTER)SQL_CP_RELAXED_MATCH, 0);
        if (!SQL_SUCCEEDED(ret)) { return false; }

        return true;
    }

    bool OdbcConnection::StartReadingResults()
    {
        SQLSMALLINT columns;
        SQLRETURN ret = SQLNumResultCols(statement, &columns);
        CHECK_ODBC_ERROR( ret, statement );

        column = 0;
        resultset = make_shared<ResultSet>(columns);

        while (column < resultset->GetColumns())
        {
            SQLSMALLINT nameLength;
            ret = SQLDescribeCol(statement, column + 1, nullptr, 0, &nameLength, nullptr, nullptr, nullptr, nullptr);
            CHECK_ODBC_ERROR( ret, statement );

            ResultSet::ColumnDefinition& current = resultset->GetMetadata(column);
            vector<wchar_t> buffer(nameLength+1);
            ret = SQLDescribeCol(statement, column + 1, buffer.data(), nameLength+1, &nameLength, &current.dataType, &current.columnSize, &current.decimalDigits, &current.nullable);
            CHECK_ODBC_ERROR( ret, statement );

            current.name = wstring(buffer.data(), nameLength);

            column++;
        }

        ret = SQLRowCount(statement, &resultset->rowcount);
        CHECK_ODBC_ERROR( ret, statement );

        return true;
    }

    bool OdbcConnection::TryClose()
    {
        if (connectionState != Closed)  // fast fail before critical section
        {
            ScopedCriticalSectionLock critSecLock( closeCriticalSection );
            if (connectionState != Closed)
            {
                SQLDisconnect(connection);

                resultset.reset();
                statement.Free();
                connection.Free();
                connectionState = Closed;
            }
        }

        return true;
    }

    bool OdbcConnection::TryOpen(const wstring& connectionString)
    {
        SQLRETURN ret;

        assert(connectionState == Closed );

        OdbcConnectionHandle localConnection;

        if( !localConnection.Alloc(environment) ) { RETURN_ODBC_ERROR( environment ); }

        this->connection = std::move(localConnection);

        ret = SQLDriverConnect(connection, NULL, const_cast<wchar_t*>(connectionString.c_str()), connectionString.length(), NULL, 0, NULL, SQL_DRIVER_NOPROMPT);
        CHECK_ODBC_ERROR( ret, connection );

        connectionState = Open;
        return true;
    }

    bool OdbcConnection::TryExecute( const wstring& query, QueryOperation::param_bindings& paramIt )
    {
        assert( connectionState == Open );

        // if the statement isn't already allocated
        if( !statement )
        {
            // allocate it
            if( !statement.Alloc(connection) ) { RETURN_ODBC_ERROR( connection ); }

        }

        bool bound = BindParams( paramIt );
        if( !bound ) {
            // error already set in BindParams
            return false;
        }

        endOfResults = true;     // reset 
        column = 0;

        SQLRETURN ret = SQLExecDirect(statement, const_cast<wchar_t*>(query.c_str()), query.length());
        if (ret != SQL_NO_DATA && !SQL_SUCCEEDED(ret)) 
        { 
            resultset = make_shared<ResultSet>(0);
            resultset->endOfRows = true;
            RETURN_ODBC_ERROR( statement );
        }

        return StartReadingResults();
    }

    bool OdbcConnection::TryReadRow()
    {
        column = 0; // reset

        SQLRETURN ret = SQLFetch(statement);
        if (ret == SQL_NO_DATA) 
        { 
            resultset->endOfRows = true;
            return true;
        }
        else 
        {
            resultset->endOfRows = false;
        }
        CHECK_ODBC_ERROR( ret, statement );

        return true;
    }

    bool OdbcConnection::TryReadColumn(int column)
    {
        assert( column >= 0 && column < resultset->GetColumns() );

        SQLLEN strLen_or_IndPtr;
        const ResultSet::ColumnDefinition& definition = resultset->GetMetadata(column);
        switch (definition.dataType)
        {
        case SQL_CHAR:
        case SQL_VARCHAR:
        case SQL_LONGVARCHAR:
        case SQL_WCHAR:
        case SQL_WVARCHAR:
        case SQL_WLONGVARCHAR:
        case SQL_SS_XML:
        case SQL_GUID:
            {
                bool read = TryReadString( false, column );
                if( !read ) {
                    return false;
                }
            }
            break;
        case SQL_BIT:
            {
                long val;
                SQLRETURN ret = SQLGetData(statement, column + 1, SQL_C_SLONG, &val, sizeof(val), &strLen_or_IndPtr);
                CHECK_ODBC_ERROR( ret, statement );
                if (strLen_or_IndPtr == SQL_NULL_DATA) 
                {
                    resultset->SetColumn(make_shared<NullColumn>());
                }
                else 
                {
                    resultset->SetColumn(make_shared<BoolColumn>((val != 0) ? true : false));
                }
            }
            break;
        case SQL_SMALLINT:
        case SQL_TINYINT:
        case SQL_INTEGER:
            {
                long val;
                SQLRETURN ret = SQLGetData(statement, column + 1, SQL_C_SLONG, &val, sizeof(val), &strLen_or_IndPtr);
                CHECK_ODBC_ERROR( ret, statement );
                if (strLen_or_IndPtr == SQL_NULL_DATA) 
                {
                    resultset->SetColumn(make_shared<NullColumn>());
                }
                else 
                {
                    resultset->SetColumn(make_shared<IntColumn>(val));
                }
            }
            break;
        case SQL_DECIMAL:
        case SQL_NUMERIC:
        case SQL_REAL:
        case SQL_FLOAT:
        case SQL_DOUBLE:
        case SQL_BIGINT:
            {
                double val;
                SQLRETURN ret = SQLGetData(statement, column + 1, SQL_C_DOUBLE, &val, sizeof(val), &strLen_or_IndPtr);
                CHECK_ODBC_ERROR( ret, statement );
                if (strLen_or_IndPtr == SQL_NULL_DATA) 
                {
                    resultset->SetColumn(make_shared<NullColumn>());
                }
                else 
                {
                    resultset->SetColumn(make_shared<NumberColumn>(val));
                }
            }
            break;
        case SQL_BINARY:
        case SQL_VARBINARY:
        case SQL_LONGVARBINARY:
            {
                bool more = false;
                vector<char> buffer(2048);
                SQLRETURN ret = SQLGetData(statement, column + 1, SQL_C_BINARY, buffer.data(), buffer.size(), &strLen_or_IndPtr);
                CHECK_ODBC_ERROR( ret, statement );
                if (strLen_or_IndPtr == SQL_NULL_DATA) 
                {
                    resultset->SetColumn(make_shared<NullColumn>());
                }
                else 
                {
                    assert(strLen_or_IndPtr != SQL_NO_TOTAL); // per http://msdn.microsoft.com/en-us/library/windows/desktop/ms715441(v=vs.85).aspx

                    SQLWCHAR SQLState[6];
                    SQLINTEGER nativeError;
                    SQLSMALLINT textLength;
                    if (ret == SQL_SUCCESS_WITH_INFO)
                    {
                        ret = SQLGetDiagRec(SQL_HANDLE_STMT, statement, 1, SQLState, &nativeError, NULL, 0, &textLength);
                        CHECK_ODBC_ERROR( ret, statement );
                        more = wcsncmp(SQLState, L"01004", 6) == 0;
                    }

					int amount = strLen_or_IndPtr;
					if (more) {
						amount = buffer.size();
					}

                    vector<char> trimmed(amount);
                    memcpy(trimmed.data(), buffer.data(), amount);
                    resultset->SetColumn(make_shared<BinaryColumn>(trimmed, more));
                }
            }
            break;
        // use text format form time/date/etc.. for now
        // INTERVAL TYPES? 
        case SQL_TYPE_TIMESTAMP:
        case SQL_TYPE_DATE:
        case SQL_SS_TIMESTAMPOFFSET:
            {
                SQL_SS_TIMESTAMPOFFSET_STRUCT datetime;
                memset( &datetime, 0, sizeof( datetime ));

                SQLRETURN ret = SQLGetData( statement, column + 1, SQL_C_DEFAULT, &datetime, sizeof( datetime ),
                                            &strLen_or_IndPtr );
                CHECK_ODBC_ERROR( ret, statement );
                if (strLen_or_IndPtr == SQL_NULL_DATA) 
                {
                    resultset->SetColumn(make_shared<NullColumn>());
                    break;
                }

                resultset->SetColumn( make_shared<TimestampColumn>( datetime ));
            }
            break;
        case SQL_TYPE_TIME:
        case SQL_SS_TIME2:
            {
                SQL_SS_TIME2_STRUCT time;
                memset( &time, 0, sizeof( time ));

                SQLRETURN ret = SQLGetData( statement, column + 1, SQL_C_DEFAULT, &time, sizeof( time ),
                                            &strLen_or_IndPtr );
                CHECK_ODBC_ERROR( ret, statement );
                if (strLen_or_IndPtr == SQL_NULL_DATA) 
                {
                    resultset->SetColumn(make_shared<NullColumn>());
                    break;
                }

                SQL_SS_TIMESTAMPOFFSET_STRUCT datetime;
                memset( &datetime, 0, sizeof( datetime ));  // not necessary, but simple precaution
                datetime.year = SQL_SERVER_DEFAULT_YEAR;
                datetime.month = SQL_SERVER_DEFAULT_MONTH;
                datetime.day = SQL_SERVER_DEFAULT_DAY;
                datetime.hour = time.hour;
                datetime.minute = time.minute;
                datetime.second = time.second;
                datetime.fraction = time.fraction;

                resultset->SetColumn( make_shared<TimestampColumn>( datetime ));
            }
            break;
        default:
            // this shouldn't ever be hit.  Every T-SQL type should be covered above.
            assert( false );
            return false;
        }

        return true;
    }

    bool OdbcConnection::TryReadString( bool binary, int column )
    {
        SQLLEN display_size = 0;
        unique_ptr<StringColumn::StringValue> value( new StringColumn::StringValue() );
        SQLLEN value_len = 0;
        SQLRETURN r = SQL_SUCCESS;

        r = SQLColAttribute( statement, column + 1, SQL_DESC_DISPLAY_SIZE, NULL, 0, NULL, &display_size );
        CHECK_ODBC_ERROR( r, statement );

        // when a field type is LOB, we read a packet at time and pass that back.
        if( display_size == 0 || display_size == std::numeric_limits<int>::max() || 
            display_size == std::numeric_limits<int>::max() >> 1 || 
            display_size == std::numeric_limits<unsigned long>::max() - 1 ) {

            bool more = false;

            value_len = LOB_PACKET_SIZE + 1;

            value->resize( value_len );

            SQLRETURN r = SQLGetData( statement, column + 1, SQL_C_WCHAR, value->data(), value_len * 
                sizeof( StringColumn::StringValue::value_type ), &value_len );

            CHECK_ODBC_NO_DATA( r, statement );
            CHECK_ODBC_ERROR( r, statement );

            if( value_len == SQL_NULL_DATA ) {

                resultset->SetColumn( make_shared<NullColumn>());
                return true;          
            }

            // an unknown amount is left on the field so no total was returned
            if( value_len == SQL_NO_TOTAL || value_len / sizeof( StringColumn::StringValue::value_type ) > LOB_PACKET_SIZE ) {

                more = true;
                value->resize( LOB_PACKET_SIZE );
            }
            else {

                // value_len is in bytes
                value->resize( value_len / sizeof( StringColumn::StringValue::value_type ));
                more = false;
            }

            resultset->SetColumn( make_shared<StringColumn>( value, more ));

            return true;
        }
        else if( display_size >= 1 && display_size <= SQL_SERVER_MAX_STRING_SIZE ) {

            display_size++;                 // increment for null terminator
            value->resize( display_size );

            SQLRETURN r = SQLGetData( statement, column + 1, SQL_C_WCHAR, value->data(), display_size * 
                                      sizeof( StringColumn::StringValue::value_type ), &value_len );
            CHECK_ODBC_ERROR( r, statement );
            CHECK_ODBC_NO_DATA( r, statement );

            if( value_len == SQL_NULL_DATA ) {

                resultset->SetColumn(make_shared<NullColumn>());
                return true;          
            }

            assert( value_len % 2 == 0 );   // should always be even
            value_len /= sizeof( StringColumn::StringValue::value_type );

            assert( value_len >= 0 && value_len <= display_size - 1 );
            value->resize( value_len );

            resultset->SetColumn( make_shared<StringColumn>( value, false ));

            return true;
        }
        else {

            assert( false );

        }

        return false;
    }

    bool OdbcConnection::TryReadNextResult()
    {
        SQLRETURN ret = SQLMoreResults(statement);
        if (ret == SQL_NO_DATA) 
        { 
            endOfResults = true;
            statement.Free();
            return true;
        }
        CHECK_ODBC_ERROR( ret, statement );

        endOfResults = false;

        return StartReadingResults();
    }

    bool OdbcConnection::TryBeginTran( void )
    {
        // turn off autocommit
        SQLRETURN ret = SQLSetConnectAttr( connection, SQL_ATTR_AUTOCOMMIT, reinterpret_cast<SQLPOINTER>( SQL_AUTOCOMMIT_OFF ),
                                           SQL_IS_UINTEGER );
        CHECK_ODBC_ERROR( ret, connection );
        return true;
    }

    bool OdbcConnection::TryEndTran(SQLSMALLINT completionType)
    {
        SQLRETURN ret = SQLEndTran(SQL_HANDLE_DBC, connection, completionType);
        CHECK_ODBC_ERROR( ret, connection );

        // put the connection back into auto commit mode
        ret = SQLSetConnectAttr( connection, SQL_ATTR_AUTOCOMMIT, reinterpret_cast<SQLPOINTER>( SQL_AUTOCOMMIT_ON ),
                                           SQL_IS_UINTEGER );
        CHECK_ODBC_ERROR( ret, connection );

        return true;
    }
}
