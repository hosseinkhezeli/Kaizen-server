const jwt = require('jsonwebtoken');

const JWT_SECRET = 'your_jwt_secret'; // Use an environment variable in production

const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1]; // Get token from Authorization header

  if (!token) {
    return res.sendStatus(401); // Unauthorized if no token is provided
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.sendStatus(403); // Forbidden if token is invalid
    }
    req.user = user; // Attach user info to the request object
    next(); // Proceed to the next middleware or route handler
  });
};

module.exports = authenticateToken;
