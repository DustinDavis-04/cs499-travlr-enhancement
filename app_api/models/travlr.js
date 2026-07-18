var mongoose = require('mongoose');

var tripSchema = new mongoose.Schema({
    code: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true },
    length: { type: String, required: true },
    start: { type: String, required: true },
    resort: { type: String, required: true },
    perPerson: { type: String, required: true },
    image: { type: String, required: true },
    description: { type: String, required: true }
});

const Trip = mongoose.model('trips', tripSchema);
module.exports = Trip;