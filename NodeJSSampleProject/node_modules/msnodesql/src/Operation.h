//---------------------------------------------------------------------------------------------------------------------------------
// File: Operation.h
// Contents: Queue calls to ODBC on background thread
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

namespace mssql {

using namespace std;

class Operation
{
public:

    virtual ~Operation() {};

    virtual void InvokeBackground() = 0;
    virtual void CompleteForeground() = 0;

    static bool Add(Operation* operation)
    {
        operation->work.data = operation;
        int result = uv_queue_work(uv_default_loop(), &operation->work, OnBackground, OnForeground);
        if( result != 0 )
        {
            operation->last_error = uv_last_error( uv_default_loop() ) ;
            return false;
        }
        else
         {
            operation->last_error.code = UV_OK;
            return true;
        }
    }

private:

    uv_work_t  work;
    uv_err_t   last_error;

    static void OnBackground(uv_work_t* work)
    {
        Operation* operation = (Operation*)work->data;
        operation->InvokeBackground();
    }

    static void OnForeground(uv_work_t* work)
    {
        Operation* operation = (Operation*)work->data;
        operation->CompleteForeground();
        delete operation;
    }

};

}
