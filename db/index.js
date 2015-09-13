var mongoose = require('mongoose'),
	connectionPromise = new mongoose.Promise();

db = mongoose.connect('mongodb://localhost/videobox').connection;

db.on('error', function(err) {
		console.log('Connection error:', err);
	})
	.once('open', function callback () {
		console.log('Mongoose connection is open');
		connectionPromise.complete();
	});

exports.connected = connectionPromise;

require('./models/VideoAPIs');
require('./models/Users');
require('./models/Boxes');
require('./models/Tags');
