'use strict';
var express = require('express'),
	router = express.Router(),
	registerService = require("../services/user").register,
	loginService = require("../services/user").login;

/*
	/register - Endpoint to create a User

	recaptcha.response  (String) -> Required -> User response for reCaptcha challenge
	username            (String) -> Required -> User username
	email               (String) -> Not Required -> User email
	password            (String) -> Required -> User password
	confirmPassword     (String) -> Required -> User confirm password
*/
router.post('/register', function(req, res, next){

	var remoteAddress     = req.connection.remoteAddress 						  ? req.connection.remoteAddress : null,
		recaptchaResponse = (req.body.recaptcha && req.body.recaptcha.response)   ? req.body.recaptcha.response  : null,
		username          = req.body.username                                     ? req.body.username            : null,
		email             = req.body.email               					      ? req.body.email               : null,
		password          = req.body.password           					      ? req.body.password            : null,
		confirmPassword   = req.body.confirmPassword   						      ? req.body.confirmPassword     : null;

	registerService(username, 
					email, 
					password, 
					confirmPassword, 
					recaptchaResponse, 
					remoteAddress, 
					req.headers,
					function(ret) {

		if (ret) {
			if (ret.token) {
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
	/login - Service to authenticate a User
	
	usernameOrEmail (String) -> Required -> User username or email
	password        (String) -> Required -> User password
*/
router.post('/login', function(req, res, next){

	loginService(req, res, next, function(ret){
		if (ret) {
			if (ret.token) {
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

module.exports = router;
