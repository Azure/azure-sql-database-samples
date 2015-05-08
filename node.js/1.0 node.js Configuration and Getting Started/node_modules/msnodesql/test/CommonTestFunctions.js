//---------------------------------------------------------------------------------------------------------------------------------
// File: CommonTestFunctions.js
// Contents: common functions used in various tests in the test suite for mssql node.js driver
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
var config = require('./test-config');
var async = require('async');
var util = require('util');

// Need to change this to false when parameters are supported
var SKIP_BINDPARAM_TEST_CASES = true;

// Need to change this to false to verify failing/haning tests are fixed
var SKIP_FAILING_HANGING_TEST_CASES = true;

// To print extended debugging information regarding what test cases are doing, set this parameter to 'true', else false
var writeDebugComments = false;

// Here are some commonly used phrases that can be shared to prevent unnecessary duplication of comments
var dataComparisonFailed = "Results do not match expected values";

function dataComparisonFailedMessage(testname, expected, actual, done) {
    errorComments("\nTEST FAILED, " + dataComparisonFailed + ", Test Case: \n'" + testname + "' \n");
    errorComments("\nExpected: \n" + util.inspect(expected));
    errorComments("\nReceived: \n" + util.inspect(actual));
    done(new Error("\nxxxTEST FAILED, " + dataComparisonFailed + ", Test Case: \n'" + testname + "' \n"));
};

//   non-optional message 
function errorComments(Message) {
    console.log(Message);
};

//   optional debugging information
function debugComments(Message) {
    if (writeDebugComments == true)
        errorComments(Message);
};

// For datetime types, the tests need to know the current offset (in hours) this machine's time zone is from GMT:
function getTimezoneOffsetInHours(year, month, day) {
    var js_date_expected_temp = new Date(year, month - 1, day, 0, 0, 0, 0);
    return js_date_expected_temp.getTimezoneOffset() / 60;
}

//    Create table for test data
function createTable(Connection, TableName, ColumnName, TestType, done) {
    var tsql = "if exists (SELECT * FROM sys.tables WHERE name = '" + TableName + "') DROP TABLE " + TableName;
    debugComments("\ntest note createTable1_CommonTestFunctions.js ... executing: \n" + tsql);
    Connection.queryRaw(tsql, function (e, r) { assert.ifError(e) });

    tsql = "CREATE TABLE " + TableName + " (id int identity, " + ColumnName + " " + TestType + ")";
    debugComments("\ntest note createTable2_CommonTestFunctions.js ... executing: \n" + tsql);
    Connection.queryRaw(tsql, function (e, r) { assert.ifError(e); done() });

    tsql = "CREATE CLUSTERED INDEX IX_" + TableName + "_id  ON " + TableName + "  (id) ";
    debugComments("\ntest note createTable2_CommonTestFunctions.js ... executing: \n" + tsql);
    Connection.queryRaw(tsql, function (e, r) { assert.ifError(e); done() });
    debugComments("\ntest note createTable3_CommonTestFunctions.js ... returning \n");
}

//    insert test data via parameters
function insertDataBP(Connection, TableName, ColumnName, TestData, done) {
    if (SKIP_BINDPARAM_TEST_CASES == true) {
        done();
    }
    else {
        var tsql = "INSERT INTO " + TableName + " (" + ColumnName + ") VALUES (?)";
        debugComments("\ntest note insertDataBP_CommonTestFunctions.js ... executing: \n" + tsql);
        Connection.queryRaw(tsql, [TestData], function (e, r) { assert.ifError(e); done() });
    }
}

//    insert test data via TSQL
function insertDataTSQL(Connection, TableName, ColumnName, TestData, done) {
    var tsql = "INSERT INTO " + TableName + " (" + ColumnName + ") VALUES (" + TestData + ")";
    debugComments("\ntest note insertDataTSQL_CommonTestFunctions.js ... executing: \n" + tsql);
    try {
        Connection.queryRaw(tsql, function (e, r) 
        { 
        assert.ifError(e);  
        });
    }
    catch (assert) {
        done(new Error("\nTEST FAILED, Insert into table failed (insertDataTSQL_CommonTestFunctions.js) with this error message:\n" + e.toString()));
        return;
    }
    done();
}

