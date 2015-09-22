require 'tiny_tds' 

client = TinyTds::Client.new username: 'username@servername', password: 'password', 
host: 'servername.database.windows.net', port: 1433, 
database: 'databasename', azure:true 

results = client.execute("select top 10 * from [schema].[tablename]") 

results.each do |row| 

puts row 

end 
