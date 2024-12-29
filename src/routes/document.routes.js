import express from 'express';
import { verifyAccessToken } from '../middlewares/auth.middleware.js'; // JWT verification middleware
import { upload } from "../middlewares/multer.middleware.js"; // multer configuration for file uploads
import { uploadDocument } from '../controllers/document.controller.js';

const router = express.Router();

// Route to upload a document
router.post("/uploadDocument", verifyAccessToken, uploadDocument);



export default router;
