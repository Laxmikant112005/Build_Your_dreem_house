/**
 * BuildMyHome - User API Tests
 * Using Jest and Supertest
 */

const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const User = require('../src/modules/user/user.model');

const BASE_URL = '/api/v1';

let accessToken = '';
let testUserId = '';

// Test user data
const testUser = {
  email: `user${Date.now()}@example.com`,
  password: 'Password123',
  firstName: 'John',
  lastName: 'Doe'
};

describe('USER API TESTS', () => {
  
  // Setup: Create user and get token
  beforeAll(async () => {
    // Register a new user
    const registerResponse = await request(app)
      .post(`${BASE_URL}/auth/register`)
      .send(testUser);
    
    if (registerResponse.body.data) {
      accessToken = registerResponse.body.data.accessToken;
      testUserId = registerResponse.body.data.user.id;
    }
  });

  describe(`GET ${BASE_URL}/users/profile/me`, () => {
    it('should get user profile successfully', async () => {
      const response = await request(app)
        .get(`${BASE_URL}/users/profile/me`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect('Content-Type', /json/);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('email');
      expect(response.body.data).toHaveProperty('firstName');
      expect(response.body.data.email).toBe(testUser.email);
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .get(`${BASE_URL}/users/profile/me`)
        .expect('Content-Type', /json/);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should fail with invalid token', async () => {
      const response = await request(app)
        .get(`${BASE_URL}/users/profile/me`)
        .set('Authorization', 'Bearer invalid-token')
        .expect('Content-Type', /json/);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe(`PUT ${BASE_URL}/users/profile/me`, () => {
    it('should update user profile successfully', async () => {
      const response = await request(app)
        .put(`${BASE_URL}/users/profile/me`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          firstName: 'UpdatedName',
          phone: '+1234567890'
        })
        .expect('Content-Type', /json/);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.firstName).toBe('UpdatedName');
    });

    it('should fail with invalid phone format', async () => {
      const response = await request(app)
        .put(`${BASE_URL}/users/profile/me`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ phone: 'invalid' })
        .expect('Content-Type', /json/);

      expect(response.status).toBe(422);
      expect(response.body.success).toBe(false);
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .put(`${BASE_URL}/users/profile/me`)
        .send({ firstName: 'Test' })
        .expect('Content-Type', /json/);

      expect(response.status).toBe(401);
    });
  });

  describe(`GET ${BASE_URL}/users`, () => {
    it('should get all users (admin only)', async () => {
      const response = await request(app)
        .get(`${BASE_URL}/users`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect('Content-Type', /json/);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .get(`${BASE_URL}/users`)
        .expect('Content-Type', /json/);

      expect(response.status).toBe(401);
    });
  });
});

