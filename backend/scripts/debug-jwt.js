const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const app = require('../src/app');
const User = require('../src/modules/user/user.model');

(async () => {
  try {
    process.env.NODE_ENV = process.env.NODE_ENV || 'test';

    const config = require('../src/config');

    // Ensure secrets exist for both registration token signing and JWT middleware verification consistency.
    // (No secret values are printed.)
    if (config?.jwt?.secret) process.env.JWT_SECRET = config.jwt.secret;
    if (config?.jwt?.refreshSecret) process.env.JWT_REFRESH_SECRET = config.jwt.refreshSecret;

    const testUri = process.env.MONGODB_TEST_URI || config?.database?.uri || 'mongodb://localhost:27017/buildmyhome_test';

    const conn = await mongoose.connect(testUri);
    const dbName = conn.connection?.db?.databaseName;

    const uriDbOnly = (testUri.split('/').pop() || '').split('?')[0];
    let mongooseConnectionReady = false;

    // Drop DB to ensure clean state.
    await mongoose.connection.dropDatabase();

    mongooseConnectionReady = conn?.readyState === 1;

    const payload = {
      email: `tmp${Date.now()}@example.com`,
      password: 'password123',
      firstName: 'Tmp',
      lastName: 'User',
    };

    const regRes = await request(app).post('/api/v1/auth/register').send(payload);

    const createdUserId = regRes.body?.data?.user?.id || null;
    const responseUserId = regRes.body?.data?.user?.id || null;
    const accessToken = regRes.body?.data?.accessToken;

    const decoded = jwt.decode(accessToken);
    const decodedId = decoded && decoded.id ? String(decoded.id) : null;
    const decodedSub = decoded && decoded.sub ? String(decoded.sub) : null;

    const foundByDecodedId = decodedId ? await User.findById(decodedId).then((u) => !!u) : false;
    const foundByDecodedSub = decodedSub ? await User.findById(decodedSub).then((u) => !!u) : false;

    console.log(
      JSON.stringify(
        {
          createdUserId,
          responseUserId,
          decodedId,
          decodedSub,
          foundByDecodedId,
          foundByDecodedSub,
          activeDatabaseName: dbName,
          mongooseConnectionReady,
          activeMongoDbUriDatabaseOnly: uriDbOnly,
        },
        null,
        2
      )
    );

    await mongoose.disconnect();
  } catch (err) {
    // Never print secrets/tokens/passwords.
    console.error('SCRIPT_ERR', err && err.stack ? err.stack : err);
    process.exit(1);
  }
})();

