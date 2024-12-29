import express from "express";
import {
    createHousekeepingTask,
    updateHousekeepingTaskStatus,
    getAllHousekeepingTasks
} from "../controllers/housekeeping.controller.js";
import { authorizeAdmin, verifyAccessToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

/**
 * @route   POST /housekeeping
 * @desc    Create a new housekeeping task
 * @access  Admin only
 */
router.post(
    "/",
    verifyAccessToken, // Middleware to verify user's access token
    authorizeAdmin,    // Middleware to ensure the user is an admin
    createHousekeepingTask
);
router.put(
    "/:taskId/status",
    verifyAccessToken,
    authorizeAdmin,
    updateHousekeepingTaskStatus
);
router.get(
    "/:staff_id",
    verifyAccessToken,
    authorizeAdmin,
    getAllHousekeepingTasks
);


export default router;
