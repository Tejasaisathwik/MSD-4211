const mongoose = require('mongoose');

const scoreSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    username: {
        type: String,
        required: true
    },
    score: {
        type: Number,
        required: true
    },
    total: {
        type: Number,
        required: true
    },
    correct: {
        type: Number,
        required: true
    },
    wrong: {
        type: Number,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    timeTaken: {
        type: Number
    },
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Score', scoreSchema);