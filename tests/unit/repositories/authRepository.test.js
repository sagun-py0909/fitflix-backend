// tests/unit/repositories/authRepository.test.js
// Unit tests for src/features/auth/auth.repository.js

// Mock the PrismaClient module.
// This ensures that when authRepository.js requires '../../config/db',
// it gets our mocked Prisma client instead of a real one.
jest.mock('../../../src/config/db', () => ({
  // Mock the 'users' model and its methods that authRepository uses
  users: {
    findUnique: jest.fn(), // Mock findUnique method
    create: jest.fn(),     // Mock create method
  },
}));

// Import the repository after mocking its dependencies
const authRepository = require('../../../src/features/auth/auth.repository');
const prisma = require('../../../src/config/db'); // Get the mocked prisma instance

describe('Auth Repository', () => {
  // Clear all mocks before each test to ensure test isolation
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // --- Test cases for findUserByEmail ---
  describe('findUserByEmail', () => {
    test('should return a user if found', async () => {
      const mockUser = {
        user_id: 'user123',
        email: 'test@example.com',
        password_hash: 'hashedpassword',
        role: 'user',
        user_profiles: { id: 'profile1' }
      };
      // Configure the mock to return the mockUser when findUnique is called
      prisma.users.findUnique.mockResolvedValue(mockUser);

      const user = await authRepository.findUserByEmail('test@example.com');

      // Assertions
      expect(prisma.users.findUnique).toHaveBeenCalledTimes(1);
      expect(prisma.users.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
        include: { user_profiles: true }
      });
      expect(user).toEqual(mockUser);
    });

    test('should return null if user is not found', async () => {
      // Configure the mock to return null when findUnique is called
      prisma.users.findUnique.mockResolvedValue(null);

      const user = await authRepository.findUserByEmail('nonexistent@example.com');

      // Assertions
      expect(prisma.users.findUnique).toHaveBeenCalledTimes(1);
      expect(user).toBeNull();
    });

    test('should throw an error if Prisma operation fails', async () => {
      const mockError = new Error('Database connection failed');
      // Configure the mock to throw an error when findUnique is called
      prisma.users.findUnique.mockRejectedValue(mockError);

      // Expect the function to throw an error
      await expect(authRepository.findUserByEmail('test@example.com')).rejects.toThrow('Database error during user lookup.');

      // Assertions
      expect(prisma.users.findUnique).toHaveBeenCalledTimes(1);
    });
  });

  // --- Test cases for createUser ---
  describe('createUser', () => {
    test('should create and return a new user', async () => {
      const userData = {
        email: 'newuser@example.com',
        password_hash: 'newhashedpassword',
        first_name: 'New',
        last_name: 'User',
        phone: null,
        role: 'user'
      };
      const mockCreatedUser = { user_id: 'newid', ...userData };
      // Configure the mock to return the mockCreatedUser when create is called
      prisma.users.create.mockResolvedValue(mockCreatedUser);

      const user = await authRepository.createUser(userData);

      // Assertions
      expect(prisma.users.create).toHaveBeenCalledTimes(1);
      expect(prisma.users.create).toHaveBeenCalledWith({ data: userData });
      expect(user).toEqual(mockCreatedUser);
    });

    test('should throw an error for duplicate email (P2002)', async () => {
      const userData = {
        email: 'existing@example.com',
        password_hash: 'hashedpassword',
        first_name: 'Existing',
        last_name: 'User',
        role: 'user'
      };
      const prismaError = new Error('Unique constraint failed on the fields: (`email`)');
      prismaError.code = 'P2002';
      prismaError.meta = { target: ['email'] };

      // Configure the mock to throw a Prisma unique constraint error
      prisma.users.create.mockRejectedValue(prismaError);

      // Expect the function to throw a specific error message
      await expect(authRepository.createUser(userData)).rejects.toThrow('User with this email already exists.');

      // Assertions
      expect(prisma.users.create).toHaveBeenCalledTimes(1);
    });

    test('should throw a generic error if Prisma create fails for other reasons', async () => {
      const userData = { email: 'fail@example.com', password_hash: 'failpass', first_name: 'F', last_name: 'L' };
      const mockError = new Error('Some other database error');
      // Configure the mock to throw a generic error
      prisma.users.create.mockRejectedValue(mockError);

      // Expect the function to throw a generic database error message
      await expect(authRepository.createUser(userData)).rejects.toThrow('Database error during user creation.');

      // Assertions
      expect(prisma.users.create).toHaveBeenCalledTimes(1);
    });
  });
});
