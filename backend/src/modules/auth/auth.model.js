const mongoose = require('mongoose');

const RefreshTokenSchema = new mongoose.Schema(
  {
    /**
     * User who owns this refresh token.
     */
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    /**
     * Refresh token.
     *
     * IMPORTANT:
     * If auth.service.js currently stores the raw token,
     * keep this field for compatibility.
     *
     * For higher security, store a hash instead.
     */
    token: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    /**
     * Token expiration time.
     *
     * MongoDB TTL index automatically removes the document
     * after this time.
     */
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },

    /**
     * Token creation time.
     */
    createdAt: {
      type: Date,
      default: Date.now,
      immutable: true,
    },
  },
  {
    collection: 'refresh_tokens',
    versionKey: false,
  }
);

/**
 * TTL index.
 *
 * MongoDB removes the document when expiresAt is reached.
 */
RefreshTokenSchema.index(
  { expiresAt: 1 },
  { expireAfterSeconds: 0 }
);

/**
 * Helpful index for finding a user's active refresh tokens.
 */
RefreshTokenSchema.index({
  user: 1,
  expiresAt: 1,
});

module.exports = mongoose.model(
  'RefreshToken',
  RefreshTokenSchema
);