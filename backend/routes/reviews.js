const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Review = require('../models/Review');
const Session = require('../models/Session');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const addNotification = async (userId, message, type, link = '') => {
  await User.findByIdAndUpdate(userId, {
    $push: { notifications: { message, type, link, read: false } }
  });
};

// @route POST /api/reviews
router.post('/', protect, [
  body('session').notEmpty().withMessage('Session ID is required'),
  body('reviewee').notEmpty().withMessage('Reviewee is required'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }

    const { session: sessionId, reviewee, rating, feedback, tags, skillReviewed } = req.body;

    // Verify session exists and is completed
    const session = await Session.findById(sessionId);
    if (!session) return res.status(404).json({ success: false, message: 'Session not found' });
    if (session.status !== 'completed') {
      return res.status(400).json({ success: false, message: 'Can only review completed sessions' });
    }

    const isParticipant = session.participants.some(p => p.toString() === req.user._id.toString());
    if (!isParticipant) return res.status(403).json({ success: false, message: 'Not a participant' });

    // Check already reviewed
    const existingReview = await Review.findOne({ session: sessionId, reviewer: req.user._id });
    if (existingReview) {
      return res.status(400).json({ success: false, message: 'You already reviewed this session' });
    }

    const review = await Review.create({
      session: sessionId,
      reviewer: req.user._id,
      reviewee,
      rating,
      feedback: feedback || '',
      tags: tags || [],
      skillReviewed: skillReviewed || ''
    });

    // Update reviewee's reputation score
    const revieweeUser = await User.findById(reviewee);
    const allReviews = await Review.find({ reviewee });
    const totalRating = allReviews.reduce((sum, r) => sum + r.rating, 0);
    const avgRating = totalRating / allReviews.length;

    await User.findByIdAndUpdate(reviewee, {
      reputationScore: Math.round(avgRating * 10) / 10,
      totalReviews: allReviews.length
    });

    // Notify reviewee
    await addNotification(
      reviewee,
      `${req.user.name} left you a ${rating}-star review!`,
      'review',
      `/profile/${reviewee}`
    );

    await review.populate('reviewer', 'name avatar');
    res.status(201).json({ success: true, message: 'Review submitted', review });
  } catch (err) {
    next(err);
  }
});

// @route GET /api/reviews/user/:userId
router.get('/user/:userId', protect, async (req, res, next) => {
  try {
    const reviews = await Review.find({ reviewee: req.params.userId })
      .populate('reviewer', 'name avatar college')
      .populate('session', 'skill scheduledAt')
      .sort('-createdAt');

    const stats = {
      total: reviews.length,
      average: reviews.length > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0,
      distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    };
    reviews.forEach(r => stats.distribution[r.rating]++);

    res.json({ success: true, reviews, stats });
  } catch (err) {
    next(err);
  }
});

// @route GET /api/reviews/session/:sessionId
router.get('/session/:sessionId', protect, async (req, res, next) => {
  try {
    const reviews = await Review.find({ session: req.params.sessionId })
      .populate('reviewer', 'name avatar');
    res.json({ success: true, reviews });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
