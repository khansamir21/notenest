const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  gender: { type: String, required: true },
  country: { type: String, required: true },
  password: { type: String, required: true },
  isSubscribed: { type: Boolean, default: false },
  uploadLimit: { type: Number, default: 5 } // Free users ke liye max 5 notes
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);