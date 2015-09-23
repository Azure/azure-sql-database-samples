# Connect to SQL Database by using Python on Ubuntu Linux

[Python ode sample] (sample_python.py) that runs on an Ubuntu Linux client computer, to connect to an Azure SQL Database database.


## Requirements


- [Python 2.7.6](https://www.python.org/download/releases/2.7.6/).


### Install the required modules


Open your terminal and navigate to a directory where you plan on creating your python script. Enter the following commands to install **FreeTDS** and **pymssql**. pymssql uses FreeTDS to connect to SQL Databases.

	sudo apt-get --assume-yes update
	sudo apt-get --assume-yes install freetds-dev freetds-bin
	sudo apt-get --assume-yes install python-dev python-pip
	sudo pip install pymssql


### Create a database and retrieve your connection string


See the [getting started page](http://azure.microsoft.com/documentation/articles/sql-database-get-started/) to learn how to create a sample database and get your connection string. 
