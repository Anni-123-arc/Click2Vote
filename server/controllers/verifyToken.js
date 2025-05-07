const jwt = require('jsonwebtoken'); // Corrected typo

const KEY = "voting"; // Secret key for JWT

function verifyToken(req, res, next) {
    // Extract token from the Authorization header
    const token = req.headers['authorization']?.split(' ')[1]; // Split and get token part
    if (!token) {
        return res.status(403).json({
            status: false,
            message: "Token not provided"
        });
    }
 
    try { 
        // Verify token and decode payload
        const decodedToken = jwt.verify(token, KEY);

        // Optionally, you can check if specific fields are valid from the token
        // But usually, you don't need to revalidate email, password in token
        // const { voterID, email, password } = req.body;

        // Proceed to next middleware or route handler
        req.user = decodedToken; // Attach decoded token to the request object
        next(); // Pass control to the next middleware or route handler

    } catch (err) {
        // Handle error if token is invalid or expired
        return res.status(403).json({
            status: false,
            message: "Invalid token or your sessions i expired"
        });
    }
}

module.exports = {
    verifyToken
};