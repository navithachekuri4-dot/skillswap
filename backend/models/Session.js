const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  proposal: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Proposal',
    required: true
  },
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  skill: {
    type: String,
    required: true
  },
  scheduledAt: {
    type: Date,
    required: true
  },
  duration: {
    type: Number, // minutes
    default: 60
  },
  mode: {
    type: String,
    enum: ['Online', 'In-Person'],
    default: 'Online'
  },
  location: {
    type: String,
    default: ''
  },
  meetLink: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['upcoming', 'ongoing', 'completed', 'cancelled', 'rescheduled'],
    default: 'upcoming'
  },
  completedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  cancelReason: {
    type: String,
    default: ''
  },
  cancelledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  rescheduleHistory: [{
    previousDate: Date,
    newDate: Date,
    reason: String,
    rescheduledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    at: { type: Date, default: Date.now }
  }],
  notes: {
    type: String,
    default: ''
  },
  isDemo: {
    type: Boolean,
    default: false
  },
  navithaActivity: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

sessionSchema.index({ participants: 1, status: 1 });
sessionSchema.index({ scheduledAt: 1 });

module.exports = mongoose.model('Session', sessionSchema);
