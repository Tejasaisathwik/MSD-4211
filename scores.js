const router = require('express').Router();
const jwt = require('jsonwebtoken');
const Score = require('../models/Score');

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
    const token = req.header('auth-token');
    if (!token) return res.status(401).json({ error: 'Access denied' });

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        req.user = verified;
        next();
    } catch (err) {
        res.status(400).json({ error: 'Invalid token' });
    }
};

// Save a new score
router.post('/', verifyToken, async (req, res) => {
    try {
        const score = new Score({
            userId: req.user.id,
            username: req.user.username,
            ...req.body
        });
        await score.save();
        res.json(score);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Get all scores for the dashboard
router.get('/', async (req, res) => {
    try {
        const scores = await Score.find()
            .sort({ score: -1, date: -1 })
            .limit(100);
        res.json(scores);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Get user's scores
router.get('/user', verifyToken, async (req, res) => {
    try {
        const scores = await Score.find({ userId: req.user.id })
            .sort({ date: -1 });
        res.json(scores);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

module.exports = router;