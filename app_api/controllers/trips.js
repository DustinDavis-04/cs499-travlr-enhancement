const Trip = require('../models/travlr');

// GET /api/trips
const tripsList = async (req, res) => {
    try {
        const trips = await Trip.find({});
        return res.status(200).json(trips);
    } catch (err) {
        return res.status(500).json(err);
    }
};

// GET /api/trips/:tripCode
const tripsFindCode = async (req, res) => {
    try {
        const trip = await Trip.find({ code: req.params.tripCode });

        if (!trip || trip.length === 0) {
            return res.status(404).json({ message: 'Trip not found' });
        }

        return res.status(200).json(trip);
    } catch (err) {
        return res.status(500).json(err);
    }
};

// POST /api/trips
const tripsAddTrip = async (req, res) => {
    try {
        const newTrip = await Trip.create({
            code: req.body.code,
            name: req.body.name,
            length: req.body.length,
            start: req.body.start,
            resort: req.body.resort,
            perPerson: req.body.perPerson,
            image: req.body.image,
            description: req.body.description
        });

        return res.status(201).json(newTrip);
    } catch (err) {
        return res.status(400).json(err);
    }
};

// PUT /api/trips/:tripCode
const tripsUpdateTrip = async (req, res) => {
    try {
        const updatedTrip = await Trip.findOneAndUpdate(
            { code: req.params.tripCode },
            {
                code: req.body.code,
                name: req.body.name,
                length: req.body.length,
                start: req.body.start,
                resort: req.body.resort,
                perPerson: req.body.perPerson,
                image: req.body.image,
                description: req.body.description
            },
            { returnDocument: 'after' }
        );

        if (!updatedTrip) {
            return res.status(404).json({ message: 'Trip not found' });
        }

        return res.status(201).json(updatedTrip);
    } catch (err) {
        return res.status(400).json(err);
    }
};

// DELETE /api/trips/:tripCode
const tripsDeleteTrip = async (req, res) => {
    try {
        const deletedTrip = await Trip.findOneAndDelete({
            code: req.params.tripCode
        });

        if (!deletedTrip) {
            return res.status(404).json({ message: 'Trip not found' });
        }

        return res.status(200).json({ message: 'Trip deleted successfully' });
    } catch (err) {
        return res.status(500).json(err);
    }
};

module.exports = {
    tripsList,
    tripsFindCode,
    tripsAddTrip,
    tripsUpdateTrip,
    tripsDeleteTrip
};