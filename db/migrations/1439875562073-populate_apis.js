'use strict'
var mongoose = require('mongoose');
require('../index');

var VideoAPI = mongoose.model('VideoAPI');

exports.up = function(next) {

	var youtubeAPI       = new VideoAPI();
	youtubeAPI.name 	 = 'Youtube';
	youtubeAPI.website	 = 'www.youtube.com';
	youtubeAPI.baseUrls  = [];
	youtubeAPI.baseUrls.push('https://youtu.be');
	youtubeAPI.baseUrls.push('https://www.youtube.com');
	youtubeAPI.baseUrls.push('https://youtube.com');

	youtubeAPI.save(function (youtubeAPIErr){
		if(youtubeAPIErr){ 
			console.log('Failed to create Youtube API entry');
		}
		next();
	});
	
};

exports.down = function(next) {
  next();
};
