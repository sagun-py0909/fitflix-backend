// tests/unit/services/authService.test.js
// Unit tests for src/features/auth/auth.service.js

// Mock external dependencies:
// 1. auth.repository
jest.mock('../../../src/features/auth/auth.repository', () => ({
  findUserByEmail: jest.fn(),
  createUser: jest.fn(),
}));

// 2. common/helpers (for bcrypt and parseDuration)
jest.mock('../../../src/common/helpers', () => ({
  hashPassword: jest.fn(),
  comparePassword: jest.fn(),
  parseDuration: jest.fn(() => 3600000), // Mock to return 1 hour in ms by default
}));

// 3. jsonwebtoken
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(() => 'mocked_jwt_token'), // Always return a consistent token
}));

// Import the service and its mocked dependencies
const authService = require('../../../src/features/auth/auth.service');
const authRepository = require('../../../src/features/auth/auth.repository');
const helpers = require('../../../src/common/helpers');
const jwt = require('jsonwebtoken');

describe('Auth Service', () => {
  // Clear all mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset any specific mock implementations if needed for certain tests
    helpers.parseDuration.mockReturnValue(3600000); // Ensure consistent default
  });

  // --- Test cases for loginUser ---
  describe('loginUser', () => {
    const mockUser = {
      user_id: 'user123',
      email: 'test@example.com',
      password_hash: 'hashedpassword',
      username: 'testuser', // Added username
      role: 'user',
      user_profiles: {}
    };

    test('should successfully log in a user and return token/user', async () => {
      authRepository.findUserByEmail.mockResolvedValue(mockUser);
      helpers.comparePassword.mockResolvedValue(true); // Passwords match

      const result = await authService.loginUser('test@example.com', 'plainpassword');

      expect(authRepository.findUserByEmail).toHaveBeenCalledWith('test@example.com');
      expect(helpers.comparePassword).toHaveBeenCalledWith('plainpassword', 'hashedpassword');
      expect(jwt.sign).toHaveBeenCalledWith(
        { userId: 'user123', role: 'user' },
        expect.any(String), // JWT_SECRET from .env
        { expiresIn: expect.any(String) } // JWT_EXPIRES_IN from .env
      );
      expect(helpers.parseDuration).toHaveBeenCalled();
      expect(result).toEqual({
        user: { user_id: 'user123', email: 'test@example.com', username: 'testuser', role: 'user', user_profiles: {} },
        token: 'mocked_jwt_token',
        expiresInMs: 3600000
      });
    });

    test('should throw error if email or password are missing', async () => {
      await expect(authService.loginUser('test@example.com', '')).rejects.toThrow('Email and password are required.');
      await expect(authService.loginUser('', 'password')).rejects.toThrow('Email and password are required.');
      expect(authRepository.findUserByEmail).not.toHaveBeenCalled(); // Should not call repository
    });

    test('should throw error for invalid credentials (user not found)', async () => {
      authRepository.findUserByEmail.mockResolvedValue(null); // User not found

      await expect(authService.loginUser('nonexistent@example.com', 'password')).rejects.toThrow('Invalid credentials.');
      expect(authRepository.findUserByEmail).toHaveBeenCalledWith('nonexistent@example.com');
      expect(helpers.comparePassword).not.toHaveBeenCalled(); // Should not compare password
    });

    test('should throw error for invalid credentials (password mismatch)', async () => {
      authRepository.findUserByEmail.mockResolvedValue(mockUser);
      helpers.comparePassword.mockResolvedValue(false); // Passwords do not match

      await expect(authService.loginUser('test@example.com', 'wrongpassword')).rejects.toThrow('Invalid credentials.');
      expect(authRepository.findUserByEmail).toHaveBeenCalledWith('test@example.com');
      expect(helpers.comparePassword).toHaveBeenCalledWith('wrongpassword', 'hashedpassword');
    });

    test('should throw generic internal server error for unexpected repository error', async () => {
      authRepository.findUserByEmail.mockRejectedValue(new Error('DB connection failed'));

      await expect(authService.loginUser('test@example.com', 'password')).rejects.toThrow('Internal server error during login.');
      expect(authRepository.findUserByEmail).toHaveBeenCalledWith('test@example.com');
    });
  });

  // --- Test cases for registerUser ---
  describe('registerUser', () => {
    const newUserData = {
      email: 'new@example.com',
      password: 'plainpassword',
      username: 'newuserhandle', // Added username
      first_name: 'New',
      last_name: 'User',
    };
    const mockHashedPassword = 'hashednewpassword';
    const mockCreatedUser = {
      user_id: 'newuser456',
      email: 'new@example.com',
      password_hash: mockHashedPassword,
      username: 'newuserhandle', // Added username
      first_name: 'New',
      last_name: 'User',
      role: 'user'
    };

    test('should successfully register a new user', async () => {
      authRepository.createUser.mockResolvedValue(mockCreatedUser); // findUserByEmail check is removed from service, handled by repo unique constraint
      helpers.hashPassword.mockResolvedValue(mockHashedPassword);

      const result = await authService.registerUser(newUserData);

      expect(helpers.hashPassword).toHaveBeenCalledWith('plainpassword');
      expect(authRepository.createUser).toHaveBeenCalledWith({
        email: 'new@example.com',
        password_hash: mockHashedPassword,
        username: 'newuserhandle', // Assert username is passed
        first_name: 'New',
        last_name: 'User',
        role: 'user'
      });
      expect(jwt.sign).toHaveBeenCalledWith(
        { userId: 'newuser456', role: 'user' },
        expect.any(String),
        { expiresIn: expect.any(String) }
      );
      expect(helpers.parseDuration).toHaveBeenCalled();
      expect(result).toEqual({
        user: {
          user_id: 'newuser456',
          email: 'new@example.com',
          username: 'newuserhandle', // Assert username is returned
          first_name: 'New',
          last_name: 'User',
          role: 'user'
        },
        token: 'mocked_jwt_token',
        expiresInMs: 3600000
      });
    });

    test('should throw error if required fields are missing', async () => {
      await expect(authService.registerUser({ email: 'a@b.com', password: 'p', first_name: 'F', last_name: 'L' })).rejects.toThrow('Required fields (email, password, username, first_name, last_name) are missing.');
      expect(authRepository.createUser).not.toHaveBeenCalled();
    });

    test('should throw error if user with email already exists (from repository)', async () => {
      const prismaError = new Error('Unique constraint failed on the fields: (`email`)');
      prismaError.code = 'P2002';
      prismaError.meta = { target: ['email'] };
      authRepository.createUser.mockRejectedValue(prismaError); // Mock repository to throw unique email error
      helpers.hashPassword.mockResolvedValue(mockHashedPassword); // Hash still happens

      await expect(authService.registerUser(newUserData)).rejects.toThrow('User with this email already exists.');
      expect(authRepository.createUser).toHaveBeenCalled();
    });

    test('should throw error if username already taken (from repository)', async () => {
      const prismaError = new Error('Unique constraint failed on the fields: (`username`)');
      prismaError.code = 'P2002';
      prismaError.meta = { target: ['username'] };
      authRepository.createUser.mockRejectedValue(prismaError); // Mock repository to throw unique username error
      helpers.hashPassword.mockResolvedValue(mockHashedPassword);

      await expect(authService.registerUser(newUserData)).rejects.toThrow('Username already taken.');
      expect(authRepository.createUser).toHaveBeenCalled();
    });

    test('should throw generic internal server error for unexpected repository error', async () => {
      authRepository.createUser.mockRejectedValue(new Error('DB write failed'));
      helpers.hashPassword.mockResolvedValue(mockHashedPassword);

      await expect(authService.registerUser(newUserData)).rejects.toThrow('Internal server error during registration.');
      expect(authRepository.createUser).toHaveBeenCalled();
    });
  });

  // --- Test cases for logoutUser ---
  describe('logoutUser', () => {
    test('should return a successful logout message', async () => {
      const result = await authService.logoutUser();
      expect(result).toEqual({ message: 'Logout successful.' });
      // For JWT, logout is primarily client-side, so no repository/DB calls are expected here.
      expect(authRepository.findUserByEmail).not.toHaveBeenCalled();
      expect(authRepository.createUser).not.toHaveBeenCalled();
    });
  });
});
