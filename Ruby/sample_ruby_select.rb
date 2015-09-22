#Using the TinyTDS driver
require 'tiny_tds' 

#Connect to your database. 
#Replace server name, username, password, and database name with your credentials 
client = TinyTds::Client.new username: 'username@servername', password: 'password', 
host: 'servername.database.windows.net', port: 1433, 
database: 'databasename', azure:true 

#Execute a simple select statement. 
#Replace schema name and table name with your own
results = client.execute("select top 10 * from [schema].[tablename]") 

#Print results.
results.each do |row| 

puts row 

end 