const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Session = require('../models/Session');
const Review = require('../models/Review');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { validateMeetingUrl } = require('../utils/meetingValidator');

const addNotification = async (userId, message, type, link = '') => {
  await User.findByIdAndUpdate(userId, {
    $push: { notifications: { message, type, link, read: false } }
  });
};

// @route GET /api/sessions
router.get('/', protect, async (req, res, next) => {
  try {
    const { status } = req.query;
    let query = { participants: req.user._id };
    if (status) query.status = status;

    const sessions = await Session.find(query)
      .populate('participants', 'name avatar college year reputationScore')
      .populate('proposal', 'offeredSkill requestedSkill')
      .sort('scheduledAt');

    res.json({ success: true, sessions });
  } catch (err) {
    next(err);
  }
});

// @route POST /api/sessions
router.post('/', protect, [
  body('proposal').notEmpty().withMessage('Proposal ID required'),
  body('participants').isArray().withMessage('Participants required'),
  body('skill').trim().notEmpty().withMessage('Skill is required'),
  body('scheduledAt').notEmpty().withMessage('Schedule date required')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }

    const { proposal, participants, skill, scheduledAt, duration, mode, location, meetLink } = req.body;
    let validatedLink = '';
    if (meetLink && meetLink.trim()) {
      const linkCheck = validateMeetingUrl(meetLink);
      if (!linkCheck.valid) {
        return res.status(400).json({ success: false, message: linkCheck.message });
      }
      validatedLink = linkCheck.url;
    }

    const session = await Session.create({
      proposal,
      participants,
      skill,
      scheduledAt,
      duration,
      mode: mode || (validatedLink ? 'Online' : 'Online'),
      location: location || '',
      meetLink: validatedLink
    });
    await session.populate('participants', 'name avatar college year');

    // Notify other participant
    const otherId = session.participants.find(p => p._id.toString() !== req.user._id.toString());
    if (otherId) {
      await addNotification(
        otherId._id,
        `A session for "${session.skill}" has been scheduled for ${new Date(session.scheduledAt).toLocaleDateString()}`,
        'session',
        '/sessions'
      );
    }

    res.status(201).json({ success: true, message: 'Session scheduled', session });
  } catch (err) {
    next(err);
  }
});

// @route GET /api/sessions/:id
router.get('/:id', protect, async (req, res, next) => {
  try {
    const session = await Session.findById(req.params.id)
      .populate('participants', 'name avatar college year reputationScore')
      .populate('proposal');

    if (!session) return res.status(404).json({ success: false, message: 'Session not found' });

    const isParticipant = session.participants.some(p => p._id.toString() === req.user._id.toString());
    if (!isParticipant) return res.status(403).json({ success: false, message: 'Not authorized' });

    // Get reviews for this session
    const reviews = await Review.find({ session: session._id }).populate('reviewer', 'name avatar');

    res.json({ success: true, session, reviews });
  } catch (err) {
    next(err);
  }
});

// @route PUT /api/sessions/:id/complete
router.put('/:id/complete', protect, async (req, res, next) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) return res.status(404).json({ success: false, message: 'Session not found' });

    const isParticipant = session.participants.some(p => p.toString() === req.user._id.toString());
    if (!isParticipant) return res.status(403).json({ success: false, message: 'Not authorized' });

    if (session.completedBy.includes(req.user._id)) {
      return res.status(400).json({ success: false, message: 'You already marked this session as complete' });
    }

    session.completedBy.push(req.user._id);

    // If both users marked complete
    if (session.completedBy.length >= 2) {
      session.status = 'completed';

      // Update both users completed sessions count
      await User.updateMany(
        { _id: { $in: session.participants } },
        { $inc: { completedSessions: 1 } }
      );

      // Notify both to leave review
      for (const participantId of session.participants) {
        const otherId = session.participants.find(p => p.toString() !== participantId.toString());
        if (otherId) {
          await addNotification(
            participantId,
            `Session completed! Please leave a review for your partner.`,
            'review',
            `/sessions/${session._id}`
          );
        }
      }
    }

    await session.save();

    res.json({ success: true, message: session.status === 'completed' ? 'Session marked as completed by both!' : 'Marked complete. Waiting for other participant.', session });
  } catch (err) {
    next(err);
  }
});

