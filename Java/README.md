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
