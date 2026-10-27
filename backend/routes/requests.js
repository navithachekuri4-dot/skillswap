const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const SkillRequest = require('../models/SkillRequest');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// @route GET /api/requests
router.get('/', protect, async (req, res, next) => {
  try {
    const { category, search, urgency, page = 1, limit = 12 } = req.query;
    // Exclude logged-in user's own requests
    let query = { isActive: true, user: { $ne: req.user._id } };

    if (category && category !== 'All') query.category = category;
    if (urgency && urgency !== 'All') query.urgency = urgency;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;
    const total = await SkillRequest.countDocuments(query);
    const requests = await SkillRequest.find(query)
      .populate('user', 'name college year avatar reputationScore totalReviews completedSessions isDemo skillsOffered skillsNeeded')
      .sort('-createdAt')
      .skip(skip)
      .limit(parseInt(limit));

    const currentUser = await User.findById(req.user._id);
    const myOffers = (currentUser?.skillsOffered || []).map(s => s.name.toLowerCase().trim());

    const enrichedRequests = requests.map(r => {
      const obj = r.toObject();
      const titleLower = (obj.title || '').toLowerCase();
      const canHelp = myOffers.some(offer => offer && (titleLower.includes(offer) || offer.includes(titleLower)));
      return {
        ...obj,
        canHelpWithSkill: canHelp,
        matchReason: canHelp ? 'Matches a skill you offer to teach!' : null
      };
    });

    res.json({ success: true, requests: enrichedRequests, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    next(err);
  }
});

// @route POST /api/requests
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

    const skillRequest = await SkillRequest.create({ ...req.body, user: req.user._id });
    await skillRequest.populate('user', 'name college year avatar reputationScore');

    res.status(201).json({ success: true, message: 'Skill request created', request: skillRequest });
  } catch (err) {
    next(err);
  }
});

// @route GET /api/requests/my
router.get('/my', protect, async (req, res, next) => {
  try {
    const requests = await SkillRequest.find({ user: req.user._id }).sort('-createdAt');
    res.json({ success: true, requests });
  } catch (err) {
    next(err);
  }
});

// @route GET /api/requests/:id
router.get('/:id', protect, async (req, res, next) => {
  try {
    const request = await SkillRequest.findById(req.params.id)
      .populate('user', 'name college year avatar reputationScore totalReviews completedSessions bio availability');
    if (!request) return res.status(404).json({ success: false, message: 'Request not found' });
    res.json({ success: true, request });
  } catch (err) {
    next(err);
  }
});

// @route PUT /api/requests/:id
router.put('/:id', protect, async (req, res, next) => {
  try {
    const request = await SkillRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ success: false, message: 'Request not found' });
    if (request.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const updated = await SkillRequest.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
      .populate('user', 'name college year avatar reputationScore');

    res.json({ success: true, message: 'Request updated', request: updated });
  } catch (err) {
    next(err);
  }
});

// @route DELETE /api/requests/:id
router.delete('/:id', protect, async (req, res, next) => {
  try {
    const request = await SkillRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ success: false, message: 'Request not found' });
    if (request.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await request.deleteOne();
    res.json({ success: true, message: 'Request deleted' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
