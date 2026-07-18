const tripsEndpoint = 'http://localhost:3000/api/trips';

const options = {
    method: 'GET',
    headers: {
        'Accept': 'application/json'
    }
};

const travel = async (req, res) => {

    try {
        const response = await fetch(tripsEndpoint, options);
        const trips = await response.json();

        if (!Array.isArray(trips)) {
            console.log('API did not return any array');
            return res.render('travel', {
                title: 'Travel',
                trips: [],
                travelActive: true
            });
        }

        if (trips.length === 0) {
            console.log('No trips found in database');
            return res.render('travel', {
                title: 'Travel',
                trips: [],
                travelActive: true
            });
        }

        res.render('travel', {
            title: 'Travel',
            trips: trips,
            travelActive: true
        });

    } catch (err) {
        console.log(err);
        res.render('travel', {
            title: 'Travel',
            trips: [],
            travelActive: true 
        });
    }
};

const home = (req, res) => {
    res.render('index', { title: 'Travlr Getaways', homeActive: true });
};

module.exports = {
    home,
    travel
};