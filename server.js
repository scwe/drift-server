/*var express = require('express');
var app = express();
var logfmt = require("logfmt");
var port = Number(process.env.PORT || 3000);
var db = require('./database');
var passport = require('passport');
var flash    = require('connect-flash');

require('./passport')(passport, db);

app.configure(function() {
    // set up our express application
    app.use(express.bodyParser());
    app.use(logfmt.requestLogger());
    app.use(express.cookieParser()); // read cookies (needed for auth)

    // required for passport
    app.use(express.session({ secret: 'driftisanawesomeapp' })); // session secret
    app.use(passport.initialize());
    app.use(passport.session()); // persistent login sessions
    app.use(flash()); // use connect-flash for flash messages stored in session

});

var server = app.listen(port, function(){
    console.log('Listening on port %d', server.address().port);
});

app.post('/login', passport.authenticate('local-login', 
    function(req, res){
        res.statusCode = 200;
        return res.send('{\'success\':true}');  //Send em back a token of our appreciation
    }
));

app.post('/signup', passport.authenticate('local-signup', 
    function(req, res){
        res.statusCode = 200;
        return res.send('{\'success\':true}');
    }
));


app.post('/:username/marker/:marker_id', is_logged_in, function(req, res){
    if( !req.body.hasOwnProperty('lat') ||
        !req.body.hasOwnProperty('lon') ||
        !req.body.hasOwnProperty('text')){
        res.statusCode = 400;
        return res.send('Error 400: Post syntax incorrect');
    }

    if(req.body.hasOwnProperty('image')){

    }else{
        db.create_marker()
    }
    db.create_marker(req.body.category)

    res.send("some json things here");
});

app.get('/:username/marker/:marker_id', is_logged_in, function(req, res){
    //make sure that the person is either 'username' or they are facebook friends with 'username'
    var username = req.params.username;
    var marker_id = req.params.marker_id;

    if(marker_id === "all"){
        var markers = db.get_all_markers(username);
        return res.send(JSON.stringify(markers));
    }else{
        var marker = db.get_marker(username, marker_id);
        return res.send(JSON.stringify(marker));
    }
});

app.post('/:username/category/:category_id', is_logged_in, function(req, res){
    if(!req.body.hasOwnProperty('name') || 
        !req.body.hasOwnProperty('colour')){
        res.statusCode = 400;
        return res.send('Error 400: Post syntax incorrect');
    }

});

app.get('/:username/category/:category_id', is_logged_in, function(req, res){
    var username = req.params.username;
    var category_id = req.params.category_id;

    if(category_id === "all"){
        var categories = db.get_all_categories(username);
        return res.send(JSON.stringify(categories));
    }else{
        var category = db.get_category(username, category_id);
        return res.send(JSON.stringify(category));
    }
});

app.get('/facebook/:fb_id', is_logged_in, function(req, res){
    var fb_id = req.params.fb_id;

    var friend_username = db.get_friend(fb_id);

    return res.send('{\'username\': '+friend_username+'}');
});

app.get('/logout', function(req, res){
    req.logout();
    res.redirect('/');
})

app.get('/', function(req, res){
    res.send("Something or rather that sshould be here, just for testing");
});

function is_logged_in(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }

    res.statusCode = 401;
    return res.send('Error 401: Not logged in');
}*/

// server.js

// set up ======================================================================
// get all the tools we need
var express  = require('express');
var app      = express();
var port     = process.env.PORT || 8080;
var mongoose = require('mongoose');
var passport = require('passport');
var flash    = require('connect-flash');

var configDB = require('./config/database.js');

// configuration ===============================================================
mongoose.connect(configDB.url); // connect to our database

// require('./config/passport')(passport); // pass passport for configuration

app.configure(function() {

    // set up our express application
    app.use(express.logger('dev')); // log every request to the console
    app.use(express.cookieParser()); // read cookies (needed for auth)
    app.use(express.bodyParser()); // get information from html forms

    app.set('view engine', 'ejs'); // set up ejs for templating

    // required for passport
    app.use(express.session({ secret: 'ilovescotchscotchyscotchscotch' })); // session secret
    app.use(passport.initialize());
    app.use(passport.session()); // persistent login sessions
    app.use(flash()); // use connect-flash for flash messages stored in session

});

// routes ======================================================================
require('./app/routes.js')(app, passport); // load our routes and pass in our app and fully configured passport

// launch ======================================================================
app.listen(port);
console.log('The magic happens on port ' + port);