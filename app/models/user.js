// app/models/user.js
// load the things we need
var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');

// define the schema for our user model
var userSchema = mongoose.Schema({

    local             : {
        username      : String,
        password      : String,
        facebook_id   : Number,
        categories    : [{       //List of all the categories that the user 
            name      : String,
            colour    : String,
            markers   : [{       //List of all the markers attached to the category
                name  : {type: String, default : ""},
                lat   : Number,
                lon   : Number,
                text  : String,
                image : {data : Buffer, contentType : String},
            }],
        }]
    },
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

userSchema.methods.createMarker = function(categoryName, _name, _lat, _lon, _text, _image){
    var cat = findWithName(this.local.categories, categoryName);
    if(cat === null){
        return false;
    } 

    var newMarker = {lat: _lat, lon : _lon, text: _text, image:_image};

    if(_name){
        newMarker.push({name : _name});
    }

    this.local.categories.markers.push(newMarker);

    this.save(function(err){
        if(err){
            throw err;
            return false;
        }

        return this.local.categories.markers.indexOf(newMarker);
    });
};

userSchema.methods.createCategory = function(_name, _colour){
    var old_cat = findWithName(this.local.categories, _name);

    if(cat !== null){
        return false;
    }

    var newCat = {name: _name, colour: _colour, markers: []};

    this.local.categories.push(newCat);
    this.save(function(err){
        if(err){
            throw err;
            return false;
        }
        return this.local.categories.indexOf(newCat);
    });
};

userSchema.methods.getCategory = function(name){
    var cat = findWithName(this.local.categories, name);
    if(cat === null){
        return false;
    }

    return cat;
};

userSchema.methods.getMarker = function(catName, index, name){
    var cat = findWithName(this.local.categories, catName);

    if(cat === null){
        return false;
    }

    var marker = findWithName(cat, name);

    if(marker === null){  //if we can find it by name, just return that, otherwise use the index
        return cat[index];
    }

    return marker;
}

userSchema.methods.allMarkers = function(catName){
    var cat = findWithName(this.local.categories, catName);
    if(cat === null){
        return false;
    }

    return cat.markers;
}

userSchema.methods.allCategories = function(){
    return this.local.categories;
}

function findWithName(list, name){
    for (var i = list.length - 1; i >= 0; i--) {
        if(list[i].name === name){
            return list[i];
        }
    };

    return null;
}

userSchema.methods.get

//Make sure that we can convert to JSON
userSchema.set('toJSON', { getters: true, virtuals: false });

// create the model for users and expose it to our app
module.exports = mongoose.model('User', userSchema);