# Connect to SQL Database by using Node.js with Tedious on Ubuntu Linux


[Node.js code sample] (sample_nodejs_linux.js) that runs on Ubuntu Linux. The sample connects to Azure SQL Database by using the Tedious driver.


## Required software items


Open your terminal and install **node** and **npm**, unless they are already installed on your machine.


	sudo apt-get install node
	sudo apt-get install npm


After your machine is configured with **node** and **npm**, navigate to a directory where you plan to create your Node.js project, and enter the following commands.


	sudo npm init
	sudo npm install tedious


**npm init** creates a node project. To retain the defaults during your project creation, press enter until the project is created. Now you see a **package.json** file in your project directory.


### Create an AdventureWorks database


The code sample in this topic expects an **AdventureWorks** test database. If you do not already have one, see [Get started with SQL Database](https://azure.microsoft.com/en-us/documentation/articles/sql-database-get-started/). It is important that you follow the guide to create an **AdventureWorks database template**. The examples shown below work only with the **AdventureWorks schema**. 
