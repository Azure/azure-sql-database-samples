# Connect to SQL Database by using Node.js with Tedious on Mac OS X





[Node.js code sample] (sample_nodejs_mac.js) that runs on Mac OS X. The sample connects to Azure SQL Database by using the Tedious driver.


## Required software items


Install **node**, unless it is already installed on your machine.


To install node.js on OSX 10.10 Yosemite  you can download a pre-compiled binary package which makes a nice and easy installation. [Head over to nodejs.org](http://nodejs.org/) and click the install button to download the latest package.

Install the package from the .dmg by following along the install wizard which will install both **node** and **npm**, npm is Node Package Manager which facilitates installs of additional packages for node.js.


After your machine is configured with **node** and **npm**, navigate to a directory where you plan to create your Node.js project, and enter the following commands.

npm install

### Create an AdventureWorks database


The code sample in this topic expects an **AdventureWorks** test database. If you do not already have one, see [Get started with SQL Database](http://azure.microsoft.com/documentation/articles/sql-database-get-started/). It is important that you follow the guide to create an **AdventureWorks database template**. The examples shown below work only with the **AdventureWorks schema**. 
