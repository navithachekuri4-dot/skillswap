const express = require('express');
const router = express.Router();
const Session = require('../models/Session');
const Proposal = require('../models/Proposal');
const SkillOffer = require('../models/SkillOffer');
const SkillRequest = require('../models/SkillRequest');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// @route GET /api/dashboard
router.get('/', protect, async (req, res, next) => {
  try {
    const userId = req.user._id;

    const [
      totalUpcomingSessions,
      upcomingSessions,
      pendingProposalsReceived,
      pendingProposalsSent,
      completedSessions,
      myOffers,
      myRequests
    ] = await Promise.all([
      Session.countDocuments({ participants: userId, status: { $in: ['upcoming', 'rescheduled'] } }),
      Session.find({ participants: userId, status: { $in: ['upcoming', 'rescheduled'] } })
        .populate('participants', 'name avatar college isDemo')
        .sort('scheduledAt')
        .limit(3),
      Proposal.countDocuments({ receiver: userId, status: 'pending' }),
      Proposal.countDocuments({ sender: userId, status: 'pending' }),
      Session.countDocuments({ participants: userId, status: 'completed' }),
      SkillOffer.countDocuments({ user: userId, isActive: true }),
      SkillRequest.countDocuments({ user: userId, isActive: true })
    ]);

    // Compute complementary peer matches
    const { calculateMatch } = require('../utils/matching');
    const currentUser = await User.findById(userId);

    const peers = await User.find({
      _id: { $ne: userId },
      isActive: true
    })
      .select('name college year bio avatar skillsOffered skillsNeeded availability reputationScore totalReviews completedSessions isDemo profileComplete')
      .lean();

    const scoredMatches = peers.map(peer => {
      const match = calculateMatch(currentUser, peer);
      return {
        ...peer,
        matchScore: match.score,
        matchReason: match.reason,
        matchType: match.matchType,
        matchedSkills: match.matchedSkills
      };
    })
    .sort((a, b) => b.matchScore - a.matchScore || b.profileComplete - a.profileComplete)
    .slice(0, 6);

    const matches = scoredMatches;

    res.json({
      success: true,
      data: {
        stats: {
          upcomingSessions: totalUpcomingSessions,
          pendingProposalsReceived,
          pendingProposalsSent,
          completedSessions,
          myOffers,
          myRequests,
          reputationScore: currentUser.reputationScore,
          totalReviews: currentUser.totalReviews,
          profileComplete: currentUser.profileComplete
        },
        upcomingSessions,
        recommendedMatches: matches,
        unreadNotifications: currentUser.notifications.filter(n => !n.read).length
      }
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
