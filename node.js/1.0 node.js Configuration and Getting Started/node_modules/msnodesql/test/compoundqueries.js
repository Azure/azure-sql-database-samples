//---------------------------------------------------------------------------------------------------------------------------------
// File: compoundqueries.js
// Contents: test suite for verifying support of batched queries for mssql node.js driver
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

suite('compoundqueries', function () {
    var c;
    var tablename = "compoundqueries_table";
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

    testname = 'test 001 - batched query: SELECT....; INSERT ....; SELECT....;';
    test(testname, function (done) {
        var testcolumnsize = 100;
        var testcolumntype = " varchar(" + testcolumnsize + ")";
        var testcolumnclienttype = "text";
        var testcolumnname = "col2";
        var testdata1 = null;
        var testdata2Expected = "string data row 2";
        var testdata2TsqlInsert = "'" + testdata2Expected + "'";
        var tsql = "SELECT * FROM " + tablename + " ORDER BY id;  INSERT INTO " + tablename + " (" + testcolumnname + ") VALUES (" + testdata1 + ");SELECT * FROM " + tablename + " ORDER BY id;";

        var expected1 = {
            meta:
    [{ name: 'id', size: 10, nullable: false, type: 'number' },
    { name: testcolumnname, size: testcolumnsize, nullable: true, type: testcolumnclienttype}],
            rows:
    [[1, null],
    [2, testdata2Expected]]
        };

        var expected2 = {
            meta:
    null,
            rowcount:
    -1
        };

        var expected3 = {
            meta:
    [{ name: 'id', size: 10, nullable: false, type: 'number' },
    { name: testcolumnname, size: testcolumnsize, nullable: true, type: testcolumnclienttype}],
            rows:
    [[1, null],
    [2, testdata2Expected],
    [3, null]]
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
        commonTestFns.compoundQueryTSQL(c, tsql, expected1, expected2, expected3, testname, done);
    },
    ]);  // end of async.series()
    }); // end of test()

    testname = 'test 002 - batched query: SELECT....; PRINT ....; SELECT....;';
    test(testname, function (done) {
        var testcolumnsize = 100;
        var testcolumntype = " varchar(" + testcolumnsize + ")";
        var testcolumnclienttype = "text";
        var testcolumnname = "col2";
        var testdata1 = null;
        var testdata2Expected = "string data row 2";
        var testdata2TsqlInsert = "'" + testdata2Expected + "'";
        var tsql = "SELECT * FROM " + tablename + " ORDER BY id;  PRINT 'hello B.O.B.';SELECT * FROM " + tablename + " ORDER BY id;";

        var expected1 = {
            meta:
    [{ name: 'id', size: 10, nullable: false, type: 'number' },
    { name: testcolumnname, size: testcolumnsize, nullable: true, type: testcolumnclienttype}],
            rows:
    [[1, null],
    [2, testdata2Expected]]
        };

        var expected2 = {
            meta:
    null,
            rowcount:
    -1
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
        commonTestFns.compoundQueryTSQL(c, tsql, expected1, expected2, expected1, testname, done);
    },
    ]);  // end of async.series()
    }); // end of test()

    testname = 'test 003 - batched query: SELECT....; SELECT (with no results) ....; SELECT....;';
    test(testname, function (done) {
        var testcolumnsize = 100;
        var testcolumntype = " varchar(" + testcolumnsize + ")";
        var testcolumnclienttype = "text";
        var testcolumnname = "col2";
        var testdata1 = null;
        var testdata2Expected = "string data row 2";
        var testdata2TsqlInsert = "'" + testdata2Expected + "'";
        var tsql = "SELECT * FROM " + tablename + " ORDER BY id;  SELECT * FROM " + tablename + " WHERE 1=2; SELECT * FROM " + tablename + " ORDER BY id;";

        var expected1 = {
            meta:
    [{ name: 'id', size: 10, nullable: false, type: 'number' },
    { name: testcolumnname, size: testcolumnsize, nullable: true, type: testcolumnclienttype}],
            rows:
    [[1, null],
    [2, testdata2Expected]]
        };

        var expected2 = {
            meta:
    [{ name: 'id', size: 10, nullable: false, type: 'number' },
    { name: testcolumnname, size: testcolumnsize, nullable: true, type: testcolumnclienttype}],
            rows:
    []
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
        commonTestFns.compoundQueryTSQL(c, tsql, expected1, expected2, expected1, testname, done);
    },
    ]);  // end of async.series()
    }); // end of test()

    testname = 'test 004 - batched query: SELECT....; INSERT (invalid...should fail) ....; SELECT....;';
    test(testname, function (done) {
        var invalidtablename = "invalid" + tablename;
        var testcolumnsize = 100;
        var testcolumntype = " varchar(" + testcolumnsize + ")";
        var testcolumnclienttype = "text";
        var testcolumnname = "col2";
        var testdata1 = null;
        var testdata2Expected = "string data row 2";
        var testdata2TsqlInsert = "'" + testdata2Expected + "'";
        var tsql = "SELECT * FROM " + tablename + " ORDER BY id;  INSERT INTO " + invalidtablename + " (" + testcolumnname + ") VALUES (" + testdata1 + ");SELECT * FROM " + tablename + " ORDER BY id;";

        var expected1 = {
            meta:
    [{ name: 'id', size: 10, nullable: false, type: 'number' },
    { name: testcolumnname, size: testcolumnsize, nullable: true, type: testcolumnclienttype}],
            rows:
    [[1, null],
    [2, testdata2Expected]]
        };

        var expected2 = {
            meta:
    [{ name: 'id', size: 10, nullable: false, type: 'number' },
    { name: testcolumnname, size: testcolumnsize, nullable: true, type: testcolumnclienttype}],
            rows:
    []
        };
        var expectedError = new Error( "[Microsoft][" + config.driver + "][SQL Server]Invalid object name '" + invalidtablename + "'." );
        expectedError.sqlstate = '42S02';
        expectedError.code = 208;

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
    },
    ]);  // end of async.series()
    }); // end of test()
});