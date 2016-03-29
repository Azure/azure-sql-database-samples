# Connect to SQL Database by using Python on Windows


[Python code sample] (sample_python_win.py) that runs on a Windows computer. The sample and connects to Azure SQL Database by using the **pymssql** driver.


## Requirements


- [Python 2.7.6](https://www.python.org/download/releases/2.7.6/).
- [FreeTDS](https://github.com/brianb/FreeTDS)
- [Pymssql](https://github.com/pymssql/pymssql)

### Install the required modules

Install [pymssql](http://www.lfd.uci.edu/~gohlke/pythonlibs/#pymssql).

Make sure you choose the correct whl file.

For example : If you are using Python 2.7 on a 64 bit machine choose : pymssql‑2.1.1‑cp27‑none‑win_amd64.whl.
Once you download the .whl file place it in the the C:/Python27 folder.

Now install the pymssql driver using pip from command line. cd into C:/Python27 and run the following

	pip install pymssql‑2.1.1‑cp27‑none‑win_amd64.whl

Instructions to enable the use pip can be found [here](http://stackoverflow.com/questions/4750806/how-to-install-pip-on-windows)


## Create a database and retrieve your connection string


See the [getting started page](http://azure.microsoft.com/documentation/articles/sql-database-get-started/) to learn how to create a sample database and get your connection string. It is important you follow the guide to create an **AdventureWorks database template**. The samples shown below only work with the **AdventureWorks schema**. 
