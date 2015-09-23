# Connect to SQL Database by using Java with JDBC on Windows

Java code sample that you can use to connect to Azure SQL Database. The Java sample relies on the Java Development Kit (JDK) version 1.8. The sample connects to an Azure SQL Database by using the JDBC driver.


## Requirements


- [Microsoft JDBC Driver for SQL Server - SQL JDBC 4](http://www.microsoft.com/download/details.aspx?displaylang=en&id=11774).
- Any operating system platform that runs [Java Development Kit 1.8](http://www.oracle.com/technetwork/java/javase/downloads/jdk8-downloads-2133151.html).
- An existing database on SQL Azure. See the [Get Started topic](http://azure.microsoft.com/documentation/articles/sql-database-get-started/) to learn how to create a sample database and retrieve your connection string.


## Test environment


The Java code example in this topic assumes the following test table already exists in your Azure SQL Database database.

	CREATE TABLE Person
	(
		id         INT    PRIMARY KEY    IDENTITY(1,1),
		firstName  VARCHAR(32),
		lastName   VARCHAR(32),
		age        INT
	);


## Connection string for your SQL Database


The code sample creates a `Connection` object by using a connection string. You can find the connection string by using the [Azure preview portal](http://portal.azure.com/). For details about finding the connection string, see [Create your first Azure SQL Database](http://azure.microsoft.com/documentation/articles/sql-database-get-started/).


## Java code sample


The section contains the bulk of the Java code sample. It has comments indicating where you would copy-and-paste the smaller Java segments that are presented in subsequent sections. The sample in this section could compile and run even without the copy-and-pastes near the comments, but it would only connect and then end. The comments you will find are the following:


1. `// INSERT two rows into the table.`
2. `// TRANSACTION and commit for an UPDATE.`
3. `// SELECT rows from the table.`


Here next is the bulk of the Java code sample. The sample includes the `main` function of the `SQLDatabaseTest` class.


	import java.sql.*;
	import com.microsoft.sqlserver.jdbc.*;
	
	public class SQLDatabaseTest {
	
		public static void main(String[] args) {
			String connectionString =
				"jdbc:sqlserver://your_server.database.windows.net:1433;" 
				+ "database=your_database;"
				+ "user=your_user@your_server;"
				+ "password={your_password};"
				+ "encrypt=true;"
				+ "trustServerCertificate=false;"
				+ "hostNameInCertificate=*.database.windows.net;"
				+ "loginTimeout=30;"; 
	
			// Declare the JDBC objects.
			Connection connection = null;
			Statement statement = null;
			ResultSet resultSet = null;
			PreparedStatement prepsInsertPerson = null;
			PreparedStatement prepsUpdateAge = null;
	
			try {
				connection = DriverManager.getConnection(connectionString);

				// Create and execute a SELECT SQL statement.
				String selectSql = "SELECT firstName, lastName, age FROM dbo.Person";
				statement = connection.createStatement();
				resultSet = statement.executeQuery(selectSql);
				
				// Iterate through the result set and print the attributes.
				while (resultSet.next()) {
					System.out.println(resultSet.getString(2) + " "
						+ resultSet.getString(3));
					}
	
				// Create and execute an INSERT SQL prepared statement.
				String insertSql = "INSERT INTO Person (firstName, lastName, age) VALUES "
					+ "('Bill', 'Gates', 59), "
					+ "('Steve', 'Ballmer', 59);";
				
				prepsInsertPerson = connection.prepareStatement(
					insertSql,
					Statement.RETURN_GENERATED_KEYS);
				prepsInsertPerson.execute();
				// Retrieve the generated key from the insert.
				resultSet = prepsInsertPerson.getGeneratedKeys();
				// Iterate through the set of generated keys.
				while (resultSet.next()) {
					System.out.println("Generated: " + resultSet.getString(1));
					}
			}
			catch (Exception e) {
				e.printStackTrace();
			}
			finally {
				// Close the connections after the data has been handled.
				if (prepsInsertPerson != null) try { prepsInsertPerson.close(); } catch(Exception e) {}
				if (prepsUpdateAge != null) try { prepsUpdateAge.close(); } catch(Exception e) {}
				if (resultSet != null) try { resultSet.close(); } catch(Exception e) {}
				if (statement != null) try { statement.close(); } catch(Exception e) {}
				if (connection != null) try { connection.close(); } catch(Exception e) {}
			}
		}
	}
