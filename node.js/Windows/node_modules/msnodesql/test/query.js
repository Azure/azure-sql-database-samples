//---------------------------------------------------------------------------------------------------------------------------------
// File: query.js
// Contents: test suite for queries
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
var async = require( 'async' );

var config = require( './test-config' );

suite('query', function () {

    var conn_str = config.conn_str;

    test('simple query', function (done) {

        sql.query(conn_str, "SELECT 1 as X, 'ABC', 0x0123456789abcdef ", function (err, results) {

            assert.ifError(err);

            var buffer = new Buffer('0123456789abcdef', 'hex');
            var expected = [{ 'X': 1, 'Column1': 'ABC', 'Column2': buffer}];

            assert.deepEqual(results, expected, "Results don't match");

            done();
        });
    });

    test('simple raw query', function (done) {

        sql.queryRaw(conn_str, "SELECT 1 as X, 'ABC', 0x0123456789abcdef ", function (err, results) {

            assert.ifError(err);

            var buffer = new Buffer('0123456789abcdef', 'hex');

            var expected = { meta:
                             [{ name: 'X', size: 10, nullable: false, type: 'number' },
                               { name: '', size: 3, nullable: false, type: 'text' },
                               { name: '', size: 8, nullable: false, type: 'binary'}],
                rows: [[1, 'ABC', buffer]]
            }

            assert.deepEqual(results, expected, "raw results didn't match");

            done();
        });

    });

    test('simple query of types like var%', function (done) {

        var like = 'var%';

        sql.query(conn_str, "SELECT name FROM sys.types WHERE name LIKE ?", [like], function (err, results) {

            assert.ifError(err);

            for (var row = 0; row < results.length; ++row) {

                assert(results[row].name.substr(0, 3) == 'var');
            }

            done();
        });

    });

    test('streaming test', function (done) {

        var like = 'var%';
        var current_row = 0;
        var meta_expected = [{ name: 'name', size: 128, nullable: false, type: 'text'}];

        var stmt = sql.query(conn_str, 'select name FROM sys.types WHERE name LIKE ?', [like]);

        stmt.on('meta', function (meta) { assert.deepEqual(meta, meta_expected); });
        stmt.on('row', function (idx) { assert(idx == current_row); ++current_row; });
        stmt.on('column', function (idx, data, more) { assert(data.substr(0,3) == 'var'); });
        stmt.on('done', function () { done(); });
        stmt.on('error', function (err) { assert.ifError(err); });
    });

    test('serialized queries', function (done) {

        var expected = [{ meta: [{ name: '', size: 10, nullable: false, type: 'number'}],
            rows: [[1]]
        },
                         { meta: [{ name: '', size: 10, nullable: false, type: 'number'}],
                             rows: [[2]]
                         },
                         { meta: [{ name: '', size: 10, nullable: false, type: 'number'}],
                             rows: [[3]]
                         },
                         { meta: [{ name: '', size: 10, nullable: false, type: 'number'}],
                             rows: [[4]]
                         },
                         { meta: [{ name: '', size: 10, nullable: false, type: 'number'}],
                             rows: [[5]]
                         }];

        var results = [];

        var c = sql.open(conn_str, function (e) {

            assert.ifError(e);

            c.queryRaw("SELECT 1", function (e, r) {

                assert.ifError(e);

                results.push(r);
            });

            c.queryRaw("SELECT 2", function (e, r) {

                assert.ifError(e);

                results.push(r);
            });

            c.queryRaw("SELECT 3", function (e, r) {

                assert.ifError(e);

                results.push(r);
            });

            c.queryRaw("SELECT 4", function (e, r) {

                assert.ifError(e);

                results.push(r);
            });

            c.queryRaw("SELECT 5", function (e, r) {

                assert.ifError(e);

                results.push(r);

                assert.deepEqual(expected, results);
                done();
            });
        });
    });

    test( 'query with errors', function( done ) {

        var c = sql.open( conn_str, function( e ) {

            assert.ifError( e );

            var  expectedError = new Error( "[Microsoft][" + config.driver + "][SQL Server]Unclosed quotation mark after the character string 'm with NOBODY'." );
            expectedError.sqlstate = '42000';
            expectedError.code = 105;

            async.series( [

                function( async_done ) {

                    assert.doesNotThrow( function() {

                        c.queryRaw( "I'm with NOBODY", function( e, r ) {

                            assert( e instanceof Error );
                            assert.deepEqual( e, expectedError, "Unexpected error returned" );
                            async_done();
                        });
                    });
                },

                function( async_done ) {

                    assert.doesNotThrow( function() {

                        var s = c.queryRaw( "I'm with NOBODY" );
                        s.on( 'error', function( e ) {

                            assert( e instanceof Error );
                            assert.deepEqual( e, expectedError, "Unexpected error returned" );
                            async_done();
                            done();
                        });
                    });
                }
            ]);
        });
    });

    test( 'multiple results from query in callback', function( done ) {

        var moreShouldBe = true;
        var called = 0;

        sql.queryRaw(conn_str, "SELECT 1 as X, 'ABC', 0x0123456789abcdef; SELECT 2 AS Y, 'DEF', 0xfedcba9876543210", 
            function( err, results, more ) {

                assert.ifError( err );

                assert.equal( more, moreShouldBe );

                ++called;

                if( more ) {

                    var buffer = new Buffer('0123456789abcdef', 'hex');
                    var expected = { meta:
                                     [ { name: 'X', size: 10, nullable: false, type: 'number' },
                                       { name: '', size: 3, nullable: false, type: 'text' },
                                       { name: '', size: 8, nullable: false, type: 'binary' } ],
                                     rows: [ [ 1, 'ABC', buffer ] ] };

                    assert.deepEqual( results, expected, "Result 1 does not match expected" );

                    assert( called == 1 );
                    moreShouldBe = false;
                }
                else {

                    var buffer = new Buffer('fedcba9876543210', 'hex');
                    var expected = { meta:
                                     [ { name: 'Y', size: 10, nullable: false, type: 'number' },
                                       { name: '', size: 3, nullable: false, type: 'text' },
                                       { name: '', size: 8, nullable: false, type: 'binary' } ],
                                     rows: [ [ 2, 'DEF', buffer ] ] };

                    assert.deepEqual( results, expected, "Result 2 does not match expected" );

                    assert( called == 2 );
                    done();
                }
            });
    });

    test( 'multiple results from query in events', function( done ) {

        var r = sql.queryRaw( conn_str, "SELECT 1 as X, 'ABC', 0x0123456789abcdef; SELECT 2 AS Y, 'DEF', 0xfedcba9876543210" );

        var expected = [ [ { name: 'X', size: 10, nullable: false, type: 'number' },
                           { name: '', size: 3, nullable: false, type: 'text' },
                           { name: '', size: 8, nullable: false, type: 'binary' } ],
                         { row: 0 },
                         { column: 0, data: 1, more: false },
                         { column: 1, data: 'ABC', more: false },
                         { column: 2,
                           data: new Buffer('0123456789abcdef', 'hex'),
                           more: false },
                         [ { name: 'Y', size: 10, nullable: false, type: 'number' },
                           { name: '', size: 3, nullable: false, type: 'text' },
                           { name: '', size: 8, nullable: false, type: 'binary' } ],
                         { row: 1 },
                         { column: 0, data: 2, more: false },
                         { column: 1, data: 'DEF', more: false },
                         { column: 2,
                           data: new Buffer('fedcba9876543210', 'hex'),
                           more: false } ];
        var received = [];

        r.on('meta', function( m ) { received.push( m ); } );
        r.on('row', function( idx ) {  received.push( { row: idx } ); } );
        r.on('column', function( idx, data, more ) { received.push( { column: idx, data: data, more: more } ); } );
        r.on('done', function() { assert.deepEqual( received, expected ); done() } );
        r.on('error', function( e ) { assert.ifError( e ); } );
    });

    test( 'boolean return value from query', function( done ) {

        var r = sql.queryRaw( conn_str, "SELECT CONVERT(bit, 1) AS bit_true, CONVERT(bit, 0) AS bit_false", 
                              function ( err, results ) {

                                  assert.ifError( err );

                                  var expected = { meta: [ { name: 'bit_true', size: 1, nullable: true, type: 'boolean' },
                                                   { name: 'bit_false', size: 1, nullable: true, type: 'boolean' } ],
                                                   rows: [ [ true, false ] ] };
                                  assert.deepEqual( results, expected, "Results didn't match" );
                                  done();
                              });

    });

    test( 'verify empty results retrieved properly', function( test_done ) {

        sql.open( conn_str, function( err, conn ) {

          async.series([
            function( async_done ) {
              conn.queryRaw( "drop table test_sql_no_data", function( err ) {
                async_done();
              });
            },
            function (async_done) {
                conn.queryRaw("create table test_sql_no_data (id int identity, name varchar(20))", function (err) {
                    assert.ifError(err);
                    async_done();
                });
            },
            function (async_done) {
                conn.queryRaw("create clustered index index_nodata on test_sql_no_data (id)", function (err) {
                    assert.ifError(err);
                    async_done();
                });
            },
            function (async_done) {
              conn.queryRaw( "delete from test_sql_no_data where 1=0", function( err, results ) {

                assert.ifError( err );
                var expectedResults = { meta: null, rowcount: 0 }
                assert.deepEqual( results, expectedResults );
                async_done();
                test_done();
              });
            }
            ]);
        });
    });

    test( 'test retrieving a string with null embedded', function( test_done ) {

        sql.open( conn_str, function( e, c ) {

            assert.ifError( e );

            var embedded_null = String.fromCharCode( 65, 66, 67, 68, 0, 69, 70 );

            async.series([
                function( async_done ) {

                    c.queryRaw( "DROP TABLE null_in_string_test", function( e ) { async_done(); } );
                },

                function( async_done ) {

                    c.queryRaw( "CREATE TABLE null_in_string_test (id int IDENTITY, null_in_string varchar(100) NOT NULL)", 
                                function( e ) {

                                    assert.ifError( e );

                                    async_done();
                                });
                },
                function (async_done) {

                    c.queryRaw("CREATE CLUSTERED INDEX ix_null_in_string_test ON null_in_string_Test (id)", function (err) {
        
                        assert.ifError(err);
                        async_done();
                    });
                },
                function( async_done ) {

                    c.queryRaw( "INSERT INTO null_in_string_test (null_in_string) VALUES (?)", [ embedded_null ], 
                                function( e, r ) {

                                    assert.ifError( e );

                                    async_done();
                                });
                },

                function( async_done ) {

                    c.queryRaw( "SELECT null_in_string FROM null_in_string_test", function( e, r ) {

                        assert.ifError( e );

                        assert( r.rows[0] == embedded_null );

                        async_done();
                        test_done();
                    });
                },
            ]);
        });
    })

    test( 'test retrieving a non-LOB string of max size', function( test_done ) {

        String.prototype.repeat = function( num )
        {
            return new Array( num + 1 ).join( this );
        }

        sql.query( conn_str, "SELECT REPLICATE('A', 8000) AS 'NONLOB String'", function( e, r ) {

            assert.ifError( e );

            assert( r[0]['NONLOB String'] == 'A'.repeat( 8000 ));
            test_done();
        });
    });

    test( 'test retrieving an empty string', function( test_done ) {

        sql.query( conn_str, "SELECT '' AS 'Empty String'", function( e, r ) {

            assert.ifError( e );

            assert( r[0]['Empty String'] == '');
            test_done();
        });
    });

    test( 'test retrieving a LOB string larger than max string size', function( test_done ) {

        var moreCount = 0;
        var totalLength = 0;

        var stmt = sql.query( conn_str, "SELECT REPLICATE(CAST('B' AS varchar(max)), 20000) AS 'LOB String'" );

        stmt.on('column', function( c, d, m ) { assert( c == 0 ); totalLength += d.length; if( m ) { ++moreCount } });
        stmt.on('done', function() { assert( moreCount == 2, "more not received 2 times" ); 
                                     assert( totalLength == 20000, "length != 20000" ); 
                                     test_done(); });
        stmt.on('error', function( e ) { assert.ifError( e ) });
     });
       
    test( 'test function parameter validation', function( test_done ) {

        // test the module level open, query and queryRaw functions
        var thrown = false;
        try {

            sql.open( 1, "SELECT 1" );
        }
        catch( e  ) {

            thrown = true;
            assert.equal( e.toString(), "Error: [msnodesql] Invalid connection string passed to function open. Type should be string.", "Improper error returned" );
        }
        assert( thrown == true );

        thrown = false;
        try {

            sql.query( function() { return 1; }, "SELECT 1" );
        }
        catch( e  ) {

            thrown = true;
            assert.equal( e.toString(), "Error: [msnodesql] Invalid connection string passed to function query. Type should be string.", "Improper error returned" );
        }
        assert( thrown = true );

        thrown = false;
        try {

            sql.queryRaw( [ "This", "is", "a", "test" ], "SELECT 1" );
        }
        catch( e  ) {

            thrown = true;
            assert.equal( e.toString(), "Error: [msnodesql] Invalid connection string passed to function queryRaw. Type should be string.", "Improper error returned" );
        }
        assert( thrown == true );

        thrown = false;
        // test the module level open, query and queryRaw functions
        try {

            sql.open( conn_str, 5 );
        }
        catch( e  ) {

            thrown = true;
            assert.equal( e.toString(), "Error: [msnodesql] Invalid callback passed to function open. Type should be function.", "Improper error returned" );
        }
        assert( thrown = true );

        thrown = false;
        try {

            sql.query( conn_str, function() { return 5; } );
        }
        catch( e  ) {

            thrown = true;
            assert.equal( e.toString(), "Error: [msnodesql] Invalid query string passed to function query. Type should be string.", "Improper error returned" );
        }
        assert( thrown == true );

        thrown = false;
        try {

            sql.queryRaw( conn_str, [ "This", "is", "a", "test" ] );
        }
        catch( e  ) {

            thrown = true;
            assert.equal( e.toString(), "Error: [msnodesql] Invalid query string passed to function queryRaw. Type should be string.", "Improper error returned" );
        }
        assert( thrown == true );

        var stmt = sql.queryRaw( conn_str, "SELECT 1" );
        stmt.on( 'error', function( e ) { assert.ifError( e ); });

        sql.queryRaw( conn_str, "SELECT 1", function( e, r ) {

            assert.ifError( e );
        });

        sql.queryRaw( conn_str, "SELECT 1", [], function( e, r ) {

            assert.ifError( e );
        });

        sql.queryRaw( conn_str, "SELECT 1", null, function( e, r ) {

            assert.ifError( e );
        });

        stmt = sql.queryRaw( conn_str, "SELECT 1", [] );
        stmt.on( 'error', function( e ) { assert.ifError( e ); });

        stmt = sql.queryRaw( conn_str, "SELECT 1", null );
        stmt.on( 'error', function( e ) { assert.ifError( e ); });

        thrown = false
        try {

            sql.queryRaw( conn_str, "SELECT 1", 1 );

        }
        catch( e ) {

            thrown = true;
            assert.equal( e.toString(), "Error: [msnodesql] Invalid parameter(s) passed to function query or queryRaw.", "Improper error returned" );
        }
        assert( thrown == true );

        thrown = false;
        try {

            sql.queryRaw( conn_str, "SELECT 1", { a: 1, b: "2" }, function( a ) {} );

        }
        catch( e ) {

            thrown = true;
            assert.equal( e.toString(), "Error: [msnodesql] Invalid parameter(s) passed to function query or queryRaw.", "Improper error returned" );
        }
        assert( thrown == true );

        // validate member functions
        sql.open( conn_str, function( e, c ) {

            assert.ifError( e );

            thrown = false;
            try{ 

                c.query( 1 );
            }
            catch( e  ) {

                thrown = true;
                assert.equal( e.toString(), "Error: [msnodesql] Invalid query string passed to function query. Type should be string.", "Improper error returned" );
            }            
            assert( thrown == true );

            thrown = false;
            try{ 

                c.queryRaw( function() { return 1; } );
            }
            catch( e  ) {

                thrown = true;
                assert.equal( e.toString(), "Error: [msnodesql] Invalid query string passed to function queryRaw. Type should be string.", "Improper error returned" );
                test_done();
            }
            assert( thrown == true );
        });
    });

});
