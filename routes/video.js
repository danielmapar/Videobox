'use strict';
var express = require('express'),
	router = express.Router();

router.get('/dailyTop', function(req, res, next) {

	/* Get params from req 
		query, apis, filters
	*/
	var videos = [];
	videos.push(
				{
					'name': 'Larry David', 
					'src': 'https://www.youtube.com/embed/yKfVNTGmxfg', 
					'site': 'youtube',
					'thumbnail': 'http://img.youtube.com/vi/yKfVNTGmxfg/0.jpg'
				});

	videos.push(
				{
					'name': 'Louie', 
					'src': 'https://www.youtube.com/embed/-rfZftvNgvo', 
					'site': 'youtube',
					'thumbnail': 'http://img.youtube.com/vi/-rfZftvNgvo/0.jpg'
				});

	videos.push(
				{
					'name': 'Seinfeld',
					'src': 'https://www.youtube.com/embed/IeRdy6LrOAI', 
					'site': 'youtube',
					'thumbnail': 'http://img.youtube.com/vi/IeRdy6LrOAI/0.jpg'
				});

	videos.push(
				{
					'name': 'Jimmy Fallon', 
					'src': 'https://www.youtube.com/embed/ZVUozlcHjR0', 
					'site': 'youtube',
					'thumbnail': 'http://img.youtube.com/vi/ZVUozlcHjR0/0.jpg'
				});

	return res.json(videos);
	
});

module.exports = router;