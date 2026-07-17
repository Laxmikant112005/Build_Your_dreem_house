process.env.NODE_ENV='test';
process.env.JWT_SECRET='test-secret-key';
process.env.JWT_REFRESH_SECRET='test-refresh-secret';
const mongoose = require('mongoose');
const app = require('./src/app');
const request = require('supertest');
(async () => {
  await mongoose.connect('mongodb://localhost:27017/buildmyhome_test');
  await mongoose.connection.dropDatabase();
  const res1 = await request(app).post('/api/v1/auth/register').send({email:'repro@example.com',password:'password123',firstName:'Test',lastName:'User'});
  console.log('REGISTER STATUS', res1.status);
  console.log(JSON.stringify(res1.body, null, 2));
  const res2 = await request(app).post('/api/v1/auth/login').send({email:'repro@example.com',password:'password123'});
  console.log('LOGIN STATUS', res2.status);
  console.log(JSON.stringify(res2.body, null, 2));
  await mongoose.disconnect();
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
