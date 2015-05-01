//---------------------------------------------------------------------------------------------------------------------------------
// File: sql.js
// Contents: javascript interface to Microsoft Driver for Node.js  for SQL Server
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

var sql = require('./sqlserver.native');
var events = require('events');
var util = require('util');

function StreamEvents() {
    events.EventEmitter.call(this);
}
util.inherits(StreamEvents, events.EventEmitter);

function routeStatementError(err, callback, notify) {

    if (callback) {
        callback(err);
    }
    else if (notify && notify.listeners('error').length > 0) {
        notify.emit('error', err);
    }
    else {
        throw new Error(err);
    }
}

function nextOp( q ) {

    q.shift();

    if( q.length != 0 ) {

        var op = q[0];

        op.fn.apply( op.fn, op.args );
    }
}

function validateParameters( parameters, funcName ) {

    for( var p in parameters ) {

        if( typeof parameters[p].value != parameters[p].type ) {

            throw new Error( ["[msnodesql] Invalid ", parameters[p].name, " passed to function ", funcName, ". Type should be ", parameters[p].type, "." ].join('') );
        }
    }
}

function query_internal(ext, query, params, callback) {

    function onQuery(err, results) {

        if( callback ) {
            callback(err, results);
        }
    }

    return ext.query(query, params, onQuery);
}


function getChunkyArgs(paramsOrCallback, callback) {

    if(( typeof paramsOrCallback == 'object' && Array.isArray( paramsOrCallback ) == true ) &&
         typeof callback == 'function' ) {

        return { params: paramsOrCallback, callback: callback };
    }

    if( paramsOrCallback == null && typeof callback == 'function' ) {

        return { params: [], callback: callback };
    }

    if( typeof paramsOrCallback == 'function' && typeof callback == 'undefined' ) {

        return { params: [], callback: paramsOrCallback };
    }

    if(( typeof paramsOrCallback == 'object' && Array.isArray( paramsOrCallback ) == true ) &&
         typeof callback == 'undefined' ) {

        return { params: paramsOrCallback, callback: null };
    }

    if(( paramsOrCallback == null || typeof paramsOrCallback == 'undefined' ) && typeof callback == 'undefined' ) {

        return { params: [], callback: null };
    }

    throw new Error( "[msnodesql] Invalid parameter(s) passed to function query or queryRaw." );
}

function objectify(results) {

    var names = {};
    var name, idx;

    for (idx in results.meta) {
        var meta = results.meta[idx];
        name = meta.name;
        if (name !== '' && names[name] === undefined) {
            names[name] = idx;
        }
        else {
            var extra = 0;
            var candidate = 'Column' + idx;
            while (names[candidate] !== undefined) {
                candidate = 'Column' + idx + '_' + extra++;
            }
            names[candidate] = idx;
        }
    }

    var rows = [];
    for (idx in results.rows) {
        var row = results.rows[idx];
        var value = {};
        for (name in names) {
            value[name] = row[names[name]];
        }
        rows.push(value);
    }

    return rows;
}

// TODO: Simplify this to use only events, and then subscribe in Connection.query
// and Connection.queryRaw to build callback results
function readall(q, notify, ext, query, params, callback) {


    var meta;
    var column;
    var rows = [];
    var rowindex = 0;

    function onReadColumnMore( err, results ) {

        if (err) {
            routeStatementError(err, callback, notify);
            nextOp( q );
            return;
        }

        var data = results.data;
        var more = results.more;

        notify.emit('column', column, data, more);

        if (callback) {
            rows[rows.length - 1][column] += data;
        }

        if (more) {
            ext.readColumn(column, onReadColumnMore);
            return;
        }

        column++;
        if (column >= meta.length) {
            ext.readRow(onReadRow);
            return;
        }

        ext.readColumn(column, onReadColumn);
    }

    function onReadColumn( err, results ) {

        if (err) {
            routeStatementError(err, callback, notify);
            nextOp(q);
            return;
        }

        var data = results.data;
        var more = results.more;

        notify.emit('column', column, data, more);

        if (callback) {
            rows[rows.length - 1][column] = data;
        }

        if (more) {
            ext.readColumn(column, onReadColumnMore);
            return;
        }

        column++;

        if (column >= meta.length) {
            ext.readRow(onReadRow);
            return;
        }

        ext.readColumn(column, onReadColumn);
    }

    function rowsCompleted( results, more ) {

        if( !more ) {
            notify.emit('done');
        }

        if (callback) {
            callback( null, results, more );
        }
    }

    function rowsAffected( moreResults ) {

        var rowCount = ext.readRowCount();

        notify.emit('rowcount', rowCount );

        rowsCompleted( { meta: null, rowcount: rowCount }, moreResults );
    }

    function onNextResult( err, nextResultSetInfo ) {

        if( err ) {

            routeStatementError( err, callback, notify );
            nextOp( q );
            return;
        }

        // handle the just finished result reading
        if( meta.length == 0 ) {
            // if there was no metadata, then pass the row count (rows affected)
            rowsAffected( !nextResultSetInfo.endOfResults );
        }
        else {
            // otherwise, pass the accumulated results
            rowsCompleted( { meta: meta, rows: rows }, !nextResultSetInfo.endOfResults );
        }

        // reset for the next resultset
        meta = nextResultSetInfo.meta;
        rows = [];

        if( nextResultSetInfo.endOfResults ) {

            // TODO: What about closed connections due to more being false in the callback?  See queryRaw below.
            nextOp( q );
        }
        else {

            // if this is just a set of rows 
            if( meta.length > 0 ) {
                notify.emit( 'meta', meta );
                    
                // kick off reading next set of rows
                ext.readRow( onReadRow );
            }
            else {

                ext.nextResult( onNextResult );
            }
        }            
    }

    function onReadRow( err, endOfRows ) {

        if (err) {
            routeStatementError(err, callback, notify);
            nextOp(q);
            return;
        }
        // if there were rows and we haven't reached the end yet (like EOF)
        else if (meta.length > 0 && !endOfRows) {

            notify.emit('row', rowindex++);

            column = 0;
            if (callback) {
                rows[rows.length] = [];
            }

            ext.readColumn(column, onReadColumn);
        }
        // otherwise, go to the next result set
        else {

            ext.nextResult( onNextResult );
        }
    }

    query_internal(ext, query, params, function (err, results) {

        if (err) {
            routeStatementError(err, callback, notify);
            nextOp(q);
            return;
        }

        meta = results;
        if (meta.length > 0) {

            notify.emit('meta', meta);
            ext.readRow( onReadRow );
        }
        else {

            ext.nextResult( onNextResult )
        }
    });
}

