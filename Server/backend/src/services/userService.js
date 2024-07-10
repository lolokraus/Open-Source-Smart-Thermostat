const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

const authenticateUser = async (username, password) => {
  const user = await User.findByUsername(username);
  if (user && bcrypt.compareSync(password, user.password)) {
    return jwt.sign({ username: user.username }, process.env.JWT_SECRET, { expiresIn: '1h' });
  }
  throw new Error('Invalid credentials');
};

module.exports = { authenticateUser };