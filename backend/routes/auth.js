const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const User = require('../models/User');

// Nodemailer setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// @route   POST /api/auth/register
// @desc    Register a new user and send OTP
router.post('/register', async (req, res) => {
  const { name, email, password, role, company, companyDescription, skills, bio } = req.body;

  try {
    // Check if user already exists
    let user = await User.findOne({ email });
    if (user && user.isVerified) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Generate OTP and expiry
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    if (user && !user.isVerified) {
      // Update existing unverified user with new OTP
      user.otp = otp;
      user.otpExpiry = otpExpiry;
      await user.save();
    } else {
      // Create new user
      user = new User({
        name, email, password, role,
        company, companyDescription, skills, bio,
        otp, otpExpiry
      });

      // Hash password
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
      await user.save();
    }

    // Send OTP email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Verify Your Job Board Account — OTP Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;">
          <h2 style="color: #1e40af;">Verify Your Email Address</h2>
          <p>Hi <strong>${name}</strong>,</p>
          <p>Thank you for registering on Job Board! Use the OTP below to verify your account:</p>
          <div style="background-color: #f0f4ff; border: 2px dashed #1e40af; border-radius: 10px; padding: 20px; text-align: center; margin: 20px 0;">
            <h1 style="color: #1e40af; font-size: 42px; letter-spacing: 10px; margin: 0;">${otp}</h1>
          </div>
          <p style="color: #dc2626;"><strong>⚠️ This OTP expires in 5 minutes.</strong></p>
          <p>If you did not register, please ignore this email.</p>
        </div>
      `
    });

    res.status(201).json({
      message: 'Registration successful! Please check your email for the OTP.',
      email
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/auth/verify-otp
// @desc    Verify OTP and activate account
router.post('/verify-otp', async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'Account already verified' });
    }

    // Check OTP
    if (user.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP. Please try again.' });
    }

    // Check OTP expiry
    if (new Date() > user.otpExpiry) {
      return res.status(400).json({ message: 'OTP has expired. Please register again.' });
    }

    // Verify account
    user.isVerified = true;
    user.otp = null;
    user.otpExpiry = null;
    await user.save();

    // Create JWT token
    const payload = { id: user._id, role: user.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({
      message: 'Account verified successfully!',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/auth/resend-otp
// @desc    Resend OTP to email
router.post('/resend-otp', async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'Account already verified' });
    }

    // Generate new OTP
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);

    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save();

    // Send new OTP email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Your New OTP Code — Job Board',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;">
          <h2 style="color: #1e40af;">New OTP Code</h2>
          <p>Hi <strong>${user.name}</strong>,</p>
          <p>Here is your new OTP code:</p>
          <div style="background-color: #f0f4ff; border: 2px dashed #1e40af; border-radius: 10px; padding: 20px; text-align: center; margin: 20px 0;">
            <h1 style="color: #1e40af; font-size: 42px; letter-spacing: 10px; margin: 0;">${otp}</h1>
          </div>
          <p style="color: #dc2626;"><strong>⚠️ This OTP expires in 5 minutes.</strong></p>
        </div>
      `
    });

    res.json({ message: 'New OTP sent to your email!' });

  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check if account is verified
    if (!user.isVerified) {
      return res.status(400).json({
        message: 'Please verify your email first.',
        needsVerification: true,
        email: user.email
      });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Create JWT token
    const payload = { id: user._id, role: user.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;