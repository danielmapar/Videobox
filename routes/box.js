'use strict';
var express        			     = require('express'),
	router         				 = express.Router(),
	createService  				 = require("../services/box").create,
	createUnauthenticatedService = require("../services/box").createUnauthenticated,

	jwt  = require('express-jwt'),
	auth = jwt({secret: process.env.jwt_secret, userProperty: 'user'});

/*
	/create - Endpoint to create a Box as an authenticated User
	
	name (String)   -> Required -> Box name
	tags ([String]) -> Required -> Set of tags that describe Box
*/
router.post('/create', auth, function(req, res, next) {

	var name   = req.body.name               ? req.body.name : null,
		tags   = req.body.tags 				 ? req.body.tags : null,
		userId = (req.user && req.user._id)  ? req.user._id  : null;

	createService(name, tags, userId, function(ret) {
		if (ret) {
			if (ret.createdSuccessfully) {
				res.status(200).json(ret);
			} else if (ret.message) {
				res.status(400).json(ret);
			} else {
				res.status(400).json({message: 'System failure'});
			}
		} else {
			res.status(400).json({message: 'System failure'});
		}
	});

});

/*
	/createUnauthenticated - Endpoint to create and save a Box as an unauthenticated User
	
	name (String)   -> Required -> Box name
	tags ([String]) -> Required -> Set of tags that describe Box
	videos ([Object]) -> Required -> Set of videos 
*/
router.post('/createUnauthenticated', function(req, res, next) {

	console.log('teste');

	var name   = req.body.name   ? req.body.name   : null,
		tags   = req.body.tags   ? req.body.tags   : null,
		videos = req.body.videos ? req.body.videos : null;

	createUnauthenticatedService(name, tags, videos, function(ret) {
		if (ret) {
			if (ret.createdSuccessfully) {
				res.status(200).json(ret);
			} else if (ret.message) {
				res.status(400).json(ret);
			} else {
				res.status(400).json({message: 'System failure'});
			}
		} else {
			res.status(400).json({message: 'System failure'});
		}
	});
});

/*
	/save - Endpoint to save a Box as an authenticated User
	
	boxId  (String)   -> Required -> Box Id
	videos ([String]) -> Required -> List of videos
*/
router.post('/save', auth, function(req, res, next) {

	var boxId  = req.body.boxId  ? req.body.boxId  : null,
		videos = req.body.videos ? req.body.videos : null,
		user   = req.user        ? req.user        : null;


});


module.exports = router;