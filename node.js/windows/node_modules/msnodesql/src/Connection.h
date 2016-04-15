//---------------------------------------------------------------------------------------------------------------------------------
// File: Connection.h
// Contents: C++ interface to Microsoft Driver for Node.js for SQL Server
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

#include "OdbcConnectionBridge.h"

namespace mssql
{
    using namespace std;
    using namespace v8;

    class Connection : node::ObjectWrap 
    {
    private:
        static Persistent<FunctionTemplate> constructor_template;

        unique_ptr<OdbcConnectionBridge> innerConnection;
        Persistent<Object> This;
    public:
        Connection()
            : innerConnection(new OdbcConnectionBridge())
        {
        }

        virtual ~Connection();

        static void Initialize(Handle<Object> target);
        static Handle<Value> Close(const Arguments& args);
        static Handle<Value> BeginTransaction(const Arguments& args);
        static Handle<Value> Commit(const Arguments& args);
        static Handle<Value> Rollback(const Arguments& args);
        static Handle<Value> New(const Arguments& args);
        static Handle<Value> Open(const Arguments& args);
        static Handle<Value> Query(const Arguments& args);
        static Handle<Value> ReadRow(const Arguments& args);
        static Handle<Value> ReadColumn(const Arguments& args);
        static Handle<Value> ReadNextResult(const Arguments& args);
        static Handle<Value> ReadRowCount(const Arguments& args);
    };

}

