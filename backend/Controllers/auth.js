import User from "../Models/user.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { sendOTPEmail } from "../Services/emailService.js";

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function register(req, res) {
  try {
    const { name, email, password, userType, companyName, skills, idToken } = req.body;

    console.log('📝 Registration attempt:', { name, email, userType, companyName: userType === 'employer' ? companyName : 'N/A', isFirebaseAuth: !!idToken });

    // Validation
    if (!name || !email || !password || !userType) {
      console.log('❌ Missing required fields');
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (!['job_seeker', 'employer'].includes(userType)) {
      console.log('❌ Invalid userType:', userType);
      return res.status(400).json({ message: 'Invalid userType' });
    }

    if (userType === 'employer' && !companyName) {
      console.log('❌ Employer without company name');
      return res.status(400).json({ message: 'Company name is required for employers' });
    }

    // Check if user exists
    let user = await User.findOne({ email });
    if (user) {
      console.log('❌ User already exists:', email);
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password (or use Firebase token directly)
    let hashedPassword;
    if (idToken) {
      // Firebase auth - store the token as password placeholder
      hashedPassword = idToken;
      console.log('🔐 Using Firebase authentication');
    } else {
      const salt = await bcrypt.genSalt(10);
      hashedPassword = await bcrypt.hash(password, salt);
    }

    // Generate OTP
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    console.log('🔐 OTP generated:', otp);

    // Create user
    user = new User({
      name,
      email,
      password: hashedPassword,
      userType,
      companyName: userType === 'employer' ? companyName : null,
      skills: userType === 'job_seeker' ? (skills || []) : [],
      otp,
      otpExpiry,
      isEmailVerified: idToken ? true : false, // Auto-verify Firebase users
      isGoogleAuth: idToken ? true : false, // Mark as Google user
    });

    console.log('💾 Saving user to database...');
    await user.save();

    // Send OTP email only if not Firebase auth (Firebase users are auto-verified)
    if (!idToken) {
      console.log('📧 Sending OTP email to:', email);
      await sendOTPEmail(email, otp);
    } else {
      console.log('✅ Firebase user auto-verified, skipping OTP');
    }

    console.log('✅ Registration successful:', email);
    
    // For Firebase users, generate JWT token immediately (no OTP needed)
    let responseData = {
      message: idToken ? 'User registered successfully with Google!' : 'User registered successfully. Please verify your email with the OTP sent to your email.',
      email,
      requiresOTP: !idToken,
    };

    if (idToken) {
      const token = jwt.sign(
        { userId: user._id, userType: user.userType },
        JWT_SECRET,
        { expiresIn: '7d' }
      );
      responseData.token = token;
      responseData.user = {
        id: user._id,
        name: user.name,
        email: user.email,
        userType: user.userType,
        isEmailVerified: user.isEmailVerified,
      };
    }

    res.status(201).json(responseData);
  } catch (error) {
    console.error('❌ Registration error:', error.message);
    console.error('   Stack:', error.stack);
    res.status(500).json({ message: error.message });
  }
}

export async function verifyOTP(req, res) {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if already verified
    if (user.isEmailVerified) {
      return res.status(400).json({ message: 'Email already verified' });
    }

    // Check OTP expiry
    if (!user.otpExpiry || new Date() > user.otpExpiry) {
      return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
    }

    // Check OTP attempts
    if (user.otpAttempts >= 5) {
      return res.status(400).json({ message: 'Too many failed attempts. Please request a new OTP.' });
    }

    // Check OTP
    if (user.otp !== otp) {
      user.otpAttempts += 1;
      await user.save();
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    // Mark email as verified
    user.isEmailVerified = true;
    user.otp = null;
    user.otpExpiry = null;
    user.otpAttempts = 0;
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, userType: user.userType },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Email verified successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        userType: user.userType,
        isEmailVerified: user.isEmailVerified,
      },
    });
  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({ message: error.message });
  }
}

export async function resendOTP(req, res) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ message: 'Email is already verified' });
    }

    // Generate new OTP
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    user.otp = otp;
    user.otpExpiry = otpExpiry;
    user.otpAttempts = 0; // Reset attempts
    await user.save();

    // Send OTP email
    await sendOTPEmail(email, otp);

    res.json({
      message: 'New OTP sent to your email',
      email,
    });
  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({ message: error.message });
  }
}

export async function login(req, res) {
  try {
    const { email, password, isGoogleAuth } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required' });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check email verification
    if (!user.isEmailVerified) {
      return res.status(403).json({
        message: 'Please verify your email first',
        email: user.email,
        requiresVerification: true,
      });
    }

    // Handle Google Auth users
    if (isGoogleAuth) {
      // For Google users, just verify they exist and are verified
      // Firebase has already authenticated them
      console.log('🔐 Google auth login for:', email);
    } else {
      // For traditional users, verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }
    }

    // Generate token
    const token = jwt.sign(
      { userId: user._id, userType: user.userType },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        userType: user.userType,
        isEmailVerified: user.isEmailVerified,
        isGoogleAuth: user.isGoogleAuth,
        ...(user.userType === 'employer' && { companyName: user.companyName }),
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: error.message });
  }
}

export async function getProfile(req, res) {
  try {
    const user = await User.findById(req.userId).select('-password -otp -otpExpiry');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: error.message });
  }
}

export async function updateProfile(req, res) {
  try {
    const { name, phone, location, skills, experience, companyDescription, industry, companySize, companyWebsite } = req.body;

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update common fields
    if (name) user.name = name;
    if (phone) user.phone = phone;

    // Update job seeker specific fields
    if (user.userType === 'job_seeker') {
      if (location) user.location = location;
      if (skills) user.skills = skills;
      if (experience) user.experience = experience;
    }

    // Update employer specific fields
    if (user.userType === 'employer') {
      if (companyDescription) user.companyDescription = companyDescription;
      if (industry) user.industry = industry;
      if (companySize) user.companySize = companySize;
      if (companyWebsite) user.companyWebsite = companyWebsite;
    }

    await user.save();

    res.json({
      message: 'Profile updated successfully',
      user: user.toObject(),
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: error.message });
  }
}
