const jwt = require('jsonwebtoken');

/**
 * Generates a signed JWT containing only the userId.
 * Never include sensitive data (email, role, password) in the payload
 * since JWT is base64-encoded and publicly readable.
 */
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

module.exports = generateToken;
