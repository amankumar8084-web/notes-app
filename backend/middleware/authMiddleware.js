const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
    // Get token from header
    const authHeader = req.headers.authorization;

    // Check if token exists
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ 
            message: "No token, authorization denied" 
        });
    }

    try {
        // Extract token (remove "Bearer " prefix)
        const token = authHeader.split(" ")[1];
        
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Add user to request object
        req.user = decoded;
        next();
    } catch (error) {
        console.error("Token verification error:", error.message);
        res.status(401).json({ 
            message: "Token is not valid" 
        });
    }
};

module.exports = authMiddleware;