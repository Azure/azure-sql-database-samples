
# Contribution Guidelines Overview

If you would like to become involved in the development of the [Microsoft Driver for Node.js for SQL Server][Project], there are many different ways in which you can contribute. We strongly value user feedback and will appreciate your questions, bug reports and feature requests. For more details how you can submit those see section Using the product and providing feedback below. In addition you can also contribute changes to the code, which include bug fixes and improvements as well as new features. For more details how to do this please see section Contributing changes below.

## Using the product and providing feedback

Using the Microsoft Driver for Node.js for SQL Server, asking and answering question, reporting bugs and making feature requests are critical parts of the project community. User feedback is crucial for improving the quality of the products and drive further development.
In order to become familiar with the functionality you can donwnload the pre-compiled binaries (see Obtaining the binaries below) or synch the source code from Github and compile locally (see Obtaining the source code below). Once you become familiar with the functionality you can report bugs or request new features (see Report bugs and request features below).

### Asking and answering questions

The easiest way to ask and answer questions is to visit the [Issues][Issues] page, and ask a question there.

### Obtaining the binaries

Pre-compiled binaries of Driver are available at the [download page][Download]. 

### Obtaining the source code

In order to obtain the source code you need to become familiar with [Git](http://progit.org/book/) and [Github](http://help.github.com/) and you need to have Git installed on your local machine. You can obtain the source code from the [Project page][Project].

### Report bugs and request features

Issues and feature requests are submitted through the project's [Issues][Issues] section on GitHub. Please use the following guidelines when you submit issues and feature requests:

* Make sure the issue is not already reported by searching through the list of issues
* Provide detailed description of the issue including the following information:
    * Which feature the issue appears in
    * Under what circumstances the issue appears
    * What is desired behavior
    * What is breaking
    * What is the impact (things like loss or corruption of data, compromizing security, disruption of service etc.)
    * Any code that will be helpful to reproduce the issue

Issues are regularly reviewed and updated with additional information by the core team. Sometimes the core team may have questions about particular issue that might need clarifications so, please be ready to provide additional information.

## Contributing changes
### How to become a contributor?

In order to become a contributor to the project we need you to sign the Contributor License Agreement (CLA). Signing the Contributor License Agreement (CLA) does not grant you rights to commit to the main repository but it does mean that we will consider your contributions and you will get credit if we do. Active contributors might be asked to join the core team, and given the ability to merge pull requests.
You can download the Contributor License Agreement (CLA) by clicking at the following [link][CLA]. Please fill in, sign, scan and email it to [cla@microsoft.com](mailto:cla@microsoft.com).

### Create bug fixes and features

You make modifications of the code in your local Git repository. Once you are done with your implementation follow the steps below:

* Change the working branch to master with the following command: ```git checkout master````
* Submit the changes to your own fork in GitHub by using the following command: ```git submit````
* In GitHub create new pull request by clicking on the Pull Request button
* In the pull request select your fork as source and WindowsAzure/node-sqlserver as destination for the request
* Write detailed message describing the changes in the pull request
    Submit the pull request for consideration by the Core Team

Note: All changes and pull request should be done in the master branch if they are bug fixes. Major changes should be coordinated with the core team so that we can set up an improvement branch for this work. Changes will be integrated in a release branch by the Core Team.

Please keep in mind that not all requests will be approved. Requests are reviewed by the Core Team on a regular basis and will be updated with the status at each review. If your request is accepted you will receive information about the next steps and when the request will be integrated in the main branch. If your request is rejected you will receive information about the reasons why it was rejected.
Contribution guidelines

Before you start working on bug fixes and features it is good idea to discuss those broadly with the community. You can file an Issue as described in Asking and answering questions for this purpose.
Before submitting your changes make sure you followed the guidelines below:

* You have properly documented any new functionality using the documentation standards for the language (this includes classes, methods and functions, properties etc.)
*   Proper inline documentation is included for any change you make  
* For any new functionality you have written complete unit tests
* You have ran all unit tests and they pass

In order to speed up the process of accepting your contributions, you should try to make your checkins as small as possible, avoid any unnecessary deltas and the need to rebase. 

[Issues]: https://github.com/WindowsAzure/node-sqlserver/issues
[Project]: https://github.com/WindowsAzure/node-sqlserver/
[Download]: http://www.microsoft.com/en-us/download/details.aspx?id=29995
[CLA]: http://windowsazure.github.com/docs/Contribution%20License%20Agreement.pdf