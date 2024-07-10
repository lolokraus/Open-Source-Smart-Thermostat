const jwt = require('jsonwebtoken');
const tokenBlacklist = require('../controllers/userController').tokenBlacklist;

const verifyToken = (req, res, next) => {
    const token = req.headers.authorization.split(' ')[1]; // 'Bearer TOKEN'
    if (tokenBlacklist.has(token)) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        jwt.verify(token, process.env.JWT_SECRET);
        next();
    } catch (error) {
        res.status(401).json({ message: 'Unauthorized' });
    }
};

module.exports = verifyToken;