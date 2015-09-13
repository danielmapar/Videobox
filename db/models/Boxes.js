'use strict';

var mongoose = require('mongoose'),
	VideoAPI = mongoose.model('VideoAPI'),

	BoxSchema = new mongoose.Schema({
		name: String,
		created: {
					at: Date, 
			      	by: {
			      		_id: mongoose.Schema.Types.ObjectId,
						username: String,
						email: String
					}
				 },
		tags: [{type: String, unique: true}],
		likes: Number,
		videos: [{
					name: String,
					src: String,
					thumbnail: String,
					site: String
				}]
	});

	BoxSchema.statics.validateId = function(boxId) {
		if (!boxId) {
			return 'Please fill out the Box Id field';
		} else if (!(typeof boxId === 'string' || boxId instanceof String)) {
			return 'Box Id must be a string value';
		} else if (!mongoose.Types.ObjectId.isValid(boxId)) {
			return 'Invalid Box Id';
		}
		return false;
	};

	BoxSchema.statics.validateName = function(name) {
		if(!name) {
			return 'Please fill out the name field';
		} else if(!(typeof name === 'string' || name instanceof String)) {
			return 'Box name must be a string value';
		} else if(name.length < 5 || name.length > 170) {
			return 'Box name must be 5 to 170 characters long';
		}
		return false;
	};

	BoxSchema.statics.validateTags = function(tags) {
		if(!tags) {
			return 'Please fill out the tags fields';
		} else if(!(Object.prototype.toString.call(tags) === '[object Array]' || tags instanceof Object)) {
			return 'Tags must be an array of string values';
		} else if(tags.length < 3 || tags.length > 30) {
			return 'Box must hold 3 to 30 tags';
		}

		for(var i = 0; i < tags.length; i++) {
			if (!(typeof tags[i]  === 'string' || tags[i] instanceof String)) {
				return 'Tag value must be a String value';
			} else if(tags[i].length < 3) {
				return 'Every tag must be at least 3 characters long';
			}
		}
		return false;
	};

	BoxSchema.statics.validateVideos = function(videos, callback) {
		if(!(Object.prototype.toString.call(videos) === '[object Array]' || videos instanceof Object)) {
			return callback('Videos must be an array of Objects containing string values');
		} else if(videos.length === 0) {
			return callback('Box must hold at least 1 video');
		}

		var error = null;
		for(var i = 0; i < videos.length; i++) {
			if (!(typeof videos[i].name       === 'string' || videos[i].name      instanceof String) ||
				!(typeof videos[i].src        === 'string' || videos[i].src       instanceof String) ||
				!(typeof videos[i].thumbnail  === 'string' || videos[i].thumbnail instanceof String) ||
				!(typeof videos[i].site       === 'string' || videos[i].site      instanceof String)) {
				return callback('Video Object only supports String values');
			} 
			VideoAPI.validateUrl(videos[i].src, function(error) {
				if(error) {
					console.log('opa' + i);
					return callback(error);
				}
			});
		}
		console.log('saiu');
		return callback(false);
	};

mongoose.model('Box', BoxSchema);