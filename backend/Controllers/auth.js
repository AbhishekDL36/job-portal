import User from "../Models/user.js";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
 export async function register (req, res){
  try {
    const { name, email, password, userType, companyName } = req.body;

   
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    
    user = new User({
      name,
      email,
      password: hashedPassword,
      userType,
      companyName: userType === 'employer' ? companyName : null,
    });

    await user.save();
const token = jwt.sign({ userId: user._id, userType: user.userType }, JWT_SECRET, {
      expiresIn: '7d',
    });

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: { id: user._id, name: user.name, email: user.email, userType: user.userType },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export default async function login(req, res) {
  try {
    const { email, password } = req.body;

  
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required' });
    }


    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }


    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }


    const token = jwt.sign({ userId: user._id, userType: user.userType }, JWT_SECRET, {
      expiresIn: '7d',
    });

    res.json({
      message: 'Login successful',
      token,
      user: { id: user._id, name: user.name, email: user.email, userType: user.userType },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}


export async function getProfile(req, res) {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');

    res.json(user);
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
}