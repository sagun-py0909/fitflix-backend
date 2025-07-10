// tests/integration/auth.integration.test.js
// Integration tests for the authentication API endpoints.
// These tests interact with the full Express application and the test database.

const request = require('supertest'); // Used for making HTTP requests to the Express app
const app = require('../../src/app'); // Import your Express app
const prisma = require('../../src/config/db'); // Import Prisma client for direct DB assertions/cleanup

// The global setup (tests/setup.js) will handle resetting and migrating the test database
// before all tests in this suite run.

describe('Authentication API Integration Tests', () => {
  // Define common user data for testing
  const testUser = {
    email: 'testuser@example.com',
    password: 'Password123!',
    username: 'testuserhandle',
    first_name: 'Test',
    last_name: 'User',
  };

  const anotherUser = {
    email: 'another@example.com',
    password: 'AnotherPassword123!',
    username: 'anotherhandle',
    first_name: 'Another',
    last_name: 'User',
  };

  // Clean up the database after each test to ensure isolation.
  // We'll delete users created in each test.
  // This is crucial because `prisma migrate reset` runs only once before `all` tests.
  // For larger suites, consider transaction per test or more granular cleanup.
  afterEach(async () => {
    // Delete users created during tests to ensure a clean state for the next test
    await prisma.users.deleteMany({
      where: {
        email: {
          in: [testUser.email, anotherUser.email, 'newlyregistered@example.com']
        }
      }
    });
  });

  // --- Test /api/auth/register endpoint ---
  describe('POST /api/auth/register', () => {
    test('should register a new user successfully', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(testUser)
        .expect(201); // Expect HTTP 201 Created

      // Assert response body
      expect(res.body.message).toBe('User registered successfully.');
      expect(res.body.user).toBeDefined();
      expect(res.body.user.email).toBe(testUser.email);
      expect(res.body.user.username).toBe(testUser.username);
      expect(res.body.user.password_hash).toBeUndefined(); // Password hash should not be returned

      // Assert that a JWT cookie is set
      expect(res.headers['set-cookie']).toBeDefined();
      expect(res.headers['set-cookie'][0]).toMatch(/^token=/); // Check for 'token' cookie

      // Verify user exists in the database
      const userInDb = await prisma.users.findUnique({
        where: { email: testUser.email }
      });
      expect(userInDb).toBeDefined();
      expect(userInDb.email).toBe(testUser.email);
      expect(userInDb.username).toBe(testUser.username);
      expect(userInDb.password_hash).toBeDefined(); // Password hash should be stored
      expect(userInDb.role).toBe('user'); // Default role
    });

    test('should return 400 if required fields are missing', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'missing@example.com', password: 'password' }) // Missing username, first_name, last_name
        .expect(400); // Expect HTTP 400 Bad Request

      expect(res.body.message).toBe('Required fields (email, password, username, first_name, last_name) are missing.');
    });

    test('should return 409 if user with email already exists', async () => {
      // First, register the user
      await request(app).post('/api/auth/register').send(testUser).expect(201);

      // Try to register again with the same email
      const res = await request(app)
        .post('/api/auth/register')
        .send(testUser)
        .expect(409); // Expect HTTP 409 Conflict

      expect(res.body.message).toBe('User with this email already exists.');
    });

    test('should return 409 if username already taken', async () => {
      // Register a user
      await request(app).post('/api/auth/register').send(testUser).expect(201);

      // Try to register another user with a different email but the same username
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'another_email@example.com',
          password: 'Password123!',
          username: testUser.username, // Same username as testUser
          first_name: 'Another',
          last_name: 'One'
        })
        .expect(409); // Expect HTTP 409 Conflict

      expect(res.body.message).toBe('Username already taken.');
    });
  });

  // --- Test /api/auth/login endpoint ---
  describe('POST /api/auth/login', () => {
    // Register a user before all login tests in this block
    beforeAll(async () => {
      await request(app).post('/api/auth/register').send(testUser).expect(201);
    });

    test('should successfully log in an existing user', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: testUser.email, password: testUser.password })
        .expect(200); // Expect HTTP 200 OK

      // Assert response body
      expect(res.body.message).toBe('Login successful.');
      expect(res.body.user).toBeDefined();
      expect(res.body.user.email).toBe(testUser.email);
      expect(res.body.user.username).toBe(testUser.username);
      expect(res.body.user.password_hash).toBeUndefined(); // Password hash should not be returned

      // Assert that a JWT cookie is set
      expect(res.headers['set-cookie']).toBeDefined();
      expect(res.headers['set-cookie'][0]).toMatch(/^token=/);
    });

    test('should return 401 for invalid credentials (wrong password)', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: testUser.email, password: 'wrongpassword' })
        .expect(401); // Expect HTTP 401 Unauthorized

      expect(res.body.message).toBe('Invalid credentials.');
    });

    test('should return 401 for invalid credentials (user not found)', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'nonexistent@example.com', password: 'password' })
        .expect(401); // Expect HTTP 401 Unauthorized

      expect(res.body.message).toBe('Invalid credentials.');
    });

    test('should return 400 if email or password are missing', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: testUser.email }) // Missing password
        .expect(400); // Expect HTTP 400 Bad Request

      expect(res.body.message).toBe('Email and password are required.');
    });
  });

  // --- Test /api/auth/logout endpoint ---
  describe('POST /api/auth/logout', () => {
    test('should successfully log out a user by clearing the cookie', async () => {
      // First, log in a user to get a cookie
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ email: testUser.email, password: testUser.password })
        .expect(200);

      // Extract the cookie from the login response
      const cookie = loginRes.headers['set-cookie'];

      // Now, send a logout request with the cookie
      const logoutRes = await request(app)
        .post('/api/auth/logout')
        .set('Cookie', cookie) // Send the cookie with the request
        .expect(200); // Expect HTTP 200 OK

      expect(logoutRes.body.message).toBe('Logout successful.');

      // Assert that the 'token' cookie is cleared (maxAge=0 or expires in the past)
      expect(logoutRes.headers['set-cookie']).toBeDefined();
      const clearedCookie = logoutRes.headers['set-cookie'][0];
      expect(clearedCookie).toMatch(/token=;/); // Check for empty token
      expect(clearedCookie).toMatch(/Max-Age=0/); // Check for Max-Age=0
    });
  });
});
