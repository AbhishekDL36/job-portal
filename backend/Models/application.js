import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true,
  },
  coverLetter: String,
  resume: String,
  status: {
    type: String,
    enum: ['applied', 'shortlisted', 'rejected', 'accepted'],
    default: 'applied',
  },
  appliedAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model('Application', applicationSchema);
