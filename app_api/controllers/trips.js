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
    const tripCode = req.params.tripCode?.trim();

    // Reject requests that do not include a usable trip code.
    if (!tripCode) {
        return res.status(400).json({
            message: 'A trip code is required'
        });
    }

    try {
        const trip = await Trip.findOne({ code: tripCode });

        if (!trip) {
            return res.status(404).json({
                message: `No trip was found with code ${tripCode}`
            });
        }

        return res.status(200).json(trip);
    } catch (err) {
        console.error('Unable to retrieve trip:', err);

        return res.status(500).json({
            message: 'An unexpected error occurred while retrieving the trip'
        });
    }
};

// POST /api/trips
const tripsAddTrip = async (req, res) => {
    const requiredFields = [
        'code',
        'name',
        'length',
        'start',
        'resort',
        'perPerson',
        'image',
        'description'
    ];

    // Identify required fields that are missing or contain only whitespace.
    const missingFields = requiredFields.filter((field) => {
        const value = req.body[field];

        return value === undefined ||
            value === null ||
            String(value).trim() === '';
    });

    if (missingFields.length > 0) {
        return res.status(400).json({
            message: 'All trip fields are required',
            missingFields
        });
    }

    const tripData = {
        code: req.body.code.trim(),
        name: req.body.name.trim(),
        length: req.body.length.trim(),
        start: req.body.start.trim(),
        resort: req.body.resort.trim(),
        perPerson: req.body.perPerson.trim(),
        image: req.body.image.trim(),
        description: req.body.description.trim()
    };

    try {
        // Trip codes must remain unique because they identify API resources.
        const existingTrip = await Trip.findOne({ code: tripData.code });

        if (existingTrip) {
            return res.status(409).json({
                message: `A trip with code ${tripData.code} already exists`
            });
        }

        const newTrip = await Trip.create(tripData);

        return res.status(201).json(newTrip);
    } catch (err) {
        console.error('Unable to create trip:', err);

        return res.status(500).json({
            message: 'An unexpected error occurred while creating the trip'
        });
    }
};

// PUT /api/trips/:tripCode
const tripsUpdateTrip = async (req, res) => {
    const tripCode = req.params.tripCode?.trim();

    const requiredFields = [
        'code',
        'name',
        'length',
        'start',
        'resort',
        'perPerson',
        'image',
        'description'
    ];

    if (!tripCode) {
        return res.status(400).json({
            message: 'A trip code is required'
        });
    }

    const missingFields = requiredFields.filter((field) => {
        const value = req.body[field];

        return value === undefined ||
            value === null ||
            String(value).trim() === '';
    });

    if (missingFields.length > 0) {
        return res.status(400).json({
            message: 'All trip fields are required',
            missingFields
        });
    }

    const tripData = {
        code: req.body.code.trim(),
        name: req.body.name.trim(),
        length: req.body.length.trim(),
        start: req.body.start.trim(),
        resort: req.body.resort.trim(),
        perPerson: req.body.perPerson.trim(),
        image: req.body.image.trim(),
        description: req.body.description.trim()
    };

    try {
        // Prevent changing the trip code to one that already exists.
        if (tripData.code !== tripCode) {
            const existingTrip = await Trip.findOne({
                code: tripData.code
            });

            if (existingTrip) {
                return res.status(409).json({
                    message: `A trip with code ${tripData.code} already exists`
                });
            }
        }

        const updatedTrip = await Trip.findOneAndUpdate(
            { code: tripCode },
            tripData,
            {
                new: true,
                runValidators: true
            }
        );

        if (!updatedTrip) {
            return res.status(404).json({
                message: `No trip was found with code ${tripCode}`
            });
        }

        return res.status(200).json(updatedTrip);
    } catch (err) {
        console.error(`Unable to update trip ${tripCode}:`, err);

        if (err.code === 11000) {
            return res.status(409).json({
                message: `A trip with code ${tripData.code} already exists`
            });
        }

        return res.status(500).json({
            message: 'An unexpected error occurred while updating the trip'
        });
    }
};

// DELETE /api/trips/:tripCode
const tripsDeleteTrip = async (req, res) => {
    const tripCode = req.params.tripCode?.trim();

    if (!tripCode) {
        return res.status(400).json({
            message: 'A trip code is required'
        });
    }

    try {
        const deletedTrip = await Trip.findOneAndDelete({
            code: tripCode
        });

        if (!deletedTrip) {
            return res.status(404).json({
                message: `No trip was found with code ${tripCode}`
            });
        }

        return res.status(200).json({
            message: `Trip ${tripCode} deleted successfully`
        });
    } catch (err) {
        console.error(`Unable to delete trip ${tripCode}:`, err);

        return res.status(500).json({
            message: 'An unexpected error occurred while deleting the trip'
        });
    }
};

module.exports = {
    tripsList,
    tripsFindCode,
    tripsAddTrip,
    tripsUpdateTrip,
    tripsDeleteTrip
};