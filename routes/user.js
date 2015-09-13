'use strict';
var express                           = require('express'),
	router                            = express.Router(),
	reactivateService                 = require("../services/user").reactivate,
	unlockService                     = require("../services/user").unlock,
	forgotPasswordService             = require("../services/user").forgotPassword,
	resetPasswordService              = require("../services/user").resetPassword,
	checkResetPasswordTokenService    = require("../services/user").checkResetPasswordToken,
	setNewPasswordService             = require("../services/user").setNewPassword,
	resendEmailValidationTokenService = require("../services/user").resendEmailValidationToken,
	validateAccountService            = require("../services/user").validateAccount,

	jwt  = require('express-jwt'),
	auth = jwt({secret: 'ENV_VAR', userProperty: 'user'});

/*
	/reactivate - Endpoint to activate a User that did not provide an email address
				  during registration, and is also inactive for a week (no login)
	
	email    (String) -> Required -> User email
	username (String) -> Required -> User username
	password (String) -> Required -> User password
*/
router.post('/reactivate', function(req, res, next){

	reactivateService(req, res, next, function(ret){
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
	/unlock - Endpoint to let a User that did not provide an email address
			  during registration add it later (active user)
	
	email (String) -> Required -> User email
*/
router.post('/unlock', auth, function(req, res, next) {

	var email  = req.body.email ? req.body.email : null,
		userId = req.user._id   ? req.user._id   : null;

	unlockService(email, userId, function(ret) {
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
	/forgotPassword - Endpoint to send a reset password token to a User (not logged in)
	
	usernameOrEmail (String) -> Required -> User username or email
*/
router.post('/forgotPassword', function(req, res, next) {

	var usernameOrEmail  = req.body.usernameOrEmail ? req.body.usernameOrEmail : null;

	forgotPasswordService(usernameOrEmail, function(ret){
		if (ret) {
			if (ret.sentSuccessfully) {
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
	/resetPassword - Endpoint to send a reset password token to a User (logged in)
*/
router.post('/resetPassword', auth, function(req, res, next) {

	var userId = req.user._id ? req.user._id : null;

	resetPasswordService(userId, function(ret) {
		if (ret) {
			if (ret.sentSuccessfully) {
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
	/checkResetPasswordToken - Endpoint to check if reset password token still valid
	
	username (String) -> Required -> User username
	token    (String) -> Required -> Reset password token
*/
router.post('/checkResetPasswordToken', function(req, res, next) {

	var username = req.body.username  ? req.body.username  : null,
		token    = req.body.token     ? req.body.token     : null;

	checkResetPasswordTokenService(username, token, function(ret) {
		if (ret) {
			if (ret.validToken) {
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
	/setNewPassword - Endpoint to set a new password for a User
	
	username        (String) -> Required -> User username
	password        (String) -> Required -> User new password 
	confirmPassword (String) -> Required -> User new confirm password
	token           (String) -> Required -> Reset password token
*/
router.post('/setNewPassword', function(req, res, next) {

	var username          = req.body.username         ? req.body.username          : null,
		password          = req.body.password         ? req.body.password          : null,
		confirmPassword   = req.body.confirmPassword  ? req.body.confirmPassword   : null,
		token             = req.body.token            ? req.body.token             : null;

	setNewPasswordService(username, password, confirmPassword, token, function(ret) {
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
	/resendEmailValidationToken - Endpoint to send the validation token again to the User (logged out)
	
	email (String) -> Required -> User email
*/
router.post('/resendEmailValidationToken', function(req, res, next) {

	var email = req.body.email ? req.body.email : null;
	
	resendEmailValidationTokenService(email, function(ret) {
		if (ret) {
			if (ret.sentSuccessfully) {
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
	/validateAccount - Endpoint to validate an User account
	
	username (String) -> Required -> User username
	token    (String) -> Required -> Validate User token
*/
router.post('/validateAccount', function(req, res, next) {

	var username = req.body.username ? req.body.username : null,
		token 	 = req.body.token    ? req.body.token    : null;

	validateAccountService(username, token, function(ret) {
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