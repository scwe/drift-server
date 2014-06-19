var pg = require('pg');
var connectionString = process.env.DATABASE_URL;
 
var client = new pg.Client(connectionString);
client.connect();

var query = client.query(
    'CREATE TABLE categories (  ' +
        'category_id serial PRIMARY KEY,    ' +
        'user_id integer NOT NULL,  ' +
        'name text NOT NULL,    ' +
        'colour text NOT NULL   ' +
    '); ' +
    'CREATE TABLE users (   ' +
        'user_id serial,    ' +
        'username text, ' +
        'password text NOT NULL,    ' +
        'facebook_id text,  ' +
        'PRIMARY KEY (username, user_id)    ' +
    '); ' +
    'CREATE TABLE markers ( ' +
        'user_id integer NOT NULL,  ' +
        'marker_id serial PRIMARY KEY,  ' +
        'lat double NOT NULL,   ' +
        'lon double NOT NULL,   ' +
        'data text, ' +
        'image bytea,   ' +
    ');');

query.on('end', function(result){
    client.end();
});
