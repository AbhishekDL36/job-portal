import express from "express";
import {
  getMyJobs,
  getAllJobs,
  getJobById,
  postJob,
  updateJob,
  deleteJob,
  searchJobs,
} from "../Controllers/Job.js";
import { authMiddleware, employerOnly } from "../Middlewares/auth.js";

const router = express.Router();

// Public routes
router.get('/', getAllJobs);
router.get('/search', searchJobs);
router.get('/:id', getJobById);

// Protected routes
router.post('/', authMiddleware, employerOnly, postJob);
router.get('/user/my-jobs', authMiddleware, employerOnly, getMyJobs);
router.put('/:id', authMiddleware, employerOnly, updateJob);
router.delete('/:id', authMiddleware, employerOnly, deleteJob);

export default router;
