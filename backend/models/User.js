const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  college: {
    type: String,
    default: ''
  },
  year: {
    type: String,
    enum: ['1st Year', '2nd Year', '3rd Year', '4th Year', 'First Year', 'Second Year', 'Third Year', 'Fourth Year', 'Postgraduate', 'PhD', ''],
    default: ''
  },
  bio: {
    type: String,
    maxlength: [300, 'Bio cannot exceed 300 characters'],
    default: ''
  },
  avatar: {
    type: String,
    default: ''
  },
  skillsOffered: [{
    name: { type: String, required: true },
    category: { type: String, default: 'General' },
    level: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'], default: 'Intermediate' },
    description: { type: String, default: '' }
  }],
  skillsNeeded: [{
    name: { type: String, required: true },
    category: { type: String, default: 'General' },
    level: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'], default: 'Beginner' }
  }],
  availability: {
    weekdays: { type: Boolean, default: false },
    weekends: { type: Boolean, default: false },
    mornings: { type: Boolean, default: false },
    afternoons: { type: Boolean, default: false },
    evenings: { type: Boolean, default: false }
  },
  reputationScore: {
    type: Number,
    default: 0
  },
  totalReviews: {
    type: Number,
    default: 0
  },
  completedSessions: {
    type: Number,
    default: 0
  },
  notifications: [{
    message: String,
    type: { type: String, enum: ['proposal', 'session', 'review', 'system'], default: 'system' },
    read: { type: Boolean, default: false },
    link: String,
    createdAt: { type: Date, default: Date.now }
  }],
  profileComplete: {
    type: Number,
    default: 20
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isDemo: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

// Hash password before save
userSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

// Compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Calculate profile completeness
userSchema.methods.calculateProfileComplete = function() {
  let score = 20; // base for name+email
  if (this.college) score += 15;
  if (this.year) score += 10;
  if (this.bio) score += 15;
  if (this.skillsOffered.length > 0) score += 20;
  if (this.skillsNeeded.length > 0) score += 10;
  const avail = this.availability;
  if (avail.weekdays || avail.weekends || avail.mornings || avail.afternoons || avail.evenings) score += 10;
  return Math.min(score, 100);
};

module.exports = mongoose.model('User', userSchema);
