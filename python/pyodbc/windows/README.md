# Connect to SQL Database by using Python on Windows using pyodbc


[Python code sample] (sample_python_windows.py) that runs on a Windows computer. The sample and connects to Microsoft SQL Database by using the **pyodbc** driver.


## Requirements


- [Python 2.7.6](https://www.python.org/download/releases/2.7.6/).
- [ODBC Driver 11 or 13 for SQL Server Windows](https://www.microsoft.com/en-us/download/details.aspx?id=50420)
- [Pyodbc](https://pypi.python.org/pypi/pyodbc/3.0.10)

### Install the required modules

Navigate to your Python directory where the pip installer is located. For example C:\Python27\Scripts>. 

####Install pyodbc

    pip install pyodbc

*Note: Instructions to enable the use pip can be found [here](http://stackoverflow.com/questions/4750806/how-to-install-pip-on-windows)*


## Create a database and retrieve your connection string

For simplicity we will create an Azure SQL Database for the sample. You can use the same sample for an on-premise SQL Server instance. See the [getting started page](http://azure.microsoft.com/documentation/articles/sql-database-get-started/) to learn how to create a sample database and get your connection string. It is important you follow the guide to create an AdventureWorks database template. The samples shown below only work with the AdventureWorks schema. 

See the [getting started page](http://azure.microsoft.com/documentation/articles/sql-database-get-started/) to learn how to create a sample database and get your connection string. It is important you follow the guide to create an **AdventureWorks database template**. The samples shown below only work with the **AdventureWorks schema**. 
