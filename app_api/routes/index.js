var express = require('express');
var router = express.Router();

var { expressjwt: jwt } = require('express-jwt');

var auth = jwt({
    secret: process.env.JWT_SECRET,
    userProperty: 'payload',
    algorithms: ['HS256']
});

var ctrlTrips = require('../controllers/trips');
var ctrlAuth = require('../controllers/authentication');

// Public routes
router.get('/trips', ctrlTrips.tripsList);
router.get('/trips/:tripCode', ctrlTrips.tripsFindCode);

// Protected routes
router.post('/trips', auth, ctrlTrips.tripsAddTrip);
router.put('/trips/:tripCode', auth, ctrlTrips.tripsUpdateTrip);
router.delete('/trips/:tripCode', auth, ctrlTrips.tripsDeleteTrip);

// Auth routes
router.post('/register', ctrlAuth.register);
router.post('/login', ctrlAuth.login);

module.exports = router;