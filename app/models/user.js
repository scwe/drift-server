// app/models/user.js
// load the things we need
var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');

// define the schema for our user model
var userSchema = mongoose.Schema({
    username        : String,
    password        : String,
    facebook        : {
        id          : Number,
        friends     : [Number]
    },
    categories      : [{       //List of all the categories that the user 
        name        : String,
        colour      : String,
        markers     : [{       //List of all the markers attached to the category
            name    : {type: String, default : ""},
            id   : Number,
            lat     : Number,
            lon     : Number,
            text    : String,
            image   : {data : Buffer, contentType : String},
        }],
    }]
});

// methods ======================
// generating a hash
userSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
userSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.password);
};

userSchema.methods.createMarker = function(categoryName, _name, _lat, _lon, _text, _image){
    var cat = findWithName(this.categories, categoryName);
    if(cat === null){
        return false;
    } 

    var newMarker = {lat: _lat, lon : _lon, text: _text, image:_image, id : cat.markers.length};

    if(_name){
        newMarker["name"] = _name;
    }

    cat.markers.push(newMarker);
    this.save();

    return newMarker.id;  //that should do it
};

userSchema.methods.createCategory = function(_name, _colour){
    var old_cat = findWithName(this.categories, _name);

    if(old_cat !== null){
        return false;
    }

    var newCat = {name: _name, colour: _colour, markers: []};

    this.categories.push(newCat);
    this.save();

    return newCat;
};

userSchema.methods.getCategory = function(name){
    var cat = findWithName(this.categories, name);
    if(cat === null){
        return false;
    }

    return cat;
};

userSchema.methods.getMarker = function(catName, id){
    var cat = findWithName(this.categories, catName);

    if(cat === null){
        return false;
    }
    var marker = false;

    for (var i = 0; i < cat.markers.length; i++) {
        console.log("id is: "+cat.markers[i].id+" and the one we are looking for is: "+id);
        if(cat.markers[i].id === id){
            marker = cat.markers[i];
        } 
    };

    return marker;
}

userSchema.methods.allMarkers = function(catName){
    var cat = findWithName(this.categories, catName);
    if(cat === null){
        return false;
    }

    return cat.markers;
}

userSchema.methods.allCategories = function(){
    return this.categories;
}

userSchema.methods.setFacebookId = function(id){
    this.facebook.id = id;
    this.save();

    return id;
}

userSchema.methods.addFriends = function(new_friends){
    this.facebook.friends.concat(new_friends);

    this.save();
    return true;
}

function findWithName(list, name){
    for (var i = list.length - 1; i >= 0; i--) {
        if(list[i].name === name){
            return list[i];
        }
    };

    return null;
}

//Make sure that we can convert to JSON
userSchema.set('toJSON', { getters: true, virtuals: false });

// create the model for users and expose it to our app
module.exports = mongoose.model('User', userSchema);