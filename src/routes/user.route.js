import express from "express";
import {
    registerUser,
    loginUser,
    getUser,
    updateUser,
    deleteUser,
    getCurrentUser,
    createStaffUser,
    getAllUsers,
    getAllUsersByRoles,
} from "../controllers/user.controller.js";
import { verifyAccessToken, authorizeAdmin } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Register a new user
router.post("/register", registerUser);

// Login a user
router.post("/login", loginUser);

// Get user by ID (protected)
router.get("/all", verifyAccessToken, authorizeAdmin, getAllUsers);
router.get("/all/role", verifyAccessToken, authorizeAdmin, getAllUsersByRoles);
router.get("/:id", verifyAccessToken, getUser);
router.get("/user", verifyAccessToken, getCurrentUser);

// Update user by ID (protected)
router.put("/:id", verifyAccessToken, updateUser);

// Delete user by ID (protected)
router.delete("/:id", verifyAccessToken, authorizeAdmin, deleteUser);

router.post('/staff', verifyAccessToken, authorizeAdmin, createStaffUser);

export default router;






















// import { Router } from "express";

// import { loginUser, registerUser, updateUser } from "../controllers/user.controller.js"

// import { upload } from "../middlewares/multer.middleware.js"
// import { verifyJWT } from "../middlewares/auth.middleware.js";

// const router = Router();


// router.post("/login", loginUser)
// router.post("/register", upload.single("avatar"), registerUser);

// // User Update Route (with file upload for avatar)
// router.put("/update/:id", upload.single("avatar"), updateUser);



// export default router;