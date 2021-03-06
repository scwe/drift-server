// app/routes.js

var User = require('../app/models/user');  //only needed for finding friends, but we should probably load at the start anyway
var base64 = require('base64-js');

module.exports = function(app, passport) {

    // =====================================
    // HOME PAGE (with login links) ========
    // =====================================
    app.get('/', function(req, res) {
        res.render('index.ejs'); // load the index.ejs file
    });

    // =====================================
    // LOGIN ===============================
    // =====================================
    // show the login form
    app.get('/login-web', function(req, res) {

        // render the page and pass in any flash data if it exists
        res.render('login.ejs', { message: req.flash('loginMessage') }); 
    });

    // process the signup form
    app.post('/signup-web', passport.authenticate('local-signup', {
        successRedirect : '/profile', // redirect to the secure profile section
        failureRedirect : '/signup-web', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));

    //Tested and working
    app.post('/signup', function(req, res, next) {
        passport.authenticate('local-signup', function(err, user, info) {
            if (err) { return next(err); }
            if (!user) { return res.status(409).send(false); }
            req.logIn(user, function(err) {
                if (err) { return next(err); }
                return res.json(true);
            });
        })(req, res, next);
    });

    // =====================================
    // SIGNUP ==============================
    // =====================================
    // show the signup form
    app.get('/signup-web', function(req, res) {
        // render the page and pass in any flash data if it exists
        res.render('signup.ejs', { message: req.flash('signupMessage') });
    });

    //Tested and working
    app.post('/login', function(req, res, next) {
        passport.authenticate('local-login', function(err, user, info) {
            if (err) { return next(err); }
            if (!user) { return res.status(401).send(false); }
            req.logIn(user, function(err) {
                if (err) { return next(err); }
                return res.json(true);
            });
        })(req, res, next);
    });

    // process the login form
    app.post('/login-web', passport.authenticate('local-login', {
        successRedirect : '/profile', // redirect to the secure profile section
        failureRedirect : '/login-web', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));

    // =====================================
    // PROFILE SECTION =====================
    // =====================================
    // we will want this protected so you have to be logged in to visit
    // we will use route middleware to verify this (the isLoggedIn function)
    app.get('/profile', is_logged_in, function(req, res) {
        res.render('profile.ejs', {
            user : req.user, // get the user out of session and pass to template
            json : JSON.stringify(req.user.toJSON(), null, 2)
        });
    });

    // =====================================
    // LOGOUT ==============================
    // =====================================
    app.get('/logout', function(req, res) {
        req.logout();
        res.location('/').redirect('/');
    });

    //tested and working
    app.post('/category/:category_name/marker/create', is_logged_in, function(req, res){
        if( !req.body.hasOwnProperty('lat') ||
            !req.body.hasOwnProperty('lon') ||
            !req.body.hasOwnProperty('text')){
            res.statusCode = 400;
            return res.send('Error 400: Post syntax incorrect');
        }

        var user = req.user;
        var marker;
        var name = ""
        var image = null;

        if(req.body.hasOwnProperty('name')){
            name = req.body.name;
        }
        if(req.body.hasOwnProperty('image')){
            image = req.body.image;
            console.log("We have an image");
        }
        console.log("The image out here is: "+image);

        var index = user.createMarker(req.params.category_name, name, req.body.lat, req.body.lon, req.body.text, image);
        return res.json(index);
    });

    //Tested and working
    app.post('/category/create', is_logged_in, function(req, res){
        if(!req.body.hasOwnProperty('name') || 
            !req.body.hasOwnProperty('colour')){
            res.statusCode = 400;
            return res.send('Error 400: Post syntax incorrect');
        }

        var newCat = req.user.createCategory(req.body.name, req.body.colour);

        return res.send(JSON.stringify(newCat));

    });

    //Tested and working (both all and with an id)
    app.get('/category/:category_name/marker/:marker_id', is_logged_in, function(req, res){
        //make sure that the person is either 'username' or they are facebook friends with 'username'
        var user = req.user;
        var mid = req.params.marker_id;

        if(mid === "all"){
            var markers = user.allMarkers(req.params.category_name);
            if(!markers){
                return res.status(404).send("There was nothing there");
            }
            return res.send(JSON.stringify(markers));
        }else if(!isNaN(mid) && parseInt(Number(mid)) == mid){
            var marker = user.getMarker(req.params.category_name, mid);
            if(!marker){
                return res.status(404).send("There was nothing there");
            }
            return res.send(JSON.stringify(marker));
        }else{
            return res.status(404).send("There was nothing there");
        }
    });

    //Tested and working
    app.get('/category/:category_name', is_logged_in, function(req, res){
        var user = req.user;
        var category_name = req.params.category_name;

        if(category_name === "all"){
            var categories = user.allCategories();
            return res.send(JSON.stringify(categories));
        }else{
            var category = user.getCategory(category_name);

            if(!category){
                return res.status(404).send("There was nothing there");
            }else{
                return res.send(JSON.stringify(category));
            }

        }
    });

    app.get('/category/:category_name/marker/:marker_id/photo', is_logged_in, function(req, res){
        var user = req.user;
        var cName = req.params.category_name;
        var mid = req.params.marker_id;

        var marker = user.getMarker(cName, mid);

        if(!marker){
            return res.status(404).send("There was nothing there");
        }
        var image = marker.image;

        if(!image){
            return res.status(404).send("There was nothing there");
        }

        var imageString = base64.fromByteArray(marker.image);
        console.log("The base64 string is: "+imageString);

        var returnString = "<img src=\"data:image/png;base64,"+imageString+"\" alt=\"Red dot\">";
        console.log("The return string is: "+returnString);

        return res.send(returnString);

    });

    //for setting the persons facebook id
    //tested and working
    app.post('/facebook/add', is_logged_in, function(req, res){
        if(!req.body.hasOwnProperty('facebook_id')){
            return res.status(400).send("Incorrect post syntax");
        }

        var user = req.user;
        var fb_id = req.body.facebook_id;

        user.setFacebookId(fb_id);
        return res.json(true);
    });


    app.get('/facebook/:fb_id', is_logged_in, function(req, res){
        var user = req.user;
        var fb_id = req.params.fb_id;
        if(!user.isFriend(fb_id)){
            return res.status(401).json("That person is not your friend");
        }

        var result = User.findOne({'facebook.id': fb_id}, function(err, data){
            if(err){
                return res.status(404).send("There was nothing there");
            }
            return res.json(data.categories);
        });
    });

    app.post('/facebook/friends', is_logged_in, function(req, res){
        if(!req.body.hasOwnProperty('friends')){
            return res.status(400).send("Incorrect post syntax");
        }
        var user = req.user;
        var friends = req.body.friends.split(",");

        return res.json(user.addFriends(friends));
    });

    app.get('/all', is_logged_in, function(req, res){
        return res.json(req.user.toJSON());
    });

    app.get('/logout', function(req, res){
        req.logout();
        res.redirect('/');
    });
};

function getAllMethods(object) {
    return Object.getOwnPropertyNames(object).filter(function(property) {
        return typeof object[property] == 'function';
    });
}

// route middleware to make sure a user is logged in
function is_logged_in(req, res, next) {

    // if user is authenticated in the session, carry on 
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.status(401).send(false);
}