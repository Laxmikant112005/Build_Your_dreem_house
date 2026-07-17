// Admin model skeleton (optional)
// Use this if you want separate admin profile metadata beyond the User collection.

const mongoose = require('mongoose');

const AdminMetaSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('AdminMeta', AdminMetaSchema);
