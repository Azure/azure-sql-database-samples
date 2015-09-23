# Connect to SQL Database by using Ruby on Rails on Ubuntu Linux

Rails code sample that runs on an Ubuntu Linux client computer to connect to an Azure SQL Database database.

## Install the required modules

Open your terminal and install FreeTDS if you do not have it on your machine.
	
    sudo apt-get --assume-yes update 
    sudo apt-get --assume-yes install freetds-dev freetds-bin

After your machine is configured with FreeTDS, install Ruby if you do not already have it on your machine.
    
    sudo apt-get install libgdbm-dev libncurses5-dev automake libtool bison libffi-dev 
    curl -L https://get.rvm.io | bash -s stable

If you have any issues with signatures, run the following command.

    command curl -sSL https://rvm.io/mpapis.asc | gpg --import - 

If there are no issues with signatures, run the following commands.  

    source ~/.rvm/scripts/rvm 
    rvm install 2.1.2 
    rvm use 2.1.2 --default 
    ruby -v 

Ensure that you are running version 2.1.2 or the Ruby VM.

Next, install TinyTDS.

    gem install tiny_tds
  
Install Ruby on Rails and check the version

    gem install rails 4.2.4 
    rails -v

Install activerecord-sqlserver-adapter

    gem install activerecord-sqlserver-adapter

## Create a new application

Begin a new project by running the following command:

    rails new test_application

Change directories into the folder

    cd test_application

## Connect to Azure SQL Database
Add TinyTDS and activerecord-sqlserver-adapter to the Gemfile

    gem 'tiny_tds'
    gem 'activerecord-sqlserver-adapter'

Install the gems in the Gemfile

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

Check that the connection is working by migrating to the database. If there are no errors, the database is connected properly
    
    rake db:migrate

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
