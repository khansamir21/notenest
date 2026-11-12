const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { type: String, required: true },
  fileUrl: { type: String, required: true },
  fileType: { type: String, required: true },
  isPublic: { type: Boolean, default: true },
  uploader: { type: String, default: 'Samiullah Bagwan' },
  description: { type: String, default: '' }, // Naya description field
}, { timestamps: true });

module.exports = mongoose.model('Note', noteSchema);