// @route PUT /api/sessions/:id/cancel
router.put('/:id/cancel', protect, async (req, res, next) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) return res.status(404).json({ success: false, message: 'Session not found' });

    const isParticipant = session.participants.some(p => p.toString() === req.user._id.toString());
    if (!isParticipant) return res.status(403).json({ success: false, message: 'Not authorized' });

    if (session.status !== 'upcoming') {
      return res.status(400).json({ success: false, message: 'Can only cancel upcoming sessions' });
    }

    session.status = 'cancelled';
    session.cancelReason = req.body.reason || '';
    session.cancelledBy = req.user._id;
    await session.save();

    // Notify other participant
    const otherId = session.participants.find(p => p.toString() !== req.user._id.toString());
    if (otherId) {
      await addNotification(
        otherId,
        `${req.user.name} cancelled the session scheduled for ${new Date(session.scheduledAt).toLocaleDateString()}`,
        'session',
        '/sessions'
      );
    }

    res.json({ success: true, message: 'Session cancelled', session });
  } catch (err) {
    next(err);
  }
});

// @route PUT /api/sessions/:id/reschedule
router.put('/:id/reschedule', protect, [
  body('newDate').notEmpty().withMessage('New date is required'),
  body('reason').trim().notEmpty().withMessage('Please provide a reason for rescheduling')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }

    const session = await Session.findById(req.params.id);
    if (!session) return res.status(404).json({ success: false, message: 'Session not found' });

    const isParticipant = session.participants.some(p => p.toString() === req.user._id.toString());
    if (!isParticipant) return res.status(403).json({ success: false, message: 'Not authorized' });

    if (!['upcoming', 'rescheduled'].includes(session.status)) {
      return res.status(400).json({ success: false, message: 'Cannot reschedule this session' });
    }

    const { newDate, reason, meetLink } = req.body;

    session.rescheduleHistory.push({
      previousDate: session.scheduledAt,
      newDate: new Date(newDate),
      reason,
      rescheduledBy: req.user._id
    });
    session.scheduledAt = new Date(newDate);
    session.status = 'rescheduled';
    if (meetLink && meetLink.trim()) {
      const linkCheck = validateMeetingUrl(meetLink);
      if (!linkCheck.valid) {
        return res.status(400).json({ success: false, message: linkCheck.message });
      }
      session.meetLink = linkCheck.url;
    }

    await session.save();

    const otherId = session.participants.find(p => p.toString() !== req.user._id.toString());
    if (otherId) {
      await addNotification(
        otherId,
        `${req.user.name} rescheduled your session to ${new Date(newDate).toLocaleDateString()}. Reason: ${reason}`,
        'session',
        '/sessions'
      );
    }

    res.json({ success: true, message: 'Session rescheduled', session });
  } catch (err) {
    next(err);
  }
});

// @route PUT /api/sessions/:id/meeting-link
router.put('/:id/meeting-link', protect, async (req, res, next) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) return res.status(404).json({ success: false, message: 'Session not found' });

    const isParticipant = session.participants.some(p => p.toString() === req.user._id.toString());
    if (!isParticipant) {
      return res.status(403).json({ success: false, message: 'Not authorized: only session participants can update the meeting link' });
    }

    if (session.status === 'completed' || session.status === 'cancelled') {
      return res.status(400).json({ success: false, message: 'Cannot update meeting link for completed or cancelled sessions' });
    }

    const { meetLink } = req.body;
    const validation = validateMeetingUrl(meetLink);
    if (!validation.valid) {
      return res.status(400).json({ success: false, message: validation.message });
    }

    session.meetLink = validation.url;
    session.mode = 'Online';
    await session.save();

    await session.populate('participants', 'name avatar college year reputationScore');
    await session.populate('proposal', 'offeredSkill requestedSkill');

    // Notify other participant
    const otherId = session.participants.find(p => p._id.toString() !== req.user._id.toString());
    if (otherId) {
      await addNotification(
        otherId._id,
        `${req.user.name} updated the ${validation.provider} meeting link for your "${session.skill}" session`,
        'session',
        '/sessions'
      );
    }

    res.json({
      success: true,
      message: `${validation.provider} link saved successfully!`,
      session
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
