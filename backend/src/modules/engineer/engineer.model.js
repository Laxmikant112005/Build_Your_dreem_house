// Engineer model skeleton
// Extend with fields specific to engineer profiles and availability.

const mongoose = require('mongoose');

const EngineerProfileSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  bio: { type: String },
  specialties: [{ type: String }],
  experienceYears: { type: Number, default: 0 },
  isVerified: { type: Boolean, default: false },
  portfolio: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('EngineerProfile', EngineerProfileSchema);
