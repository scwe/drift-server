var pg = require('pg').native 
  , connectionString = process.env.DATABASE_URL  
  , client 
  , query; 

client = new pg.Client(connectionString); 
client.connect(function(err){
    if(err){
        return console.error('Could not connect to the database');
    }

    client.query('')
});

query = client.query('
    CREATE TABLE categories ( 
        category_id serial PRIMARY KEY,
        user_id integer NOT NULL,
        name text NOT NULL,
        colour text NOT NULL
    );
    CREATE TABLE users (
        user_id serial PRIMARY KEY,
        username text NOT NULL,
        password text NOT NULL,
        facebook_id text
    );
    CREATE TABLE markers (
        user_id integer NOT NULL,
        marker_id serial PRIMARY KEY,
        lat double NOT NULL, 
        lon double NOT NULL,
        data text,
        image bytea,
    );');

query.on('end', function(result){
    client.end();
});
