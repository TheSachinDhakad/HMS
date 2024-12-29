import { Document } from "../models/document.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js"; // Cloudinary upload function
import { upload } from "../middlewares/multer.middleware.js"; // Multer configuration
import { ApiError } from "../utils/ApiError.js";

// Document Upload Controller
export const uploadDocument = [
    // Multer middleware to handle file upload
    upload.single('file'), // 'file' is the name of the file input field in the form

    async (req, res, next) => {
        try {
            if (!req.file) {
                throw new ApiError(400, "No file uploaded");
            }

            // Upload the file to Cloudinary
            const cloudinaryResponse = await uploadOnCloudinary(req.file.path);

            if (!cloudinaryResponse) {
                throw new ApiError(500, "Error uploading file to Cloudinary");
            }

            // Create a new Document entry in the database
            const document = await Document.create({
                type: req.body.type, // Assuming 'type' is passed in the request body
                file_url: cloudinaryResponse.secure_url, // Cloudinary URL
                status: "pending", // Default status
                user_id: req.user.id, // User ID from the authenticated token
            });

            return res.status(201).json({
                message: "Document uploaded successfully",
                document,
            });
        } catch (error) {
            next(error);
        }
    }
];
