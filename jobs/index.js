'use strict';

var mongoose = require('mongoose'),
	User = mongoose.model('User'),
	schedule = require('node-schedule'),
	mandrill = require('mandrill-api/mandrill'),
	mandrill_client = new mandrill.Mandrill(process.env.mandrill_api_key);

/*
The cron format consists of:
*    *    *    *    *    *
┬    ┬    ┬    ┬    ┬    ┬
│    │    │    │    │    |
│    │    │    │    │    └ day of week (0 - 7) (0 or 7 is Sun)
│    │    │    │    └───── month (1 - 12)
│    │    │    └────────── day of month (1 - 31)
│    │    └─────────────── hour (0 - 23)
│    └──────────────────── minute (0 - 59)
└───────────────────────── second (0 - 59, OPTIONAL)
*/

exports.init = function () {
	// Run job every hour in order to check for inactive anonymous Users
	schedule.scheduleJob('*/1 * * * *', function() {
		//0 */1 * * *'

		console.log('Running job: Checking for inactive users every hour (' + new Date() + ')');

		var limitDate = new Date(),
			numberOfDays = 0;

		limitDate.setDate(limitDate.getDate() - numberOfDays);

		User.find({
					'logins.last': { $lt: limitDate },
					'status': User.STATUS.ANONYMOUS_AND_ACTIVE
				  }).then(function(users){
			users.forEach(function(user){
				user.status = User.STATUS.ANONYMOUS_AND_INACTIVE;
				user.save();
			});
		});
	});

	// Run job every minute in order to send "reset password" tokens
	// using the Mandrill email service
	schedule.scheduleJob('*/30 * * * * *', function() {

		console.log('Running job: Checking for reset password tokens every minute (' + new Date() + ')');

		/* Reset password email template */
		var template_name = "resetPassword",
			template_content = [{
				"name": "Videobox",
				"content": "Reset Password"
			}],
			message = {
				"from_email": "no-reply@boxes.video",
				"from_name": "Videobox",
				"to": [{
					"email": null,
					"name": null,
					"type": "to"
				}],
				"headers": {
					"Reply-To": null
				},
				"important": true,
				"global_merge_vars": [{
					"name": "USERNAME",
					"content": null
				},{
					"name": "TOKEN",
					"content": null
				},{
					"name": "SERVICE_NAME",
					"content": 'resetPassword'
				},{
					"name": "APP_URL",
					"content": 'http://localhost:3000'
				}]
			},
			async = false;

		User.find({'resetPassword.emailSent': false}).then(function(users){
			
			users.forEach(function(user) {
				message.to[0].email                  = user.email.address;
				message.to[0].name                   = user.username;
				message.headers["Reply-To"]          = user.email.address;
				message.global_merge_vars[0].content = user.username;
				message.global_merge_vars[1].content = user.resetPassword.token;

				mandrill_client.messages.sendTemplate({
							"template_name"   : template_name,
							"template_content": template_content,
							"message"         : message, 
							"async"           : async
				}, function(result) {
					user.resetPassword.emailSent = true;
					user.save();
				}, function(e) {
					user.resetPassword = undefined;
					user.save();
					// Mandrill returns the error as an object with name and message keys
					console.log('A mandrill error occurred: ' + e.name + ' - ' + e.message);
				});
			});
		});
	});


	// Run job every 30 seconds in order to send "email validation" tokens
	// using the Mandrill email service
	schedule.scheduleJob('*/30 * * * * *', function() {

		console.log('Running job: Checking for new Users every 30 seconds (' + new Date() + ')');

		/* Reset password email template */
		var template_name = "validate-email",
			template_content = [{
				"name": "Videobox",
				"content": "Email Validation"
			}],
			message = {
				"from_email": "no-reply@boxes.video",
				"from_name": "Videobox",
				"to": [{
					"email": null,
					"name": null,
					"type": "to"
				}],
				"headers": {
					"Reply-To": null
				},
				"important": true,
				"global_merge_vars": [{
					"name": "USERNAME",
					"content": null
				},{
					"name": "TOKEN",
					"content": null
				},{
					"name": "SERVICE_NAME",
					"content": 'validateAccount'
				},{
					"name": "APP_URL",
					"content": 'http://localhost:3000'
				}]
			},
			async = false;

		User.find({$or: [{status: User.STATUS.SENDING_EMAIL_VALIDATION},
						 {status: User.STATUS.FAILED_SENDING_EMAIL_VALIDATION}]
					}).then(function(users){
			
			for (var i = 0; i < users.length; i++) {
				var user = users[i];

				/* Remove User with invalid email address */
				if (user.email.validation.numberOfTries === 3) {
					user.remove().exec();
					continue;
				}

				message.to[0].email                  = user.email.address;
				message.to[0].name                   = user.username;
				message.headers["Reply-To"]          = user.email.address;
				message.global_merge_vars[0].content = user.username;
				message.global_merge_vars[1].content = user.email.validation.token;

				mandrill_client.messages.sendTemplate({
							"template_name"   : template_name,
							"template_content": template_content,
							"message"         : message, 
							"async"           : async
				}, function(result) {
					user.status = User.STATUS.WAITING_VALIDATION;
					user.save();
				}, function(e) {
					user.status = User.STATUS.FAILED_SENDING_EMAIL_VALIDATION;
					user.email.validation.numberOfTries += 1;
					user.save();
					// Mandrill returns the error as an object with name and message keys
					console.log('A mandrill error occurred: ' + e.name + ' - ' + e.message);
				});
			};
		});
	});
};