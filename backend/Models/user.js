
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
  // Email verification
  isEmailVerified: {
    type: Boolean,
    default: false,
  },
  otp: String,
  otpExpiry: Date,
  otpAttempts: {
    type: Number,
    default: 0,
  },

  // Google Auth Flag
  isGoogleAuth: {
    type: Boolean,
    default: false,
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

  
  resetToken: String,
  resetTokenExpiry: Date,

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default  mongoose.model('User', userSchema);
