// Auth-related models (e.g., tokens, sessions) skeleton
// Create appropriate Mongoose schemas here if you need a separate collection for refresh tokens or sessions.

const mongoose = require('mongoose');

const RefreshTokenSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  token: { type: String, required: true, index: true },
  expiresAt: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('RefreshToken', RefreshTokenSchema);
