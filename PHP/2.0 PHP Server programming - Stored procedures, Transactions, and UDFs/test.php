<?php	
	$serverName = "tcp:yourserver.database.windows.net,1433";
    $connectionOptions = array("Database"=>"yourdatabase",
        "Uid"=>"yourusername", "PWD"=>"yourpassword");
    //Establishes the connection
    $conn = sqlsrv_connect($serverName, $connectionOptions);
    //////////////////STORED PROCEDURE/////////////////////////    
    $tsql = "CREATE PROCEDURE sp_GetCompanies22 AS BEGIN SELECT [CompanyName] FROM SalesLT.Customer END";
    $storedProc = sqlsrv_query($conn, $tsql);
    if($storedProc == FALSE){
        echo "Error creating Stored Procedure";
        die(FormatErrors( sqlsrv_errors()));
    }    
    sqlsrv_free_stmt($storedProc);

    $tsql = "exec sp_GETCompanies22";
    //Executes the query
    $getProducts = sqlsrv_query($conn, $tsql);
    //Error handling
    if ($getProducts == FALSE){
        echo "Error executing Stored Procedure";    
        die(FormatErrors(sqlsrv_errors()));
    }    
    $productCount = 0;
    $ctr = 0;
?>    
    <h1> First 10 results are after executing the stored procedure:  </h1>
<?php
    while($row = sqlsrv_fetch_array($getProducts, SQLSRV_FETCH_ASSOC)){ 
        //Printing only the first 10 results 
        if($ctr>9)
            break; 
        $ctr++;
        echo($row['CompanyName']);
        echo("<br/>");
        $productCount++;  
    }
    sqlsrv_free_stmt($getProducts);
    $tsql = "DROP PROCEDURE sp_GETCompanies22";

    $storedProc = sqlsrv_query($conn, $tsql);
    if($storedProc == FALSE)
    {
        echo "Error dropping Stored Procedure";
        die(FormatErrors( sqlsrv_errors()));
    }    
    sqlsrv_free_stmt($storedProc);
?>
<?php
    //////////////////TRANSACTION/////////////////////////
    if (sqlsrv_begin_transaction($conn) == FALSE)
    {
        echo "Error opening connection";    
        die(FormatErrors(sqlsrv_errors()));
    }   

        /* Set up and execute the first query. */
    $tsql1 = "INSERT INTO SalesLT.SalesOrderDetail
       (SalesOrderID,OrderQty,ProductID,UnitPrice)
       VALUES (71774, 22, 709, 33)";
    $stmt1 = sqlsrv_query($conn, $tsql1);

    /* Set up and execute the second query. */
    $tsql2 = "UPDATE SalesLT.SalesOrderDetail SET OrderQty = (OrderQty + 1) WHERE ProductID = 709";
    $stmt2 = sqlsrv_query( $conn, $tsql2);

    /* If both queries were successful, commit the transaction. */
    /* Otherwise, rollback the transaction. */
    if($stmt1 && $stmt2)
    {
            sqlsrv_commit($conn);
 ?>
        <h1> Transaction was commited </h1>

<?php           
            
    }
    else
    {
            sqlsrv_rollback($conn);
            echo "Transaction was rolled back.\n";
    }

    /* Free statement and connection resources. */
    sqlsrv_free_stmt( $stmt1);
    sqlsrv_free_stmt( $stmt2);

?>
<?php
    //////////////////UDF/////////////////////////
    //Dropping function if it already exists
    $tsql1 = "IF OBJECT_ID(N'dbo.ifGetTotalItems', N'IF') IS NOT NULL DROP FUNCTION dbo.ifGetTotalItems;";
    $getProducts = sqlsrv_query($conn, $tsql1);
    //Error handling
    if ($getProducts == FALSE)
    {
        echo "Error deleting the UDF";    
        die(FormatErrors(sqlsrv_errors()));
    }
    $tsql1 = "CREATE FUNCTION dbo.ifGetTotalItems (@OrderID INT) RETURNS TABLE WITH SCHEMABINDING AS RETURN (SELECT SUM(OrderQty) AS TotalItems FROM SalesLT.SalesOrderDetail WHERE SalesOrderID = @OrderID GROUP BY SalesOrderID);";
    $getProducts = sqlsrv_query($conn, $tsql1);
    //Error handling
    if ($getProducts == FALSE)
    {
        echo "Error creating the UDF";    
        die(FormatErrors(sqlsrv_errors()));
    }
    $tsql1 = "SELECT s.SalesOrderID, s.OrderDate, s.CustomerID, f.TotalItems FROM SalesLT.SalesOrderHeader s CROSS APPLY dbo.ifGetTotalItems(s.SalesOrderID) f ORDER BY SalesOrderID;";
    $getProducts = sqlsrv_query($conn, $tsql1);
    //Error handling
    if ($getProducts == FALSE)
    {
        echo "Error executing the UDF";    
        die(FormatErrors(sqlsrv_errors()));
    }   
    $productCount = 0;
    $ctr = 0;
?>    
    <h1> First 10 results are after executing a query that uses the UDF:  </h1>
<?php
    echo "SalesOrderID      CustomerID      TotalItems";
            echo("<br/>");

    while($row = sqlsrv_fetch_array($getProducts, SQLSRV_FETCH_ASSOC))
    {  
        //Printing only the top 10 results
        if($ctr>9)
            break; 
        $ctr++;
        echo $row['SalesOrderID'] . str_repeat('&nbsp;', 13) . $row['CustomerID'] . str_repeat('&nbsp;', 11) . $row['TotalItems'];
        echo("<br/>");
        $productCount++;
      
    }
    sqlsrv_free_stmt($getProducts);


?>