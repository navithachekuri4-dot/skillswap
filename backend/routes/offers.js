const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const SkillOffer = require('../models/SkillOffer');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// @route GET /api/offers
router.get('/', protect, async (req, res, next) => {
  try {
    const { category, search, page = 1, limit = 12 } = req.query;
    // Exclude logged in user's own offers from discovery browse
    let query = { isActive: true, user: { $ne: req.user._id } };

    if (category && category !== 'All') query.category = category;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;
    const total = await SkillOffer.countDocuments(query);
    const offers = await SkillOffer.find(query)
      .populate('user', 'name college year avatar reputationScore totalReviews completedSessions isDemo skillsOffered skillsNeeded')
      .sort('-createdAt')
      .skip(skip)
      .limit(parseInt(limit));

    // Get current user to tag complementary offers
    const currentUser = await User.findById(req.user._id);
    const myNeeds = (currentUser?.skillsNeeded || []).map(s => s.name.toLowerCase().trim());

    const enrichedOffers = offers.map(o => {
      const obj = o.toObject();
      const titleLower = (obj.title || '').toLowerCase();
      const isMatch = myNeeds.some(need => need && (titleLower.includes(need) || need.includes(titleLower)));
      return {
        ...obj,
        isWishlistMatch: isMatch,
        matchReason: isMatch ? 'Matches a skill on your wishlist!' : null
      };
    });

    res.json({ success: true, offers: enrichedOffers, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    next(err);
  }
});

// @route POST /api/offers
router.post('/', protect, [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('category').notEmpty().withMessage('Category is required'),
  body('description').trim().notEmpty().withMessage('Description is required')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }

    const offer = await SkillOffer.create({ ...req.body, user: req.user._id });
    await offer.populate('user', 'name college year avatar reputationScore');

    // Also add to user's skillsOffered if not already there
    const user = await User.findById(req.user._id);
    const exists = user.skillsOffered.some(s => s.name.toLowerCase() === offer.title.toLowerCase());
    if (!exists) {
      user.skillsOffered.push({ name: offer.title, category: offer.category, level: offer.level });
      user.profileComplete = user.calculateProfileComplete();
      await user.save();
    }

    res.status(201).json({ success: true, message: 'Skill offer created', offer });
  } catch (err) {
    next(err);
  }
});

// @route GET /api/offers/my
router.get('/my', protect, async (req, res, next) => {
  try {
    const offers = await SkillOffer.find({ user: req.user._id }).sort('-createdAt');
    res.json({ success: true, offers });
  } catch (err) {
    next(err);
  }
});

// @route GET /api/offers/:id
router.get('/:id', protect, async (req, res, next) => {
  try {
    const offer = await SkillOffer.findById(req.params.id)
      .populate('user', 'name college year avatar reputationScore totalReviews completedSessions bio availability');
    if (!offer) return res.status(404).json({ success: false, message: 'Offer not found' });

    // Increment views
    await SkillOffer.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });

    res.json({ success: true, offer });
  } catch (err) {
    next(err);
  }
});

// @route PUT /api/offers/:id
router.put('/:id', protect, async (req, res, next) => {
  try {
    const offer = await SkillOffer.findById(req.params.id);
    if (!offer) return res.status(404).json({ success: false, message: 'Offer not found' });
    if (offer.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const updated = await SkillOffer.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
      .populate('user', 'name college year avatar reputationScore');

    res.json({ success: true, message: 'Offer updated', offer: updated });
  } catch (err) {
    next(err);
  }
});

// @route DELETE /api/offers/:id
router.delete('/:id', protect, async (req, res, next) => {
  try {
    const offer = await SkillOffer.findById(req.params.id);
    if (!offer) return res.status(404).json({ success: false, message: 'Offer not found' });
    if (offer.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await offer.deleteOne();
    res.json({ success: true, message: 'Offer deleted' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
