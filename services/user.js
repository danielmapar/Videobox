'use strict';
var passport = require('passport'),
	request = require('request'),
	mongoose = require('mongoose'),
	crypto = require('crypto'),
	UAParser = require('ua-parser-js'),
	User = mongoose.model('User');

/*
	/login - Service to login a User
*/
exports.login = function login(req, res, next, callback) {

	var usernameOrEmail  = req.body.usernameOrEmail ? req.body.usernameOrEmail : null,
		password         = req.body.password        ? req.body.password        : null,
		error 			 = null;

	if((error = User.validateUsernameOrEmail(usernameOrEmail)) || 
	   (error = User.validatePassword(password))) {
		return callback({message: error});
	} 

	passport.authenticate('local', function(err, user, info) {
		if(err){ return callback(next(err)); }

		if(user) {
			if (user.status === User.STATUS.ANONYMOUS_AND_INACTIVE) {
				return callback({message: 'Locked account', locked: true});
			} else if(user.status === User.STATUS.WAITING_VALIDATION || user.status === User.STATUS.SENDING_VALIDATION_EMAIL) {
				return callback({message: 'Inactive account. Please check your email to activate your subscription', inactive: true});
			}

			user.set({
				'logins.last'    : new Date(),
				'logins.previous': user.logins.last,
				'logins.count'   : ++user.logins.count,
				'browser'        : exports.getBrowser(req.headers)
			});

			user.save(function (userErr){
				if(userErr){ 
					return callback({message: 'Saving process has failed!'});
				}

				return callback({token: user.generateJWT()});
			});
		} else {
			return callback(info);
		}
	})(req, res, next);
};

/*
	/register - Service to create a User
*/
exports.register = function register(username, email, password, confirmPassword, recaptchaResponse, remoteAddress, reqHeaders, callback) {

	var error = null;

	if((error = User.validateUsername(username))			   		     || 
	   (email && (error = User.validateEmail(email)))		   	 		 ||
	   (error = User.validatePassword(password))			   	 		 ||
	   (error = User.validateConfirmPassword(password, confirmPassword)) ||
	   (error = exports.validateReCaptchaResponse(recaptchaResponse))    ||
	   (error = exports.validateRemoteAddress(remoteAddress))    		 ||
	   (error = exports.validateRequestHeaders(reqHeaders))) {
		return callback({message: error});
	}

	request.post('https://www.google.com/recaptcha/api/siteverify', {
		form: {
			secret: "6LeVNwsTAAAAAMx1O25zyxOPOmBBLYfW5F7n7sTu",
				remoteip: remoteAddress,
				response: recaptchaResponse
		}
	}, function (captchaErr, captchaRes, captchaBody) {

		if(captchaErr){
			return callback({message: 'Recaptcha validation failed'});
		}

		/* 
		   If the request to googles verification service returns
		   a body which has false within it means server failed
		   validation, if it doesnt verification passed
		 */
		if (captchaBody && captchaBody.match(/false/) === null) {

			var user = new User();

			if (email) {
				var buf = crypto.randomBytes(48);
				user.set({
					'email.address'         : email,
					'email.validation.token': buf.toString('hex')
				});
				user.status = User.STATUS.SENDING_EMAIL_VALIDATION;
			} else {
				user.status = User.STATUS.ANONYMOUS_AND_ACTIVE;
			}
			user.boxes = {
				fauvorites: [], 
				createdByMe: []
			};
			user.createdAt = new Date();
			user.set({
						'logins.last'    : user.createdAt,
						'logins.previous': null,
						'logins.count'   : 1,
						'browser'        : exports.getBrowser(reqHeaders)
					});
			user.username = username;
			user.setPassword(password);

			user.save(function (userErr) {

				if(userErr){ 
					if (!(userErr.message.match(/username/) === null)) {
						return callback({message: 'Username already in use'});
					} else if (!(userErr.message.match(/email/) === null)) {
						return callback({message: 'Email already in use'});
					}
				}

				return callback({token: user.generateJWT()});
			});
		} else {
			return callback({message: 'Recaptcha validation failed'});
		}
	});
};


