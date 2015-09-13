var passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    mongoose = require('mongoose'),
    User = mongoose.model('User');

passport.use(new LocalStrategy({usernameField: 'usernameOrEmail'},
  function(usernameOrEmail, password, done) {
    User.findOne({ $or:[{username: usernameOrEmail}, {'email.address': usernameOrEmail}] }, function (err, user) {
      if (err) { return done(err); }
      if (!user) {
        return done(null, false, { message: 'Incorrect Username/Email' });
      } else if (!user.validPassword(password)) {
        return done(null, false, { message: 'Incorrect Password' });
      }
      return done(null, user);
    });
  }
));