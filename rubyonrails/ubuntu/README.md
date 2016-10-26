# Ruby on Rails - Sample Application on Ubuntu

## Install the required modules

Open your terminal and install FreeTDS if you do not have it on your machine.

    sudo apt-get --assume-yes update
    sudo apt-get --assume-yes install freetds-dev freetds-bin

After your machine is configured with FreeTDS, install Ruby if you do not already have it on your machine.

    sudo apt-get install libgdbm-dev libncurses5-dev automake libtool bison libffi-dev
    command curl -sSL https://rvm.io/mpapis.asc | gpg --import -
    curl -L https://get.rvm.io | bash -s stable

If there are no issues with signatures, run the following commands.  

    source ~/.rvm/scripts/rvm
    rvm install 2.3.0
    rvm use 2.3.0 --default
    ruby -v

Ensure that you are running version 2.3.0 or the Ruby VM.

Install Ruby on Rails.

    gem install rails

## Git clone this project 

    git clone https://github.com/Azure/azure-sql-database-samples.git
    
## Connect to Azure SQL Database

Bundle install to make sure you have the rest of the prereqs.  

    bundle install
  
Update the database.yml file (/test_application/config/database.yml)

    development:
     adapter: sqlserver
     mode: dblib
     host: yourservername.database.windows.net
     port: 1433
     database: yourdatabasename
     username: yourusername@yourservername
     password: yourpassword
     timeout: 5000
     azure: true

Check that the connection is working by migrating to the database. If there are no errors, the database is connected properly.

    rake db:setup

##Notes for using TinyTDS with Azure

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
