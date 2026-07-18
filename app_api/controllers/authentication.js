var mongoose = require('mongoose');
var passport = require('passport');

var User = mongoose.model('users');

// Register
module.exports.register = async function(req, res) {
    if (!req.body.name || !req.body.email || !req.body.password) {
        return res.status(400).json({ message: 'All fields required' });
    }

    try {
        var user = new User();

        user.name = req.body.name;
        user.email = req.body.email;
        user.setPassword(req.body.password);

        await user.save();

        var token = user.generateJWT();
        return res.status(200).json({ token: token });
    } catch (err) {
        return res.status(400).json(err);
    }
};

// Login
module.exports.login = function(req, res) {
    if (!req.body.email || !req.body.password) {
        return res.status(400).json({ message: 'All fields required' });
    }

    passport.authenticate('local', function(err, user, info) {
        if (err) {
            return res.status(404).json(err);
        }

        if (user) {
            var token = user.generateJWT();
            return res.status(200).json({ token: token });
        } else {
            return res.status(401).json(info);
        }
    })(req, res);
};