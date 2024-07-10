const jwt = require('jsonwebtoken');

const handleHeartbeat = (req, res) => {
    const token = req.headers.authorization.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const currentTime = Math.floor(Date.now() / 1000);
    if (decoded.exp - currentTime < 600) { 
        const newToken = jwt.sign({ username: decoded.username }, process.env.JWT_SECRET, { expiresIn: '1h' });
        
        res.json({
            message: 'Heartbeat received. Token renewed.',
            token: newToken
        });
    } else {
        res.json({ message: 'Heartbeat received. Token still valid.' });
    }
};

module.exports = { handleHeartbeat };