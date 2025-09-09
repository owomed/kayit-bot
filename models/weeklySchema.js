const mongoose = require('mongoose');

const weeklySchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        unique: true
    },
    count: {
        type: Number,
        default: 0
    }
});

module.exports = mongoose.model('WeeklyCount', weeklySchema);
