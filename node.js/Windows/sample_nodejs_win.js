var http = require('http');
var sql = require('msnodesql');
var http = require('http');
var fs = require('fs');
var useTrustedConnection = false;
var result = "";


var conn_str = "Driver={SQL Server Native Client 11.0};Server=tcp:<yourservername>.database.windows.net;" + (useTrustedConnection == true ? "Trusted_Connection={Yes};" : "UID=<yourusername>;PWD=<yourpassword>;") + "Database={<yourdatabasename>};";
sql.open(conn_str, function (err, conn) {
    if (err) {
        console.log("Error opening the connection!");
        return;
    }
    else
        console.log("Successfuly connected");

    conn.queryRaw("SELECT TOP 10 Title, FirstName, LastName from SalesLT.Customer;", function (err, results) {
        if (err) {
            console.log("Error running query1!");
            return;
        }
        for (var i = 0; i < 10; i++) {
            console.log(results.rows[i]);
            result+= results.rows[i] + "\n";
        }
    });
    conn.queryRaw("INSERT SalesLT.Product (Name, ProductNumber, StandardCost, ListPrice, SellStartDate) OUTPUT INSERTED.ProductID VALUES ('SQL Server Express 1001', 'SQLEXPRESS 1001', 0, 0, CURRENT_TIMESTAMP)", function (err, results) {
        if (err) {
            console.log("Error running query!");
            return;
        }
        for (var i = 0; i < results.rows.length; i++) {
            console.log("Product ID Inserted : "+results.rows[i]);
            result+="<h1>";
            result+="Product ID Inserted : ";
            result+="</h1>";
            result += results.rows[i];
        }
    });
   
});


http.createServer(function (req, res) {
    res.writeHead(200, {'Content-Type': 'text/html'});
        res.write("<h1> First 100 Results of the sample query are : </h1> <h2> <pre>");  

        res.end(result);
        }).listen(1337, "127.0.0.1");
console.log('Server running at http://127.0.0.1:1337/');
