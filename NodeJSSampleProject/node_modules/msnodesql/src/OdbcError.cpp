//--------------------------------------------------------------------------------------------------------------------------------
// File: OdbcError.cpp
// Contents: Custom errors for this driver
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

#include "stdafx.h"

// list of msnodesql specific errors
namespace mssql {

	// error returned when a string returns no data but it's not a NULL field
	// ODBC returns SQL_NO_DATA so we translate this into an error and return it to node.js
    OdbcError OdbcError::NODE_SQL_NO_DATA = OdbcError( "IMNOD", "No data returned", 1 );
}
