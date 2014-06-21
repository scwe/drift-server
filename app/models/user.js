// app/models/user.js
// load the things we need
var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');

// define the schema for our user model
var userSchema = mongoose.Schema({

    local            : {
        username     : String,
        password     : String,
        facebook_id  : String
    },
    facebook         : {
        id           : String,
        token        : String,
        email        : String,
        name         : String
    }
/*
    'CREATE TABLE categories (  ' +
        'category_id serial PRIMARY KEY,    ' +
        'user_id integer NOT NULL,  ' +
        'name text NOT NULL,    ' +
        'colour text NOT NULL   ' +
    '); ' +
    'CREATE TABLE users (   ' +
        
    '); ' +
    'CREATE TABLE markers ( ' +
        'user_id integer NOT NULL,  ' +
        'marker_id serial PRIMARY KEY,  ' +
        'lat double NOT NULL,   ' +
        'lon double NOT NULL,   ' +
        'data text, ' +
        'image bytea,   ' +
    ');'*/

});

// methods ======================
// generating a hash
userSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
userSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.local.password);
};

// create the model for users and expose it to our app
module.exports = mongoose.model('User', userSchema);