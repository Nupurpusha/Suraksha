const mongoose = require('mongoose');

const querySchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  message: { type: String, required: true },
  status: { type: String, enum: ['Open', 'Answered'], default: 'Open' },
  answer: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Query', querySchema);


