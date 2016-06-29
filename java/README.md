# Connect to SQL Database by using Java with JDBC on Windows

[Java code sample] (sample_java.java) that you can use to connect to Azure SQL Database. The Java sample relies on the Java Development Kit (JDK) version 8. The sample connects to an Azure SQL Database by using the JDBC driver.


## Requirements


- [Microsoft JDBC Driver for SQL Server - SQL JDBC 4.2](http://www.microsoft.com/download/details.aspx?displaylang=en&id=11774).
      - Download the latest JDBC Driver 4.2 Package *sqljdbc_4.2.6420.100_enu.exe* OR *sqljdbc_4.2.6420.100_enu.tar.gz*
      - For guidance on which jar file to use based on your Java version, please see the [System Requirements for the JDBC Driver](https://msdn.microsoft.com/en-us/library/ms378422(v=sql.110).aspx)
- Any operating system platform that runs [Java Development Kit 8](http://www.oracle.com/technetwork/java/javase/downloads/jdk8-downloads-2133151.html).
- An existing database on SQL Azure. See the [Get Started topic](http://azure.microsoft.com/documentation/articles/sql-database-get-started/) to learn how to create a sample database and retrieve your connection string.


## Create a database, retrieve your connection string

The Java sample relies on the AdventureWorks sample database. If you do not already have AdventureWorks, you can see how to create it at the following topic: [Create your first Azure SQL Database](http://azure.microsoft.com/documentation/articles/sql-database-get-started/)
