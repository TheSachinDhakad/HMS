import jwt from 'jsonwebtoken';
import { ApiError } from '../utils/ApiError.js';

// Middleware to verify the access token and decode user data
export const verifyAccessToken = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return next(new ApiError(401, "Access token is missing or invalid"));
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        console.log("Decoded user from token:", decoded); // Log the decoded user

        req.user = decoded; // Attach decoded user data to the request object

        console.log("User attached to req.user:", req.user); // Log the attached user data

        next();
    } catch (error) {
        return next(new ApiError(403, "Invalid or expired access token"));
    }
};




// Middleware to authorize admin role
export const authorizeAdmin = (req, res, next) => {

    console.log("User role in authorizeAdmin:", req.user?.role);

    // Ensure the user is an admin
    if (req.user?.role !== "admin") {
        return res.status(403).json({ message: "Access denied. Admins only." });
    }

    next();
};
