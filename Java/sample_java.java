// Use the JDBC driver
import java.sql.*;
import com.microsoft.sqlserver.jdbc.*;

	public class SQLDatabaseTest {

		// Connect to your database.
		// Replace server name, username, and password with your credentials
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
			
			try {
				connection = DriverManager.getConnection(connectionString);

				// Create and execute a SELECT SQL statement.
				String selectSql = "SELECT Title, FirstName, MiddleName, LastName from SalesLT.Customer";
				statement = connection.createStatement();
				resultSet = statement.executeQuery(selectSql);

				// Print results from select statement
				while (resultSet.next()) {
					System.out.println(resultSet.getString(2) + " "
						+ resultSet.getString(3)
						+ resultSet.getString(4));
					}

				// Create and execute an INSERT SQL prepared statement.
				String insertSql = "INSERT INTO SalesLT.Customer (FirstName, LastName, CompanyName) VALUES "
					+ "('Bill', 'Gates', 'Microsoft'), "
					+ "('Steve', 'Ballmer', 'Microsoft');";

				prepsInsertPerson = connection.prepareStatement(
					insertSql,
					Statement.RETURN_GENERATED_KEYS);
				prepsInsertPerson.execute();
				// Retrieve the generated key from the insert.
				resultSet = prepsInsertPerson.getGeneratedKeys();
				// Print the ID of the inserted row.
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
				if (resultSet != null) try { resultSet.close(); } catch(Exception e) {}
				if (statement != null) try { statement.close(); } catch(Exception e) {}
				if (connection != null) try { connection.close(); } catch(Exception e) {}
			}
		}
	}
