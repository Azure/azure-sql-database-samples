#using the pymssql driver
import pymssql

#Connect to your database. 
#Replace server name, username, and password with your credentials    
conn = pymssql.connect(server='yourserver.database.windows.net', user='yourusername@yourserver', 
	password='yourpassword', database='AdventureWorks')
cursor = conn.cursor()

#Execute a simple select statement. 
cursor.execute('SELECT c.CustomerID, c.CompanyName,COUNT(soh.SalesOrderID) AS OrderCount FROM SalesLT.Customer AS c LEFT OUTER JOIN SalesLT.SalesOrderHeader AS soh ON c.CustomerID = soh.CustomerID GROUP BY c.CustomerID, c.CompanyName ORDER BY OrderCount DESC;')
row = cursor.fetchone()

#Print results. Specify as many columns as you require
while row:
    print str(row[0]) + " " + str(row[1]) + " " + str(row[2])   
    row = cursor.fetchone()
