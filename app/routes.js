// app/routes.js
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
    app.get('/login', function(req, res) {

        // render the page and pass in any flash data if it exists
        res.render('login.ejs', { message: req.flash('loginMessage') }); 
    });

    // process the signup form
    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect : '/profile', // redirect to the secure profile section
        failureRedirect : '/signup', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));

    // =====================================
    // SIGNUP ==============================
    // =====================================
    // show the signup form
    app.get('/signup', function(req, res) {
        // render the page and pass in any flash data if it exists
        res.render('signup.ejs', { message: req.flash('signupMessage') });
    });

    // process the login form
    app.post('/login', passport.authenticate('local-login', {
        successRedirect : '/profile', // redirect to the secure profile section
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
            user : req.user // get the user out of session and pass to template
        });
    });

    // =====================================
    // LOGOUT ==============================
    // =====================================
    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });
};

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on 
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/login');
}

/*

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
});
*/