'use strict';

var mongoose = require('mongoose'),

	VideoAPISchema = new mongoose.Schema({
		name: {type: String, unique: true},
		website: {type: String, unique: true},
		baseUrls: [{type: String, unique: true}]
	});

	VideoAPISchema.statics.validateUrl = function(url, callback){
		this.model('VideoAPI').find({}).then(function(apis) {

			var invalid = true;

			for(var i = 0; i < apis.length; i++) {
				for(var y = 0; y < apis[i].baseUrls.length; y++) {
					if (url.indexOf(apis[i].baseUrls[y]) > -1) {
						invalid = false;
						break;
					}
				}
				if(!invalid) break;	
			}
			if (invalid) {
				return callback('Invalid URL');
			}

			return callback(false);
		});
	};


mongoose.model('VideoAPI', VideoAPISchema);