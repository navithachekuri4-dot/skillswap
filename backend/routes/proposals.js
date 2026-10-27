const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Proposal = require('../models/Proposal');
const Session = require('../models/Session');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { validateMeetingUrl } = require('../utils/meetingValidator');

const addNotification = async (userId, message, type, link = '') => {
  await User.findByIdAndUpdate(userId, {
    $push: { notifications: { message, type, link, read: false } }
  });
};

// @route POST /api/proposals
router.post('/', protect, [
  body('receiver').notEmpty().withMessage('Receiver is required'),
  body('offeredSkill').trim().notEmpty().withMessage('Please specify what skill you offer'),
  body('requestedSkill').trim().notEmpty().withMessage('Please specify what skill you want to learn'),
  body('message').trim().isLength({ min: 10 }).withMessage('Message must be at least 10 characters')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }

    const { receiver, offeredSkill, requestedSkill, message, preferredTimes, skillOffer, skillRequest } = req.body;

    if (receiver === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot send a proposal to yourself' });
    }

    // Check for existing pending proposal
    const existing = await Proposal.findOne({
      sender: req.user._id,
      receiver,
      status: 'pending'
    });
    if (existing) {
      return res.status(400).json({ success: false, message: 'You already have a pending proposal with this user' });
    }

    const proposal = await Proposal.create({
      sender: req.user._id,
      receiver,
      offeredSkill,
      requestedSkill,
      message,
      preferredTimes: preferredTimes || [],
      skillOffer: skillOffer || null,
      skillRequest: skillRequest || null
    });

    await proposal.populate([
      { path: 'sender', select: 'name avatar college' },
      { path: 'receiver', select: 'name avatar college' }
    ]);

    // Notify receiver
    await addNotification(
      receiver,
      `${req.user.name} sent you a skill exchange proposal for "${requestedSkill}"`,
      'proposal',
      `/proposals`
    );

    res.status(201).json({ success: true, message: 'Proposal sent successfully', proposal });
  } catch (err) {
    next(err);
  }
});

// @route GET /api/proposals/sent
router.get('/sent', protect, async (req, res, next) => {
  try {
    const proposals = await Proposal.find({ sender: req.user._id })
      .populate('receiver', 'name avatar college year reputationScore')
      .populate('skillOffer', 'title category')
      .sort('-createdAt');
    res.json({ success: true, proposals });
  } catch (err) {
    next(err);
  }
});

// @route GET /api/proposals/received
router.get('/received', protect, async (req, res, next) => {
  try {
    const proposals = await Proposal.find({ receiver: req.user._id })
      .populate('sender', 'name avatar college year reputationScore')
      .populate('skillRequest', 'title category')
      .sort('-createdAt');
    res.json({ success: true, proposals });
  } catch (err) {
    next(err);
  }
});

// @route PUT /api/proposals/:id/accept
router.put('/:id/accept', protect, async (req, res, next) => {
  try {
    const proposal = await Proposal.findById(req.params.id)
      .populate('sender', 'name');

    if (!proposal) return res.status(404).json({ success: false, message: 'Proposal not found' });
    if (proposal.receiver.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    if (proposal.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Proposal is no longer pending' });
    }

    proposal.status = 'accepted';
    await proposal.save();

    // Create a session
    const { scheduledAt, duration, mode, location, meetLink } = req.body;
    let validatedLink = '';
    if (meetLink && meetLink.trim()) {
      const linkCheck = validateMeetingUrl(meetLink);
      if (!linkCheck.valid) {
        return res.status(400).json({ success: false, message: linkCheck.message });
      }
      validatedLink = linkCheck.url;
    }

    let session = null;
    if (scheduledAt) {
      session = await Session.create({
        proposal: proposal._id,
        participants: [proposal.sender._id, proposal.receiver],
        skill: `${proposal.requestedSkill} / ${proposal.offeredSkill}`,
        scheduledAt: new Date(scheduledAt),
        duration: duration || 60,
        mode: mode || (validatedLink ? 'Online' : 'Online'),
        location: location || '',
        meetLink: validatedLink
      });
    }

    // Notify sender
    await addNotification(
      proposal.sender._id,
      `${req.user.name} accepted your proposal! ${scheduledAt ? 'A session has been scheduled.' : 'Schedule a session now.'}`,
      'proposal',
      '/sessions'
    );

    res.json({ success: true, message: 'Proposal accepted', proposal, session });
  } catch (err) {
    next(err);
  }
});

// @route PUT /api/proposals/:id/reject
router.put('/:id/reject', protect, async (req, res, next) => {
  try {
    const proposal = await Proposal.findById(req.params.id);
    if (!proposal) return res.status(404).json({ success: false, message: 'Proposal not found' });
    if (proposal.receiver.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    if (proposal.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Proposal is no longer pending' });
    }

    proposal.status = 'rejected';
    proposal.rejectionReason = req.body.reason || '';
    await proposal.save();

    await addNotification(
      proposal.sender,
      `${req.user.name} declined your proposal for "${proposal.requestedSkill}"`,
      'proposal',
      '/proposals'
    );

    res.json({ success: true, message: 'Proposal rejected', proposal });
  } catch (err) {
    next(err);
  }
});

// @route PUT /api/proposals/:id/cancel
router.put('/:id/cancel', protect, async (req, res, next) => {
  try {
    const proposal = await Proposal.findById(req.params.id);
    if (!proposal) return res.status(404).json({ success: false, message: 'Proposal not found' });
    if (proposal.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    if (!['pending', 'accepted'].includes(proposal.status)) {
      return res.status(400).json({ success: false, message: 'Cannot cancel this proposal' });
    }

    proposal.status = 'cancelled';
    proposal.cancelReason = req.body.reason || '';
    await proposal.save();

    await addNotification(
      proposal.receiver,
      `${req.user.name} cancelled their proposal`,
      'proposal',
      '/proposals'
    );

    res.json({ success: true, message: 'Proposal cancelled', proposal });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
