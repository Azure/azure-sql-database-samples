//---------------------------------------------------------------------------------------------------------------------------------
// File: OdbcConnectionBridge.h
// Contents: Create (bridge) operations to be completed on background thread queue
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
#include "OdbcConnection.h"
#include "OdbcOperation.h"

namespace mssql
{
    using namespace std;
    using namespace v8;

    class OdbcConnectionBridge
    {
    public:

        OdbcConnectionBridge()
        {
            connection = make_shared<OdbcConnection>();
        }

        Handle<Value> Close(Handle<Object> callback)
        {
            HandleScope scope;

            Operation* operation = new CloseOperation(connection, callback);
            Operation::Add(operation);

            return scope.Close(Undefined());
        }

        void Collect( void )
        {
            Operation* operation = new CollectOperation(connection);
            Operation::Add( operation );
        }

        Handle<Value> BeginTransaction(Handle<Object> callback )
        {
            HandleScope scope;

            Operation* operation = new BeginTranOperation(connection, callback );
            Operation::Add(operation);

            return scope.Close(Undefined());
        }

        Handle<Value> Commit(Handle<Object> callback)
        {
            HandleScope scope;

            Operation* operation = new EndTranOperation(connection, SQL_COMMIT, callback);
            Operation::Add(operation);

            return scope.Close(Undefined());
        }

        Handle<Value> Rollback(Handle<Object> callback)
        {
            HandleScope scope;

            Operation* operation = new EndTranOperation(connection, SQL_ROLLBACK, callback);
            Operation::Add(operation);

            return scope.Close(Undefined());
        }

        Handle<Value> Query(Handle<String> query, Handle<Array> params, Handle<Object> callback)
        {
            HandleScope scope;

            QueryOperation* operation = new QueryOperation(connection, FromV8String(query), callback);

            bool bound = operation->BindParameters( params );

            if( bound ) {

                Operation::Add(operation);
            }

            return scope.Close(Undefined());
        }
        
        Handle<Value> ReadRow(Handle<Object> callback)
        {
            HandleScope scope;

            Operation* operation = new ReadRowOperation(connection, callback);
            Operation::Add(operation);

            return scope.Close(Undefined());
        }
        
        Handle<Integer> ReadRowCount( void )
        {
            HandleScope scope;

            assert( connection );
            assert( connection->resultset );

            return scope.Close( Integer::New( connection->resultset->RowCount() ));
        }

        Handle<Value> ReadNextResult(Handle<Object> callback)
        {
            HandleScope scope;

            Operation* operation = new ReadNextResultOperation(connection, callback);
            Operation::Add(operation);

            return scope.Close(Undefined());
        }

        Handle<Value> ReadColumn(Handle<Number> column, Handle<Object> callback)
        {
            HandleScope scope;

            Operation* operation = new ReadColumnOperation(connection, column->Int32Value(), callback);
            Operation::Add(operation);

            return scope.Close(Undefined());
        }

        Handle<Value> Open(Handle<String> connectionString, Handle<Object> callback, Handle<Object> backpointer)
        {
            HandleScope scope;

            Operation* operation = new OpenOperation(connection, FromV8String(connectionString), callback, backpointer);
            Operation::Add(operation);

            return scope.Close(Undefined());
        }

    private:

        shared_ptr<OdbcConnection> connection;
    };
}
