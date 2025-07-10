// src/features/auth/auth.repository.js
// This file handles all direct database interactions related to user authentication.
// It uses Prisma Client to perform CRUD operations on the 'users' table.

// Assuming src/config/db.js exports the PrismaClient instance
const prisma = require('../../config/db');

/**
 * Finds a user by their email address.
 * @param {string} email - The email address of the user.
 * @returns {Promise<object|null>} The user object including their profile, or null if not found.
 */
async function findUserByEmail(email) {
  try {
    // Use Prisma to find a unique user by email, including their profile
    const user = await prisma.users.findUnique({
      where: { email },
      include: { user_profiles: true } // Include related user_profiles if needed by the service layer
    });
    return user;
  } catch (error) {
    // Log the error and re-throw a more generic error for the service layer to handle
    console.error('AuthRepository: Error finding user by email:', error);
    throw new Error('Database error during user lookup.');
  }
}

/**
 * Creates a new user in the database.
 * @param {object} userData - Object containing user data (email, password_hash, username, first_name, last_name, phone).
 * @returns {Promise<object>} The newly created user object.
 */
async function createUser(userData) {
  try {
    // Use Prisma to create a new user
    const newUser = await prisma.users.create({
      data: userData
    });
    return newUser;
  } catch (error) {
    // Log the error and re-throw a more generic error for the service layer to handle
    console.error('AuthRepository: Error creating user:', error);
    // Specifically check for unique constraint violation for email or username
    if (error.code === 'P2002') {
      if (error.meta?.target?.includes('email')) {
        throw new Error('User with this email already exists.');
      }
      if (error.meta?.target?.includes('username')) {
        throw new Error('Username already taken.');
      }
    }
    throw new Error('Database error during user creation.');
  }
}

module.exports = {
  findUserByEmail,
  createUser
};
