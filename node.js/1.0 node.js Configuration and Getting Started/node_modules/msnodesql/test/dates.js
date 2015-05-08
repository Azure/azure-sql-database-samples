//---------------------------------------------------------------------------------------------------------------------------------
// File: dates.js
// Contents: test suite for queries and parameters dealing with dates
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

var sql = require('../');

var assert = require( 'assert' );
var async = require( 'async' );

var config = require( './test-config' );

suite( 'date tests', function() {

    var conn_str = config.conn_str;

    // this test simply verifies dates round trip.  It doesn't try to verify illegal dates vs. legal dates.
    // SQL Server is assumed to be only returning valid times and dates.
    test( 'date retrieval verification', function( test_done ) {
      sql.open( conn_str, function( err, conn ) {

          assert.ifError( err );

          var testDates = [ "1-1-1970", "12-31-1969", "2-29-1904", "2-29-2000" ];

          async.series([
              function( async_done ) {

                  conn.queryRaw( "DROP TABLE date_test", function( e ) { async_done(); } );
              },
              function( async_done ) {

                  conn.queryRaw("CREATE TABLE date_test (id int identity, test_date date)", function (e) {

                      assert.ifError( e );
                      async_done();
                  });
              },
              function (async_done) {

                  conn.queryRaw("CREATE CLUSTERED INDEX IX_date_test ON date_test(id)", function (e) {

                    assert.ifError(e);
                    async_done();
                });
              },
              function (async_done) {

                  var insertQuery = "INSERT INTO date_test (test_date) VALUES ";
                  for( var i in testDates ) {
                    insertQuery += "('" + testDates[i] + "'),";
                  }
                  insertQuery = insertQuery.substr( 0, insertQuery.length - 1 );
                  insertQuery += ";";
                  conn.queryRaw( insertQuery, function( e ) {

                      assert.ifError( e );
                      async_done();
                  });
              },
              // test valid dates
              function( async_done ) {

                  conn.queryRaw( "SELECT test_date FROM date_test", function( e, r ) {

                      assert.ifError( e );

                      var expectedDates = [];
                      for( var i in testDates ) {
                          var expectedDate = new Date( testDates[i] );
                          expectedDate.setUTCHours( 0, 0, 0, 0 );
                          expectedDate.nanosecondsDelta = 0;
                          expectedDates.push( [ expectedDate ]);
                      }
                      var expectedResults = { meta: [ { name: 'test_date', size: 10, nullable: true, type: 'date' } ],
                          rows: expectedDates 
                      };
                      assert.deepEqual( expectedResults.meta, r.meta );
                      for( var row in r.rows ) {
                          for( var d in row ) {
                              assert.deepEqual( expectedResults.rows[row][d], r.rows[row][d] );
                          }
                      }
                      async_done();
                      test_done();
                  });
              }
          ]);
        });
    });

// this test simply verifies dates round trip.  It doesn't try to verify illegal dates vs. legal dates.
// SQL Server is assumed to be only returning valid times and dates.
  test( 'date to millisecond verification', function( test_done ) {
    sql.open( conn_str, function( err, conn ) {

        assert.ifError( err );

        var testDates = [{ date1: "1-1-1900", date2: "1-1-1901", milliseconds: 31536000000 },
                         { date1: "2-28-1900", date2: "3-1-1900", milliseconds: 86400000 },
                         { date1: "2-28-1904", date2: "3-1-1904", milliseconds: 172800000 },
                         { date1: "2-28-2000", date2: "3-1-2000", milliseconds: 172800000 },
                         { date1: "1-1-1970", date2: "12-31-1969", milliseconds: -86400000 },
                         { date1: "1-1-1969", date2: "1-1-1968", milliseconds: -(31536000000 + 86400000) },
                         { date1: "2-3-4567", date2: "2-3-4567", milliseconds: 0 }];

        async.series([
            function( async_done ) {

                conn.queryRaw( "DROP TABLE date_diff_test", function( e ) { async_done(); } );
            },
            function (async_done) {

                conn.queryRaw("CREATE TABLE date_diff_test (id int identity, date1 datetime2, date2 datetime2)", function (e) {

                    assert.ifError(e);
                    async_done();
                });
            },
            function (async_done) {

                conn.queryRaw("CREATE CLUSTERED INDEX IX_date_diff_test ON date_diff_test(id)", function (e) {

                    assert.ifError(e);
                    async_done();
                });
            },
            function (async_done) {

                var insertQuery = "INSERT INTO date_diff_test (date1, date2) VALUES ";
                for( var i in testDates ) {
                  insertQuery += ["('", testDates[i].date1, "','", testDates[i].date2, "'),"].join("");
                }
                insertQuery = insertQuery.substr( 0, insertQuery.length - 1 );
                insertQuery = insertQuery + ";";
                conn.queryRaw( insertQuery, function( e ) {

                    assert.ifError( e );
                    async_done();
                });
            },
            // test valid dates
            function( async_done ) {

                conn.queryRaw( "SELECT date1, date2 FROM date_diff_test ORDER BY id", function( e, r ) {

                    assert.ifError( e );

                    for( var d in r.rows ) {
                        var timeDiff = r.rows[d][1].getTime() - r.rows[d][0].getTime();
                        assert( timeDiff == testDates[d].milliseconds );
                    }
                    async_done();
                    test_done();
                });
            }
        ]);
    });
  });

  test( 'time to millisecond components', function( test_done ) {

    sql.open( conn_str, function( err, conn ) {

        var randomHour = Math.floor( Math.random() * 24 );
        var randomMinute = Math.floor( Math.random() * 60 );
        var randomSecond = Math.floor( Math.random() * 60 );
        var randomMs = [];
        var nanoseconds = [ 1e-9*100, 0.9999999, 0.5 ];
        var nanosecondsDeltaExpected = [ 1e-7, 0.0009999, 0 ];

        async.series([
            function( async_done ) {

                conn.queryRaw( "DROP TABLE time_test", function( e ) { async_done(); } );
            },
            function( async_done ) {

                conn.queryRaw( "CREATE TABLE time_test (id int identity, test_time time, test_datetime2 datetime2, test_datetimeoffset datetimeoffset)", function( e ) {

                    assert.ifError( e );
                    async_done();
                });
            },
            function (async_done) {

                conn.queryRaw("CREATE CLUSTERED INDEX IX_time_test ON time_test(id)", function (e) {

                    assert.ifError(e);
                    async_done();
                });
            },
            // insert all the hours and make sure they come back from time column
            function( async_done ) {

                var query = ["INSERT INTO time_test (test_time) VALUES "];

                for( var h = 0; h <= 23; ++h ) {

                    query.push( ["('", h, ":00:00.00'),"].join("") );
                }
                query = query.join("");
                query = query.substr( 0, query.length - 1 );
                query += ";";

                conn.queryRaw( query, function( e, r ) {

                    assert.ifError( e );
                    async_done();
                });
            },
            function( async_done ) {

                var expectedHour = -1;

                var stmt = conn.queryRaw( "SELECT test_time FROM time_test ORDER BY id" );

                stmt.on( 'error', function( e ) { assert.ifError( e ); } );
                stmt.on( 'column', function( c, d, more ) {
                    ++expectedHour;
                    assert( c == 0 );
                    assert( more == false );
                    var expectedDate = new Date( Date.UTC( 1900, 0, 1, expectedHour, 0, 0, 0 ));
                    expectedDate.nanosecondsDelta = 0;
                    assert.deepEqual( d, expectedDate );
                });
                stmt.on( 'done', function() { assert( expectedHour == 23 ); async_done(); } );
            },
            function( async_done ) {

                conn.queryRaw( "TRUNCATE TABLE time_test", function( e, r ) {

                    assert.ifError( e );
                    async_done();
                });
            },
            // insert all the hours and make sure they come back from time column
            function( async_done ) {

                var query = ["INSERT INTO time_test (test_time) VALUES "];

                for( var m = 0; m <= 59; ++m ) {

                    query.push( ["('", randomHour, ":", m, ":00.00'),"].join("") );
                }
                query = query.join("");
                query = query.substr( 0, query.length - 1 );
                query += ";";

                conn.queryRaw( query, function( e, r ) {

                    assert.ifError( e );
                    async_done();
                });
            },
            function( async_done ) {

                var expectedMinute = -1;

                var stmt = conn.queryRaw( "SELECT test_time FROM time_test ORDER BY id" );

                stmt.on( 'error', function( e ) { assert.ifError( e ); } );
                stmt.on( 'column', function( c, d, more ) {
                    ++expectedMinute;
                    assert( c == 0 );
                    assert( more == false );
                    var expectedDate = new Date( Date.UTC( 1900, 0, 1, randomHour, expectedMinute, 0, 0 ));
                    expectedDate.nanosecondsDelta = 0;
                    assert.deepEqual( d, expectedDate );
                });
                stmt.on( 'done', function() { assert( expectedMinute == 59 ); async_done(); } );
            },
            function( async_done ) {

                conn.queryRaw( "TRUNCATE TABLE time_test", function( e, r ) {

                    assert.ifError( e );
                    async_done();
                });
            },
            // insert all the hours and make sure they come back from time column
            function( async_done ) {

                var query = ["INSERT INTO time_test (test_time) VALUES "];

                for( var s = 0; s <= 59; ++s ) {

                    query.push( ["('", randomHour, ":", randomMinute, ":", s, ".00'),"].join("") );
                }
                query = query.join("");
                query = query.substr( 0, query.length - 1 );
                query += ";";

                conn.queryRaw( query, function( e, r ) {

                    assert.ifError( e );
                    async_done();
                });
            },
            function( async_done ) {

                var expectedSecond = -1;

                var stmt = conn.queryRaw( "SELECT test_time FROM time_test ORDER BY id" );

                stmt.on( 'error', function( e ) { assert.ifError( e ); } );
                stmt.on( 'column', function( c, d, more ) {
                    ++expectedSecond;
                    assert( c == 0 );
                    assert( more == false );
                    var expectedDate = new Date( Date.UTC( 1900, 0, 1, randomHour, randomMinute, expectedSecond, 0 ));
                    expectedDate.nanosecondsDelta = 0;
                    assert.deepEqual( d, expectedDate );
                });
                stmt.on( 'done', function() { assert( expectedSecond == 59 ); async_done(); } );
            },
            function( async_done ) {

                conn.queryRaw( "TRUNCATE TABLE time_test", function( e, r ) {

                    assert.ifError( e );
                    async_done();
                });
            },
            // insert a sampling of milliseconds and make sure they come back correctly
            function( async_done ) {

                var query = ["INSERT INTO time_test (test_time) VALUES "];
                randomMs = [];

                for( var ms = 0; ms <= 50; ++ms ) {

                    randomMs.push( Math.floor( Math.random() * 1000 ) );
                    query.push( ["('", randomHour, ":", randomMinute, ":", randomSecond, (randomMs[ ms ] / 1000).toFixed(3).substr(1), "')," ].join("") );
                }
                query = query.join("");
                query = query.substr( 0, query.length - 1 );
                query += ";";

                conn.queryRaw( query, function( e, r ) {

                    assert.ifError( e );
                    async_done();
                });
            },
            function( async_done ) {

                var msCount = -1;

                var stmt = conn.queryRaw( "SELECT test_time FROM time_test ORDER BY id" );

                stmt.on( 'error', function( e ) { assert.ifError( e ); } );
                stmt.on( 'column', function( c, d, more ) {
                    ++msCount;
                    assert( c == 0 );
                    assert( more == false );
                    var expectedDate = new Date( Date.UTC( 1900, 0, 1, randomHour, randomMinute, randomSecond, randomMs[ msCount ] ));
                    expectedDate.nanosecondsDelta = 0;
                    assert.deepEqual( d, expectedDate, "Milliseconds didn't match" );
                });
                stmt.on( 'done', function() { assert( msCount == 50 ); async_done(); } );
            },
            function( async_done ) {

                conn.queryRaw( "TRUNCATE TABLE time_test", function( e, r ) {

                    assert.ifError( e );
                    async_done();
                });
            },
            // insert a sampling of milliseconds and make sure they come back correctly
            function( async_done ) {

                var query = ["INSERT INTO time_test (test_time) VALUES "];


                for( var i in nanoseconds ) {

                    query.push( ["('", randomHour, ":", randomMinute, ":", randomSecond, (nanoseconds[i]).toFixed(7).substr(1), "')," ].join("") );
                }
                query = query.join("");
                query = query.substr( 0, query.length - 1 );
                query += ";";

                conn.queryRaw( query, function( e, r ) {

                    assert.ifError( e );
                    async_done();
                });
            },
            function( async_done ) {

                var nsCount = -1;

                var stmt = conn.queryRaw( "SELECT test_time FROM time_test ORDER BY id" );

                stmt.on( 'error', function( e ) { assert.ifError( e ); } );
                stmt.on( 'column', function( c, d, more ) {
                    ++nsCount;
                    assert( c == 0 );
                    assert( more == false );
                    var expectedDate = new Date( Date.UTC( 1900, 0, 1, randomHour, randomMinute, randomSecond, nanoseconds[ nsCount ] * 1000 ));
                    expectedDate.nanosecondsDelta = nanosecondsDeltaExpected[ nsCount ];
                    assert.deepEqual( d, expectedDate, "Nanoseconds didn't match" );
                });
                stmt.on( 'done', function() { assert( nsCount == 2 ); async_done(); test_done(); } );
            },
        ]);
    });
  });

  test( 'test timezone components of datetimeoffset', function( test_done ) {

    sql.open( conn_str, function( err, conn ) {

        var lastDays = [ 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 ];

        var tzYear   = 1970;
        var tzMonth  = 0; 
        var tzDay    = 1;
        var tzHour   = 0; 
        var tzMinute = 0; 
        var tzSecond = 0; 

        var insertedDate = new Date( Date.UTC( tzYear, tzMonth, tzDay, tzHour, tzSecond ));

        var msPerHour = 1000 * 60 * 60;

        async.series([
            function( async_done ) {

                conn.queryRaw( "DROP TABLE datetimeoffset_test", function( e ) { async_done(); } );
            },
            function( async_done ) {

                conn.query( "CREATE TABLE datetimeoffset_test (id int identity, test_datetimeoffset datetimeoffset)", function( e ) {

                    assert.ifError( e );
                    async_done();
                });
            },
            function (async_done) {

                conn.queryRaw("CREATE CLUSTERED INDEX IX_datetimeoffset_test ON datetimeoffset_test(id)", function (e) {

                    assert.ifError(e);
                    async_done();
                });
            },
            function (async_done) {

                var query = ["INSERT INTO datetimeoffset_test (test_datetimeoffset) VALUES "];

                // there are some timezones not on hour boundaries, but we aren't testing those in these unit tests
                for( var tz = -12; tz <= 12; ++tz ) {

                    query.push( ["('", (tzYear < 1000) ? "0" + tzYear : tzYear, "-", tzMonth + 1, "-", tzDay, 
                        " ", tzHour, ":", tzMinute, ":", tzSecond, (tz < 0) ? "" : "+", tz, ":00')," ].join("") );
                }
                query = query.join("");
                query = query.substr( 0, query.length - 1 );
                query += ";";

                conn.queryRaw( query, function( e, r ) {

                    assert.ifError( e );
                    async_done();
                });
            },
            function( async_done ) {

                var stmt = conn.queryRaw( "SELECT test_datetimeoffset FROM datetimeoffset_test ORDER BY id" );
                var tz = -13;

                stmt.on( 'error', function( e ) { assert.ifError( e ); });
                stmt.on( 'column', function( c, d, m ) { 

                    assert( c == 0, "c != 0");
                    assert( m == false, "m != false" );
                    assert( d.nanosecondsDelta == 0, "nanosecondsDelta != 0" );
                    ++tz;
                    var expectedDate = new Date( insertedDate.valueOf() + ( msPerHour * tz ));
                    assert( d.valueOf() == expectedDate.valueOf(), "Dates don't match" );
                });
                stmt.on( 'done', function() { assert( tz == 12, "Incorrect final timezone" ); async_done(); test_done(); });
            }
        ]);   
    });
  });
});