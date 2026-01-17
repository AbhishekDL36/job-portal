import express from 'express';
import {
  saveResume,
  getResume,
  deleteResume,
  calculateJobMatchScore,
  getResumeSuggestions,
} from '../Controllers/resume.js';
import { authMiddleware, jobSeekerOnly } from '../Middlewares/auth.js';

const router = express.Router();

// All routes require authentication and job seeker role
router.use(authMiddleware);
router.use(jobSeekerOnly);

// Resume CRUD
router.post('/', saveResume);
router.get('/', getResume);
router.delete('/', deleteResume);

// Resume scoring and suggestions
router.get('/suggestions', getResumeSuggestions);
router.get('/match/:jobId', calculateJobMatchScore);

export default router;
