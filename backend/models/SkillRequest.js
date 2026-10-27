const mongoose = require('mongoose');

const skillRequestSchema = new mongoose.Schema({
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
  currentLevel: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    default: 'Beginner'
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  urgency: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Medium'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  offersReceived: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

skillRequestSchema.index({ user: 1, category: 1 });
skillRequestSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('SkillRequest', skillRequestSchema);
