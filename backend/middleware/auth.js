// backend/middleware/auth.js
const { getAuth } = require("firebase-admin/auth"); // Import modular auth

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    // 1. Safely check if the header exists
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }

    // 2. Extract the token
    const token = authHeader.split(' ')[1];

    // 3. Safely check token length (prevents the length undefined error)
    if (!token || token.length === 0) {
      return res.status(401).json({ error: 'Unauthorized: Token is empty' });
    }

    // 4. Verify the token using getAuth() instead of admin.auth()
    const decodedToken = await getAuth().verifyIdToken(token);
    req.user = decodedToken;
    next();
    
  } catch (error) {
    console.error('❌ Token verification error:', error.message);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

module.exports = authMiddleware;