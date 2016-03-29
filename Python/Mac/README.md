# Connect to SQL Database by using Python on Mac OS


[Python code sample] (sample_python_mac.py) that runs on a Mac computer. The sample and connects to Azure SQL Database by using the **pymssql** driver.


## Requirements


- [Python 2.7.6](https://www.python.org/download/releases/2.7.6/).
- [FreeTDS](https://github.com/brianb/FreeTDS)
- [Pymssql](https://github.com/pymssql/pymssql)

### Install the required modules


Open your terminal and install

**1) Homebrew**: Run the following command from your terminal. This will download the Homebrew package manager on your machine.

    ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"

**2) FreeTDS**: Run the following command from your terminal. This will download FreeTDS on your machine. FreeTDS is required for pymmsql to work.

    brew install FreeTDS
  
**3) Pymmsql**: Run the following command from your terminal. This will install pymmsql on your machine.

    sudo -H pip install pymssql

## Create a database and retrieve your connection string


See the [getting started page](http://azure.microsoft.com/documentation/articles/sql-database-get-started/) to learn how to create a sample database and get your connection string. It is important you follow the guide to create an **AdventureWorks database template**. The samples shown below only work with the **AdventureWorks schema**. 
