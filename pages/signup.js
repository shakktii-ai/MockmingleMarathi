// pages/signup.js

import React, { useState, useRef } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useRouter } from 'next/router';
import Link from 'next/link';
import axios from 'axios';

const SignUp = () => {
    const router = useRouter();
    const fileInputRef = useRef(null);

    // Form state
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        mobileNo: '',
        address: '',
        collageName: 'SPPU',
        education: '',
        DOB: '',
        password: '',
        confirmPassword: '',
        profileImg: null
    });
    
    const [formErrors, setFormErrors] = useState({});
    const [generalError, setGeneralError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Handle input changes
    const handleChange = (e) => {
        const { name, value, files } = e.target;
        
        if (name === 'profileImg') {
            if (files && files[0]) {
                setFormData(prev => ({
                    ...prev,
                    [name]: files[0]
                }));
            }
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }

        // Clear error when user types
        if (formErrors[name]) {
            setFormErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setGeneralError('');
        
        // Basic validation
        const errors = {};
        if (!formData.fullName.trim()) errors.fullName = 'Full name is required';
        if (!formData.email.includes('@')) errors.email = 'Please enter a valid email';
        if (!formData.DOB) errors.DOB = 'Date of birth is required';
        if (formData.password.length < 6) errors.password = 'Password must be at least 6 characters';
        if (formData.password !== formData.confirmPassword) errors.confirmPassword = 'Passwords do not match';
        if (!formData.mobileNo) errors.mobileNo = 'Mobile number is required';
        if (!formData.address) errors.address = 'Address is required';
        if (!formData.education) errors.education = 'Education is required';
        
        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }

        setIsSubmitting(true);
        
        try {
            const formDataToSend = new FormData();
            Object.keys(formData).forEach(key => {
                if (formData[key] !== null && formData[key] !== undefined) {
                    formDataToSend.append(key, formData[key]);
                }
            });

            const response = await axios.post('/api/signup', formDataToSend, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.data.success) {
                toast.success('Account created successfully! Redirecting...');
                setTimeout(() => {
                    router.push('/login');
                }, 2000);
            } else {
                setGeneralError(response.data.message || 'Something went wrong');
            }
        } catch (error) {
            console.error('Signup error:', error);
            setGeneralError(error.response?.data?.message || 'An error occurred during signup');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="relative min-h-screen bg-gray-100">
            {/* Background Image */}
            <div className="absolute inset-0 z-0">
                <img 
                    src="/bg.gif" 
                    alt="background" 
                    className="w-full h-full object-cover"
                />
            </div>
            
            {/* Logo */}
            <div className="relative z-10">
                <img
                    src="/Logoo.png"
                    alt="Shakti AI Logo"
                    className="absolute top-4 right-8 w-20"
                />
            </div>

            {/* Main Content */}
            <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
                <div className="w-full max-w-4xl bg-white bg-opacity-90 rounded-xl shadow-2xl overflow-hidden">
                    <div className="md:flex">
                        {/* Left Side - Form */}
                        <div className="w-full md:w-2/3 p-8">
                            <h1 className="text-3xl font-bold text-pink-600 mb-8 text-center">
                                <span className="text-pink-600">खाते</span> तयार करा
                            </h1>
                            
                            {generalError && (
                                <div className="mb-6 p-4 bg-red-100 border-l-4 border-red-500 text-red-700">
                                    <p>{generalError}</p>
                                </div>
                            )}
                            
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Profile Image Upload */}
                                <div className="flex flex-col items-center mb-6">
                                    <div className="relative w-32 h-32 mb-4 rounded-full overflow-hidden bg-gray-200 border-2 border-dashed border-gray-300 flex items-center justify-center">
                                        {formData.profileImg ? (
                                            <img 
                                                src={URL.createObjectURL(formData.profileImg)} 
                                                alt="Profile Preview" 
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <span className="text-gray-400 text-5xl">👤</span>
                                        )}
                                        <input
                                            id="profile-upload"
                                            ref={fileInputRef}
                                            type="file"
                                            name="profileImg"
                                            accept="image/*"
                                            onChange={handleChange}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="px-4 py-2 bg-pink-500 text-white rounded-full text-sm font-medium hover:bg-pink-600 transition duration-300"
                                    >
                                        {formData.profileImg ? "नवीन फोटो निवडा" : "फोटो अपलोड करा"}
                                    </button>
                                    <p className="text-gray-500 text-xs mt-2">फाइल साइज: 10MB (फाइल कंप्रेस केली जाईल)</p>
                                </div>

                                {/* Form Fields */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Full Name */}
                                    <div>
                                        <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                                            संपूर्ण नाव <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            id="fullName"
                                            name="fullName"
                                            value={formData.fullName}
                                            onChange={handleChange}
                                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent ${
                                                formErrors.fullName ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                            placeholder="आपले नाव प्रविष्ट करा"
                                        />
                                        {formErrors.fullName && (
                                            <p className="mt-1 text-sm text-red-600">{formErrors.fullName}</p>
                                        )}
                                    </div>

                                    {/* Email */}
                                    <div>
                                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                            ईमेल <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent ${
                                                formErrors.email ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                            placeholder="आपला ईमेल पत्ता"
                                        />
                                        {formErrors.email && (
                                            <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>
                                        )}
                                    </div>

                                    {/* Mobile Number */}
                                    <div>
                                        <label htmlFor="mobileNo" className="block text-sm font-medium text-gray-700 mb-1">
                                            मोबाईल नंबर <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="tel"
                                            id="mobileNo"
                                            name="mobileNo"
                                            value={formData.mobileNo}
                                            onChange={handleChange}
                                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent ${
                                                formErrors.mobileNo ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                            placeholder="आपला मोबाईल नंबर"
                                        />
                                        {formErrors.mobileNo && (
                                            <p className="mt-1 text-sm text-red-600">{formErrors.mobileNo}</p>
                                        )}
                                    </div>

                                    {/* College/Institution */}
                                    <div>
                                        <label htmlFor="collageName" className="block text-sm font-medium text-gray-700 mb-1">
                                            महाविद्यालय/संस्था
                                        </label>
                                        <input
                                            type="text"
                                            id="collageName"
                                            name="collageName"
                                            value={formData.collageName}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                                            placeholder="आपले महाविद्यालय/संस्थेचे नाव"
                                        />
                                    </div>

                                    {/* Password */}
                                    <div>
                                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                            पासवर्ड <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="password"
                                            id="password"
                                            name="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent ${
                                                formErrors.password ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                            placeholder="किमान ६ वर्णांचा पासवर्ड"
                                        />
                                        {formErrors.password && (
                                            <p className="mt-1 text-sm text-red-600">{formErrors.password}</p>
                                        )}
                                    </div>

                                    {/* Confirm Password */}
                                    <div>
                                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                                            पासवर्डची पुष्टी करा <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="password"
                                            id="confirmPassword"
                                            name="confirmPassword"
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent ${
                                                formErrors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                            placeholder="पासवर्ड पुन्हा टाइप करा"
                                        />
                                        {formErrors.confirmPassword && (
                                            <p className="mt-1 text-sm text-red-600">{formErrors.confirmPassword}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Address */}
                                <div className="md:col-span-2">
                                    <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                                        पत्ता <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        id="address"
                                        name="address"
                                        value={formData.address}
                                        onChange={handleChange}
                                        rows="2"
                                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent ${
                                            formErrors.address ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                        placeholder="तुमचा संपूर्ण पत्ता"
                                    />
                                    {formErrors.address && (
                                        <p className="mt-1 text-sm text-red-600">{formErrors.address}</p>
                                    )}
                                </div>

                                {/* Date of Birth */}
                                <div>
                                    <label htmlFor="DOB" className="block text-sm font-medium text-gray-700 mb-1">
                                        जन्मतारीख <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        id="DOB"
                                        name="DOB"
                                        value={formData.DOB}
                                        onChange={handleChange}
                                        max={new Date().toISOString().split('T')[0]} // Prevent future dates
                                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent ${
                                            formErrors.DOB ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                    />
                                    {formErrors.DOB && (
                                        <p className="mt-1 text-sm text-red-600">{formErrors.DOB}</p>
                                    )}
                                </div>

                                {/* Education */}
                                <div>
                                    <label htmlFor="education" className="block text-sm font-medium text-gray-700 mb-1">
                                        शैक्षणिक पात्रता <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        id="education"
                                        name="education"
                                        value={formData.education}
                                        onChange={handleChange}
                                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent ${
                                            formErrors.education ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                    >
                                        <option value="">-- निवडा --</option>
                                        <option value="10th">१० वी</option>
                                        <option value="12th">१२ वी</option>
                                        <option value="diploma">डिप्लोमा</option>
                                        <option value="bachelor">पदवी</option>
                                        <option value="master">पदव्युत्तर</option>
                                        <option value="phd">पीएचडी</option>
                                        <option value="other">इतर</option>
                                    </select>
                                    {formErrors.education && (
                                        <p className="mt-1 text-sm text-red-600">{formErrors.education}</p>
                                    )}
                                </div>

                                {/* Submit Button */}
                                <div className="pt-4">
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-3 px-6 rounded-full font-medium text-lg hover:opacity-90 transition duration-300 disabled:opacity-70 flex items-center justify-center"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                प्रक्रिया करत आहे...
                                            </>
                                        ) : (
                                            'साइन अप करा'
                                        )}
                                    </button>
                                </div>

                                {/* Login Link */}
                                <div className="text-center mt-4">
                                    <p className="text-gray-600">
                                        आधीपासून खाते आहे?{' '}
                                        <Link href="/login" className="text-pink-600 font-medium hover:underline">
                                            लॉगिन करा
                                        </Link>
                                    </p>
                                </div>
                            </form>
                        </div>

                        {/* Right Side - Image/Illustration */}
                        <div className="hidden md:block md:w-1/3 bg-gradient-to-b from-pink-400 to-purple-600 p-8 text-white">
                            <div className="h-full flex flex-col justify-center">
                                <h2 className="text-2xl font-bold mb-4">शक्ती एआय मध्ये आपले स्वागत आहे</h2>
                                <p className="mb-6 text-pink-100">
                                    आपले शैक्षणिक आणि व्यावसायिक वाटचाल सुरू करा. आमच्यासोबत जोडा आणि आपल्या कौशल्यांमध्ये प्रगती करा.
                                </p>
                                <div className="space-y-4">
                                    <div className="flex items-start">
                                        <svg className="h-6 w-6 text-pink-200 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        <span>वैयक्तिकृत शिक्षण अनुभव</span>
                                    </div>
                                    <div className="flex items-start">
                                        <svg className="h-6 w-6 text-pink-200 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        <span>तज्ञ मार्गदर्शन आणि अभिप्राय</span>
                                    </div>
                                    <div className="flex items-start">
                                        <svg className="h-6 w-6 text-pink-200 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        <span>आपल्या वेगाने शिका</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Toast Container */}
            <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
            />
        </div>
    );
};

export default SignUp;