/*
	/reactivate - Service to reactivate an Anonymous User (no email)
*/
exports.reactivate = function reactivate(req, res, next, callback) {

	var email  	  = req.body.email            ? req.body.email            : null,
		username  = req.body.usernameOrEmail  ? req.body.usernameOrEmail  : null,
		password  = req.body.password         ? req.body.password         : null,
        error     = null;

	if((error = User.validateUsername(username))  || 
	   (error = User.validateEmail(email))	   	  ||
	   (error = User.validatePassword(password))) {
		return callback({message: error});
	}
	
	passport.authenticate('local', function(err, user, info) {
		if(err){ return next(err); }

		if(user) {
			if(user.status === User.STATUS.ANONYMOUS_AND_INACTIVE) {
				var buf = crypto.randomBytes(48);
				user.set({
					'email.address': email,
					'email.validation.token': buf.toString('hex')
				});
				user.status = User.STATUS.SENDING_EMAIL_VALIDATION;
				user.save(function (userErr){
					if(userErr){ 
						return callback({message: 'Email address already in use by another user'});
					}

					return callback({token: user.generateJWT()})
				});
			} else if (user.status === User.STATUS.NORMAL_AND_ACTIVE) {
				return callback({message: 'User already active'});
			}
		} else {
			return callback({message: 'Could not authenticate User'});
		}
	})(req, res, next);
};

/*
	/unlock - Service to unlock a User
*/
exports.unlock = function unlock(email, userId, callback) {

	var error = null;

	if((error = User.validateEmail(email)) ||
	   (error = User.validateId(userId))) {
		return callback({message: error});
	}

	User.findById(userId).then(function (user) {
		if(!user) {
			return callback({message: 'User does not exist'});
		} else if(user.status === User.STATUS.ANONYMOUS_AND_ACTIVE) {
			var buf = crypto.randomBytes(48);
			user.set({
				'email.address': email,
				'email.validation.token': buf.toString('hex')
			});
			user.status = User.STATUS.SENDING_EMAIL_VALIDATION;
			user.save(function (userErr){
				if(userErr){ 
					return callback({message: 'Email address already in use by another user'});
				}
				
				return callback({token: user.generateJWT()})
			});
		} else if (user.status === User.STATUS.NORMAL_AND_ACTIVE) {
			return callback({message: 'User already active'});
		} else {
			return callback({message: 'Could not find User'});
		}
	});
};

/*
	/forgotPassword - Service to send a reset password token to a User (not logged in)
*/
exports.forgotPassword = function forgotPassword(usernameOrEmail, callback) {
	
	var error = null;

	if((error = User.validateUsernameOrEmail(usernameOrEmail))) {
		return callback({message: error});
	}

	User.findOne({$or: [{username: usernameOrEmail}, {'email.address': usernameOrEmail}]}).then(function (user) {
		if(!user) {
			return callback({message: 'User does not exist'});
		} else if (user.status !== User.STATUS.NORMAL_AND_ACTIVE || !user.email) {
			return callback({message: 'There is no email address associated to this account'});
		} else {
			var buf = crypto.randomBytes(48);
			user.set({
				'resetPassword.token': buf.toString('hex'),
				'resetPassword.createdAt': new Date(),
				'resetPassword.emailSent': false
			});
			user.save(function (userErr){
				if(userErr){ 
					return callback({message: 'Could not save User'});
				}

				return callback({sentSuccessfully: true});
			});
		}
	});
};

/*
	/resetPassword - Service to send a reset password token to a User (logged in)
*/
exports.resetPassword = function resetPassword(userId, callback) {
	
	var error = null;

	if((error = User.validateId(userId))) {
		return callback({message: error});
	}

	User.findById(userId).then(function (user) {
		if(!user) {
			return callback({message: 'User does not exist'});
		} else if (user.status !== User.STATUS.NORMAL_AND_ACTIVE || !user.email) {
			return callback({message: 'There is no email address associated to this account'});
		} else {
			var buf = crypto.randomBytes(48);
			user.set({
				'resetPassword.token': buf.toString('hex'),
				'resetPassword.createdAt': new Date(),
				'resetPassword.emailSent': false
			});

			user.save(function (userErr){
				if(userErr){ 
					return callback({message: 'Could not save User'});
				}

				return callback({sentSuccessfully: true});
			});
		}
	});
};


/*
	/checkResetPasswordToken - Service to check if reset password token still valid
*/
exports.checkResetPasswordToken = function checkResetPasswordToken(username, token, callback) {
	
	var error = null;

	if((error = User.validateUsername(username)) ||
	   (error = exports.validateToken(token))) {
		return callback({message: error});
	}

	User.findOne({$and: [{username: username}, {'resetPassword.token': token}]}).then(function (user) {
		if(!user) {
			return callback({message: 'This token is no longer valid'});
		} else {
			return callback({validToken: true});
		}
	});
};

