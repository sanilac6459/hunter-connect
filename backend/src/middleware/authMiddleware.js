// checks if user is authenticated before making request

const jwt = require("jsonwebtoken");

// checks if user has a valid JWT token
const authenticateToken = (req, res, next) => {
  // get token from the authorization header
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Access denied. No token provided." });
  }

  try {
    // verify token and attach user info to request
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: "Invalid token." });
  }
};

module.exports = authenticateToken;
