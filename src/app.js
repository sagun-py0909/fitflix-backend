// src/app.js
const express = require('express');
const userRoutes = require('./routes/user.routes');
const membershipRoutes = require('./routes/membership.routes');
const gymRoutes = require('./routes/gym.routes');
const userMembershipRoutes = require('./routes/userMembership.routes');

const app = express();

app.use(express.json());
app.use('/api/users', userRoutes);
app.use('/api/memberships', membershipRoutes);
app.use('/api/gyms', gymRoutes);
app.use('/api/user_memberships', userMembershipRoutes);



app.get('/', (req, res) => {
  res.send('Fitflix API is running!');
});

module.exports = app;
