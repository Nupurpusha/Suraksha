const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // IMPORTANT: This should always be hashed!
  role: { type: String, enum: ['user', 'admin', 'counsellor'], default: 'user' },
  otp: { type: String }, // To store the OTP
  otpExpires: { type: Date }, // To store when the OTP expires
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model('User', userSchema);