import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get the current directory name in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configure storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Set the destination folder for uploads
        cb(null, path.join(process.cwd(), 'public/uploads/'));
    },
    filename: function (req, file, cb) {
        // Create a unique filename
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname).toLowerCase();
        cb(null, 'profile-' + uniqueSuffix + ext);
    }
});

// File filter to allow only images
const fileFilter = (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Only image files are allowed (JPEG, JPG, PNG, GIF)'), false);
    }
};

// Initialize multer with the storage and file filter
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
        files: 1
    }
});

// Middleware to handle single file upload
export const uploadSingle = (fieldName) => {
    return (req, res, next) => {
        upload.single(fieldName)(req, res, function (err) {
            if (err) {
                // Handle multer errors
                if (err.code === 'LIMIT_FILE_SIZE') {
                    return res.status(400).json({
                        success: false,
                        error: 'File too large',
                        message: 'File size should not exceed 5MB'
                    });
                }
                if (err.code === 'LIMIT_UNEXPECTED_FILE') {
                    return res.status(400).json({
                        success: false,
                        error: 'Unexpected file',
                        message: 'Only one file is allowed'
                    });
                }
                if (err.message === 'Only image files are allowed (JPEG, JPG, PNG, GIF)') {
                    return res.status(400).json({
                        success: false,
                        error: 'Invalid file type',
                        message: 'Only image files are allowed (JPEG, JPG, PNG, GIF)'
                    });
                }
                return res.status(400).json({
                    success: false,
                    error: 'File upload failed',
                    message: err.message
                });
            }
            next();
        });
    };
};

// Export the multer instance for direct use
export default upload;
