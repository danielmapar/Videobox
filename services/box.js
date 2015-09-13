'use strict';
var mongoose = require('mongoose'),
	User = mongoose.model('User'),
	Box = mongoose.model('Box'),
	Tag = mongoose.model('Tag');

/*
	/create - Service to create a Box as an authenticated User
*/
exports.create = function create(name, tags, userId, callback) {

	if((error = User.validateId(userId)) || 
	   (error = Box.validateName(name))  ||
	   (error = Box.validateTags(tags))) {
		return callback({message: error});
	}

	User.findById(userId).then(function(user) {
		if(!user) {
			return callback({message: 'User does not exist'});
		} else {
			var boxTags = [],
				currentDate = new Date();

			for(var i = 0; i < tags.length; i++) {
				var tag  = new Tag();
				tag.name = tags[i];
				tag.created = {
					at: currentDate,
					by: {
						_id: user._id,
						username: user.username,
						email: user.email
					}
				};			
				tag.save();
			}

			var box = new Box();
			box.name = name;
			box.tags = tags;
			box.created = {
				at: currentDate,
				by: {
					_id     : user._id,
					username: user.username,
					email   : user.email
				}
			};

			box.save(function (boxErr) {
				if(boxErr) { 
					return callback({message: 'Could not save Box'});
				}

				user.boxes.createdByMe.push({
					_id : box._id,
					name: box.name
				});

				user.save(function (userErr) {
					if(userErr) { 
						return callback({message: 'Could not update User'});
					}
					return callback({_id: box._id, createdSuccessfully: true});
				});	
			});
		}
	});
};

/*
	/createUnauthenticated - Service to create and save a Box as an unauthenticated User
*/
exports.createUnauthenticated = function createUnauthenticated(name, tags, videos, callback) {

	console.log('antes');

	if((error = Box.validateName(name))  ||
	   (error = Box.validateTags(tags))) {
		return callback({message: error});
	}

	console.log('passou');

	var boxTags = [],
		currentDate = new Date();

	for(var i = 0; i < tags.length; i++) {
		var tag = new Tag();
		tag.name = tags[i];
		tag.created = {
			at: currentDate
		};					
		tag.save();
	}

	var box = new Box();
	box.name = name;
	box.tags = tags;
	box.videos = videos;
	box.created = {
		at: currentDate
	};

	Box.validateVideos(videos, function(boxErr) {
		if (boxErr) {
			return callback({message: boxErr});
		}

		box.save(function (boxErr) {
			if(boxErr) { 
				return callback({message: 'Could not save Box'});
			}
			
			return callback({_id: box._id, createdSuccessfully: true});
		});
	});
};

/*
	/save - Service to save a Box as an authenticated User
*/
exports.save = function save(boxId, videos, callback) {

	if((error = Box.validateId(boxId))) {
		return callback({message: error});
	}

	Box.validateVideos(videos, function(ret) {
		if (ret) {
			return callback({message: ret});
		}

		/* Verificar se a box eh do usuario */
		/* Bloquear o save caso tenha videos + sem created at */

		Box.findByIdAndUpdate(boxId, {videos: videos}).then(function(box) {
			if(!box) {
				return callback({message: 'Box does not exist'});
			} else {
				return callback({_id: box._id, savedSuccessfully: true});			
			}
		});

	});
};