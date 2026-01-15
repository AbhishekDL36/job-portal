import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET

export default async function auth(req, res, next)  {
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
    res.status(401).json({ message: 'Invalid token' });
  }
};


