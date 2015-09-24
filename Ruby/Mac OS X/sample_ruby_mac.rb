#Using the TinyTDS driver
require 'tiny_tds' 

#Connect to your database. 
#Replace server name, username, and password with your credentials 
client = TinyTds::Client.new username: 'username@servername', password: 'password', 
host: 'servername.database.windows.net', port: 1433, 
database: 'AdventureWorks', azure:true 

#SELECT
#Execute a simple select statement. 
results = client.execute("select * from SalesLT.Product") 

#Print results of select.
results.each do |row| 
puts row 
end 