//    batched query comprised of (currently) 3 TSQL queries
function compoundQueryTSQL(Connection, tsql, ExpectedData1, ExpectedData2, ExpectedData3, testname, done) {
    debugComments("\ntest note compoundQueryTSQL_CommonTestFunctions.js ... executing: \n" + tsql);
    var called = 0;
    var NewExpectedData = ExpectedData1;
    Connection.queryRaw(tsql, [], function (e, r, more) {

        assert.ifError(e);

        ++called;
        if (called == 3)
            NewExpectedData = ExpectedData3;
        else if (called == 2)
            NewExpectedData = ExpectedData2;

        if (more) {
            try {
                debugComments("\ntest note compoundQueryTSQL01_CommonTestFunctions.js ... now in try{ } \n");
                assert.deepEqual(r, NewExpectedData, dataComparisonFailed);
            }
            catch (assert) {
                debugComments("\ntest note compoundQueryTSQL02_CommonTestFunctions.js ... now in catch (assert): \n");
                dataComparisonFailedMessage(testname, NewExpectedData, r, done);
                return;
            }
        }
        else {
            try {
                debugComments("\ntest note compoundQueryTSQL03_CommonTestFunctions.js ... now in try{ } \n");
                assert.deepEqual(r, NewExpectedData, dataComparisonFailed);
            }
            catch (assert) {
                debugComments("\ntest note compoundQueryTSQL04_CommonTestFunctions.js ... now in catch (assert): \n");
                dataComparisonFailedMessage(testname, NewExpectedData, r, done);
                return;
            }
        }
        if (called > 2) {
            done();
        }
    });
}

//    batched query comprised of (currently) 3 TSQL queries
function compoundQueryTSQLNewConnection(ConnectionString, tsql, ExpectedData1, ExpectedData2, ExpectedData3, testname, done) {
    debugComments("\ntest note compoundQueryTSQL_CommonTestFunctions.js ... executing: \n" + tsql);
    var called = 0;
    var NewExpectedData = ExpectedData1;
    sql.queryRaw(ConnectionString, tsql, [], function (e, r, more) {

        assert.ifError(e);

        ++called;
        if (called == 3)
            NewExpectedData = ExpectedData3;
        else if (called == 2)
            NewExpectedData = ExpectedData2;

        if (more) {
            try {
                debugComments("\ntest note compoundQueryTSQLNewConnection01_CommonTestFunctions.js ... now in try{ } \n");
                assert.deepEqual(r, NewExpectedData, dataComparisonFailed);
            }
            catch (assert) {
                debugComments("\ntest note compoundQueryTSQLNewConnection02_CommonTestFunctions.js ... now in catch (assert): \n");
                dataComparisonFailedMessage(testname, NewExpectedData, r, done);
                return;
            }
        }
        else {
            try {
                debugComments("\ntest note compoundQueryTSQLNewConnection03_CommonTestFunctions.js ... now in try{ } \n");
                assert.deepEqual(r, NewExpectedData, dataComparisonFailed);
            }
            catch (assert) {
                debugComments("\ntest note compoundQueryTSQLNewConnection04_CommonTestFunctions.js ... now in catch (assert): \n");
                dataComparisonFailedMessage(testname, NewExpectedData, r, done);
                return;
            }
        }
        if (called > 2) {
            done();
        }
    });
}

//  'tsql' contains an invalid and should fail with the error 'ExpectedError'
function invalidQueryTSQL(Connection, tsql, ExpectedError, testname, done) {
    debugComments("\ntest note invalidQueryTSQL_CommonTestFunctions.js ... executing: \n" + tsql);
    Connection.queryRaw(tsql, [], function (e, r, more) {
        if (e) {
            debugComments("\ninvalid query failed as expected \n");
            try {
                assert.deepEqual(e, ExpectedError, "Expected error didn't match \n");
            }
            catch (assert) {

                errorComments("\nTEST FAILED, Expected error didn't match, Test Case: \n'" + testname + "' \n");
                errorComments("\nExpected: \n" + ExpectedError);
                errorComments("\nReceived: \n" + e);
                done(new Error("\nxxxTEST FAILED, Expected error didn't match, Test Case: \n'" + testname + "' \n"));
                return;
            }
            e = null;
        }
        done();
    });
}

