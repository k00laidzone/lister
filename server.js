var http 	= require( 'http' ),
	db 		= require( './db' );
	app		= require('./app')(db);

	if (process.env.NODE_ENV == 'production') { 
		app.set( 'port', process.env.PORT || 80 );
	} else {
		app.set( 'port', process.env.PORT || 3000 );
	}

	http.createServer( app ).listen( app.get( 'port' ), function (){
  	console.log( 'Express server listening on port ' + app.get( 'port' ));
});
