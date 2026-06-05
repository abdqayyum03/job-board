const mongoose = require('mongoose');

const ApplicationSchema = new mongoose.Schema({
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  candidate: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  resume: {
    type: String,
    required: true
  },
  coverLetter: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Reviewed', 'Accepted', 'Rejected'],
    default: 'Pending'
  }
}, { timestamps: true });

module.exports = mongoose.model('Application', ApplicationSchema);