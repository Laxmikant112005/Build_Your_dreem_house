// Upload model skeleton
// Track uploaded files and metadata.

const mongoose = require('mongoose');

const UploadSchema = new mongoose.Schema({
  filename: { type: String, required: true },
  key: { type: String },
  url: { type: String },
  mimeType: { type: String },
  size: { type: Number },
  uploader: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Upload', UploadSchema);
