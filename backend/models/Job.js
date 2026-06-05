const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
  employer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  company: {
    type: String,
    required: true,
    trim: true
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['Full-time', 'Part-time', 'Remote', 'Internship', 'Contract'],
    required: true
  },
  description: {
    type: String,
    required: true
  },
  requirements: [String],
  salaryMin: {
    type: Number
  },
  salaryMax: {
    type: Number
  },
  isOpen: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Job', JobSchema);