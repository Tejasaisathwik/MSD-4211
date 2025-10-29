const router = require('express').Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Score = require('../models/Score');

// Admin middleware - checks if user is an admin
const isAdmin = async (req, res, next) => {
    const token = req.header('auth-token');
    if (!token) return res.status(401).json({ error: 'Access denied' });

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        const user = await User.findById(verified.id);
        if (!user || !user.isAdmin) {
            return res.status(403).json({ error: 'Access denied - Admin only' });
        }
        req.user = verified;
        next();
    } catch (err) {
        res.status(400).json({ error: 'Invalid token' });
    }
};

// Get all users with their stats
router.get('/users', isAdmin, async (req, res) => {
    try {
        const users = await User.find().select('-password');
        
        // Get scores for all users
        const userStats = await Promise.all(users.map(async (user) => {
            const scores = await Score.find({ userId: user._id });
            const stats = {
                totalGames: scores.length,
                averageScore: scores.length ? scores.reduce((acc, score) => acc + score.score, 0) / scores.length : 0,
                highestScore: scores.length ? Math.max(...scores.map(s => s.score)) : 0,
                lastPlayed: scores.length ? scores[scores.length - 1].date : null,
                categories: [...new Set(scores.map(s => s.category))]
            };
            
            return {
                ...user.toObject(),
                stats
            };
        }));

        res.json(userStats);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get detailed stats for a specific user
router.get('/users/:userId', isAdmin, async (req, res) => {
    try {
        const user = await User.findById(req.params.userId).select('-password');
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const scores = await Score.find({ userId: user._id }).sort({ date: -1 });
        
        const userDetails = {
            ...user.toObject(),
            scores,
            stats: {
                totalGames: scores.length,
                averageScore: scores.length ? scores.reduce((acc, score) => acc + score.score, 0) / scores.length : 0,
                highestScore: scores.length ? Math.max(...scores.map(s => s.score)) : 0,
                categoriesPlayed: [...new Set(scores.map(s => s.category))],
                scoresByCategory: scores.reduce((acc, score) => {
                    if (!acc[score.category]) {
                        acc[score.category] = {
                            total: 0,
                            count: 0,
                            highest: 0
                        };
                    }
                    acc[score.category].total += score.score;
                    acc[score.category].count += 1;
                    acc[score.category].highest = Math.max(acc[score.category].highest, score.score);
                    return acc;
                }, {})
            }
        };

        res.json(userDetails);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;