function open(connectionString, callback) {

    validateParameters( [ { type: 'string', value: connectionString, name: 'connection string' },
                          { type: 'function', value: callback, name: 'callback' }], 'open' );

    var ext = new sql.Connection();

    var q = [];

    function defaultCallback( err ) {

        if( err ) {
            throw new Error( err );
        }
    }

    function Connection() {

        this.close = function (callback) { 

            function onClose( err ) {

                callback( err );
            }

            callback = callback || defaultCallback;

            ext.close( onClose ); 
        }

        this.queryRaw = function (query, paramsOrCallback, callback) {

            validateParameters( [ { type: 'string', value: query, name: 'query string' }], 'queryRaw' );

            var notify = new StreamEvents();

            var chunky = getChunkyArgs(paramsOrCallback, callback);

            var op = { fn: readall, args: [ q, notify, ext, query, chunky.params, chunky.callback ] }; 
            q.push( op );
            
            if( q.length == 1 ) {

                readall( q, notify, ext, query, chunky.params, chunky.callback );
            }

            return notify;
        }

        this.query = function (query, paramsOrCallback, callback) {

            validateParameters( [ { type: 'string', value: query, name: 'query string' }], 'query' );

            var chunky = getChunkyArgs(paramsOrCallback, callback);

            function onQueryRaw( err, results, more ) {

                if (chunky.callback) {
                    if (err) chunky.callback(err);
                    else chunky.callback(err, objectify(results), more);
                }
            }

            return this.queryRaw(query, chunky.params, onQueryRaw);
        }

        this.beginTransaction = function(callback) {

            function onBeginTxn( err ) {

                callback( err );

                nextOp( q );
            }

            callback = callback || defaultCallback;
            
            var op = { fn: function( callback ) { ext.beginTransaction( callback ) }, args: [ onBeginTxn ] }; 
            q.push( op );

            if( q.length == 1 ) {

                ext.beginTransaction( onBeginTxn );
            }
        }

        this.commit = function (callback) {

            function onCommit( err ) {

                callback( err );

                nextOp(q);
            }

            callback = callback || defaultCallback;

            var op = { fn: function (callback) { ext.commit(callback); }, args: [onCommit] };
            q.push(op);

            if (q.length == 1) {

                ext.commit(onCommit);
            }
        }

        this.rollback = function(callback) {

            function onRollback( err ) {

                callback( err );

                nextOp( q );
            }

            callback = callback || defaultCallback;

            var op = { fn: function( callback ) { ext.rollback( callback ); }, args: [ onRollback ] }; 
            q.push( op );

            if( q.length == 1 ) {

                ext.rollback( onRollback );
            }
        }
    }

    var connection = new Connection();

    function onOpen( err ) {

        callback( err, connection );
    }

    callback = callback || defaultCallback;

    ext.open(connectionString, onOpen);

    return connection;
}

function query(connectionString, query, paramsOrCallback, callback) {

    validateParameters( [ { type: 'string', value: connectionString, name: 'connection string' },
                          { type: 'string', value: query, name: 'query string' }], 'query' );

    var chunky = getChunkyArgs(paramsOrCallback, callback);

    return queryRaw(connectionString, query, chunky.params, function (err, results, more) {
        if (chunky.callback) {
            if (err) chunky.callback(err);
            else chunky.callback(err, objectify(results), more);
        }
    });
}

function queryRaw(connectionString, query, paramsOrCallback, callback) {

    validateParameters( [ { type: 'string', value: connectionString, name: 'connection string' },
                          { type: 'string', value: query, name: 'query string' }], 'queryRaw' );

    var ext = new sql.Connection();
    var notify = new StreamEvents();
    var q = [];

    var chunky = getChunkyArgs(paramsOrCallback, callback);

    chunky.callback = chunky.callback || function( err ) { if( err ) { throw new Error( err ); } };

    function onOpen( err, connection ) {

        if( err ) {
            chunky.callback( err );
            return;
        }

        readall(q, notify, ext, query, chunky.params, function (err, results, more) {

            if (err) {
                routeStatementError(err, chunky.callback, notify);
                return;
            }

            if( chunky.callback ) {
                chunky.callback( err, results, more );
            }

            if( !more ) {
                ext.close();
            }
        });

    }

    ext.open(connectionString, onOpen);

    return notify;
}

exports.open = open;
exports.query = query; 
exports.queryRaw = queryRaw;
