# Connect to SQL Database by using Ruby on Ubuntu Linux

[AZURE.INCLUDE [sql-database-develop-includes-selector-language-platform-depth](../../includes/sql-database-develop-includes-selector-language-platform-depth.md)]

This topic presents a Ruby code sample that runs on an Ubuntu Linux client computer to connect to an Azure SQL Database database.

## Install the required modules

Open your terminal and install FreeTDS if you do not have it on your machine.
	
    sudo apt-get --assume-yes update 
    sudo apt-get --assume-yes install freetds-dev freetds-bin

After your machine is configured with FreeTDS, install Ruby if you do not already have it on your machine.
    
    sudo apt-get install libgdbm-dev libncurses5-dev automake libtool bison libffi-dev 
    curl -L https://get.rvm.io | bash -s stable

If you have any issues with signatures, run the following command.

    command curl -sSL https://rvm.io/mpapis.asc | gph --import - 

If there are no issues with signatures, run the following commands.  

    source ~/.rvm/scripts/rvm 
    rvm install 2.1.2 
    rvm use 2.1.2 --default 
    ruby -v 

Ensure that you are running version 2.1.2 or the Ruby VM.

Next, install TinyTDS.

    gem install tiny_tds

## Create a database, retrieve your connection string

The Ruby sample relies on the AdventureWorks sample database. If you do not already have AdventureWorks, you can see how to create it at the following topic: [Create your first Azure SQL Database](http://azure.microsoft.com/documentation/articles/sql-database-get-started/)
