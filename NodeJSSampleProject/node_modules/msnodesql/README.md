# Microsoft Driver for Node.js for SQL Server

The Microsoft Driver for Node.js for SQL Server allows Node.js applications on
Microsoft Windows and Microsoft Windows Azure to access Microsoft SQL Server 
and Microsoft Windows Azure SQL Database.

This is an initial preview release, and is not production ready. We welcome any
feedback, fixes and contributions from the community at this very early stage.

## Prerequisites

The following prerequisites are necessary prior to using the driver:

* Node.js - use the latest version if possible, but it has been tested on node
0.6.10 and later

* node-gyp - latest version installed globally (npm install -g node-gyp)

* python 2.7.x - for node-gyp (make sure it is in the path)

* Visual C++ 2010 - the Express edition is freely available from 
[Microsoft][visualstudio]

* SQL Server Native Client 11.0 - available as Microsoft SQL Server 2012 
Native Client found in the [SQL Server 2012 Feature Pack][sqlncli]

## Build

To build the driver, first node-gyp must configure the appropriate build files.

    node-gyp configure

Use node-gyp to build the driver:

    node-gyp build

Or to build the debug version:

    node-gyp build --debug

Then copy the sqlserver.node file from the build\\(Release|Debug) directory to
the lib directory.  If you would like to use Visual C++ to debug the driver,
also copy the sqlserver.pdb file from the same directory.

## Test

Included are a few unit tests.  They require mocha, async, and assert to be 
installed via npm.  Also, set the variables in test-config.js, then run the 
tests as follows:

    cd test
    node runtests.js

## Known Issues

We are aware that many features are still not implemented, and are working to
update these. Please visit the [project on Github][project] to view 
outstanding [issues][issues].

## Usage

For now, please see the unit tests for usage examples.

## Contribute Code

If you would like to become an active contributor to this project please follow the instructions provided in [the Contribution Guidelines][contribute].

## License

The Microsoft Driver for Node.js for SQL Server is licensed under the Apache
2.0 license.  See the LICENSE file for more details.

[visualstudio]: http://www.microsoft.com/visualstudio/

[sqlncli]: http://www.microsoft.com/en-us/download/details.aspx?id=29065

[project]: https://github.com/windowsazure/node-sqlserver

[issues]: https://github.com/windowsazure/node-sqlserver/issues

[contribute]: https://github.com/WindowsAzure/node-sqlserver/blob/master/CONTRIBUTING.md



