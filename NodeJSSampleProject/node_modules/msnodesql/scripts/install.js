var assert=require('assert');
var http=require('http');
var file=require('fs');
var subprocess=require('child_process');
var package=require('../package.json');

function log( msg ) {

	console.log( "install.js: " + msg );
}

console.log( "You are downloading Microsoft Driver for Node.js for SQL Server from\nMicrosoft, the license agreement to which is available at\nhttp://download.microsoft.com/download/6/E/2/6E2D7972-E54D-45AA-\n8AB6-41E616035147/EULA.rtf and in the project folder to which the\nsoftware is downloaded. Check the package for additional dependencies, which\nmay come with their own license agreement(s). Your use of the package and\ndependencies constitutes your acceptance of their license agreements. If\nyou do not accept the license agreement(s), then delete the relevant\ncomponents from your device." );

var msiVer = process.version.split(".").slice(0,2).join(".");
var msiArch = process.arch;
var msiName = "msnodesql-" + package.version + "-" + msiVer + "-" + msiArch + ".msi";
var msiUrl = {
  host: 'download.microsoft.com',
  port: 80,
  path: '/download/6/E/2/6E2D7972-E54D-45AA-8AB6-41E616035147/' + msiName,
};

// retrieve the msi from Microsoft
http.get( msiUrl, function( res ) {

	if( res.statusCode != 200 ) {
		log( "Unable to download " + msiName );
		process.exit(1);
	}

	var msiLength = parseInt( res.headers['content-length'] );
	assert( msiLength < 1000000 );	// arbitrary length to verify that we aren't too large

	var msi = new Buffer( msiLength );
	var msiSoFar = 0;

	// download the msi in pieces
	res.on('data', function( chunk ) {

		if( msiSoFar + chunk.length > msi.length ) {
			log( "Error downloading " + msiName );
			process.exit(1);
		}
		chunk.copy( msi, msiSoFar );
		msiSoFar += chunk.length;
	});

	res.on( 'end', function() {

		if( msiSoFar != msi.length ) {
			log( "Error downloading " + msiName );
			process.exit(1);
		}

		// write the msi file
		var msiFile = file.openSync( msiName, 'w');
		var len = file.writeSync( msiFile, msi, 0, msi.length, 0 );
		if( len != msi.length ) {

			log( "Error writing the msi to a file" );
			process.exit(1);
		}
		file.closeSync( msiFile );

		// run the msi to extract the driver inside
		var msiCmd = [ 'cmd', '/c', 'msiexec', '/i', msiName, '/quiet', 'IACCEPTMSNODESQLLICENSETERMS=Yes', 'NPMINSTALL=Yes' ].join(' ');
		subprocess.exec( msiCmd, function( error, stdout, stderr ) {

			if( error !== null ) {
				log( error );
				log( stdout );
				process.exit( 1 );
			}
		});
	});
}).on( 'error', function ( err ) {
	log( err );
});