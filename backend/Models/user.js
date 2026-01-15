// Backend User Model
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  userType: {
    type: String,
    enum: ['job_seeker', 'employer'],
    required: true,
  },
  // Job Seeker specific fields
  resume: String,
  skills: [String],
  experience: String,
  location: String,
  phone: String,

  // Employer specific fields
  companyName: String,
  companyDescription: String,
  industry: String,
  companySize: String,
  companyWebsite: String,
  companyCategory: {
    type: String,
    enum: ['top', 'featured', 'startup', 'regular'],
    default: 'regular',
  },
  isVerified: {
    type: Boolean,
    default: false,
  },

  // Password reset fields
  resetToken: String,
  resetTokenExpiry: Date,

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default  mongoose.model('User', userSchema);
