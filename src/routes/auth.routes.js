const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  try {
    const user = await prisma.users.findUnique({
      where: {
        email: email,
      },
      include: {
        staff: true, // Include staff details if the user is a staff member
      },
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    // Check if the user is a staff member and has a gym_id
    let gymId = null;
    if (user.staff && user.staff.length > 0) {
      // Assuming a user can be associated with only one staff entry for simplicity
      gymId = user.staff[0].gym_id;
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.user_id,
        email: user.email,
        role: user.role,
        gymId: gymId, // Include gymId in the token payload
      },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '1h' }
    );

    res.status(200).json({ message: 'Login successful', token, user: { id: user.user_id, email: user.email, role: user.role, gymId: gymId } });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

module.exports = router;