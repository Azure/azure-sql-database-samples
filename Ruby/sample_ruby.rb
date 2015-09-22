#Using the TinyTDS driver
require 'tiny_tds' 

#Connect to your database. 
#Replace server name, username, and password with your credentials 
client = TinyTds::Client.new username: 'yourusername@yourserver', password: 'yourpassword', 
host: 'yourserver.database.windows.net', port: 1433, 
database: 'AdventureWorks', azure:true 

#SELECT
#Execute a simple select statement. 
results = client.execute("select * from SalesLT.Product") 

#Print results of select.
results.each do |row| 
puts row 
end 

#INSERT
#Configure date format to align with SQL Server datetime format
require 'date'
t = Time.now
curr_date = t.strftime("%Y-%m-%d %H:%M:%S.%L") 

#Execute an insert statement  
results = client.execute("INSERT SalesLT.Product (Name, ProductNumber, StandardCost, ListPrice, SellStartDate) 
OUTPUT INSERTED.ProductID VALUES ('SQL Server Express New', 'SQLEXPRESS New', 0, 0, '#{curr_date}' )")

#Print the ID of the inserted row. 
results.each do |row| 
puts row
end 
