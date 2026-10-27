const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });
};

// @route POST /api/auth/register
router.post('/register', [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 50 }).withMessage('Name cannot exceed 50 characters'),
  body('email').trim().notEmpty().withMessage('Email is required').isEmail().withMessage('Please enter a valid email address'),
  body('password').notEmpty().withMessage('Password is required').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }

    const { name, email, password } = req.body;
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanName = (name || '').trim();

    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email is already registered. Please sign in.' });
    }

    const user = await User.create({ name: cleanName, email: cleanEmail, password });
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        college: user.college,
        year: user.year,
        bio: user.bio,
        avatar: user.avatar,
        skillsOffered: user.skillsOffered,
        skillsNeeded: user.skillsNeeded,
        availability: user.availability,
        reputationScore: user.reputationScore,
        totalReviews: user.totalReviews,
        completedSessions: user.completedSessions,
        isDemo: user.isDemo || false,
        profileComplete: user.profileComplete
      }
    });
  } catch (err) {
    next(err);
  }
});

// @route POST /api/auth/login
router.post('/login', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }

    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        college: user.college,
        year: user.year,
        bio: user.bio,
        avatar: user.avatar,
        skillsOffered: user.skillsOffered,
        skillsNeeded: user.skillsNeeded,
        availability: user.availability,
        reputationScore: user.reputationScore,
        totalReviews: user.totalReviews,
        completedSessions: user.completedSessions,
        isDemo: user.isDemo || false,
        notifications: user.notifications,
        profileComplete: user.profileComplete
      }
    });
  } catch (err) {
    next(err);
  }
});

// @route GET /api/auth/me
router.get('/me', protect, async (req, res) => {
  const user = await User.findById(req.user._id);
  res.json({ success: true, user });
});

// @route PUT /api/auth/change-password
router.put('/change-password', protect, [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }

    const user = await User.findById(req.user._id).select('+password');
    const { currentPassword, newPassword } = req.body;

    if (!(await user.comparePassword(currentPassword))) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: 'Password changed successfully' });
  } catch (err) {
    next(err);
  }
});

// @route POST /api/auth/demo-login
const { getOrCreateDemoUser, seedDemoUser } = require('../utils/demoSeeder');

router.post('/demo-login', async (req, res, next) => {
  try {
    const user = await getOrCreateDemoUser();
    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Demo login successful',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        college: user.college,
        year: user.year,
        bio: user.bio,
        avatar: user.avatar,
        skillsOffered: user.skillsOffered,
        skillsNeeded: user.skillsNeeded,
        availability: user.availability,
        reputationScore: user.reputationScore,
        totalReviews: user.totalReviews,
        completedSessions: user.completedSessions,
        isDemo: true,
        notifications: user.notifications,
        profileComplete: user.profileComplete
      }
    });
  } catch (err) {
    next(err);
  }
});

// @route POST /api/auth/demo-reset
router.post('/demo-reset', protect, async (req, res, next) => {
  try {
    if (!req.user.isDemo) {
      return res.status(403).json({ success: false, message: 'Only demo accounts can be reset' });
    }
    const user = await seedDemoUser();
    res.json({
      success: true,
      message: 'Demo data reset successfully',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        college: user.college,
        year: user.year,
        bio: user.bio,
        avatar: user.avatar,
        skillsOffered: user.skillsOffered,
        skillsNeeded: user.skillsNeeded,
        availability: user.availability,
        reputationScore: user.reputationScore,
        totalReviews: user.totalReviews,
        completedSessions: user.completedSessions,
        isDemo: true,
        notifications: user.notifications,
        profileComplete: user.profileComplete
      }
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
