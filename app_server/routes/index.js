var express = require('express');
var router = express.Router();

const ctrlTravel = require('../controllers/traveler');

/* GET home page. */
router.get('/', ctrlTravel.home);

/* GET travel page. */
router.get('/travel', ctrlTravel.travel);

module.exports = router;