/*
	/setNewPassword - Service to set a new password for a User
*/
exports.setNewPassword = function setNewPassword(username, password, confirmPassword, token, callback) {
	
	var error = null;
	
	if((error = User.validateUsername(username))                         ||
	   (error = User.validatePassword(password))                         ||
	   (error = User.validateConfirmPassword(password, confirmPassword)) ||
	   (error = exports.validateToken(token))) {
		return callback({message: error});
	}

	User.findOne({$and: [{username: username}, {'resetPassword.token': token}]}).then(function (user) {
		if(!user) {
			return callback({message: 'This token is no longer valid'});
		} else {
			user.setPassword(password);
			user.resetPassword = undefined;
			user.save(function (userErr){
				if(userErr){ 
					return callback({message: 'Could not save User'});
				}

				return callback({token: user.generateJWT()});
			});
		}
	});
};

/*
	/resendEmailValidationToken - Service to send the validation token again to the User (logged out)
*/
exports.resendEmailValidationToken = function resendEmailValidationToken(email, callback) {
	
	var error = null;
	
	if((error = User.validateEmail(email))) {
		return callback({message: error});
	}

	User.findOne({'email.address': email}).then(function (user) {
		if(!user) {
			return callback({message: 'User does not exist'});
		} else if (user.status === User.STATUS.NORMAL_AND_ACTIVE) {
			return callback({message: 'This account is already active'});
		} else {
			var buf = crypto.randomBytes(48);
			user.set({
				'email.validation.token': buf.toString('hex')
			});
			user.status = User.STATUS.SENDING_EMAIL_VALIDATION;
			
			user.save(function (userErr){
				if(userErr){ 
					return callback({message: 'Could not save User'});
				}

				return callback({sentSuccessfully: true});
			});
		}
	});
};

/*
	/validateAccount - Service to validate an User account
*/
exports.validateAccount = function validateAccount(username, token, callback) {
	
	var error = null;
	
	if((error = User.validateUsername(username)) ||
	   (error = exports.validateToken(token))) {
		return callback({message: error});
	}

	User.findOne({username: username, 'email.validation.token': token}).then(function (user) {
		if(!user) {
			return callback({message: 'This token is no longer valid'});
		} else if (user.status === User.STATUS.NORMAL_AND_ACTIVE) {
			return callback({message: 'This account is already active'});
		} else {
			user.email.validation = undefined;
			user.status = User.STATUS.NORMAL_AND_ACTIVE;

			user.save(function (userErr){
				if(userErr){ 
					return callback({message: 'Could not save User'});
				}

				return callback({token: user.generateJWT()});
			});
		}
	});
};

// @returns the browser information from the @headers object
exports.getBrowser = function getBrowser(headers) {

	var userAgentString = headers['user-agent'],
		parser,
		browser;

	// Capture their current browser for reporting.
	if (userAgentString) {
		parser = new UAParser();
		parser.setUA(userAgentString);

		browser = parser.getBrowser();
		if (browser.major) {
			browser.os = parser.getOS().name;
			browser.osVersion = parser.getOS().version ?
				parser.getOS().version : null;
		} else {
			browser = {};
		}
	}

	return browser;
};

exports.validateReCaptchaResponse = function validateReCaptchaResponse(recaptchaResponse){
	if(!recaptchaResponse) {
		return 'Please fill the Recaptcha Response field';
	} else if(!(typeof recaptchaResponse  === 'string' || recaptchaResponse instanceof String)) {
		return 'Recaptcha Response must be a string value';
	}
	return null;
};

exports.validateRemoteAddress = function validateRemoteAddress(remoteAddress){
	if(!remoteAddress) {
		return 'Please fill the Remote Address field';
	} else if(!(typeof remoteAddress  === 'string' || remoteAddress instanceof String)) {
		return 'Remote Address must be a string value';
	}
	return null;
};

exports.validateRequestHeaders = function validateRequestHeaders(reqHeaders){
	if(!reqHeaders) {
		return 'Please do not modify the Request Headers field';
	}
	return null;
};

exports.validateToken = function validateToken(token){
	if(!token) {
		return 'Please fill out the token field';
	} else if(!(typeof token === 'string' || token instanceof String)) {
		return 'Token must be a string value';
	}
	return null;
};