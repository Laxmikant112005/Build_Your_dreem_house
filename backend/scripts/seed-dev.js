/**
 * Planova - Development Seed Script
 *
 * Provisions known-good E2E accounts (a User and an Engineer) so login/dashboard
 * and the Engineer panel can be tested against the REAL database with REAL
 * bcrypt password hashing (via the User model pre-save hook).
 *
 * SECURITY GUARD: This script only runs when NODE_ENV !== 'production'.
 * It never bypasses auth, never hardcodes access beyond setting a known
 * password, and never touches production data.
 *
 * Usage (from backend/):
 *   $env:NODE_ENV="development"; node scripts/seed-dev.js
 */

const mongoose = require('mongoose');
const User = require('../src/modules/user/user.model');
const config = require('../src/config');

const SEED_ACCOUNTS = [
  {
    email: 'e2e.user@planova.dev',
    password: 'Planova@123',
    firstName: 'E2E',
    lastName: 'User',
    phone: '+919000000001',
    role: 'user',
    isEmailVerified: true,
    isActive: true,
  },
  {
    email: 'e2e.engineer@planova.dev',
    password: 'Planova@123',
    firstName: 'E2E',
    lastName: 'Engineer',
    phone: '+919000000002',
    role: 'engineer',
    isEmailVerified: true,
    isActive: true,
    engineerProfile: {
      bio: 'Professional structural engineer with 10+ years of experience.',
      title: 'Senior Structural Engineer',
      company: 'Planova Constructions',
      isVerified: true,
      verificationStatus: 'approved',
      yearsOfExperience: 10,
      specializations: ['Structural', 'Residential', 'Green Building'],
      hourlyRate: 1500,
      currency: 'INR',
      serviceAreas: [
        {
          city: 'Bangalore',
          state: 'Karnataka',
          radiusKm: 50,
          location: { type: 'Point', coordinates: [77.5946, 12.9716] },
        },
      ],
      availability: [
        { dayOfWeek: 1, startTime: '09:00', endTime: '18:00' },
        { dayOfWeek: 2, startTime: '09:00', endTime: '18:00' },
        { dayOfWeek: 3, startTime: '09:00', endTime: '18:00' },
        { dayOfWeek: 4, startTime: '09:00', endTime: '18:00' },
        { dayOfWeek: 5, startTime: '09:00', endTime: '18:00' },
      ],
      education: [
        { degree: 'B.Tech Civil Engineering', institution: 'IIT Bombay', year: 2012 },
      ],
      certifications: [
        { name: 'Licensed Structural Engineer', issuer: 'India Board', year: 2014 },
      ],
    },
  },
];

(async () => {
  if (config.env === 'production') {
    console.error('Refusing to seed in production.');
    process.exit(1);
  }

  await mongoose.connect(config.database.uri, config.database.options);

  for (const account of SEED_ACCOUNTS) {
    const existing = await User.findOne({ email: account.email });
    if (existing) {
      // Update password so the account is guaranteed usable with known password.
      existing.password = account.password;
      existing.isActive = true;
      existing.isEmailVerified = true;
      if (account.role === 'engineer' && account.engineerProfile) {
        existing.engineerProfile = { ...existing.engineerProfile, ...account.engineerProfile };
      }
      await existing.save();
      console.log(`[updated] ${account.email} (${account.role})`);
    } else {
      await User.create(account);
      console.log(`[created] ${account.email} (${account.role})`);
    }
  }

  console.log('Seed complete. Known-good credentials:');
  console.log('  User:     e2e.user@planova.dev / Planova@123');
  console.log('  Engineer: e2e.engineer@planova.dev / Planova@123');

  await mongoose.disconnect();
})().catch((e) => {
  console.error('Seed failed:', e);
  process.exit(1);
});
