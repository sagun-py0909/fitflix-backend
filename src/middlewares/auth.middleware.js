const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  // look in Authorization header:
  const authHeader = req.header('Authorization') || req.header('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user || decoded;  // depending on how you sign
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token is not valid' });
  }
};

const authorizeFrontdesk = (req, res, next) => {
  console.log('Frontdesk authorization middleware triggered');

  const token = req.headers.authorization && req.headers.authorization.split(' ')[1];

  if (!token) {
    return res.status(401).send('Unauthorized: No token provided.');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
    req.user = decoded; // Attach decoded user information to the request

    const user = req.user;

    if (!user) {
      return res.status(401).send('Unauthorized: No user information found.');
    }

    // Check if the user has the 'frontdesk' role
    if (user.role !== 'frontdesk') {
      return res.status(403).send('Access Denied: Only frontdesk managers can access this resource.');
    }

    // For gym-specific resources, check if the frontdesk manager is assigned to that gym.
    // This assumes that gym_id is part of the route parameters or request body for gym-related operations.
    const requestedGymId = req.params.gymId || req.body.gymId;

    if (requestedGymId && user.gymId && user.gymId !== requestedGymId) {
      return res.status(403).send('Access Denied: Not authorized for this gym.');
    }

    next();
  } catch (error) {
    console.error('Authorization error:', error);
    return res.status(401).send('Unauthorized: Invalid token.');
  }
};

module.exports = { auth, authorizeFrontdesk };