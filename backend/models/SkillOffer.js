const mongoose = require('mongoose');

const skillOfferSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['Programming', 'Design', 'Mathematics', 'Science', 'Language', 'Music', 'Sports', 'Art', 'Business', 'Writing', 'Photography', 'Cooking', 'Other']
  },
  level: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
    default: 'Intermediate'
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  tags: [String],
  sessionDuration: {
    type: Number, // in minutes
    default: 60,
    min: 30,
    max: 180
  },
  preferredMode: {
    type: String,
    enum: ['Online', 'In-Person', 'Both'],
    default: 'Both'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  views: {
    type: Number,
    default: 0
  },
  proposalsReceived: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

skillOfferSchema.index({ user: 1, category: 1 });
skillOfferSchema.index({ title: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('SkillOffer', skillOfferSchema);
