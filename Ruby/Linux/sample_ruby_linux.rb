#Using the TinyTDS driver
require 'tiny_tds'
require 'date'

#Connect to your database.
#Replace server name, username, and password with your credentials
#Code is dependent on AdventureWorks database
client = TinyTds::Client.new username: 'yourusername@yourserver', password: 'yourpassword',
host: 'yourserver.database.windows.net', port: 1433,
database: 'AdventureWorks', azure:true

#SELECT
#Execute a simple select statement.
results = client.execute("SELECT TOP 10 Title, FirstName, LastName from SalesLT.Customer")

#Print results of select.
results.each do |row|
    puts row
end

#INSERT
#Make sure you have followed the recommended settings for using TinyTDS with Azure
results = client.execute("SET ANSI_NULLS ON")
results = client.execute("SET CURSOR_CLOSE_ON_COMMIT OFF")
results = client.execute("SET ANSI_NULL_DFLT_ON ON")
results = client.execute("SET IMPLICIT_TRANSACTIONS OFF")
results = client.execute("SET ANSI_PADDING ON")
results = client.execute("SET QUOTED_IDENTIFIER ON")
results = client.execute("SET ANSI_WARNINGS ON")
results = client.execute("SET CONCAT_NULL_YIELDS_NULL ON")

#Configure date format to align with SQL Server datetime format
t = Time.now
curr_date = t.strftime("%Y-%m-%d %H:%M:%S.%L")

#Execute an insert statement
results = client.execute("INSERT SalesLT.Product (Name, ProductNumber, StandardCost, ListPrice, SellStartDate)
 OUTPUT INSERTED.ProductID VALUES ('SQL Server Express New', 'SQLEXPRESS New', 0, 0, '#{curr_date}' )")

#Print the ID of the inserted row.
results.each do |row|
    puts ro
end
