const User = require("../models/User");
const verifyToken = require("../utils/verifyToken");

const AUTH_ERROR = { message: "Not authorized" };

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json(AUTH_ERROR);
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);

    if (!decoded) {
      return res.status(401).json(AUTH_ERROR);
    }

    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json(AUTH_ERROR);
    }

    req.user = user;
    next();
  } catch {
    return res.status(401).json(AUTH_ERROR);
  }
};

module.exports = authenticate;
