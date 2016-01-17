/**
 * Module dependencies.
 */

module.exports = function(db){
var express        = require( 'express' );
var app    		   = express();
var passport 	   = require( 'passport' );
var flash    	   = require( 'connect-flash' );

//Passport Config
require('./config/passport')(passport);

var cookieParser   = require( 'cookie-parser');
var bodyParser     = require( 'body-parser' );
var session 	   = require( 'express-session');

var validator 	   = require('express-validator');

var path           = require( 'path' );
var engine         = require( 'ejs-locals' );
var favicon        = require( 'serve-favicon' );
var methodOverride = require( 'method-override' );
var logger         = require( 'morgan' );
var errorHandler   = require( 'errorhandler' );
var static         = require( 'serve-static' );





// all environments
app.engine( 'ejs', engine );
app.set( 'views', path.join( __dirname, 'views' ));
app.set( 'view engine', 'ejs' );
app.use(cookieParser());
app.use( favicon( __dirname + '/public/favicon.ico' ));
app.use( logger( 'dev' ));
app.use( methodOverride());
app.use( cookieParser());
app.use( bodyParser.json());
app.use( bodyParser.urlencoded({ extended : true }));

// required for passport
app.use(session({
  genid: function(req) {
    return require('crypto').randomBytes(48).toString('hex'); // use UUIDs for session IDs 
  },
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true
}))
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

app.use(function (req, res, next) {
    res.locals.login = req.isAuthenticated();
    next();
});
app.use(validator());
app.use(function(req, res, next) {
  res.locals.messages = req.session.messages
  next()
})

var routes 		   = require( './routes' )(db, passport);

// Routes
// /app.use( routes.current_user );
app.get(  '/',            	        routes.index );
app.get(  '/changestore/:store', 	isLoggedIn,routes.changestore );
app.post( '/create',  				isLoggedIn, routes.create );
app.get(  '/destroy/:id',  			isLoggedIn, routes.destroy );
app.get(  '/edit/:id',  			isLoggedIn, routes.edit );
app.post( '/update/:id',  			isLoggedIn, routes.update );

app.get( '/stores/',  				isLoggedIn, routes.stores );
app.post(  '/createstore/', 		isLoggedIn, routes.createstore );
app.get(  '/destroystore/:id',  	isLoggedIn, routes.destroystore );
app.get( '/editstore/:id',  		isLoggedIn, routes.editstore );
app.post( '/updatestore/:id', 		isLoggedIn, routes.updatestore );

app.get( '/dept/', 					isLoggedIn, routes.dept );
app.post( '/createdept/', 			isLoggedIn, routes.createdept );
app.get( '/editdept/:id', 			isLoggedIn, routes.editdept );
app.post( '/updatedept/:id', 		isLoggedIn, routes.updatedept );
app.get( '/destroydept/:id', 		isLoggedIn, routes.destroydept );

app.get('/list', isLoggedIn,  routes.list);

app.get('/login', function(req, res) {
        // render the page and pass in any flash data if it exists
        res.render('login.ejs', { message: req.flash('loginMessage'), title: 'Login' }); 
    });

app.get('/signup', function(req, res) {

        // render the page and pass in any flash data if it exists
        res.render('signup.ejs', { message: req.flash('signupMessage'), title: 'Sign Up' });
    });


// process the signup form
app.post('/signup', passport.authenticate('local-signup', {
    successRedirect : '/list', // redirect to the secure profile section
    failureRedirect : '/signup', // redirect back to the signup page if there is an error
    failureFlash : true // allow flash messages

}));


 // process the login form
    app.post('/login', passport.authenticate('local-login', {
        successRedirect : '/list', // redirect to the secure profile section
        failureRedirect : '/login', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));


// =====================================
    // PROFILE SECTION =====================
    // =====================================
    // we will want this protected so you have to be logged in to visit
    // we will use route middleware to verify this (the isLoggedIn function)
    app.get('/profile', isLoggedIn, function(req, res) {
        res.render('profile.ejs', {
        	title: 'User Profile',
            user : req.user // get the user out of session and pass to template
        });
    });


	function isLoggedIn(req, res, next) {

	    // if user is authenticated in the session, carry on 
	    if (req.isAuthenticated())
	        return next();

	    // if they aren't redirect them to the home page
	    res.redirect('/login');
	}

	// =====================================
    // LOGOUT ==============================
    // =====================================
    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });

app.use( static( path.join( __dirname, 'public' )));

// development only
if( 'development' == app.get( 'env' )){
  app.use( errorHandler());
}

return app;
}
