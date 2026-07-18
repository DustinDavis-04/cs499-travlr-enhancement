var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var mongoose = require('mongoose');

var User = mongoose.model('users');

passport.use(new LocalStrategy(
    {
        usernameField: 'email'
    },
    async function(username, password, done) {
        try {
            const user = await User.findOne({ email: username });

            if (!user) {
                return done(null, false, { message: 'User not found' });
            }

            if (!user.validPassword(password)) {
                return done(null, false, { message: 'Invalid password' });
            }

            return done(null, user);
        } catch (err) {
            return done(err);
        }
    }
));