import express from "express";
import { register, login, getProfile, verifyOTP, resendOTP, updateProfile } from "../Controllers/auth.js";
import { authMiddleware } from "../Middlewares/auth.js";

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/verify-otp', verifyOTP);
router.post('/resend-otp', resendOTP);
router.post('/login', login);

// Protected routes
router.get('/me', authMiddleware, getProfile);
router.put('/profile', authMiddleware, updateProfile);

export default router;
