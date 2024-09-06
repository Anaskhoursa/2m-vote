const jwt = require('jsonwebtoken');

const generateAccessToken = (user) => {
  const userWithoutPassword = {
    id: user._id,
    name: user.name,
    BadgeNumber: user.BadgeNumber,
    isAdmin: user.isAdmin
  };
  
  return jwt.sign(userWithoutPassword, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '24h' });
};

module.exports = generateAccessToken;
