const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Review = require('../models/Review');
const { protect } = require('../middleware/auth');

// @route GET /api/users/profile/:id
router.get('/profile/:id', protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password -notifications');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // Get reviews for this user
    const reviews = await Review.find({ reviewee: req.params.id })
      .populate('reviewer', 'name avatar')
      .sort('-createdAt')
      .limit(10);

    let matchInfo = null;
    if (req.user._id.toString() !== req.params.id) {
      const currentUser = await User.findById(req.user._id);
      matchInfo = calculateMatch(currentUser, user);
    }

    res.json({ success: true, user, reviews, matchInfo });
  } catch (err) {
    next(err);
  }
});

// @route PUT /api/users/profile
router.put('/profile', protect, [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('bio').optional().isLength({ max: 300 }).withMessage('Bio cannot exceed 300 characters')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }

    const { name, college, year, bio, availability } = req.body;

    const user = await User.findById(req.user._id);

    if (name) user.name = name;
    if (college !== undefined) user.college = college;
    if (year !== undefined) user.year = year;
    if (bio !== undefined) user.bio = bio;
    if (availability) user.availability = { ...user.availability, ...availability };

    user.profileComplete = user.calculateProfileComplete();
    await user.save();

    res.json({ success: true, message: 'Profile updated', user });
  } catch (err) {
    next(err);
  }
});

// @route POST /api/users/skills/offer
router.post('/skills/offer', protect, [
  body('name').trim().notEmpty().withMessage('Skill name is required'),
  body('category').notEmpty().withMessage('Category is required'),
  body('level').notEmpty().withMessage('Level is required')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }

    const user = await User.findById(req.user._id);
    user.skillsOffered.push(req.body);
    user.profileComplete = user.calculateProfileComplete();
    await user.save();

    res.status(201).json({ success: true, message: 'Skill added to offered list', user });
  } catch (err) {
    next(err);
  }
});

// @route DELETE /api/users/skills/offer/:skillId
router.delete('/skills/offer/:skillId', protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    user.skillsOffered = user.skillsOffered.filter(s => s._id.toString() !== req.params.skillId);
    user.profileComplete = user.calculateProfileComplete();
    await user.save();
    res.json({ success: true, message: 'Skill removed', user });
  } catch (err) {
    next(err);
  }
});

// @route POST /api/users/skills/need
router.post('/skills/need', protect, [
  body('name').trim().notEmpty().withMessage('Skill name is required')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }

    const user = await User.findById(req.user._id);
    user.skillsNeeded.push(req.body);
    user.profileComplete = user.calculateProfileComplete();
    await user.save();

    res.status(201).json({ success: true, message: 'Skill added to needed list', user });
  } catch (err) {
    next(err);
  }
});

// @route DELETE /api/users/skills/need/:skillId
router.delete('/skills/need/:skillId', protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    user.skillsNeeded = user.skillsNeeded.filter(s => s._id.toString() !== req.params.skillId);
    user.profileComplete = user.calculateProfileComplete();
    await user.save();
    res.json({ success: true, message: 'Skill removed', user });
  } catch (err) {
    next(err);
  }
});

// @route GET /api/users/notifications
router.get('/notifications', protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('notifications');
    res.json({ success: true, notifications: user.notifications.sort((a,b) => b.createdAt - a.createdAt) });
  } catch (err) {
    next(err);
  }
});

// @route PUT /api/users/notifications/read
router.put('/notifications/read', protect, async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.user._id, {
      $set: { 'notifications.$[].read': true }
    });
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (err) {
    next(err);
  }
});

// @route PUT /api/users/notifications/:notifId/read
router.put('/notifications/:notifId/read', protect, async (req, res, next) => {
  try {
    await User.findOneAndUpdate(
      { _id: req.user._id, 'notifications._id': req.params.notifId },
      { $set: { 'notifications.$.read': true } }
    );
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

const { calculateMatch } = require('../utils/matching');

// @route GET /api/users/search
router.get('/search', protect, async (req, res, next) => {
  try {
    const { q, category } = req.query;
    const currentUser = await User.findById(req.user._id);

    let query = { _id: { $ne: req.user._id }, isActive: true };

    if (q && q.trim()) {
      const regex = new RegExp(q.trim(), 'i');
      query.$or = [
        { name: regex },
        { college: regex },
        { bio: regex },
        { 'skillsOffered.name': regex },
        { 'skillsNeeded.name': regex }
      ];
    }

    if (category && category !== 'All') {
      query.$or = query.$or || [];
      query.$and = [
        {
          $or: [
            { 'skillsOffered.category': category },
            { 'skillsNeeded.category': category }
          ]
        }
      ];
    }

    const peers = await User.find(query)
      .select('name college year bio avatar skillsOffered skillsNeeded availability reputationScore totalReviews completedSessions isDemo createdAt profileComplete')
      .limit(30)
      .lean();

    // Augment with matching score & explanation
    const peersWithMatches = peers.map(peer => {
      const match = calculateMatch(currentUser, peer);
      return {
        ...peer,
        matchScore: match.score,
        matchReason: match.reason,
        matchType: match.matchType,
        matchedSkills: match.matchedSkills
      };
    });

    // Sort by match score descending, then profile completeness
    peersWithMatches.sort((a, b) => b.matchScore - a.matchScore || b.profileComplete - a.profileComplete);

    res.json({ success: true, users: peersWithMatches });
  } catch (err) {
    next(err);
  }
});

// @route GET /api/users/matches
router.get('/matches', protect, async (req, res, next) => {
  try {
    const currentUser = await User.findById(req.user._id);

    // Fetch all active peers excluding current user
    const peers = await User.find({
      _id: { $ne: req.user._id },
      isActive: true
    })
      .select('name college year bio avatar skillsOffered skillsNeeded availability reputationScore totalReviews completedSessions isDemo createdAt profileComplete')
      .lean();

    // Compute complementary matches
    const scoredPeers = peers.map(peer => {
      const match = calculateMatch(currentUser, peer);
      return {
        ...peer,
        matchScore: match.score,
        matchReason: match.reason,
        matchType: match.matchType,
        matchedSkills: match.matchedSkills
      };
    });

    // Filter to those with notable complementary interest (score >= 45) and sort highest first
    const topMatches = scoredPeers
      .filter(p => p.matchScore >= 45)
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 10);

    res.json({ success: true, matches: topMatches });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

