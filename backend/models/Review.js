const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  session: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Session',
    required: true
  },
  reviewer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reviewee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: 1,
    max: 5
  },
  feedback: {
    type: String,
    maxlength: [400, 'Feedback cannot exceed 400 characters'],
    default: ''
  },
  skillReviewed: {
    type: String,
    default: ''
  },
  tags: [{
    type: String,
    enum: ['Knowledgeable', 'Patient', 'Punctual', 'Helpful', 'Clear Explanation', 'Friendly', 'Well Prepared']
  }],
  isDemo: {
    type: Boolean,
    default: false
  },
  navithaActivity: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

// Prevent double reviews per session per reviewer
reviewSchema.index({ session: 1, reviewer: 1 }, { unique: true });
reviewSchema.index({ reviewee: 1 });

module.exports = mongoose.model('Review', reviewSchema);
