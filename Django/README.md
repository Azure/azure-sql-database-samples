#Instructions

1. Install FreeTDS, Django 1.7, pymssql, and django-pymsqsl

	a) Homebrew: Run the following command from your terminal. This will download the Homebrew package manager on your machine.

        ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"

	FreeTDS: Run the following command from your terminal. This will download FreeTDS on your 	machine. FreeTDS is required for pymmsql to work.

        brew install FreeTDS
        
	b) Django

        sudo pip install django==1.7

	c) pymssql

        sudo pip install pymssql

	d) django-pymssql

        sudo pip install django-pymsqsl	


2. Git clone this project


        git clone https://github.com/Azure/azure-sql-database-samples.git


3. cd into the django folder


4. Run setup.py


        python setup.py servername datbasename username password`



5. Edit settings.py with your database settings. Replace the sqllite settings to this one
        
        
         DATABASES = {
	    'default': {
	        'ENGINE': 'sqlserver_pymssql',
	        'HOST': 'csucla2015.database.windows.net',
	        'NAME': 'djangodemoui',
	        'USER': 'meet_bhagdev@csucla2015',
	        'PASSWORD': 'avengersA1',
	        'OPTIONS': {
	            # ...
        		   },
	    		},
		    }


6. Run Django migrations
	From your project folder where manage.py is located run the following:

        python manage.py migrate

7. Run your django app

        python manage.py runserver
