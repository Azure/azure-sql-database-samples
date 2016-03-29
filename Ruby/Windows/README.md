# Connect to SQL Database by using Ruby on Windows

[Ruby code sample] (sample_ruby_win.rb) that runs on Windows  to connect to an Azure SQL Database.

## Install the required modules

**1) Ruby:** If your machine does not have Ruby please install it. For new ruby users, we recommend you use Ruby 2.1.X installers. These provide a stable language and a extensive list of packages (gems) that are compatible and updated. [Go the Ruby download page](http://rubyinstaller.org/downloads/) and download the appropriate 2.1.x installer. For example if you are on a 64 bit machine, download the **Ruby 2.1.6 (x64)** installer.
<br/><br/>Once the installer is downloaded, do the following:


- Double-click the file to start the installer.

- Select your language, and agree to the terms.

- On the install settings screen, select the check boxes next to both *Add Ruby executables to your PATH* and *Associate .rb and .rbw files with this Ruby installation*.


**2) DevKit:** Download DevKit from the [RubyInstaller page](http://rubyinstaller.org/downloads/)

After the download is finished, do the following:


- Double-click the file. You will be asked where to extract the files.

- Click the "..." button, and select "C:\DevKit". You will probably need to create this folder first by clicking "Make New Folder".

- Click "OK", and then "Extract", to extract the files.


Now open the Command Prompt and enter the following commands:

	> chdir C:\DevKit
	> ruby dk.rb init
	> ruby dk.rb install

You now have a fully functional Ruby and RubyGems!


**3) TinyTDS:** Navigate to C:\DevKit and run the following command from your terminal. This will install TinyTDS on your machine.

	gem inst tiny_tds --pre

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



