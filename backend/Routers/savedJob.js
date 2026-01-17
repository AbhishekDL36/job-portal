import express from "express";
import {
  getSavedJobs,
  saveJob,
  unsaveJob,
  isJobSaved,
  getSavedJobsCount,
} from "../Controllers/savedJob.js";
import { authMiddleware, jobSeekerOnly } from "../Middlewares/auth.js";

const router = express.Router();

// Protected routes - Job seeker only
router.get('/', authMiddleware, jobSeekerOnly, getSavedJobs);
router.get('/count', authMiddleware, jobSeekerOnly, getSavedJobsCount);
router.post('/:jobId/save', authMiddleware, jobSeekerOnly, saveJob);
router.delete('/:jobId', authMiddleware, jobSeekerOnly, unsaveJob);
router.get('/:jobId/check', authMiddleware, jobSeekerOnly, isJobSaved);

export default router;