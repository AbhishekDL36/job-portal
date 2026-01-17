import express from "express";
import {
  applyJob,
  checkApplications,
  getUserApplications,
  updateApplicationStatus,
  getApplicationStats,
} from "../Controllers/application.js";
import { authMiddleware, employerOnly, jobSeekerOnly } from "../Middlewares/auth.js";

const router = express.Router();

// Job seeker routes
router.post('/:jobId/apply', authMiddleware, jobSeekerOnly, applyJob);
router.get('/user/my-applications', authMiddleware, jobSeekerOnly, getUserApplications);

// Employer routes
router.get('/user/check-applications', authMiddleware, employerOnly, checkApplications);
router.put('/:applicationId/status', authMiddleware, employerOnly, updateApplicationStatus);
router.get('/user/stats', authMiddleware, employerOnly, getApplicationStats);

export default router;
