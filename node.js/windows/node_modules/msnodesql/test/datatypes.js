//---------------------------------------------------------------------------------------------------------------------------------
// File: datatypes.js
// Contents: test suite for verifying the driver can use SQL Server Datatypes
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
var commonTestFns = require('./CommonTestFunctions');
var async = require('async');
var util = require( 'util' );



suite('datatypes', function () {
    var c;
    var tablename = "types_table";
    var testname = 'not set yet';

    var conn_str = config.conn_str;

    setup(function (test_done) {

        commonTestFns.debugComments("\ncalling sql.open(...) with conn_str= \" " + conn_str + "\" \n");
        sql.open(conn_str, function (err, new_conn) {

            assert.ifError(err);

            c = new_conn;

            test_done();
        });
    });

    teardown(function (done) {

        c.close(function (err) { assert.ifError(err); done(); });
    });

    testname = 'test 001 - verify functionality of data type \'smalldatetime\', fetch as date';
    test(testname, function (done) {
        var testcolumnsize = 16;
        var testcolumntype = " smalldatetime";
        var testcolumnclienttype = "date";
        var testcolumnname = "col2";
        var rowWithNullData = 1;
        // test date = 1955-12-13 12:43:00
        var year = 1955;
        var month = 12;
        var day = 13;
        var hour = 12;
        var minute = 43;
        var second = 0;
        var nanosecond = 0;
        var testdata2Expected = "" + year + "-" + month + "-" + day + " " + hour + ":" + minute + ":" + second;
        var testdata2TsqlInsert = "'" + testdata2Expected + "'";
        // Month in JS is 0-based, so expected will be month minus 1
        var js_date_expected = new Date(year, month - 1, day, hour - commonTestFns.getTimezoneOffsetInHours(year, month, day), minute, second, nanosecond);

        async.series([
            function (async_done) {
                commonTestFns.createTable(c, tablename, testcolumnname, testcolumntype, async_done);
            },
            function (async_done) {
                commonTestFns.insertDataTSQL(c, tablename, testcolumnname, null, async_done);
            },
            function (async_done) {
                commonTestFns.insertDataTSQL(c, tablename, testcolumnname, testdata2TsqlInsert, async_done);
            },
            function (async_done) {
                commonTestFns.verifyData_Datetime(c, tablename, testcolumnname, rowWithNullData, js_date_expected, testname, done);
            }
        ]);  // end of async.series()
    }); // end of test()

    testname = 'test 002 - verify functionality of data type \'datetime\', fetch as date';
    test(testname, function (done) {
        var testcolumnsize = 23;
        var testcolumntype = " datetime";
        var testcolumnclienttype = "date";
        var testcolumnname = "col2";
        var rowWithNullData = 2;
        // test date = 2007-05-08 12:35:29.123
        var year = 2007;
        var month = 05;
        var day = 08;
        var hour = 12;
        var minute = 35;
        var second = 29.123;
        var nanosecond = 0;
        var testdata2Expected = "" + year + "-" + month + "-" + day + " " + hour + ":" + minute + ":" + second;
        var testdata2TsqlInsert = "'" + testdata2Expected + "'";
        // Month in JS is 0-based, so expected will be month minus 1
        var js_date_expected = new Date(year, month - 1, day, hour - commonTestFns.getTimezoneOffsetInHours(year, month, day), minute, second, nanosecond);

        async.series
        ([
            function (async_done) {
                commonTestFns.createTable(c, tablename, testcolumnname, testcolumntype, async_done);
            },
            function (async_done) {
                commonTestFns.insertDataTSQL(c, tablename, testcolumnname, testdata2TsqlInsert, async_done);
            },
            function (async_done) {
                commonTestFns.insertDataTSQL(c, tablename, testcolumnname, null, async_done);
            },
            function (async_done) {
                commonTestFns.verifyData_Datetime(c, tablename, testcolumnname, rowWithNullData, js_date_expected, testname, done);
            }
        ]);  // end of async.series()
    });   // end of test(



    testname = 'test 003_a - insert valid data into time(7) via TSQL, fetch as date';
    test(testname, function (done) {
        var testcolumnsize = 16;
        var testdatetimescale = 7;
        var testcolumntype = " time(" + testdatetimescale + ")";
        var testcolumnclienttype = "date";
        var testcolumnname = "col2";
        var testdata1 = null;
        var rowWithNullData = 1;
        // test date = <default date> 12:10:05.1234567
        var year = 1900;
        var month = 1;
        var day = 1;
        var hour = 12;
        var minute = 10;
        var second = 05;
        var nanosecond = 0;
        // Month in JS is 0-based, so expected will be month minus 1
        var js_date_expected = new Date(year, month - 1, day, hour - commonTestFns.getTimezoneOffsetInHours(year, month, day), minute, second, nanosecond);
        var testdata2Expected = "12:10:05.1234567";
        var testdata2TsqlInsert = "'" + testdata2Expected + "'";

        async.series
        ([

            function (async_done) {
                commonTestFns.createTable(c, tablename, testcolumnname, testcolumntype, async_done);
            },
            function (async_done) {
                commonTestFns.insertDataTSQL(c, tablename, testcolumnname, testdata1, async_done);
            },
            function (async_done) {
                commonTestFns.insertDataTSQL(c, tablename, testcolumnname, testdata2TsqlInsert, async_done);
            },
            function (async_done) {
                commonTestFns.verifyData_Datetime(c, tablename, testcolumnname, rowWithNullData, js_date_expected, testname, done);
            }
        ]);
    });  // end of test()


    testname = 'test 003_b - insert valid data into time(0) via TSQL, fetch as date';
    test(testname, function (done) {
        var testcolumnsize = 16;
        var testdatetimescale = 0;
        var testcolumntype = " time(" + testdatetimescale + ")";
        var testcolumnclienttype = "date";
        var testcolumnname = "col2";
        var testdata1 = null;
        var rowWithNullData = 1;
        // test date = <default date> 12:10:05
        var year = 1900;
        var month = 1;
        var day = 1;
        var hour = 12;
        var minute = 10;
        var second = 05;
        var nanosecond = 0;
        // Month in JS is 0-based, so expected will be month minus 1
        var js_date_expected = new Date(year, month - 1, day, hour - commonTestFns.getTimezoneOffsetInHours(year, month, day), minute, second, nanosecond);
        var testdata2Expected = "12:10:05.1234567";
        var testdata2TsqlInsert = "'" + testdata2Expected + "'";

        async.series([

    function (async_done) {
        commonTestFns.createTable(c, tablename, testcolumnname, testcolumntype, async_done);
    },
    function (async_done) {
        commonTestFns.insertDataTSQL(c, tablename, testcolumnname, testdata1, async_done);
    },
    function (async_done) {
        commonTestFns.insertDataTSQL(c, tablename, testcolumnname, testdata2TsqlInsert, async_done);
    },
    function (async_done) {
        commonTestFns.verifyData_Datetime(c, tablename, testcolumnname, rowWithNullData, js_date_expected, testname, done);
    },
    ]);  // end of async.series()
    }); // end of test()

    testname = 'test 004_a - insert valid data into datetime2(7) via TSQL, fetch as date';
    test(testname, function (done) {
        var testcolumnsize = 27;
        var testdatetimescale = 7;
        var testcolumntype = " datetime2(" + testdatetimescale + ")";
        var testcolumnclienttype = "date";
        var testcolumnname = "col2";
        var testdata1 = null;
        var rowWithNullData = 1;
        // test date = 2001-04-10 10:12:59.1234567
        var year = 2001;
        var month = 4;
        var day = 10;
        var hour = 10;
        var minute = 12;
        var second = 59.1234567;
        var nanosecond = 0;
        // Month in JS is 0-based, so expected will be month minus 1
        var js_date_expected = new Date(year, month - 1, day, hour - commonTestFns.getTimezoneOffsetInHours(year, month, day), minute, second, nanosecond);
        var testdata2Expected = "2001-04-10 10:12:59.1234567";
        var testdata2TsqlInsert = "'" + testdata2Expected + "'";

        async.series([
            function (async_done) {
                commonTestFns.createTable(c, tablename, testcolumnname, testcolumntype, async_done);
            },
            function (async_done) {
                commonTestFns.insertDataTSQL(c, tablename, testcolumnname, testdata1, async_done);
            },
            function (async_done) {
                commonTestFns.insertDataTSQL(c, tablename, testcolumnname, testdata2TsqlInsert, async_done);
            },
            function (async_done) {
                commonTestFns.verifyData_Datetime(c, tablename, testcolumnname, rowWithNullData, js_date_expected, testname, done);
            }
        ]);  // end of async.series()
    }); // end of test()

    testname = 'test 004_b - insert valid data into datetime2(0) via TSQL, fetch as date';
    test(testname, function (done) {
        var testcolumnsize = 19;
        var testdatetimescale = 0;
        var testcolumntype = " datetime2(" + testdatetimescale + ")";
        var testcolumnclienttype = "date";
        var testcolumnname = "col2";
        var testdata1 = null;
        var rowWithNullData = 1;
        // test date = 2001-04-10 10:12:59.1234567
        var year = 2001;
        var month = 4;
        var day = 10;
        var hour = 10;
        var minute = 12;
        var second = 59;
        var nanosecond = 0;
        // Month in JS is 0-based, so expected will be month minus 1
        var js_date_expected = new Date(year, month - 1, day, hour - commonTestFns.getTimezoneOffsetInHours(year, month, day), minute, second, nanosecond);
        var testdata2Expected = "2001-04-10 10:12:59.1234567";
        var testdata2TsqlInsert = "'" + testdata2Expected + "'";

        async.series([
            function (async_done) {
                commonTestFns.createTable(c, tablename, testcolumnname, testcolumntype, async_done);
            },
            function (async_done) {
                commonTestFns.insertDataTSQL(c, tablename, testcolumnname, testdata1, async_done);
            },
            function (async_done) {
                commonTestFns.insertDataTSQL(c, tablename, testcolumnname, testdata2TsqlInsert, async_done);
            },
            function (async_done) {
                commonTestFns.verifyData_Datetime(c, tablename, testcolumnname, rowWithNullData, js_date_expected, testname, done);
            }
        ]);  // end of async.series()
    }); // end of test()

    testname = 'test 005_a - insert valid data into datetimeoffset(7) via TSQL, fetch as date';
    test(testname, function (done) {
        var testcolumnsize = 34;
        var testdatetimescale = 7;
        var testcolumntype = " datetimeoffset(" + testdatetimescale + ")";
        var testcolumnclienttype = "date";
        var testcolumnname = "col2";
        var testdata1 = null;
        var rowWithNullData = 1;
        // test date = 2001-04-10 10:12:59.1234567 +13:30
        var year = 2001;
        var month = 4;
        var day = 10;
        var hour = 10;
        var minute = 12;
        var second = 59.1234567;
        var nanosecond = 0;
        var offsetHours = 13;
        var offsetMinutes = 30;
        // Month in JS is 0-based, so expected will be month minus 1
        var js_date_expected = new Date(year, month - 1, day, hour - commonTestFns.getTimezoneOffsetInHours(year, month, day) + offsetHours, minute + offsetMinutes, second, nanosecond);
        var testdata2Expected = "2001-04-10 10:12:59.1234567 +" + offsetHours + ":" + offsetMinutes;
        var testdata2TsqlInsert = "'" + testdata2Expected + "'";

        async.series([
            function (async_done) {
                commonTestFns.createTable(c, tablename, testcolumnname, testcolumntype, async_done);
            },
            function (async_done) {
                commonTestFns.insertDataTSQL(c, tablename, testcolumnname, testdata1, async_done);
            },
            function (async_done) {
                commonTestFns.insertDataTSQL(c, tablename, testcolumnname, testdata2TsqlInsert, async_done);
            },
            function (async_done) {
                commonTestFns.verifyData_Datetime(c, tablename, testcolumnname, rowWithNullData, js_date_expected, testname, done);
            }
        ]);  // end of async.series()
    }); // end of test()

    testname = 'test 005_b - insert valid data into datetimeoffset(0) via TSQL, fetch as date';
    test(testname, function (done) {
        var testcolumnsize = 26;
        var testdatetimescale = 0;
        var testcolumntype = " datetimeoffset(" + testdatetimescale + ")";
        var testcolumnclienttype = "date";
        var testcolumnname = "col2";
        var testdata1 = null;
        var rowWithNullData = 1;
        // test date = 2001-04-10 10:12:59 +13:30
        var year = 2001;
        var month = 4;
        var day = 10;
        var hour = 10;
        var minute = 12;
        var second = 59;
        var nanosecond = 0;
        var offsetHours = 13;
        var offsetMinutes = 30;
        // Month in JS is 0-based, so expected will be month minus 1
        var js_date_expected = new Date(year, month - 1, day, hour - commonTestFns.getTimezoneOffsetInHours(year, month, day) + offsetHours, minute + offsetMinutes, second, nanosecond);
        var testdata2Expected = "2001-04-10 10:12:59.1234567 +" + offsetHours + ":" + offsetMinutes;
        var testdata2TsqlInsert = "'" + testdata2Expected + "'";

        async.series([

    function (async_done) {
        commonTestFns.createTable(c, tablename, testcolumnname, testcolumntype, async_done);
    },
    function (async_done) {
        commonTestFns.insertDataTSQL(c, tablename, testcolumnname, testdata1, async_done);
    },
    function (async_done) {
        commonTestFns.insertDataTSQL(c, tablename, testcolumnname, testdata2TsqlInsert, async_done);
    },
    function (async_done) {
        commonTestFns.verifyData_Datetime(c, tablename, testcolumnname, rowWithNullData, js_date_expected, testname, done);
    },
    ]);  // end of async.series()
    }); // end of test()

    testname = 'test 006_a - insert valid data into datetimeoffset(7) via TSQL, fetch as date UTC';
    test(testname, function (done) {
        var testcolumnsize = 34;
        var testdatetimescale = 7;
        var testcolumntype = " datetimeoffset(" + testdatetimescale + ")";
        var testcolumnclienttype = "date";
        var testcolumnname = "col2";
        var testdata1 = null;
        var rowWithNullData = 1;
        // test date = 2001-04-10 10:12:59 +13:30
        var year = 2001;
        var month = 4;
        var day = 10;
        var hour = 10;
        var minute = 12;
        var second = 59;
        var nanosecond = 0;
        var offsetHours = 13;
        var offsetMinutes = 30;
        // Month in JS is 0-based, so expected will be month minus 1
        var js_date_expected = new Date(year, month - 1, day, hour - commonTestFns.getTimezoneOffsetInHours(year, month, day) + offsetHours, minute + offsetMinutes, second, nanosecond);
        var testdata2Expected = "2001-04-10 10:12:59.1234567 +" + offsetHours + ":" + offsetMinutes;
        var testdata2TsqlInsert = "'" + testdata2Expected + "'";
        // note - month is 0-based in js
        var utcDate = new Date(Date.UTC(year,
            month - 1,
            day,
            hour + offsetHours,
            minute + offsetMinutes,
            second,
            nanosecond));

        async.series([

            function (async_done) {
                commonTestFns.createTable(c, tablename, testcolumnname, testcolumntype, async_done);
            },
            function (async_done) {
                commonTestFns.insertDataTSQL(c, tablename, testcolumnname, testdata1, async_done);
            },
            function (async_done) {
                commonTestFns.insertDataTSQL(c, tablename, testcolumnname, testdata2TsqlInsert, async_done);
            },
            function (async_done) {
                commonTestFns.verifyData_Datetime(c, tablename, testcolumnname, rowWithNullData, utcDate, testname, done);
            }
        ]);  // end of async.series()
    }); // end of test()

    testname = 'test 007 - insert valid data into date via TSQL, fetch as date';
    test(testname, function (done) {
        var testcolumnsize = 10;
        var testdatetimescale = 0;
        var testcolumntype = " date";
        var testcolumnclienttype = "date";
        var testcolumnname = "col2";
        var testdata1 = null;
        var rowWithNullData = 1;
        // test date = 2005-12-21
        var year = 2005;
        var month = 12;
        var day = 21;
        var hour = 0;
        var minute = 0;
        var second = 0;
        var nanosecond = 0;
        var testdata2Expected = "2005-12-21";
        var testdata2TsqlInsert = "'" + testdata2Expected + "'";
        var js_date_expected = new Date(year, month - 1, day, hour - commonTestFns.getTimezoneOffsetInHours(year, month, day), minute, second, nanosecond);

        async.series([
            function (async_done) {
                commonTestFns.createTable(c, tablename, testcolumnname, testcolumntype, async_done);
            },
            function (async_done) {
                commonTestFns.insertDataTSQL(c, tablename, testcolumnname, testdata1, async_done);
            },
            function (async_done) {
                commonTestFns.insertDataTSQL(c, tablename, testcolumnname, testdata2TsqlInsert, async_done);
            },
            function (async_done) {
                commonTestFns.verifyData_Datetime(c, tablename, testcolumnname, rowWithNullData, js_date_expected, testname, done);
            },
        ]);  // end of async.series()
    }); // end of test()

    testname = 'test 008 - insert null into varchar(max) via TSQL, fetch as text';
    test(testname, function (done) {
        var testcolumnsize = 0;
        var testcolumntype = " varchar(" + "max" + ")";
        var testcolumnclienttype = "text";
        var testcolumnname = "col2";
        var testdata1 = null;
        var testdata2Expected = "string data row 2";
        var testdata2TsqlInsert = "'" + testdata2Expected + "'";

        var expected = {
            meta:
    [{ name: 'id', size: 10, nullable: false, type: 'number' },
    { name: testcolumnname, size: testcolumnsize, nullable: true, type: testcolumnclienttype}],
            rows:
    [[1, testdata1],
    [2, testdata2Expected]]
        };

        async.series([

    function (async_done) {
        commonTestFns.createTable(c, tablename, testcolumnname, testcolumntype, async_done);
    },
    function (async_done) {
        commonTestFns.insertDataTSQL(c, tablename, testcolumnname, testdata1, async_done);
    },
    function (async_done) {
        commonTestFns.insertDataTSQL(c, tablename, testcolumnname, testdata2TsqlInsert, async_done);
    },
    function (async_done) {
        commonTestFns.verifyData(c, tablename, testcolumnname, expected, testname, done);
    },
    ]);  // end of async.series()
        // end of test():
    });

// currently, buffer size is 2048 characters, so a 2048 char string should not call 'more' in the OdbcConnection.cpp, but fetch entire result set at once.
testname = 'test 008_bndryCheck_VC - insert 2048 char string into varchar(max) via TSQL, fetch as text';
    test(testname, function (done) {
        var testcolumnsize = 0;
        var testcolumntype = " varchar(" + "max" + ")";
        var testcolumnclienttype = "text";
        var testcolumnname = "col2";
        var testdata1 = null;
        var A100CharacterString = "0234567890123456789022345678903234567890423456789052345678906234567890723456789082345678909234567890";
        var A2000CharacterString = A100CharacterString + A100CharacterString + A100CharacterString + A100CharacterString + A100CharacterString + A100CharacterString + A100CharacterString + A100CharacterString + A100CharacterString + A100CharacterString + A100CharacterString + A100CharacterString + A100CharacterString + A100CharacterString + A100CharacterString + A100CharacterString + A100CharacterString + A100CharacterString + A100CharacterString + A100CharacterString;
        var testdata2Expected = "AStringWith2048Characters_aaaa5aaa10aaa15aaa20aa" + A2000CharacterString;
        var testdata2TsqlInsert = "'" + testdata2Expected + "'";

        var expected = {
            meta:
        [{ name: 'id', size: 10, nullable: false, type: 'number' },
        { name: testcolumnname, size: testcolumnsize, nullable: true, type: testcolumnclienttype}],
            rows:
        [[1, testdata1],
        [2, testdata2Expected]]
        };

        async.series([

        function (async_done) {
            commonTestFns.createTable(c, tablename, testcolumnname, testcolumntype, async_done);
        },
        function (async_done) {
            commonTestFns.insertDataTSQL(c, tablename, testcolumnname, testdata1, async_done);
        },
        function (async_done) {
            commonTestFns.insertDataTSQL(c, tablename, testcolumnname, testdata2TsqlInsert, async_done);
        },
        function (async_done) {
            commonTestFns.verifyData(c, tablename, testcolumnname, expected, testname, done);
        },
        ]);  // end of async.series()
        // end of test():
    });

    // currently, buffer size is 2048 characters, so a 2049 char string should call 'more' in the OdbcConnection.cpp and concatenate to correctly return larger data
    testname = 'test 008_bndryCheck_NVC - insert 2049 char string into nvarchar(max) via TSQL, fetch as text';
    test(testname, function (done) {
        var testcolumnsize = 0;
        var testcolumntype = " nvarchar(" + "max" + ")";
        var testcolumnclienttype = "text";
        var testcolumnname = "col2";
        var testdata1 = null;
        var A100CharacterString = "0234567890123456789022345678903234567890423456789052345678906234567890723456789082345678909234567890";
        var A2000CharacterString = A100CharacterString + A100CharacterString + A100CharacterString + A100CharacterString + A100CharacterString + A100CharacterString + A100CharacterString + A100CharacterString + A100CharacterString + A100CharacterString + A100CharacterString + A100CharacterString + A100CharacterString + A100CharacterString + A100CharacterString + A100CharacterString + A100CharacterString + A100CharacterString + A100CharacterString + A100CharacterString;
        var testdata2Expected = "AStringWith2049Characters_aaaa5aaa10aaa15aaa20aaa" + A2000CharacterString;
        var testdata2TsqlInsert = "'" + testdata2Expected + "'";

        var expected = {
            meta:
        [{ name: 'id', size: 10, nullable: false, type: 'number' },
        { name: testcolumnname, size: testcolumnsize, nullable: true, type: testcolumnclienttype}],
            rows:
        [[1, testdata1],
        [2, testdata2Expected]]
        };

        async.series([

        function (async_done) {
            commonTestFns.createTable(c, tablename, testcolumnname, testcolumntype, async_done);
        },
        function (async_done) {
            commonTestFns.insertDataTSQL(c, tablename, testcolumnname, testdata1, async_done);
        },
        function (async_done) {
            commonTestFns.insertDataTSQL(c, tablename, testcolumnname, testdata2TsqlInsert, async_done);
        },
        function (async_done) {
            commonTestFns.verifyData(c, tablename, testcolumnname, expected, testname, done);
        },
        ]);  // end of async.series()
        // end of test():
    });

    testname = 'test 009 - verify functionality of data type \'guid\', fetch as text';
    test(testname, function (done) {
        var testcolumnsize = 36;
        var testcolumntype = " uniqueidentifier";
        var testcolumnclienttype = "text";
        var testcolumnname = "col2";
        var testdata1 = null;
        var testdata2Expected = "0E984725-C51C-4BF4-9960-E1C80E27ABA0";
        var testdata2TsqlInsert = "'" + testdata2Expected + "'";

        var expected = {
            meta:
                [{ name: 'id', size: 10, nullable: false, type: 'number' },
                { name: testcolumnname, size: testcolumnsize, nullable: true, type: testcolumnclienttype}],
            rows:
                [[1, testdata1],
                [2, testdata2Expected]]
        };

        if (commonTestFns.SKIP_FAILING_TEST_ISSUE_34 == true) {
            done();
        }
        else {
            async.series([
                function (async_done) {
                    commonTestFns.createTable(c, tablename, testcolumnname, testcolumntype, async_done);
                },
                function (async_done) {
                    commonTestFns.insertDataTSQL(c, tablename, testcolumnname, testdata1, async_done);
                },
                function (async_done) {
                    commonTestFns.insertDataTSQL(c, tablename, testcolumnname, testdata2TsqlInsert, async_done);
                },
                function (async_done) {
                    commonTestFns.verifyData(c, tablename, testcolumnname, expected, testname, done);
                }
            ]);  // end of async.series()
        }
        // end of test():
    });

    testname = 'test 010 - verify functionality of data type \'tinyint\', fetch as number';
    test(testname, function (done) {
        var testcolumnsize = 3;
        var testcolumntype = " tinyint";
        var testcolumnclienttype = "number";
        var testcolumnname = "col2";
        var testdata1 = null;
        var testdata2Expected = 255;
        var testdata2TsqlInsert = testdata2Expected;

        var expected = {
            meta:
    [{ name: 'id', size: 10, nullable: false, type: 'number' },
    { name: testcolumnname, size: testcolumnsize, nullable: true, type: testcolumnclienttype}],
            rows:
    [[1, testdata1],
    [2, testdata2Expected]]
        };

        async.series([

    function (async_done) {
        commonTestFns.createTable(c, tablename, testcolumnname, testcolumntype, async_done);
    },
    function (async_done) {
        commonTestFns.insertDataTSQL(c, tablename, testcolumnname, testdata1, async_done);
    },
    function (async_done) {
        commonTestFns.insertDataTSQL(c, tablename, testcolumnname, testdata2TsqlInsert, async_done);
    },
    function (async_done) {
        commonTestFns.verifyData(c, tablename, testcolumnname, expected, testname, done);
    },
    ]);  // end of async.series()
        // end of test():
    });

    testname = 'test 011 - verify functionality of data type \'smallint\', fetch as number';
    test(testname, function (done) {
        var testcolumnsize = 5;
        var testcolumntype = " smallint";
        var testcolumnclienttype = "number";
        var testcolumnname = "col2";
        var testdata1 = null;
        var testdata2Expected = 32767;
        var testdata2TsqlInsert = testdata2Expected;

        var expected = {
            meta:
    [{ name: 'id', size: 10, nullable: false, type: 'number' },
    { name: testcolumnname, size: testcolumnsize, nullable: true, type: testcolumnclienttype}],
            rows:
    [[1, testdata1],
    [2, testdata2Expected]]
        };

        async.series([

    function (async_done) {
        commonTestFns.createTable(c, tablename, testcolumnname, testcolumntype, async_done);
    },
    function (async_done) {
        commonTestFns.insertDataTSQL(c, tablename, testcolumnname, testdata1, async_done);
    },
    function (async_done) {
        commonTestFns.insertDataTSQL(c, tablename, testcolumnname, testdata2TsqlInsert, async_done);
    },
    function (async_done) {
        commonTestFns.verifyData(c, tablename, testcolumnname, expected, testname, done);
    },
    ]);  // end of async.series()
        // end of test():
    });

    testname = 'test 012 - verify functionality of data type \'int\', fetch as number';
    test(testname, function (done) {
        var testcolumnsize = 10;
        var testcolumntype = " int";
        var testcolumnclienttype = "number";
        var testcolumnname = "col2";
        var testdata1 = null;
        var testdata2Expected = -2147483648;
        var testdata2TsqlInsert = testdata2Expected;

        var expected = {
            meta:
    [{ name: 'id', size: 10, nullable: false, type: 'number' },
    { name: testcolumnname, size: testcolumnsize, nullable: true, type: testcolumnclienttype}],
            rows:
    [[1, testdata1],
    [2, testdata2Expected]]
        };

        async.series([

    function (async_done) {
        commonTestFns.createTable(c, tablename, testcolumnname, testcolumntype, async_done);
    },
    function (async_done) {
        commonTestFns.insertDataTSQL(c, tablename, testcolumnname, testdata1, async_done);
    },
    function (async_done) {
        commonTestFns.insertDataTSQL(c, tablename, testcolumnname, testdata2TsqlInsert, async_done);
    },
    function (async_done) {
        commonTestFns.verifyData(c, tablename, testcolumnname, expected, testname, done);
    },
    ]);  // end of async.series()
        // end of test():
    });

    testname = 'test 013 - verify functionality of data type \'bigint\', fetch as number';
    test(testname, function (done) {
        var testcolumnsize = 19;
        var testcolumntype = " bigint";
        var testcolumnclienttype = "number";
        var testcolumnname = "col2";
        var testdata1 = null;
        var testdata2Expected = -9223372036854775808;
        var testdata2TsqlInsert = testdata2Expected;

        var expected = {
            meta:
    [{ name: 'id', size: 10, nullable: false, type: 'number' },
    { name: testcolumnname, size: testcolumnsize, nullable: true, type: testcolumnclienttype}],
            rows:
    [[1, testdata1],
    [2, testdata2Expected]]
        };

        if (commonTestFns.SKIP_FAILING_HANGING_TEST_CASES == true) {
            done();
        }
        else {
            async.series([

    function (async_done) {
        commonTestFns.createTable(c, tablename, testcolumnname, testcolumntype, async_done);
    },
    function (async_done) {
        commonTestFns.insertDataTSQL(c, tablename, testcolumnname, testdata1, async_done);
    },
    function (async_done) {
        commonTestFns.insertDataTSQL(c, tablename, testcolumnname, testdata2TsqlInsert, async_done);
    },
    function (async_done) {
        commonTestFns.verifyData(c, tablename, testcolumnname, expected, testname, done);
    },
    ]);  // end of async.series()
        }
        // end of test():
    });

    testname = 'test 014 - verify functionality of data type \'smallmoney\', fetch as number';
    test(testname, function (done) {
        var testcolumnsize = 10;
        var testcolumntype = " smallmoney";
        var testcolumnclienttype = "number";
        var testcolumnname = "col2";
        var testdata1 = null;
        var testdata2Expected = 214748.3647;
        var testdata2TsqlInsert = testdata2Expected;

        var expected = {
            meta:
    [{ name: 'id', size: 10, nullable: false, type: 'number' },
    { name: testcolumnname, size: testcolumnsize, nullable: true, type: testcolumnclienttype}],
            rows:
    [[1, testdata1],
    [2, testdata2Expected]]
        };

        async.series([

    function (async_done) {
        commonTestFns.createTable(c, tablename, testcolumnname, testcolumntype, async_done);
    },
    function (async_done) {
        commonTestFns.insertDataTSQL(c, tablename, testcolumnname, testdata1, async_done);
    },
    function (async_done) {
        commonTestFns.insertDataTSQL(c, tablename, testcolumnname, testdata2TsqlInsert, async_done);
    },
    function (async_done) {
        commonTestFns.verifyData(c, tablename, testcolumnname, expected, testname, done);
    },
    ]);  // end of async.series()
        // end of test():
    });

    testname = 'test 015 - verify functionality of data type \'money\', fetch as number';
    test(testname, function (done) {
        var testcolumnsize = 19;
        var testcolumntype = " money";
        var testcolumnclienttype = "number";
        var testcolumnname = "col2";
        var testdata1 = null;
        var testdata2Expected = -922337203685477.5808;
        var testdata2TsqlInsert = testdata2Expected;

        var expected =
    {
        meta:
    [{ name: 'id', size: 10, nullable: false, type: 'number' },
    { name: testcolumnname, size: testcolumnsize, nullable: true, type: testcolumnclienttype}],
        rows:
    [[1, testdata1],
    [2, testdata2Expected]]
    };
        var tsql = "SELECT * FROM types_table ORDER BY id";
        var expectedError = "[Microsoft][" + config.driver + "][SQL Server]Arithmetic overflow";

        if (commonTestFns.SKIP_FAILING_HANGING_TEST_CASES == true) {
            done();
        }
        else {
            async.series([
    function (async_done) {
        commonTestFns.createTable(c, tablename, testcolumnname, testcolumntype, async_done);
    },
    function (async_done) {
        commonTestFns.insertDataTSQL(c, tablename, testcolumnname, testdata1, async_done);
    },
    function (async_done) {
        commonTestFns.insertDataTSQL(c, tablename, testcolumnname, testdata2TsqlInsert, async_done);
    },
    function (async_done) {
        commonTestFns.invalidQueryTSQL(c, tsql, expectedError, testname, done);
        //                commonTestFns.verifyData(c, tablename, testcolumnname, expected, testname, done);
    },
    ]);  // end of async.series()
        }
        // end of test():
    });

    testname = 'test 016 - verify functionality of data type \'numeric(7,3)\', fetch as number';
    test(testname, function (done) {
        var testcolumnsize = 7;
        var testcolumntype = " numeric(7,3)";
        var testcolumnclienttype = "number";
        var testcolumnname = "col2";
        var testdata1 = null;
        var testdata2Expected = 1234.567;
        var testdata2TsqlInsert = testdata2Expected;

        var expected = {
            meta:
    [{ name: 'id', size: 10, nullable: false, type: 'number' },
    { name: testcolumnname, size: testcolumnsize, nullable: true, type: testcolumnclienttype}],
            rows:
    [[1, testdata1],
    [2, testdata2Expected]]
        };

        async.series([

    function (async_done) {
        commonTestFns.createTable(c, tablename, testcolumnname, testcolumntype, async_done);
    },
    function (async_done) {
        commonTestFns.insertDataTSQL(c, tablename, testcolumnname, testdata1, async_done);
    },
    function (async_done) {
        commonTestFns.insertDataTSQL(c, tablename, testcolumnname, testdata2TsqlInsert, async_done);
    },
    function (async_done) {
        commonTestFns.verifyData(c, tablename, testcolumnname, expected, testname, done);
    },
    ]);  // end of async.series()
        // end of test():
    });

    testname = 'test 017 - verify functionality of data type \'decimal(7,3)\', fetch as number';
    test(testname, function (done) {
        var testcolumnsize = 7;
        var testcolumntype = " decimal(7,3)";
        var testcolumnclienttype = "number";
        var testcolumnname = "col2";
        var testdata1 = null;
        var testdata2Expected = 1234.567;
        var testdata2TsqlInsert = testdata2Expected;

        var expected = {
            meta:
    [{ name: 'id', size: 10, nullable: false, type: 'number' },
    { name: testcolumnname, size: testcolumnsize, nullable: true, type: testcolumnclienttype}],
            rows:
    [[1, testdata1],
    [2, testdata2Expected]]
        };

        async.series([

    function (async_done) {
        commonTestFns.createTable(c, tablename, testcolumnname, testcolumntype, async_done);
    },
    function (async_done) {
        commonTestFns.insertDataTSQL(c, tablename, testcolumnname, testdata1, async_done);
    },
    function (async_done) {
        commonTestFns.insertDataTSQL(c, tablename, testcolumnname, testdata2TsqlInsert, async_done);
    },
    function (async_done) {
        commonTestFns.verifyData(c, tablename, testcolumnname, expected, testname, done);
    },
    ]);  // end of async.series()
        // end of test():
    });

    testname = 'test 018 - verify functionality of data type \'bit\', fetch as number';
    test(testname, function (done) {
        var testcolumnsize = 1;
        var testcolumntype = " bit";
        var testcolumnclienttype = "boolean";
        var testcolumnname = "col2";
        var testdata1 = null;
        var testdata2Expected = 1;
        var testdata2TsqlInsert = testdata2Expected;

        var expected = {
            meta:
    [{ name: 'id', size: 10, nullable: false, type: 'number' },
    { name: testcolumnname, size: testcolumnsize, nullable: true, type: testcolumnclienttype}],
            rows:
    [[1, testdata1],
    [2, true]]
        };

        async.series([

    function (async_done) {
        commonTestFns.createTable(c, tablename, testcolumnname, testcolumntype, async_done);
    },
    function (async_done) {
        commonTestFns.insertDataTSQL(c, tablename, testcolumnname, testdata1, async_done);
    },
    function (async_done) {
        commonTestFns.insertDataTSQL(c, tablename, testcolumnname, testdata2TsqlInsert, async_done);
    },
    function (async_done) {
        commonTestFns.verifyData(c, tablename, testcolumnname, expected, testname, done);
    },
    ]);  // end of async.series()
        // end of test():
    });

    testname = 'test 019 - verify functionality of data type \'float(53)\', fetch as number';
    test(testname, function (done) {
        var testcolumnsize = 53;
        var testcolumntype = " float(53)";
        var testcolumnclienttype = "number";
        var testcolumnname = "col2";
        var testdata1 = null;
        var testdata2Expected = "1.79E+308";
        var testdata2TsqlInsert = testdata2Expected;

        var expected = {
            meta:
    [{ name: 'id', size: 10, nullable: false, type: 'number' },
    { name: testcolumnname, size: testcolumnsize, nullable: true, type: testcolumnclienttype}],
            rows:
    [[1, testdata1],
    [2, testdata2Expected]]
        };

        async.series([

    function (async_done) {
        commonTestFns.createTable(c, tablename, testcolumnname, testcolumntype, async_done);
    },
    function (async_done) {
        commonTestFns.insertDataTSQL(c, tablename, testcolumnname, testdata1, async_done);
    },
    function (async_done) {
        commonTestFns.insertDataTSQL(c, tablename, testcolumnname, testdata2TsqlInsert, async_done);
    },
    function (async_done) {
        commonTestFns.verifyData(c, tablename, testcolumnname, expected, testname, done);
    },
    ]);  // end of async.series()
        // end of test():
    });

    testname = 'test 020 - verify functionality of data type \'real\', fetch as number';
    test(testname, function (done) {
        var testcolumnsize = 24;
        var testcolumntype = " real";
        var testcolumnclienttype = "number";
        var testcolumnname = "col2";
        var testdata1 = null;
        var testdata2Expected = "44.44000244140625";
        var testdata2TsqlInsert = testdata2Expected;

        var expected = {
            meta:
    [{ name: 'id', size: 10, nullable: false, type: 'number' },
    { name: testcolumnname, size: testcolumnsize, nullable: true, type: testcolumnclienttype}],
            rows:
    [[1, testdata1],
    [2, testdata2Expected]]
        };

        async.series([

    function (async_done) {
        commonTestFns.createTable(c, tablename, testcolumnname, testcolumntype, async_done);
    },
    function (async_done) {
        commonTestFns.insertDataTSQL(c, tablename, testcolumnname, testdata1, async_done);
    },
    function (async_done) {
        commonTestFns.insertDataTSQL(c, tablename, testcolumnname, testdata2TsqlInsert, async_done);
    },
    function (async_done) {
        commonTestFns.verifyData(c, tablename, testcolumnname, expected, testname, done);
    },
    ]);  // end of async.series()
        // end of test():
    });

    testname = 'test 021 - verify functionality of data type \'binary(n)\', fetch as binary';
    test(testname, function (done) {
        var testcolumnsize = 10;
        var testcolumntype = " binary(" + testcolumnsize + ")";
        var testcolumnclienttype = "binary";
        var testcolumnname = "col2";
        var testdata1 = null;
        var testdata2TsqlInsert = 0x0123;

        var binary_buffer = new Buffer('00000000000000000123', 'hex');

        var expected = {
            meta:
    [{ name: 'id', size: 10, nullable: false, type: 'number' },
    { name: testcolumnname, size: testcolumnsize, nullable: true, type: testcolumnclienttype}],
            rows:
    [[1, testdata1],
    [2, binary_buffer]]
        };

        async.series([

    function (async_done) {
        commonTestFns.createTable(c, tablename, testcolumnname, testcolumntype, async_done);
    },
    function (async_done) {
        commonTestFns.insertDataTSQL(c, tablename, testcolumnname, testdata1, async_done);
    },
    function (async_done) {
        commonTestFns.insertDataTSQL(c, tablename, testcolumnname, testdata2TsqlInsert, async_done);
    },
    function (async_done) {
        commonTestFns.verifyData(c, tablename, testcolumnname, expected, testname, done);
    },
    ]);  // end of async.series()
        // end of test():
    });

    testname = 'test 022 - verify functionality of data type \'varbinary(n)\', fetch as binary';
    test(testname, function (done) {
        var testcolumnsize = 10;
        var testcolumntype = " varbinary(" + testcolumnsize + ")";
        var testcolumnclienttype = "binary";
        var testcolumnname = "col2";
        var testdata1 = null;
        var testdata2TsqlInsert = 0x0123;

        var binary_buffer = new Buffer('00000123', 'hex');

        var expected = {
            meta:
    [{ name: 'id', size: 10, nullable: false, type: 'number' },
    { name: testcolumnname, size: testcolumnsize, nullable: true, type: testcolumnclienttype}],
            rows:
    [[1, testdata1],
    [2, binary_buffer]]
        };

        async.series([

    function (async_done) {
        commonTestFns.createTable(c, tablename, testcolumnname, testcolumntype, async_done);
    },
    function (async_done) {
        commonTestFns.insertDataTSQL(c, tablename, testcolumnname, testdata1, async_done);
    },
    function (async_done) {
        commonTestFns.insertDataTSQL(c, tablename, testcolumnname, testdata2TsqlInsert, async_done);
    },
    function (async_done) {
        commonTestFns.verifyData(c, tablename, testcolumnname, expected, testname, done);
    },
    ]);  // end of async.series()
        // end of test():
    });

    testname = 'test 023 - verify functionality of data type \'varbinary(max)\', fetch as binary';
    test(testname, function (done) {
        var testcolumnsize = 0;
        var testcolumntype = " varbinary(" + "max" + ")";
        var testcolumnclienttype = "binary";
        var testcolumnname = "col2";
        var testdata1 = null;
        var testdata2TsqlInsert = "CONVERT(varbinary(max), 0x0123456789AB)";
        var binary_buffer = new Buffer('0123456789AB', 'hex');
        var expected = {
            meta:
    [{ name: 'id', size: 10, nullable: false, type: 'number' },
    { name: testcolumnname, size: testcolumnsize, nullable: true, type: testcolumnclienttype}],
            rows:
    [[1, testdata1],
    [2, binary_buffer]]
        };

        async.series([

    function (async_done) {
        commonTestFns.createTable(c, tablename, testcolumnname, testcolumntype, async_done);
    },
    function (async_done) {
        commonTestFns.insertDataTSQL(c, tablename, testcolumnname, testdata1, async_done);
    },
    function (async_done) {
        commonTestFns.insertDataTSQL(c, tablename, testcolumnname, testdata2TsqlInsert, async_done);
    },
    function (async_done) {
        commonTestFns.verifyData(c, tablename, testcolumnname, expected, testname, done);
    },
    ]);  // end of async.series()
        // end of test():
    });

    testname = 'test 024 - verify functionality of data type \'image\', fetch as binary';
    test(testname, function (done) {
        var testcolumnsize = 2147483647;
        var testcolumntype = " image";
        var testcolumnclienttype = "binary";
        var testcolumnname = "col2";
        var testdata1 = null;
        var testdata2Expected = 0x0123;
        var testdata2TsqlInsert = "CONVERT(varbinary(50), 0x0123456789AB)";
        var binary_buffer = new Buffer('0123456789AB', 'hex');

        var expected = {
            meta:
    [{ name: 'id', size: 10, nullable: false, type: 'number' },
    { name: testcolumnname, size: testcolumnsize, nullable: true, type: testcolumnclienttype}],
            rows:
    [[1, testdata1],
    [2, binary_buffer]]
        };

        async.series([

    function (async_done) {
        commonTestFns.createTable(c, tablename, testcolumnname, testcolumntype, async_done);
    },
    function (async_done) {
        commonTestFns.insertDataTSQL(c, tablename, testcolumnname, testdata1, async_done);
    },
    function (async_done) {
        commonTestFns.insertDataTSQL(c, tablename, testcolumnname, testdata2TsqlInsert, async_done);
    },
    function (async_done) {
        commonTestFns.verifyData(c, tablename, testcolumnname, expected, testname, done);
    },
    ]);  // end of async.series()
        // end of test():
    });

    testname = 'test 025 - verify functionality of data type \'xml\', fetch as text';
    test(testname, function (done) {
        var testcolumnsize = 0;
        var testcolumntype = " xml";
        var testcolumnclienttype = "text";
        var testcolumnname = "col2";
        var testdata1 = null;
        var testdata2Expected = "<data>zzzzz</data>";
        var testdata2TsqlInsert = "'" + testdata2Expected + "'";

        var expected = {
            meta:
                [{ name: 'id', size: 10, nullable: false, type: 'number' },
                { name: testcolumnname, size: testcolumnsize, nullable: true, type: testcolumnclienttype}],
            rows:
                [[1, testdata1],
                [2, testdata2Expected]]
        };

        if (commonTestFns.SKIP_FAILING_TEST_ISSUE_36 == true) {
            done();
        }
        else {
            async.series([
                function (async_done) {
                    commonTestFns.createTable(c, tablename, testcolumnname, testcolumntype, async_done);
                },
                function (async_done) {
                    commonTestFns.insertDataTSQL(c, tablename, testcolumnname, testdata1, async_done);
                },
                function (async_done) {
                    commonTestFns.insertDataTSQL(c, tablename, testcolumnname, testdata2TsqlInsert, async_done);
                },
                function (async_done) {
                    commonTestFns.verifyData(c, tablename, testcolumnname, expected, testname, done);
                }
            ]);  // end of async.series()
        }
        // end of test():
    });

    testname = 'test 026 - verify functionality of data type \'char\', fetch as text';
    test(testname, function (done) {
        var testcolumnsize = 10;
        var testcolumntype = " char(" + testcolumnsize + ")";
        var testcolumnclienttype = "text";
        var testcolumnname = "col2";
        var testdata1 = null;
        var testdata2Expected = "char data ";
        var testdata2TsqlInsert = "'" + testdata2Expected + "'";

        var expected = {
            meta:
    [{ name: 'id', size: 10, nullable: false, type: 'number' },
    { name: testcolumnname, size: testcolumnsize, nullable: true, type: testcolumnclienttype}],
            rows:
    [[1, testdata1],
    [2, testdata2Expected]]
        };

        async.series([

    function (async_done) {
        commonTestFns.createTable(c, tablename, testcolumnname, testcolumntype, async_done);
    },
    function (async_done) {
        commonTestFns.insertDataTSQL(c, tablename, testcolumnname, testdata1, async_done);
    },
    function (async_done) {
        commonTestFns.insertDataTSQL(c, tablename, testcolumnname, testdata2TsqlInsert, async_done);
    },
    function (async_done) {
        commonTestFns.verifyData(c, tablename, testcolumnname, expected, testname, done);
    },
    ]);  // end of async.series()
        // end of test():
    });

    testname = 'test 027 - verify functionality of data type \'varchar(n)\', fetch as text';
    test(testname, function (done) {
        var testcolumnsize = 20;
        var testcolumntype = " varchar(" + testcolumnsize + ")";
        var testcolumnclienttype = "text";
        var testcolumnname = "col2";
        var testdata1 = null;
        var testdata2Expected = "varchar data";
        var testdata2TsqlInsert = "'" + testdata2Expected + "'";

        var expected = {
            meta:
    [{ name: 'id', size: 10, nullable: false, type: 'number' },
    { name: testcolumnname, size: testcolumnsize, nullable: true, type: testcolumnclienttype}],
            rows:
    [[1, testdata1],
    [2, testdata2Expected]]
        };

        async.series([

    function (async_done) {
        commonTestFns.createTable(c, tablename, testcolumnname, testcolumntype, async_done);
    },
    function (async_done) {
        commonTestFns.insertDataTSQL(c, tablename, testcolumnname, testdata1, async_done);
    },
    function (async_done) {
        commonTestFns.insertDataTSQL(c, tablename, testcolumnname, testdata2TsqlInsert, async_done);
    },
    function (async_done) {
        commonTestFns.verifyData(c, tablename, testcolumnname, expected, testname, done);
    },
    ]);  // end of async.series()
        // end of test():
    });

    testname = 'test 028 - verify functionality of data type \'varchar(max)\', fetch as text';
    test(testname, function (done) {
        var testcolumnsize = 0;
        var testcolumntype = " varchar(" + "max" + ")";
        var testcolumnclienttype = "text";
        var testcolumnname = "col2";
        var testdata1 = null;
        var testdata2Expected = "varchar_max data";
        var testdata2TsqlInsert = "'" + testdata2Expected + "'";

        var expected = {
            meta:
    [{ name: 'id', size: 10, nullable: false, type: 'number' },
    { name: testcolumnname, size: testcolumnsize, nullable: true, type: testcolumnclienttype}],
            rows:
    [[1, testdata1],
    [2, testdata2Expected]]
        };

        async.series([

    function (async_done) {
        commonTestFns.createTable(c, tablename, testcolumnname, testcolumntype, async_done);
    },
    function (async_done) {
        commonTestFns.insertDataTSQL(c, tablename, testcolumnname, testdata1, async_done);
    },
    function (async_done) {
        commonTestFns.insertDataTSQL(c, tablename, testcolumnname, testdata2TsqlInsert, async_done);
    },
    function (async_done) {
        commonTestFns.verifyData(c, tablename, testcolumnname, expected, testname, done);
    },
    ]);  // end of async.series()
        // end of test():
    });

    testname = 'test 029 - verify functionality of data type \'text\', fetch as text';
    test(testname, function (done) {
        var testcolumnsize = 2147483647;
        var testcolumntype = " text";
        var testcolumnclienttype = "text";
        var testcolumnname = "col2";
        var testdata1 = null;
        var testdata2Expected = "text data";
        var testdata2TsqlInsert = "'" + testdata2Expected + "'";

        var expected = {
            meta:
    [{ name: 'id', size: 10, nullable: false, type: 'number' },
    { name: testcolumnname, size: testcolumnsize, nullable: true, type: testcolumnclienttype}],
            rows:
    [[1, testdata1],
    [2, testdata2Expected]]
        };

        async.series([

    function (async_done) {
        commonTestFns.createTable(c, tablename, testcolumnname, testcolumntype, async_done);
    },
    function (async_done) {
        commonTestFns.insertDataTSQL(c, tablename, testcolumnname, testdata1, async_done);
    },
    function (async_done) {
        commonTestFns.insertDataTSQL(c, tablename, testcolumnname, testdata2TsqlInsert, async_done);
    },
    function (async_done) {
        commonTestFns.verifyData(c, tablename, testcolumnname, expected, testname, done);
    },
    ]);  // end of async.series()
        // end of test():
    });

    testname = 'test 030 - verify functionality of data type \'nchar\', fetch as text';
    test(testname, function (done) {
        var testcolumnsize = 10;
        var testcolumntype = " nchar(" + testcolumnsize + ")";
        var testcolumnclienttype = "text";
        var testcolumnname = "col2";
        var testdata1 = null;
        var testdata2Expected = "char data ";
        var testdata2TsqlInsert = "'" + testdata2Expected + "'";

        var expected = {
            meta:
    [{ name: 'id', size: 10, nullable: false, type: 'number' },
    { name: testcolumnname, size: testcolumnsize, nullable: true, type: testcolumnclienttype}],
            rows:
    [[1, testdata1],
    [2, testdata2Expected]]
        };

        async.series([

    function (async_done) {
        commonTestFns.createTable(c, tablename, testcolumnname, testcolumntype, async_done);
    },
    function (async_done) {
        commonTestFns.insertDataTSQL(c, tablename, testcolumnname, testdata1, async_done);
    },
    function (async_done) {
        commonTestFns.insertDataTSQL(c, tablename, testcolumnname, testdata2TsqlInsert, async_done);
    },
    function (async_done) {
        commonTestFns.verifyData(c, tablename, testcolumnname, expected, testname, done);
    },
    ]);  // end of async.series()
        // end of test():
    });

    testname = 'test 031 - verify functionality of data type \'nvarchar(n)\', fetch as text';
    test(testname, function (done) {
        var testcolumnsize = 20;
        var testcolumntype = " nvarchar(" + testcolumnsize + ")";
        var testcolumnclienttype = "text";
        var testcolumnname = "col2";
        var testdata1 = null;
        var testdata2Expected = "nvarchar data";
        var testdata2TsqlInsert = "'" + testdata2Expected + "'";

        var expected = {
            meta:
    [{ name: 'id', size: 10, nullable: false, type: 'number' },
    { name: testcolumnname, size: testcolumnsize, nullable: true, type: testcolumnclienttype}],
            rows:
    [[1, testdata1],
    [2, testdata2Expected]]
        };

        async.series([

    function (async_done) {
        commonTestFns.createTable(c, tablename, testcolumnname, testcolumntype, async_done);
    },
    function (async_done) {
        commonTestFns.insertDataTSQL(c, tablename, testcolumnname, testdata1, async_done);
    },
    function (async_done) {
        commonTestFns.insertDataTSQL(c, tablename, testcolumnname, testdata2TsqlInsert, async_done);
    },
    function (async_done) {
        commonTestFns.verifyData(c, tablename, testcolumnname, expected, testname, done);
    },
    ]);  // end of async.series()
        // end of test():
    });

    testname = 'test 032 - verify functionality of data type \'nvarchar(max)\', fetch as text';
    test(testname, function (done) {
        var testcolumnsize = 0;
        var testcolumntype = " nvarchar(" + "max" + ")";
        var testcolumnclienttype = "text";
        var testcolumnname = "col2";
        var testdata1 = null;
        var testdata2Expected = "nvarchar_max data";
        var testdata2TsqlInsert = "'" + testdata2Expected + "'";

        var expected = {
            meta:
    [{ name: 'id', size: 10, nullable: false, type: 'number' },
    { name: testcolumnname, size: testcolumnsize, nullable: true, type: testcolumnclienttype}],
            rows:
    [[1, testdata1],
    [2, testdata2Expected]]
        };

        async.series([

    function (async_done) {
        commonTestFns.createTable(c, tablename, testcolumnname, testcolumntype, async_done);
    },
    function (async_done) {
        commonTestFns.insertDataTSQL(c, tablename, testcolumnname, testdata1, async_done);
    },
    function (async_done) {
        commonTestFns.insertDataTSQL(c, tablename, testcolumnname, testdata2TsqlInsert, async_done);
    },
    function (async_done) {
        commonTestFns.verifyData(c, tablename, testcolumnname, expected, testname, done);
    },
    ]);  // end of async.series()
        // end of test():
    });

    testname = 'test 033 - verify functionality of data type \'ntext\', fetch as text';
    test(testname, function (done) {
        var testcolumnsize = 1073741823;
        var testcolumntype = " ntext";
        var testcolumnclienttype = "text";
        var testcolumnname = "col2";
        var testdata1 = null;
        var testdata2Expected = "ntext data";
        var testdata2TsqlInsert = "'" + testdata2Expected + "'";

        var expected = {
            meta:
    [{ name: 'id', size: 10, nullable: false, type: 'number' },
    { name: testcolumnname, size: testcolumnsize, nullable: true, type: testcolumnclienttype}],
            rows:
    [[1, testdata1],
    [2, testdata2Expected]]
        };

        async.series([

    function (async_done) {
        commonTestFns.createTable(c, tablename, testcolumnname, testcolumntype, async_done);
    },
    function (async_done) {
        commonTestFns.insertDataTSQL(c, tablename, testcolumnname, testdata1, async_done);
    },
    function (async_done) {
        commonTestFns.insertDataTSQL(c, tablename, testcolumnname, testdata2TsqlInsert, async_done);
    },
    function (async_done) {
        commonTestFns.verifyData(c, tablename, testcolumnname, expected, testname, done);
    },
    ]);  // end of async.series()
        // end of test():
    });

    testname = 'test 034 - verify functionality of data type \'sysname\', fetch as text';
    test(testname, function (done) {
        var testcolumnsize = 128;
        var testcolumntype = " sysname";
        var testcolumnclienttype = "text";
        var testcolumnname = "col2";
        var testdata1Expected = "";
        var testdata1TsqlInsert = "'" + testdata1Expected + "'";
        var testdata2Expected = "sysname data";
        var testdata2TsqlInsert = "'" + testdata2Expected + "'";

        var expected =
    {
        meta:
    [{ name: 'id', size: 10, nullable: false, type: 'number' },
    { name: testcolumnname, size: testcolumnsize, nullable: false, type: testcolumnclienttype}],
        rows:
    [[1, testdata1Expected],
    [2, testdata2Expected]]
    };

        async.series([

    function (async_done) {
        commonTestFns.createTable(c, tablename, testcolumnname, testcolumntype, async_done);
    },
    function (async_done) {
        commonTestFns.insertDataTSQL(c, tablename, testcolumnname, testdata1TsqlInsert, async_done);
    },
    function (async_done) {
        commonTestFns.insertDataTSQL(c, tablename, testcolumnname, testdata2TsqlInsert, async_done);
    },
    function (async_done) {
        commonTestFns.verifyData(c, tablename, testcolumnname, expected, testname, done);
    }
    ]);
    });
});
