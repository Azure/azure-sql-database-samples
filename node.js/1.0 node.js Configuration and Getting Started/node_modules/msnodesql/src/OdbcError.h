//--------------------------------------------------------------------------------------------------------------------------------
// File: OdbcError.h
// Contents: Object that represents ODBC errors
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
//--------------------------------------------------------------------------------------------------------------------------------

#pragma once

namespace mssql
{
    using namespace std;

    class OdbcError
    {
    public:

        OdbcError( const char* sqlstate, const char* message, SQLINTEGER code )
           : sqlstate( sqlstate ), message(message), code(code)
        {
        }

        const char* Message( void ) const
        {
            return message.c_str();
        }

        const char* SqlState( void ) const
        {
            return sqlstate.c_str();
        }

        SQLINTEGER Code( void ) const
        {
            return code;
        }

        // list of msnodesql specific errors
        static OdbcError NODE_SQL_NO_DATA;

    private:

        string message;
        string sqlstate;
        SQLINTEGER code;
    };

}
