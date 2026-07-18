var mongoose = require('mongoose');
var fs = require('fs');
var path = require('path');

// Bring in Database connection and model
require('./db');
require('./travlr');

var Trip = mongoose.model('trips');

// Read JSON file
var tripsData = JSON.parse(
    fs.readFileSync(path.join(__dirname, '../../data/trips.json'), 'utf8')
);

// Clear existing data and insert new data
Trip.deleteMany({})
    .then(() => {
        console.log('Old trips removed');
        return Trip.insertMany(tripsData);
    })
    .then(() => {
        console.log('New trips added');
        mongoose.connection.close();
    })
    .catch(err => {
        console.log('Error: ', err);
        mongoose.connection.close();
    });