var mongoose = require('mongoose'),
	crypto = require('crypto'),
	jwt = require('jsonwebtoken'),
	emailValidator = require("email-validator"),

	UserSchema = new mongoose.Schema({
		username: {type: String, lowercase: true, unique: true},
		email: {
				address: {type: String, trim: true, index: true, unique: true, sparse: true},
				validation: {
					token: String,
					numberOfTries: {type: Number, default: 0}
				}
		},
		hash: String,
		salt: String,
		createdAt: Date,
		status: String,
		logins: {
			// Last login
			last: Date,
			// Next-to-last login
			previous: Date,
			count: {type: Number, default: 0}
		},
		browser: {
			name: String,
			major: String,
			version: String,
			os: String,
			osVersion: String
		},
		resetPassword: {
			token: String,
			createdAt: Date,
			emailSent: Boolean
		},
		boxes: {
				fauvorites: [{
					_id: mongoose.Schema.Types.ObjectId,
					name: String,
					deleted: Boolean /* Box deleted by user */
				}], 
				createdByMe: [{
					_id: mongoose.Schema.Types.ObjectId,
					name: String,
					deleted: Boolean /* Box deleted by user */
				}]
		},
		preferences: {}
	});

	UserSchema.statics.STATUS = {
		NORMAL_AND_ACTIVE: 'Normal and Active',
		SENDING_EMAIL_VALIDATION: 'Sending Email Validation',
		FAILED_SENDING_EMAIL_VALIDATION: 'Failed Sending Email Validation',
		WAITING_VALIDATION: 'Waiting Validation',
		ANONYMOUS_AND_ACTIVE: 'Anonymous and Active',
		ANONYMOUS_AND_INACTIVE: 'Anonymous and Inactive'
	};

	UserSchema.statics.validateId = function(userId) {
		if (!userId) {
			return 'Please fill out the User Id field';
		} else if (!(typeof userId === 'string' || userId instanceof String)) {
			return 'User Id must be a string value';
		} else if (!mongoose.Types.ObjectId.isValid(userId)) {
			return 'Invalid User Id';
		}
		return false;
	};

	UserSchema.statics.validateUsername = function(username) {
		if (!username) {
			return 'Please fill out the Username field';
		} else if (!(typeof username === 'string' || username instanceof String)) {
			return 'Username must be a string value';
		} else if(username.length < 5 || username.length > 17) {
			return 'Username must be 5 to 17 characters long';
		} else if (emailValidator.validate(username)) {
			return 'Username cannot be an email address';
		}
		return false;
	};

	UserSchema.statics.validateEmail = function(email) {
		if (!email) {
			return 'Please fill out the Email field';
		} else if (!(typeof email === 'string' || email instanceof String)) {
			return 'Email must be a string value';
		} else if (!emailValidator.validate(email)) {
			return 'Invalid email address';
		}
		return false;
	};

	UserSchema.statics.validateUsernameOrEmail = function(usernameOrEmail) {
		if (!usernameOrEmail) {
			return 'Please fill out the Username or Email field';
		} else if (!(typeof usernameOrEmail === 'string' || usernameOrEmail instanceof String)) {
			return 'Username or Email must be a string value';
		}
		return false;
	};

	UserSchema.statics.validatePassword = function(password) {
		if (!password) {
			return 'Please fill out the Password field';
		} else if (!(typeof password === 'string' || password instanceof String)) {
			return 'Password must be a string value';
		} else if(password.length < 8 || password.length > 30) {
			return 'Password must be 8 to 30 characters long';
		} else if(!password.match('[0-9]+.*[a-zA-Z]+|[a-zA-Z]+.*[0-9]+')) {
			return 'Password must contain characters and numbers';
		}
		return false;
	};

	UserSchema.statics.validateConfirmPassword = function(password, confirmPassword) {
		if (!confirmPassword) {
			return 'Please fill out the Confirm Password field';
		} else if (!(typeof confirmPassword === 'string' || confirmPassword instanceof String)) {
			return 'Confirm Password must be a string value';
		} else if (password !== confirmPassword) {
			return 'Password and Confirm Password do not match';
		}
		return false;
	};
	
	UserSchema.methods.setPassword = function(password){
		this.salt = crypto.randomBytes(16).toString('hex');

		this.hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64).toString('hex');
	};

	UserSchema.methods.validPassword = function(password) {
		var hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64).toString('hex');

		return this.hash === hash;
	};

	UserSchema.methods.generateJWT = function() {

		// set expiration to 1 day
		var today = new Date(),
			exp = new Date(today);

		exp.setDate(today.getDate() + 1);

		return jwt.sign({
							_id: this._id,
							username: this.username,
							email: (this.email && this.email.address) ? this.email.address : null,
							exp: parseInt(exp.getTime() / 1000),
						}, process.env.jwt_secret);
	};

mongoose.model('User', UserSchema);