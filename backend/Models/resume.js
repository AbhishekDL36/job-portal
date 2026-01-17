import mongoose from 'mongoose';

const resumeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    default: 'My Resume',
  },
  personalInfo: {
    fullName: String,
    email: String,
    phone: String,
    location: String,
    website: String,
    linkedin: String,
  },
  summary: {
    type: String,
    maxLength: 500,
  },
  experience: [
    {
      jobTitle: String,
      company: String,
      location: String,
      startDate: Date,
      endDate: Date,
      currentlyWorking: Boolean,
      description: String,
    },
  ],
  education: [
    {
      degree: String,
      institution: String,
      fieldOfStudy: String,
      startDate: Date,
      endDate: Date,
      score: String,
      description: String,
    },
  ],
  skills: [
    {
      skill: String,
      proficiency: {
        type: String,
        enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
      },
    },
  ],
  certifications: [
    {
      name: String,
      issuer: String,
      issueDate: Date,
      expirationDate: Date,
      credentialUrl: String,
    },
  ],
  projects: [
    {
      projectName: String,
      description: String,
      link: String,
      technologies: [String],
    },
  ],
  languages: [
    {
      language: String,
      proficiency: {
        type: String,
        enum: ['Basic', 'Intermediate', 'Fluent', 'Native'],
      },
    },
  ],
  atsScore: {
    type: Number,
    default: 0,
  },
  suggestions: [String],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model('Resume', resumeSchema);
