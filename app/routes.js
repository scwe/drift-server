// app/routes.js

var User = require('../app/models/user');  //only needed for finding friends, but we should probably load at the start anyway

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

    app.post('/:category_name/create_marker', is_logged_in, function(req, res){
        if( !req.body.hasOwnProperty('lat') ||
            !req.body.hasOwnProperty('lon') ||
            !req.body.hasOwnProperty('text')){
            res.statusCode = 400;
            return res.send('Error 400: Post syntax incorrect');
        }

        var user = req.user;
        var marker;
        var name = ""

        if(req.body.hasOwnProperty('name')){
            name = req.body.name;
        }

        if(req.body.hasOwnProperty('image')){
            marker = user.createMarker(req.params.category_name, name, req.body.lat, req.body.lon, req.body.text, req.body.image);
        }else{
            marker = user.createMarker(req.params.category_name, name, req.body.lat, req.body.lon, req.body.text);
        }

        return res.send(JSON.stringify(marker));
    });

    app.post('/create_category', is_logged_in, function(req, res){
        if(!req.body.hasOwnProperty('name') || 
            !req.body.hasOwnProperty('colour')){
            res.statusCode = 400;
            return res.send('Error 400: Post syntax incorrect');
        }

        return res.send(JSON.stringify(req.user.createCategory(req.body.name, req.body.colour)));

    });

    app.get('/:category_name/:marker_id', is_logged_in, function(req, res){
        //make sure that the person is either 'username' or they are facebook friends with 'username'
        var user = req.user;

        if(req.params.marker_id === "all"){
            var markers = user.allMarkers(req.params.category_name);
            return res.send(JSON.stringify(markers));
        }else{
            var marker = user.getMarker(req.params.category_name, req.params.marker_id);
            return res.send(JSON.stringify(marker));
        }
    });



    app.get('/:category_name', is_logged_in, function(req, res){
        var user = req.user;
        var category_name = req.params.category_name;

        if(category_name === "all"){
            var categories = user.allCategories();
            return res.send(JSON.stringify(categories));
        }else{
            var category = user.getCategory(category_name);
            return res.send(JSON.stringify(category));
        }
    });

    app.get('/all', is_logged_in, function(req, res){
        return res.json(req.user.toJSON());
    });

    //for setting the persons facebook id
    app.post('/facebook/add', is_logged_in, function(req, res){
        if(!req.body.hasOwnProperty('facebook_id')){
            return res.status(400).send("Incorrect post syntax");
        }

        var user = req.user;
        var fb_id = req.body.facebook_id;

        user.addFacebookId(fb_id);
        return res.json(true);
    });

    app.get('/facebook/:fb_id', is_logged_in, function(req, res){
        var user = req.user;
        var fb_id = req.param.fb_id;

        var friend_categories = User.findOne({'facebook.id': fb_id}, 'categories', function(err, categories){
            if(err){
                return res.status(400).send("There is no one in the database with that id");
            }
            return categories;
        });

        return res.json(friend_categories.markers);
    });

    app.post('/facebook/friends', is_logged_in, function(req, res){
        if(!req.body.hasOwnProperty('friends')){
            return res.status(400).send("Incorrect post syntax");
        }
        var user = req.user;
        return res.json(user.addFriends(req.body.friends));
    });

    app.get('/logout', function(req, res){
        req.logout();
        res.redirect('/');
    });
};

// route middleware to make sure a user is logged in
function is_logged_in(req, res, next) {

    // if user is authenticated in the session, carry on 
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.status(401).send(false);
}