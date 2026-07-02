const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'sapphire_stays_secret_key_india_2026';

function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required. Please login.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired authentication token.' });
  }
}

function requireRoles(allowedRoles = []) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: `Access Denied. Required role(s): ${allowedRoles.join(', ')}. Your current role is: ${req.user.role}.` 
      });
    }
    next();
  };
}

module.exports = {
  authenticate,
  requireRoles,
  JWT_SECRET
};
