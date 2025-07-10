// src/features/auth/auth.controller.js
// This file handles the HTTP request/response logic for authentication.
// It delegates business logic to the auth.service.js.

const authService = require('./auth.service'); // Import the service layer

/**
 * Controller for user login.
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 */
async function login(req, res) {
  const { email, password } = req.body;

  try {
    // Delegate to the service layer for business logic
    const { user, token, expiresInMs } = await authService.loginUser(email, password);

    // Set HTTP-only cookie with the token
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
      sameSite: 'strict', // Protect against CSRF
      maxAge: expiresInMs // Cookie expiry matches JWT expiry
    });

    // Respond with sanitized user data
    return res.status(200).json({
      message: 'Login successful.',
      user: user // User object is already sanitized by the service
    });
  } catch (error) {
    // Handle errors thrown by the service layer
    if (error.message === 'Email and password are required.') {
      return res.status(400).json({ message: error.message });
    }
    if (error.message === 'Invalid credentials.') {
      return res.status(401).json({ message: error.message });
    }
    console.error('AuthController: Login error:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
}

/**
 * Controller for user registration.
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 */
async function register(req, res) {
  // Extract username along with other fields from request body
  const { email, password, username, first_name, last_name} = req.body;

  try {
    // Delegate to the service layer for business logic
    const { user, token, expiresInMs } = await authService.registerUser({
      email,
      password,
      username, // Pass username to the service
      first_name,
      last_name,
      
    });

    // Set HTTP-only cookie with the token
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: expiresInMs
    });

    // Respond with sanitized new user data
    return res.status(201).json({
      message: 'User registered successfully.',
      user: user // User object is already sanitized by the service
    });
  } catch (error) {
    // Handle errors thrown by the service layer
    if (error.message === 'Required fields (email, password, username, first_name, last_name) are missing.') {
      return res.status(400).json({ message: error.message });
    }
    if (error.message.includes('User with this email already exists.') ||
        error.message.includes('Username already taken.')) {
      return res.status(409).json({ message: error.message });
    }
    console.error('AuthController: Register error:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
}

/**
 * Controller for user logout.
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 */
async function logout(req, res) {
  try {
    // Delegate to the service layer (though for JWT, it's mostly client-side)
    await authService.logoutUser();

    // Clear the HTTP-only cookie
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });

    return res.status(200).json({ message: 'Logout successful.' });
  } catch (error) {
    console.error('AuthController: Logout error:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
}

module.exports = {
  login,
  register,
  logout
};
