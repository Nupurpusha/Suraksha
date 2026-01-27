const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, default: 'Untitled' },
  description: { type: String, required: true },
  location: { type: String, default: 'Not specified' },
  dateOfIncident: { type: Date, required: true },
  status: { type: String, enum: ['Submitted', 'In Review', 'Assigned', 'In Counselling', 'Resolved'], default: 'Submitted' },
  assignedCounselor: { type: String, default: 'Not Yet Assigned' },
  assignedCounselorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

  // Additional fields for categorization
  type: { type: String, required: true },
  otherType: { type: String },
  isAnonymous: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Report', reportSchema);