/**
 * Planova - E2E Verification Script
 *
 * Verifies the full auth + dashboard flow against the LIVE backend & database:
 *   - Valid user login  -> 200
 *   - Invalid password  -> 401
 *   - Unknown user      -> 401
 *   - Valid engineer login -> 200
 *   - Dashboard (user)  -> 200
 *   - /auth/me          -> 200 with role
 *
 * Usage (from backend/):
 *   $env:NODE_ENV="development"; $env:JWT_SECRET="..."; $env:JWT_REFRESH_SECRET="...";
 *   node scripts/verify-e2e.js
 */

process.env.NODE_ENV = 'development';
const mongoose = require('mongoose');
const app = require('../src/app');
const request = require('supertest');
const config = require('../src/config');

const USER = { email: 'e2e.user@planova.dev', password: 'Planova@123' };
const ENGINEER = { email: 'e2e.engineer@planova.dev', password: 'Planova@123' };

const check = (label, res, expectedStatus) => {
  const pass = res.status === expectedStatus;
  console.log(`[${pass ? 'PASS' : 'FAIL'}] ${label} -> ${res.status} (expected ${expectedStatus})`);
  if (!pass) {
    console.log('  BODY:', JSON.stringify(res.body || res.text).slice(0, 400));
  }
  return pass;
};

(async () => {
  await mongoose.connect(config.database.uri, config.database.options);

  let allPass = true;

  // 1. Valid user login
  let res = await request(app).post('/api/v1/auth/login').send(USER);
  allPass = check('User login succeeds', res, 200) && allPass;
  const userToken = res.body?.data?.accessToken;
  if (userToken) {
    // Dashboard
    const dash = await request(app).get('/api/v1/dashboard').set('Authorization', `Bearer ${userToken}`);
    allPass = check('User dashboard returns 200', dash, 200) && allPass;
    if (dash.body?.data?.stats) {
      console.log('  stats:', JSON.stringify(dash.body.data.stats));
    }
    // /auth/me
    const me = await request(app).get('/api/v1/auth/me').set('Authorization', `Bearer ${userToken}`);
    allPass = check('User /auth/me returns 200', me, 200) && allPass;
    if (me.body?.data) console.log('  role:', me.body.data.role);
  }

  // 2. Invalid password
  res = await request(app).post('/api/v1/auth/login').send({ email: USER.email, password: 'wrongpass' });
  allPass = check('Invalid password returns 401', res, 401) && allPass;

  // 3. Unknown user
  res = await request(app).post('/api/v1/auth/login').send({ email: 'nobody@planova.dev', password: 'whatever' });
  allPass = check('Unknown user returns 401', res, 401) && allPass;

  // 4. Valid engineer login
  res = await request(app).post('/api/v1/auth/login').send(ENGINEER);
  allPass = check('Engineer login succeeds', res, 200) && allPass;
  if (res.body?.data) {
    console.log('  engineer role:', res.body.data.user.role);
  }

  console.log(allPass ? '\nALL E2E CHECKS PASSED' : '\nSOME E2E CHECKS FAILED');
  await mongoose.disconnect();
  process.exit(allPass ? 0 : 1);
})().catch((e) => {
  console.error('E2E script errored:', e);
  process.exit(1);
});
