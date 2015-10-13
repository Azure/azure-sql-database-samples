#Instructions



1. Install FreeTDS and unixODBC

	a) Homebrew: Run the following command from your terminal. This will download the Homebrew package manager on your machine.

        ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"

	FreeTDS: Run the following command from your terminal. This will download FreeTDS on your 	machine. FreeTDS is required for pymmsql to work.

	brew install unixodbc
	brew install freetds --with-unixodbc        
	
	b) Configure odbcinst.ini.  
	
		open /usr/local/etc/odbcinst.ini	

	Copy this and paste it in odbcinst.ini.
	
        [FreeTDS]
	Description = TD Driver (MSSQL)
	Driver = /usr/local/lib/libtdsodbc.so
	Setup = /usr/local/lib/libtdsodbc.so
	FileUsage = 1
	

	c) Install the SQL Server - Azure SQL DB adapter

        sudo pip install django-pyodbc-azure


2. Git clone this project


        git clone https://github.com/Azure/azure-sql-database-samples.git


3. cd into the azure-sql-database-samples/Django/Django-pyodbc-azure folder


4. Run setup.py. example: python setup.py csucla2015.database.windows.net djangodemoui meet_bhagdev avengersA1


        python setup.py servername datbasename username password
        
        
   
5. Edit settings.py with your database settings. Make sure you change your credentials.
        
        
         DATABASES = {
    	'default': {
        'ENGINE': 'sql_server.pyodbc',
        'NAME': databasename',
        'USER': ‘username@servername',
        'PASSWORD': ‘password',
        'HOST': ‘servername.database.windows.net',
        'PORT': '1433',
        'OPTIONS': {
            'host_is_server': True,
            'driver': 'FreeTDS'
        	    },
		},
	}



6. Run Django migrations
<br>From your project folder where manage.py is located run the following:

	python manage.py migrate

7. Run your django app

        python manage.py runserver



	


