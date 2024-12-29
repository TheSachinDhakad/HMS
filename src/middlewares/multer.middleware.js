import multer from 'multer';
import path from 'path';

// Set up Multer storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./public/test"); // Directory where files will be temporarily stored before upload
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Use timestamp to avoid filename conflicts
    },
});

// Configure Multer with the storage
const upload = multer({ storage });

export { upload };
