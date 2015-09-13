'use strict';

var mongoose = require('mongoose'),

	TagSchema = new mongoose.Schema({
		name: {type: String, unique: true},
		created: {
					at: Date, 
			      	by: {
			      		_id: mongoose.Schema.Types.ObjectId,
						username: String,
						email: String
				  	}
				 }
	});

mongoose.model('Tag', TagSchema);