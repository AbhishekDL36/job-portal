
// Backend Job Model
import mongoose from 'mongoose'

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  location: String,
  salary: {
    min: Number,
    max: Number,
  },
  jobType: {
    type: String,
    enum: ['full-time', 'part-time', 'contract', 'remote'],
    default: 'full-time',
  },
  skills: [String],
  experience: String,
  
  // Foreign key reference
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  companyName: String,
  companyLogo: String,

  applicants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],

  status: {
    type: String,
    enum: ['active', 'closed'],
    default: 'active',
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model('Job', jobSchema);
