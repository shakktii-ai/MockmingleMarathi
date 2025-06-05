// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import User from "../../models/User";
import connectDb from "@/middleware/dbConnect";
import multer from 'multer';
import { runMiddleware } from "@/middleware/runMiddleware";
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import mongoose from 'mongoose';

// Convert fs methods to use promises
const writeFile = promisify(fs.writeFile);
const unlink = promisify(fs.unlink);
const mkdir = promisify(fs.mkdir);

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), 'public', 'uploads');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: async function (req, file, cb) {
        try {
            if (!fs.existsSync(uploadsDir)) {
                await mkdir(uploadsDir, { recursive: true });
            }
            cb(null, uploadsDir);
        } catch (error) {
            console.error('Error creating uploads directory:', error);
            cb(error);
        }
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname).toLowerCase();
        cb(null, 'profile-' + uniqueSuffix + ext);
    }
});

// File filter to allow only images
const fileFilter = (req, file, cb) => {
    try {
        const filetypes = /jpe?g|png|gif/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only image files are allowed (JPEG, JPG, PNG, GIF)'), false);
        }
    } catch (error) {
        console.error('File filter error:', error);
        cb(error, false);
    }
};

// Initialize multer with error handling
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
        files: 1
    }
});

var CryptoJS = require("crypto-js");

// Disable body parsing, we'll handle it with multer
export const config = {
    api: {
        bodyParser: false,
    },
};

const handler = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, message: 'Method not allowed' });
    }

    try {
        // First, handle the file upload if present
        await new Promise((resolve, reject) => {
            const uploadSingle = upload.single('profileImg');
            uploadSingle(req, res, (err) => {
                if (err) {
                    console.error('File upload error:', err);
                    return reject({
                        status: 400,
                        message: err.message || 'Error uploading file',
                    });
                }
                resolve();
            });
        });

        // Parse the form data
        let formData;
        try {
            formData = req.body.data ? JSON.parse(req.body.data) : req.body;
        } catch (e) {
            formData = req.body;
        }

        const { fullName, email, mobileNo, address, collageName, education, password, confirmPassword, DOB } = formData;
        
        // Basic validation
        const requiredFields = {
            fullName: 'Full Name',
            email: 'Email',
            mobileNo: 'Mobile Number',
            password: 'Password',
            confirmPassword: 'Confirm Password',
            address: 'Address',
            education: 'Education',
            DOB: 'Date of Birth',
            collageName: 'College Name'
        };
        
        const missingFields = [];
        for (const [field, label] of Object.entries(requiredFields)) {
            if (!formData[field]) {
                missingFields.push(label);
            }
        }
        
        if (missingFields.length > 0) {
            // Clean up the uploaded file if validation fails
            if (req.file) {
                try {
                    await unlink(req.file.path);
                } catch (error) {
                    console.error('Error cleaning up file after validation error:', error);
                }
            }
            return res.status(400).json({ 
                success: false, 
                message: 'Please fill in all required fields',
                missingFields: missingFields
            });
        }

        if (password !== confirmPassword) {
            // Clean up the uploaded file if validation fails
            if (req.file) {
                try {
                    await unlink(req.file.path);
                } catch (error) {
                    console.error('Error cleaning up file after password mismatch:', error);
                }
            }
            return res.status(400).json({ success: false, message: 'Passwords do not match' });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            // Delete the uploaded file if user already exists
            if (req.file) {
                try {
                    await unlink(req.file.path);
                } catch (error) {
                    console.error('Error deleting uploaded file:', error);
                }
            }
            return res.status(400).json({ success: false, message: 'User with this email already exists' });
        }

        // Create user
        let profileImgPath = '';
        if (req.file) {
            profileImgPath = `/uploads/${path.basename(req.file.path)}`;
        } else if (formData.profileImgBase64 && formData.profileImgBase64.startsWith('data:image')) {
            try {
                // Parse the base64 data
                const matches = formData.profileImgBase64.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
                if (!matches || matches.length !== 3) {
                    throw new Error('Invalid base64 image data');
                }
                
                const fileExtension = matches[1].split('/')[1] || 'jpg';
                const fileName = `profile-${Date.now()}.${fileExtension}`;
                const filePath = path.join(uploadsDir, fileName);
                const fileData = Buffer.from(matches[2], 'base64');
                
                // Ensure uploads directory exists
                if (!fs.existsSync(uploadsDir)) {
                    await mkdir(uploadsDir, { recursive: true });
                }
                
                // Save the file
                await writeFile(filePath, fileData);
                profileImgPath = `/uploads/${fileName}`;
                
            } catch (error) {
                console.error('Error saving base64 image:', error);
                return res.status(400).json({ success: false, message: 'Error processing image' });
            }
        }

        // Validate date format (YYYY-MM-DD)
        const dobRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dobRegex.test(DOB)) {
            if (req.file) {
                try {
                    await unlink(req.file.path);
                } catch (error) {
                    console.error('Error cleaning up file after validation error:', error);
                }
            }
            return res.status(400).json({ 
                success: false, 
                message: 'Please enter a valid date of birth (YYYY-MM-DD)'
            });
        }

        // Validate mobile number format (10 digits)
        const mobileRegex = /^\d{10}$/;
        if (!mobileRegex.test(mobileNo)) {
            if (req.file) {
                try {
                    await unlink(req.file.path);
                } catch (error) {
                    console.error('Error cleaning up file after validation error:', error);
                }
            }
            return res.status(400).json({ 
                success: false, 
                message: 'Please enter a valid 10-digit mobile number'
            });
        }

        const user = new User({
            fullName,
            email,
            mobileNo,
            address,
            collageName,
            education,
            DOB,
            password,
            profileImg: profileImgPath,
            no_of_interviews: 1,
            no_of_interviews_completed: 0,
            createdAt: new Date()
        });

        // Save user to database
        await user.save();

        // Return success response without sensitive data
        const userData = user.toObject();
        delete userData.password;
        delete userData.__v;

        return res.status(201).json({
            success: true,
            message: 'User registered successfully',
            user: userData
        });
    } catch (error) {
        console.error('Registration error:', error);
        
        // Clean up uploaded file if there was an error
        if (req.file) {
            try {
                await unlink(req.file.path);
            } catch (unlinkError) {
                console.error('Error cleaning up file after error:', unlinkError);
            }
        }

        const statusCode = error.status || 500;
        const message = error.message || 'Internal server error';
        
        return res.status(statusCode).json({
            success: false,
            message: message
        });
    }
};

export default connectDb(handler);