// compare fetched results from an ordered SELECT stmt against expected results. If comparison fails, 
// increment 'test failed' counter without causing tests to not respond via unhandled assert.
function verifyData(Connection, TableName, ColumnName, ExpectedData, testname, done) {
    var tsql = "SELECT * FROM " + TableName + " ORDER BY id";
    debugComments("\ntest note verifyData_CommonTestFunctions.js ... executing: \n" + tsql);
    try {
        Connection.queryRaw(tsql, function (e, r) {
            if (e) {
                done(new Error("\nTEST FAILED, SELECT FROM table failed (verifyData_CommonTestFunctions.js) with this error message:\n" + e.toString()));
                return;
            }
            try {
                debugComments("\ntest note verifyData_CommonTestFunctions.js returned results: \n" + util.inspect(r.rows[1]));
                assert.deepEqual(r, ExpectedData, dataComparisonFailed);
            }
            catch (assert) {
                dataComparisonFailedMessage(testname, ExpectedData, r, done);
                return;
            }
            done();
        });
    }
    catch (assert) {
        if (e) {
            done(new Error("\nTEST FAILED, SELECT FROM table failed (verifyData_CommonTestFunctions.js) with this error message:\n" + e.toString()));
            return;
        }
    }
}

// datetime types specific data verification function...
// compare fetched results from an ordered SELECT stmt against expected results. If comparison fails, 
// increment 'test failed' counter without causing tests to not respond via unhandled assert.
function verifyData_Datetime(Connection, TableName, ColumnName, RowWithNullData, ExpectedData, testname, done) {
    var tsql = "SELECT col2 FROM " + TableName + " ORDER BY id";
    var row = 23;
    var numberOfRows = 72;
    var numberOfRowsFetched = 0;
    debugComments("\ntest note verifyData_Datetime_CommonTestFunctions.js ... executing: \n" + tsql);
    try {
        Connection.queryRaw(tsql, function (e, r) {
            if (e) {
                done(new Error("\nTEST FAILED, SELECT FROM table failed (verifyData_Datetime_CommonTestFunctions.js) with this error message:\n" + e.toString()));
                return;
            }
            numberOfRows = r.rows.length;
            //debugComments("\ntest note verifyData_Datetime01_CommonTestFunctions.js ...Now examining data ...numberOfRows = '" + numberOfRows + "' \n");
            for (row = 0; row < numberOfRows; row++) {
                numberOfRowsFetched++;
                //debugComments("\ntest note verifyData_Datetime01H_CommonTestFunctions.js ...Now examining data 'util.inspect(r.rows[row=" + row + "])' = " + util.inspect(r.rows[row]) + " ... \n");
                if ((util.inspect(r.rows[row]) == util.inspect([null])) == true) {
                    //debugComments("\ntest note verifyData_Datetime02_CommonTestFunctions.js ... data in row " + row + " is null \n");
                    // convert 1-based row with null data to 0-based index value...
                    if (row != (RowWithNullData - 1)) {
                        done(new Error("\nTEST FAILED, SELECT FROM table failed ... null not received as expected:\n"));
                        return;
                    }
                }
                else {
                    var re = new Date(r.rows[row]);
                    try {
                        //debugComments("\ntest note verifyData_Datetime03_CommonTestFunctions.js ... data in row " + row + " is not null \n");
                        assert.deepEqual(re, ExpectedData, dataComparisonFailed);
                    }
                    catch (assert) {
                        dataComparisonFailedMessage(testname, ExpectedData, re, done);
                        return;
                    }
                }
            }
            //debugComments("\ntest note verifyData_Datetime01J_CommonTestFunctions.js ...Now examining data 'numberOfRowsFetched = " + numberOfRowsFetched + " ... \n");
            if (row != numberOfRowsFetched) {
                done(new Error("\nTEST FAILED, incorrect number of rows fetched ... expected " + row + " but fetched " + numberOfRowsFetched + " rows\n"));
                return;
            }
            done();
        });
    }
    catch (assert) {
        if (e) {
            done(new Error("\nTEST FAILED, SELECT FROM table failed (verifyData_Datetime_CommonTestFunctions.js) with this error message:\n" + e.toString()));
            return;
        }
    }
}

exports.debugComments = debugComments;
exports.errorComments = errorComments;
exports.getTimezoneOffsetInHours = getTimezoneOffsetInHours;
exports.createTable = createTable;
exports.insertDataBP = insertDataBP;
exports.insertDataTSQL = insertDataTSQL;
exports.compoundQueryTSQL = compoundQueryTSQL;
exports.compoundQueryTSQLNewConnection = compoundQueryTSQLNewConnection;
exports.invalidQueryTSQL = invalidQueryTSQL;
exports.verifyData = verifyData;
exports.verifyData_Datetime = verifyData_Datetime;
exports.SKIP_BINDPARAM_TEST_CASES = SKIP_BINDPARAM_TEST_CASES;
exports.SKIP_FAILING_HANGING_TEST_CASES = SKIP_FAILING_HANGING_TEST_CASES;
