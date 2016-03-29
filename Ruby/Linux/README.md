# Connect to SQL Database by using Ruby on Ubuntu Linux

[Ruby code sample] (sample_ruby_linux.rb) that runs on an Ubuntu Linux client computer to connect to an Azure SQL Database database.

## Install the required modules

Open your terminal and install RVM. 

    sudo apt-get --assume-yes update
    command curl -sSL https://rvm.io/mpapis.asc | gpg --import -
    curl -L https://get.rvm.io | bash -s stable
    source ~/.rvm/scripts/rvm

Next, install Ruby on your machine.

     rvm install 2.3.0
     rvm use 2.3.0 --default
     ruby -v

Ensure you are running version 2.3.0. 

Install FreeTDS

    sudo apt-get --assume-yes install freetds-dev freetds-bin

Install TinyTDS

    gem install tiny_tds

## Create a database, retrieve your connection string

The Ruby sample relies on the AdventureWorks sample database. If you do not already have AdventureWorks, you can see how to create it at the following topic: [Create your first Azure SQL Database](http://azure.microsoft.com/documentation/articles/sql-database-get-started/)

##Using TinyTDS with Azure

It is recommend the following settings when using TinyTDS with Azure.

	SET ANSI_NULLS ON
	SET CURSOR_CLOSE_ON_COMMIT OFF
	SET ANSI_NULL_DFLT_ON ON
	SET IMPLICIT_TRANSACTIONS OFF
	SET ANSI_PADDING ON
	SET QUOTED_IDENTIFIER ON
	SET ANSI_WARNINGS ON
	SET CONCAT_NULL_YIELDS_NULL ON

This can be done by running the following code prior to executing queries:

	result = client.execute("SET ANSI_NULLS ON")
	result = client.execute("SET CURSOR_CLOSE_ON_COMMIT OFF")
	result = client.execute("SET ANSI_NULL_DFLT_ON ON")
	result = client.execute("SET IMPLICIT_TRANSACTIONS OFF")
	result = client.execute("SET ANSI_PADDING ON")
	result = client.execute("SET QUOTED_IDENTIFIER ON")
	result = client.execute("SET ANSI_WARNINGS ON")
	result = client.execute("SET CONCAT_NULL_YIELDS_NULL ON")

