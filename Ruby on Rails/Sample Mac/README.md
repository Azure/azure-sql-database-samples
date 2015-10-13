# Ruby on Rails - Sample Application on Mac

##Install Prequisites

Install Homebrew
	
	ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)“

Install FreeTDS

	brew install FreeTDS

Install Tiny_TDS

	gem install tiny_tds

Install Rails

	gem install rails
 
Install activerecord-sqlserver-adapter

	gem install activerecord-sqlserver-adapter

##Clone sample project from GitHub

	git clone https://github.com/Azure/azure-sql-database-samples.git
	
cd into the following folder /azure-sql-database-samples/Ruby on Rails/Sample

##Configure SQL Database
Install the rest of the prereqs.

	bundle install

Update the database.yml (/config/database.yml) file. 

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

##Migrate the database 

	rake db:migrate

##Start the app

	rails server

