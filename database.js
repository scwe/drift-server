var connectionString = process.env.DATABASE_URL;
var bcrypt = require('bcrypt-nodejs');  //for encryption

module.exports = {
  create_user: create_user,
  encrypt_password: encrypt_password,
  valid_password: valid_password
};

function create_user(username, password){
    var user_id = -1;
    pg.connect(connectionString, function(err, client, done){
        if(err){
            return console.error('error fetching client from pool', err);
        }
        var q = client.query(
           'INSERT INTO users (username, password) VALUES (\'$1\', \'$2\') RETURNING user_id;', 
            [username, encrypt_password(password)]);

        q.on('row', function(row){
            user_id = row.user_id;
        });

        q.on('end', function(result){
            var cat_query = client.query('INSERT INTO categories (user_id, name, colour) 
                VALUES (\'$1\', \'Views\', \'#FFFF00\'),
                       (\'$1\', \'Beaches\', \'#00FF00\'),
                       (\'$1\', \'Beaches\', \'#00FFFF\'),',
                       [user_id]);

            cat_query.on('end', function (result){
                done();
            });
        });
    });

    return user_id;
}

function get_user_id(username){
    var user_id = -1;
    pg.connect(connectionString, function(err, client, done){
        if(err){
            return console.error('error fetching client from pool', err);
        }
        client.query('SELECT user_id FROM users WHERE username = \'$1\';', [username], function(err, result){
            done();
            if(err){
                return console.error('Error runnning the query');
            }
            user_id = result.rows[0].user_id;
        });
    });

    return user_id;
}

function encrypt_password(password){
    //save the password in plain text here...;
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
}

function validPassword(hashed_password){
    return bcrypt.compareSync(hashed_password, database.password);
}