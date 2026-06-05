const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['employer', 'candidate'],
    required: true
  },
  // Candidate specific fields
  skills: [String],
  bio: {
    type: String,
    trim: true
  },
  // Employer specific fields
  company: {
    type: String,
    trim: true
  },
  companyDescription: {
    type: String,
    trim: true
  }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);