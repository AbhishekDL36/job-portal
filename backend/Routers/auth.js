import express from "express";
import login, { getProfile, register } from "../Controllers/auth.js";
const router = express.Router()


router.post('/register', register);
router.post('/login',login );
router.get('/me',getProfile );

export default router;
