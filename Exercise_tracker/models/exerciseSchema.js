const mongoose = require('mongoose');

const exerciseSchema = new mongoose.Schema({
    userId: String,
    username: String,
    description: String,
    duration: Number,
    date: Number
});


const Exercise = mongoose.model('Exercise', exerciseSchema);
module.exports = Exercise;