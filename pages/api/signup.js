// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import User from "../../models/User" // Fixed import path
import connectDb from "@/middleware/dbConnect"
import mongoose from "mongoose" // Added for direct connection check
var CryptoJS = require("crypto-js");

// Configure API route to accept larger payloads (for images)
export const config = {
    api: {
        bodyParser: {
            sizeLimit: '8mb',
        },
    },
};

const handler = async (req, res) => {
    try {
        // Ensure database connection
        if (!mongoose.connections[0].readyState) {
            console.log('Connecting to MongoDB...');
            await mongoose.connect(process.env.MONGODB_URI);
        }
        
        if (req.method == 'POST') {
            // Extract all fields from request body
            const {profileImg, fullName, email, password, mobileNo, address, DOB, education, collageName} = req.body
            
            // Validate required fields
            const requiredFields = {
                fullName: 'Full Name',
                email: 'Email Address',
                password: 'Password',
                mobileNo: 'Mobile Number',
                education: 'Education',
                collageName: 'College Name'
            };
            
            const missingFields = [];
            for (const [field, label] of Object.entries(requiredFields)) {
                if (!req.body[field]) {
                    missingFields.push(label);
                }
            }
            
            if (missingFields.length > 0) {
                return res.status(400).json({
                    success: false,
                    error: "Required fields missing", 
                    missingFields: missingFields,
                    message: `Please provide: ${missingFields.join(', ')}`
                });
            }
            
            // Validate email format
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return res.status(400).json({
                    success: false,
                    error: "Invalid email format",
                    field: "email",
                    message: "Please provide a valid email address"
                });
            }
            
            // Validate password strength
            const passwordValidations = {
                minLength: password.length >= 8,
                hasUppercase: /[A-Z]/.test(password),
                hasLowercase: /[a-z]/.test(password),
                hasNumber: /[0-9]/.test(password),
                hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password)
            };
            
            const criteriaCount = Object.values(passwordValidations).filter(Boolean).length;
            if (criteriaCount < 3) {
                return res.status(400).json({
                    success: false,
                    error: "Weak password",
                    field: "password",
                    message: "Password must meet at least 3 of the following criteria: 8+ characters, uppercase letter, lowercase letter, number, and special character",
                    validations: passwordValidations
                });
            }
            
            // Check if email already exists
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(409).json({
                    success: false,
                    error: "Email already registered",
                    field: "email",
                    message: "This email is already registered, please use a different email or login"
                });
            }
            
            // Create new user with interview tracking fields explicitly defined
            const userData = {
                profileImg,
                fullName, 
                email,
                mobileNo,
                address,
                DOB,
                education,
                collageName, 
                password: CryptoJS.AES.encrypt(password, 'secret123').toString()
            };
            
            // Explicitly add the interview tracking fields
            userData.no_of_interviews = 1;
            userData.no_of_interviews_completed = 0;
            
            console.log('Creating new user with fields:', Object.keys(userData));
            
            let u = new User(userData);
            await u.save();
            
            // Log the saved user (without sensitive info)
            const savedUser = await User.findOne({ email }).select('-password');
            console.log('Saved user with fields:', Object.keys(savedUser._doc));
            
            res.status(200).json({ success: true, message: "Signup successful" });
        } else {
            res.status(405).json({ success: false, error: "Method not allowed", message: "This endpoint only supports POST requests" });
        }
    } catch (error) {
        console.error('Error in signup handler:', error);
        
        // Handle mongoose validation errors
        if (error.name === 'ValidationError') {
            const validationErrors = {};
            
            for (const field in error.errors) {
                validationErrors[field] = error.errors[field].message;
            }
            
            return res.status(400).json({
                success: false,
                error: "Validation failed",
                validationErrors,
                message: "Please fix the validation errors"
            });
        }
        
        // Handle duplicate key error (typically for unique fields like email)
        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern)[0];
            const fieldName = field === 'email' ? 'Email Address' : 
                             field === 'mobileNo' ? 'Mobile Number' : field;
            
            return res.status(409).json({
                success: false,
                error: "Duplicate value",
                field,
                message: `This ${fieldName} is already registered in our system`
            });
        }
        
        // Handle other errors
        res.status(500).json({
            success: false,
            error: "Server error", 
            message: "An unexpected error occurred during signup"
        });
    }
}

export default connectDb(handler)
