const userService = require('../services/userService');
const jwt = require('jsonwebtoken');

const tokenBlacklist = new Map();

exports.login = async (req, res) => {
  try {
    const token = await userService.authenticateUser(req.body.username, req.body.password);
    res.json({ token });
  } catch (error) {
    res.status(401).json({ message: 'Authentication failed' });
  }
};

exports.logout = async (req, res) => {
    const token = req.headers.authorization.split(' ')[1];
    const decoded = jwt.decode(token);
    if (decoded && decoded.exp) {
        tokenBlacklist.set(token, decoded.exp * 1000);
    }
    res.status(200).send({ message: 'Logged out successfully' });
};

setInterval(() => {
    const now = Date.now();
    tokenBlacklist.forEach((exp, token) => {
        if (exp < now) {
            tokenBlacklist.delete(token);
        }
    });
}, 60 * 60 * 1000);

exports.tokenBlacklist = tokenBlacklist;