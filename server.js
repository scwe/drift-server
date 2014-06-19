var express == require('express');
var app = express();
var logfmt = requre("logfmt");
var port = Number(process.env.PORT || 3000);

app.use(express.bodyParser());
app.user(logfmt.requestLogger());

var server = app.listen(port, function(){
    console.log('Listening on port %d', server.address().port);
});

app.post('/login', function(req, res){
    if(!req.body.hasOwnProperty('username') ||
        !req.body.hasOwnProperty('password')){
        res.statusCose = 400;
        return res.send('Error 400: Post syntax incorrect');
    }

    res.json(true);

});

app.post('/signup', function(req, res){

});

app.get('/', function(req, res){
    res.send"Something or rather that sshould be here, just for testing");
});