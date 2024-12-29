import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import bcrypt from "bcrypt";

// Generate Access and Refresh Tokens
export const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        throw new Error("Error generating access and refresh tokens");
    }
};

export const registerUser = async (req, res, next) => {
    try {
        console.log("Request body:", req.body); // Log the incoming request body

        const { fullName, email, username, password, role, phone } = req.body;

        // Validate required fields
        if ([fullName, email, username, password].some((field) => !field?.trim())) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Restrict "staff" and "admin" roles creation to admins
        if (role && ["staff", "admin"].includes(role)) {
            return res
                .status(403)
                .json({ message: "Only an admin can create staff or admin accounts" });
        }

        // Check if user exists
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            return res.status(409).json({ message: "Email or username already exists" });
        }

        // Set role to 'user' by default if not provided
        const userRole = role || "user";

        // Create the user
        const user = await User.create({ fullName, email, username, password, role: userRole, phone });

        // Generate access and refresh tokens
        const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);

        // Store refresh token in the database
        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return res.status(201).json(
            new ApiResponse(201, { user, accessToken }, "User registered successfully")
        );
    } catch (error) {
        console.error("Error in registerUser:", error);
        next(error);
    }
};

// Login User
export const loginUser = async (req, res) => {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user || !(await user.isPasswordCorrect(password))) {
        return res.status(401).json({ message: "Invalid email or password" });
    }

    // Generate access and refresh tokens
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);

    // Store refresh token in the database
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return res.status(200).json(
        new ApiResponse(200, { user, accessToken }, "Login successful")
    );
};

// Get User
export const getUser = async (req, res) => {
    const { id } = req.params;

    // Check if the user is trying to access their own profile
    if (req.user.id !== id) {
        return res.status(403).json({ message: "You can only access your own profile" });
    }

    const user = await User.findById(id).select("-password -refreshToken");
    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json(new ApiResponse(200, user, "User fetched successfully"));
};

// Update User
export const updateUser = async (req, res) => {
    const { id } = req.params;

    // Check if the user is trying to update their own profile
    if (req.user.id !== id) {
        return res.status(403).json({ message: "You can only update your own profile" });
    }

    const updates = req.body;

    if (updates.password) {
        updates.password = await bcrypt.hash(updates.password, 10);
    }

    const user = await User.findByIdAndUpdate(id, updates, { new: true });
    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json(new ApiResponse(200, user, "User updated successfully"));
};

// Delete User
export const deleteUser = async (req, res) => {
    const { id } = req.params;

    // Check if the user is trying to delete their own profile
    if (req.user.id !== id) {
        return res.status(403).json({ message: "You can only delete your own profile" });
    }

    const user = await User.findByIdAndDelete(id);
    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json(new ApiResponse(200, user, "User deleted successfully"));
};


export const getCurrentUser = async (req, res) => {
    return res
        .status(200)
        .json(new ApiResponse(200, req.user, "User fetched successfully"));
};


// staff user create 


export const createStaffUser = async (req, res, next) => {
    try {
        const { fullName, email, username, password, role, phone } = req.body;

        // Validate required fields
        if ([fullName, email, username, password, role].some((field) => !field?.trim())) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Only allow "admin" to create "staff" or "admin" roles
        if (req.user.role !== "admin") {
            return res.status(403).json({ message: "Only admins can create staff or admin users" });
        }

        // Check if user exists
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            return res.status(409).json({ message: "Email or username already exists" });
        }

        // Create the user
        const user = await User.create({ fullName, email, username, password, role, phone });

        return res.status(201).json({ message: "User created successfully", user });
    } catch (error) {
        console.error("Error in createStaffUser:", error);
        next(error);
    }
};

// get all user 
export const getAllUsers = async (req, res, next) => {
    try {
        // Fetch all users, excluding sensitive fields like passwords
        const users = await User.find().select('-password -refreshToken');

        return res.status(200).json({
            status: 200,
            data: users,
            message: "Users retrieved successfully",
        });
    } catch (error) {
        console.error("Error in getAllUsers:", error);
        next(new ApiError(500, "An error occurred while retrieving users"));
    }
};

export const getAllUsersByRoles = async (req, res, next) => {
    try {
        const { role } = req.query; // Extract the role query parameter

        // Build the query object
        const query = {};
        if (role) {
            query.role = role; // Add role filter to the query if provided
        }

        // Fetch users based on the query, excluding sensitive fields like passwords
        const users = await User.find(query).select('-password -refreshToken');

        return res.status(200).json({
            status: 200,
            data: users,
            message: "Users retrieved successfully",
        });
    } catch (error) {
        console.error("Error in getAllUsers:", error);
        next(new ApiError(500, "An error occurred while retrieving users"));
    }
};

