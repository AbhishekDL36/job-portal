import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export function authMiddleware(req, res, next) {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    req.userType = decoded.userType;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

export function employerOnly(req, res, next) {
  if (req.userType !== 'employer') {
    return res.status(403).json({ message: 'Only employers can access this resource' });
  }
  next();
}

export function jobSeekerOnly(req, res, next) {
  if (req.userType !== 'job_seeker') {
    return res.status(403).json({ message: 'Only job seekers can access this resource' });
  }
  next();
}

export function emailVerifiedOnly(req, res, next) {
  if (!req.user?.isEmailVerified) {
    return res.status(403).json({ message: 'Please verify your email first' });
  }
  next();
}

export { JWT_SECRET };
