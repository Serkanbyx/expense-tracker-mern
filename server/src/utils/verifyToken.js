const jwt = require('jsonwebtoken');

/**
 * Verifies a JWT and returns the decoded payload.
 * Returns null on any error (expired, malformed, invalid signature)
 * to avoid exposing specific JWT error details to the client.
 */
const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return null;
  }
};

module.exports = verifyToken;
