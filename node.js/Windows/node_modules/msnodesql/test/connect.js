//---------------------------------------------------------------------------------------------------------------------------------
// File: connect.js
// Contents: test suite for connections
// 
// Copyright Microsoft Corporation
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

var sql = require('../');
var assert = require( 'assert' );
var config = require( './test-config' );

suite( 'open', function() {

    test('trusted connection to a server', function( done ) {

        sql.open(config.conn_str, 
                  function( err, conn ) {

                      assert.ifError( err );
                      assert( typeof conn == 'object');

                      done();
                  });
    });
});

