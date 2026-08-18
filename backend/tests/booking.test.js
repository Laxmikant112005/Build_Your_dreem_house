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
let secondUserToken = '';
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

const secondUser = {
  email: `bookingsecond${Date.now()}@example.com`,
  password: 'Password123',
  firstName: 'Second',
  lastName: 'User'
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

// Register a second, unrelated user (for IDOR testing)
    const secondUserResponse = await request(app)
      .post(`${BASE_URL}/auth/register`)
      .send(secondUser);
    if (secondUserResponse.body.data) {
      secondUserToken = secondUserResponse.body.data.accessToken;
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
    // Helper: build a booking payload matching the current createBooking
    // validator (startAt/endAt ISO dates, no legacy scheduledDate/scheduledTime).
    const bookingPayload = (overrides = {}) => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);
      const isoDate = futureDate.toISOString().split('T')[0];
      return {
        engineerId: testEngineerId,
        type: 'consultation',
        startAt: `${isoDate}T10:00:00.000Z`,
        endAt: `${isoDate}T11:00:00.000Z`,
        duration: 60,
        meetingType: 'video',
        projectDetails: {
          landSize: 2000,
          budget: 5000000
        },
        ...overrides,
      };
    };

    it('should create booking as user', async () => {
      const response = await request(app)
        .post(`${BASE_URL}/bookings`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(bookingPayload())
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
      const response = await request(app)
        .post(`${BASE_URL}/bookings`)
        .send(bookingPayload())
        .expect('Content-Type', /json/);

      expect(response.status).toBe(401);
    });

it('should fail with invalid engineer ID', async () => {
      const response = await request(app)
        .post(`${BASE_URL}/bookings`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(bookingPayload({ engineerId: 'invalid-id' }))
        .expect('Content-Type', /json/);

      // The createBooking Joi validator accepts any non-empty string for
      // engineerId; the booking service then fails to cast the malformed
      // ObjectId and returns 400 (Mongoose CastError mapped by the error
      // handler). This is the correct invalid-ID behavior.
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

  describe(`GET ${BASE_URL}/bookings/engineer/my-bookings`, () => {
    it('should get engineer bookings', async () => {
      const response = await request(app)
        .get(`${BASE_URL}/bookings/engineer/my-bookings`)
        .set('Authorization', `Bearer ${engineerToken}`)
        .expect('Content-Type', /json/);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should fail for regular user without proper role', async () => {
      const response = await request(app)
        .get(`${BASE_URL}/bookings/engineer/my-bookings`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect('Content-Type', /json/);

      expect(response.status).toBe(403);
    });
  });

  describe(`GET ${BASE_URL}/bookings/:id`, () => {
    let bookingId = '';

    beforeAll(async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);
      const isoDate = futureDate.toISOString().split('T')[0];

      const createResponse = await request(app)
        .post(`${BASE_URL}/bookings`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          engineerId: testEngineerId,
          type: 'consultation',
          startAt: `${isoDate}T14:00:00.000Z`,
          endAt: `${isoDate}T15:00:00.000Z`,
          duration: 60,
          meetingType: 'video'
        });

      bookingId = createResponse.body.data.id;
    });

it('should get booking by ID', async () => {
      const response = await request(app)
        .get(`${BASE_URL}/bookings/${bookingId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect('Content-Type', /json/);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('type');
    });

    it('should NOT allow another user to view the booking (IDOR protection)', async () => {
      // secondUserToken is an unrelated user => must be denied (403).
      const response = await request(app)
        .get(`${BASE_URL}/bookings/${bookingId}`)
        .set('Authorization', `Bearer ${secondUserToken}`)
        .expect('Content-Type', /json/);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });

    it('should allow the assigned engineer to view the booking', async () => {
      const response = await request(app)
        .get(`${BASE_URL}/bookings/${bookingId}`)
        .set('Authorization', `Bearer ${engineerToken}`)
        .expect('Content-Type', /json/);

      // The assigned engineer is authorized to view the booking (200).
      expect(response.status).toBe(200);
    });

    it('should fail with invalid booking ID', async () => {
      const response = await request(app)
        .get(`${BASE_URL}/bookings/invalid-id`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect('Content-Type', /json/);

      expect(response.status).toBe(400);
    });
  });

  describe(`POST ${BASE_URL}/bookings/:id/cancel`, () => {
    it('should cancel booking', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);
      const isoDate = futureDate.toISOString().split('T')[0];

      const createResponse = await request(app)
        .post(`${BASE_URL}/bookings`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          engineerId: testEngineerId,
          type: 'consultation',
          startAt: `${isoDate}T15:00:00.000Z`,
          endAt: `${isoDate}T16:00:00.000Z`,
          duration: 60,
          meetingType: 'video'
        });

      const bookingId = createResponse.body.data.id;

      const response = await request(app)
        .post(`${BASE_URL}/bookings/${bookingId}/cancel`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({})
        .expect('Content-Type', /json/);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });
});

