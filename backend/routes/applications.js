const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const nodemailer = require('nodemailer');
const Application = require('../models/Application');
const Job = require('../models/Job');
const User = require('../models/User');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

// Multer setup for resume uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  }
});

// Nodemailer setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// @route   POST /api/applications/:jobId
// @desc    Apply for a job (candidate only)
router.post('/:jobId', auth, role('candidate'), upload.single('resume'), async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId).populate('employer');

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (!job.isOpen) {
      return res.status(400).json({ message: 'This job is no longer accepting applications' });
    }

    // Check if already applied
    const existing = await Application.findOne({
      job: req.params.jobId,
      candidate: req.user.id
    });

    if (existing) {
      return res.status(400).json({ message: 'You have already applied for this job' });
    }

    const application = new Application({
      job: req.params.jobId,
      candidate: req.user.id,
      resume: req.file.path,
      coverLetter: req.body.coverLetter
    });

    await application.save();

    // Get candidate info
    const candidate = await User.findById(req.user.id);

    // Send email to employer
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: job.employer.email,
      subject: `New Application for ${job.title}`,
      html: `
        <h3>New Job Application</h3>
        <p><strong>${candidate.name}</strong> has applied for <strong>${job.title}</strong></p>
        <p>Login to your Job Board dashboard to review the application.</p>
      `
    });

    res.status(201).json({ message: 'Application submitted successfully!', application });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/applications/employer
// @desc    Get all applications for employer's jobs
router.get('/employer/all', auth, role('employer'), async (req, res) => {
  try {
    const jobs = await Job.find({ employer: req.user.id });
    const jobIds = jobs.map(job => job._id);

    const applications = await Application.find({ job: { $in: jobIds } })
      .populate('candidate', 'name email skills bio')
      .populate('job', 'title company');

    res.json(applications);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/applications/candidate
// @desc    Get all applications by candidate
router.get('/candidate/all', auth, role('candidate'), async (req, res) => {
  try {
    const applications = await Application.find({ candidate: req.user.id })
      .populate('job', 'title company location type');

    res.json(applications);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/applications/:id/status
// @desc    Update application status (employer only)
router.put('/:id/status', auth, role('employer'), async (req, res) => {
  try {
    const { status } = req.body;

    const application = await Application.findById(req.params.id)
      .populate('candidate', 'name email')
      .populate('job', 'title');

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    application.status = status;
    await application.save();

    // Send email to candidate
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: application.candidate.email,
      subject: `Application Update — ${application.job.title}`,
      html: `
        <h3>Application Status Update</h3>
        <p>Your application for <strong>${application.job.title}</strong> has been updated.</p>
        <p>Status: <strong>${status}</strong></p>
        ${status === 'Accepted' 
          ? '<p>Congratulations! The employer will contact you soon.</p>' 
          : ''}
        ${status === 'Rejected' 
          ? '<p>Thank you for your interest. Keep applying!</p>' 
          : ''}
      `
    });

    res.json({ message: 'Application status updated!', application });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;