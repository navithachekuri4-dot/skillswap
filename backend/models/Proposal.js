const mongoose = require('mongoose');

const proposalSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  skillOffer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SkillOffer',
    default: null
  },
  skillRequest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SkillRequest',
    default: null
  },
  // What the sender offers in exchange
  offeredSkill: {
    type: String,
    required: [true, 'You must specify what skill you offer in return']
  },
  // What the sender wants to learn
  requestedSkill: {
    type: String,
    required: [true, 'You must specify what skill you want to learn']
  },
  message: {
    type: String,
    required: [true, 'Please include a message with your proposal'],
    maxlength: [500, 'Message cannot exceed 500 characters']
  },
  preferredTimes: [{
    date: Date,
    timeSlot: String
  }],
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'cancelled', 'completed'],
    default: 'pending'
  },
  rejectionReason: {
    type: String,
    default: ''
  },
  cancelReason: {
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

proposalSchema.index({ sender: 1, status: 1 });
proposalSchema.index({ receiver: 1, status: 1 });

module.exports = mongoose.model('Proposal', proposalSchema);
