var express = require('express');
var app = express();
var logfmt = require("logfmt");
var port = Number(process.env.PORT || 3000);

app.use(express.bodyParser());
app.use(logfmt.requestLogger());

var server = app.listen(port, function(){
    console.log('Listening on port %d', server.address().port);
});

app.post('/login', function(req, res){
    if(!req.body.hasOwnProperty('username') ||
        !req.body.hasOwnProperty('password')){
        res.statusCode = 400;
        return res.send('Error 400: Post syntax incorrect');
    }

    res.json(true);

});

app.post('/signup', function(req, res){
    if(!req.body.hasOwnProperty('username') ||
        !req.body.hasOwnProperty('password')){
        res.statusCode = 400;
        return res.send('Error 400: Post syntax incorrect');
    }
});

app.get('/:username/marker/:marker_id', function(req, res){
    //make sure that the person is either 'username' or they are facebook friends with 'username'
    var username = req.params.username;
    var marker_id = req.params.marker_id;

    if(marker_id === "all"){

    }
});

app.post('/:username/marker/:marker_id', function(req, res){
    if(!req.body.hasOwnProperty('category') ||
        !req.body.hasOwnProperty('lat') ||
        !req.body.hasOwnProperty('lon') ||
        !req.body.hasOwnProperty('text')){
        res.statusCode = 400;
        return res.send('Error 400: Post syntax incorrect');
    }


});

app.post('/:username/category/:category_id', function(req, res){
    if(!req.body.hasOwnProperty('name') || 
        !req.body.hasOwnProperty('colour')){
        res.statusCode = 400;
        return res.send('Error 400: Post syntax incorrect');
    }

});

app.post('/:username/category/:category_id', function(req, res){
    var username = req.params.username;
    var category_id = req.params.category_id;

    if(category_id === "all"){
        
    }
})

app.get('/', function(req, res){
    res.send("Something or rather that sshould be here, just for testing");
});