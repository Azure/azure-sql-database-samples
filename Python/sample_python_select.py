#using the pymssql driver
import pymssql

#Connect to your database. 
#Replace server name, username, password, and database name with your credentials 
conn = pymssql.connect(server='servername.database.windows.net', 
	user='username@servername', password='password', 
	database='databasename')
cursor = conn.cursor()

#Execute a simple select statement. 
#Replace schema name and table name with your own
cursor.execute('SELECT TOP 10 * FROM [schemaname].[tablename]')
row = cursor.fetchone()
while row:
	#Print results. Specify as many columns as you require
    print str(row[0]) + " " + str(row[1]) + " " + str(row[2])   
    row = cursor.fetchone()