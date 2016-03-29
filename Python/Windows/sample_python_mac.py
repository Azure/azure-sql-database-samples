#using the pymssql driver
import pymssql

#Connect to your database.
#Replace server name, username, password, and database name with your credentials 
conn = pymssql.connect(server='yourserver.database.windows.net',
	user='yourusername@yourserver', password='yourpassword',
	database='AdventureWorks')
cursor = conn.cursor()

#Execute a simple select statement.
#Replace schema name and table name with your own
cursor.execute('SELECT c.CustomerID, c.CompanyName,COUNT(soh.SalesOrderID) AS OrderCount FROM SalesLT.Customer AS c LEFT OUTER JOIN SalesLT.SalesOrderHeader AS soh ON c.CustomerID = soh.CustomerID GROUP BY c.CustomerID, c.CompanyName ORDER BY OrderCount DESC;')
row = cursor.fetchone()

#Print results from select statement.
while row:
    print str(row[0]) + " " + str(row[1]) + " " + str(row[2])
    row = cursor.fetchone()

#INSERT
#Execute an insert statement
cursor.execute("INSERT SalesLT.Product (Name, ProductNumber, StandardCost, ListPrice, SellStartDate) OUTPUT INSERTED.ProductID VALUES ('SQL Server Express', 'SQLEXPRESS', 0, 0, CURRENT_TIMESTAMP)")
row = cursor.fetchone()

#Print the ID of the inserted row.
while row:
    print "Inserted Product ID : " +str(row[0])
    row = cursor.fetchone()
