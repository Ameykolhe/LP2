var express = require('express');
var bodyParser = require('body-parser');
var Pusher = require('pusher');

var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// to serve our JavaScript, CSS and index.html
app.use(express.static('./'));

var pusher = new Pusher({
  appId: '879725',
  key: '8da9d56271713a65600c',
  secret:  'af1b199783358220f389',
  cluster: 'ap3'
});

app.post('/pusher/auth', function(req, res) {
  var socketId = req.body.socket_id;
  var channel = req.body.channel_name;
  var auth = pusher.authenticate(socketId, channel);
  res.send(auth);
});

var port = process.env.PORT || 5000;
app.listen(port, () => console.log('Listening at http://localhost:5000'));
