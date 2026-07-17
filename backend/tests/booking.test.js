/**
 * BuildMyHome - Booking API Tests
 * Using Jest and Supertest
 */

const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const User = require('../src/modules/user/user.model');

const BASE_URL = '/api/v1';

let userToken = '';
let engineerToken = '';
let testUserId = '';
let testEngineerId = '';

// Test data
const testUser = {
  email: `bookinguser${Date.now()}@example.com`,
  password: 'Password123',
  firstName: 'Booking',
  lastName: 'User'
};

const testEngineer = {
  email: `bookingengineer${Date.now()}@example.com`,
  password: 'Password123',
  firstName: 'Jane',
  lastName: 'Engineer',
  role: 'engineer'
};

describe('BOOKING API TESTS', () => {
  
  // Setup: Create users and get tokens
  beforeAll(async () => {
    // Register regular user
    const userResponse = await request(app)
      .post(`${BASE_URL}/auth/register`)
      .send(testUser);
    
    if (userResponse.body.data) {
      userToken = userResponse.body.data.accessToken;
      testUserId = userResponse.body.data.user.id;
    }

    // Register engineer user
    const engineerResponse = await request(app)
      .post(`${BASE_URL}/auth/register`)
      .send(testEngineer);
    
    if (engineerResponse.body.data) {
      engineerToken = engineerResponse.body.data.accessToken;
      testEngineerId = engineerResponse.body.data.user.id;

      // Update engineer profile
      await User.findByIdAndUpdate(testEngineerId, {
        role: 'engineer',
        engineerProfile: {
          isVerified: true,
          verificationStatus: 'approved',
          specializations: ['Modern', 'Villa'],
          experience: 5
        }
      });
    }
  });

  describe(`POST ${BASE_URL}/bookings`, () => {
    it('should create booking as user', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);

      const response = await request(app)
        .post(`${BASE_URL}/bookings`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          engineerId: testEngineerId,
          type: 'consultation',
          scheduledDate: futureDate.toISOString().split('T')[0],
          scheduledTime: '10:00',
          duration: 60,
          meetingType: 'video',
          projectDetails: {
            landSize: 2000,
            budget: 5000000
          }
        })
        .expect('Content-Type', /json/);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
    });

    it('should fail with missing required fields', async () => {
      const response = await request(app)
        .post(`${BASE_URL}/bookings`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({})
        .expect('Content-Type', /json/);

      expect(response.status).toBe(422);
      expect(response.body.success).toBe(false);
    });

    it('should fail without authentication', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);

      const response = await request(app)
        .post(`${BASE_URL}/bookings`)
        .send({
          engineerId: testEngineerId,
          type: 'consultation',
          scheduledDate: futureDate.toISOString().split('T')[0]
        })
        .expect('Content-Type', /json/);

      expect(response.status).toBe(401);
    });

    it('should fail with invalid engineer ID', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);

      const response = await request(app)
        .post(`${BASE_URL}/bookings`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          engineerId: 'invalid-id',
          type: 'consultation',
          scheduledDate: futureDate.toISOString().split('T')[0]
        })
        .expect('Content-Type', /json/);

      expect(response.status).toBe(400);
    });
  });

  describe(`GET ${BASE_URL}/bookings/my-bookings`, () => {
    it('should get user bookings', async () => {
      const response = await request(app)
        .get(`${BASE_URL}/bookings/my-bookings`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect('Content-Type', /json/);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .get(`${BASE_URL}/bookings/my-bookings`)
        .expect('Content-Type', /json/);

      expect(response.status).toBe(401);
    });
  });

  describe(`GET ${BASE_URL}/bookings`, () => {
    it('should get all bookings (admin/engineer)', async () => {
      const response = await request(app)
        .get(`${BASE_URL}/bookings`)
        .set('Authorization', `Bearer ${engineerToken}`)
        .expect('Content-Type', /json/);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should fail for regular user without proper role', async () => {
      const response = await request(app)
        .get(`${BASE_URL}/bookings`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect('Content-Type', /json/);

      expect(response.status).toBe(403);
    });
  });

  describe(`GET ${BASE_URL}/bookings/:id`, () => {
    let bookingId = '';

    it('should get booking by ID', async () => {
      // First create a booking
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);

      const createResponse = await request(app)
        .post(`${BASE_URL}/bookings`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          engineerId: testEngineerId,
          type: 'consultation',
          scheduledDate: futureDate.toISOString().split('T')[0],
          scheduledTime: '14:00',
          duration: 60,
          meetingType: 'audio'
        });

      bookingId = createResponse.body.data.id;

      const response = await request(app)
        .get(`${BASE_URL}/bookings/${bookingId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect('Content-Type', /json/);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('type');
    });

    it('should fail with invalid booking ID', async () => {
      const response = await request(app)
        .get(`${BASE_URL}/bookings/invalid-id`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect('Content-Type', /json/);

      expect(response.status).toBe(400);
    });
  });

  describe(`PUT ${BASE_URL}/bookings/:id/cancel`, () => {
    it('should cancel booking', async () => {
      // Create a booking first
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);

      const createResponse = await request(app)
        .post(`${BASE_URL}/bookings`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          engineerId: testEngineerId,
          type: 'consultation',
          scheduledDate: futureDate.toISOString().split('T')[0],
          scheduledTime: '15:00',
          duration: 60,
          meetingType: 'video'
        });

      const bookingId = createResponse.body.data.id;

      const response = await request(app)
        .put(`${BASE_URL}/bookings/${bookingId}/cancel`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect('Content-Type', /json/);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });
});

