// pages/signup.js

import React, { useState } from 'react'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useRouter } from 'next/router';
import Link from 'next/link';

const SignUp = () => {
    const router = useRouter()

    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [mobileNo, setMobileNo] = useState("");
    const [address, setAddress] = useState("");
    const [collageName, setCollageName] = useState("SPPU");
    const [education, setEducation] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [DOB, setDOB] = useState("");
    const [profileImg, setProfileImg] = useState("");

    // Form validation states
    const [passwordError, setPasswordError] = useState("");
    const [formErrors, setFormErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [generalError, setGeneralError] = useState("");

    // Password strength validation states
    const [passwordStrength, setPasswordStrength] = useState(0); // 0: none, 1: weak, 2: medium, 3: strong
    const [passwordValidation, setPasswordValidation] = useState({
        minLength: false,
        hasUppercase: false,
        hasLowercase: false,
        hasNumber: false,
        hasSpecial: false
    });

    const validatePassword = (password) => {
        // Password validation criteria
        const validations = {
            minLength: password.length >= 8,
            hasUppercase: /[A-Z]/.test(password),
            hasLowercase: /[a-z]/.test(password),
            hasNumber: /[0-9]/.test(password),
            hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password)
        };

        // Update validation state
        setPasswordValidation(validations);

        // Calculate password strength
        const criteriaCount = Object.values(validations).filter(Boolean).length;
        if (password === '') {
            setPasswordStrength(0); // Empty
        } else if (criteriaCount <= 2) {
            setPasswordStrength(1); // Weak
        } else if (criteriaCount <= 4) {
            setPasswordStrength(2); // Medium
        } else {
            setPasswordStrength(3); // Strong
        }

        // Clear any previous password error if valid
        if (criteriaCount >= 3) {
            setFormErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors.password;
                return newErrors;
            });
        }

        return criteriaCount >= 3; // Password is valid if it meets at least 3 criteria
    };

    const handlePasswordChange = (e) => {
        const newPassword = e.target.value;
        setPassword(newPassword);
        validatePassword(newPassword);

        // If confirm password is filled, check match
        if (confirmPassword) {
            if (newPassword !== confirmPassword) {
                setPasswordError("पासवर्ड जुळत नाहीत!");
            } else {
                setPasswordError("");
            }
        }
    };

    const handleConfirmPasswordChange = (e) => {
        const value = e.target.value;
        setConfirmPassword(value);

        // Check if passwords match
        if (value && password !== value) {
            setPasswordError("पासवर्ड जुळत नाहीत!");
        } else {
            setPasswordError("");
        }
    };

    const handlePasswordToggle = (e, fieldId) => {
        const field = document.getElementById(fieldId);
        const type = field.type === "password" ? "text" : "password";
        field.type = type;
        e.target.textContent = type === "password" ? "👁️" : "🙈";
    };


    // Compress image before uploading
    const compressImage = (file, maxWidth = 800, maxHeight = 800, quality = 0.7) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target.result;
                img.onload = () => {
                    // Create a canvas and get its context
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;

                    // Calculate new dimensions while maintaining aspect ratio
                    if (width > height) {
                        if (width > maxWidth) {
                            height = Math.round((height * maxWidth) / width);
                            width = maxWidth;
                        }
                    } else {
                        if (height > maxHeight) {
                            width = Math.round((width * maxHeight) / height);
                            height = maxHeight;
                        }
                    }

                    // Set canvas dimensions and draw the image
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    // Convert to base64 format
                    const dataUrl = canvas.toDataURL('image/jpeg', quality);
                    resolve(dataUrl);
                };
                img.onerror = error => {
                    reject(error);
                };
            };
            reader.onerror = error => reject(error);
        });
    };

    const handleChange = (e) => {
        if (e.target.name == 'fullName') {
            setFullName(e.target.value)
        }
        else if (e.target.name == 'email') {
            setEmail(e.target.value)
        }
        else if (e.target.name == 'collageName') {
            setCollageName(e.target.value)
        }
        else if (e.target.name == 'password') {
            setPassword(e.target.value)
        }
        else if (e.target.name == 'mobileNo') {
            setMobileNo(e.target.value)
        }
        else if (e.target.name == 'address') {
            setAddress(e.target.value)
        }
        else if (e.target.name == 'education') {
            setEducation(e.target.value)
        } else if (e.target.name == 'DOB') {
            setDOB(e.target.value)
        } else if (e.target.name == "profileImg") {
            const file = e.target.files[0];
            if (file) {
                // Check file size and type before compressing
                if (file.size > 10 * 1024 * 1024) { // Greater than 10MB
                    toast.error("प्रतिमा खूप मोठी आहे. कृपया 10MB पेक्षा लहान प्रतिमा निवडा", {
                        position: "top-center"
                    });
                    return;
                }

                if (!file.type.startsWith('image/')) {
                    toast.error("कृपया वैध प्रतिमा फाइल निवडा", {
                        position: "top-center"
                    });
                    return;
                }

                // Compress the image
                compressImage(file)
                    .then(compressedImageData => {
                        setProfileImg(compressedImageData);
                    })
                    .catch(error => {
                        console.error("Error compressing image:", error);
                        toast.error("प्रतिमा प्रक्रियेत त्रुटी आली. कृपया दुसरी प्रतिमा निवडा.", {
                            position: "top-center"
                        });
                    });
            }
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Reset previous errors
        setFormErrors({});
        setGeneralError("");
        setPasswordError("");

        // Password match validation
        if (password !== confirmPassword) {
            setPasswordError("पासवर्ड जुळत नाहीत!");
            return;
        }

        // Password strength validation
        const isPasswordValid = validatePassword(password);
        if (!isPasswordValid) {
            setFormErrors(prev => ({
                ...prev,
                password: "पासवर्ड किमान सुरक्षा आवश्यकता पूर्ण करत नाही"
            }));
            return;
        }

        // Set submitting state to true to show loading/disable the button
        setIsSubmitting(true);

        const data = { profileImg, fullName, email, DOB, password, mobileNo, address, education, collageName };

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_HOST}/api/signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            const responseData = await res.json();

            // Handle successful response
            if (res.ok && responseData.success) {
                // Clear all form fields
                setProfileImg('');
                setMobileNo('');
                setConfirmPassword('');
                setAddress('');
                setEducation('');
                setCollageName('SPPU');
                setDOB('');
                setEmail('');
                setFullName('');
                setPassword('');

                toast.success('तुमचे खाते तयार झाले आहे! लॉगिनवर रिडायरेक्ट होत आहोत...', {
                    position: "top-center",
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "light",
                });

                // Redirect to login page after 3 seconds
                setTimeout(() => {
                    router.push('/login');
                }, 3000);

                return;
            }

            // Handle validation errors and other API errors
            if (responseData.error === "Required fields missing" && responseData.missingFields) {
                // Create field-specific error messages
                const errors = {};
                responseData.missingFields.forEach(field => {
                    const map = {
                        "Full Name": "पूर्ण नाव",
                        "Email Address": "ईमेल पत्ता",
                        "Mobile Number": "मोबाईल नंबर",
                        "College Name": "कॉलेजचे नाव",
                        "Address": "पत्ता",
                        "Education": "शिक्षण",
                        "Password": "पासवर्ड",
                        "DOB": "जन्मतारीख"
                    };
                    const fieldNameMarathi = map[field] || field;
                    const fieldKey = field === "Full Name" ? "fullName" :
                        field === "Email Address" ? "email" :
                            field === "Mobile Number" ? "mobileNo" :
                                field === "College Name" ? "collageName" :
                                    field.toLowerCase().replace(/ /g, '');
                    errors[fieldKey] = `${fieldNameMarathi} आवश्यक आहे`;
                });
                setFormErrors(errors);

                toast.error(responseData.message || "कृपया सर्व आवश्यक फील्ड भरा", {
                    position: "top-center",
                });
            }
            else if (responseData.error === "Invalid email format") {
                setFormErrors({ email: responseData.message || "कृपया वैध ईमेल पत्ता प्रविष्ट करा" });
                toast.error(responseData.message, { position: "top-center" });
            }
            else if (responseData.error === "Email already registered") {
                setFormErrors({ email: responseData.message || "हा ईमेल आधीच नोंदणीकृत आहे" });
                toast.error(responseData.message, { position: "top-center" });
            }
            else if (responseData.error === "Validation failed" && responseData.validationErrors) {
                setFormErrors(responseData.validationErrors);
                toast.error(responseData.message || "कृपया त्रुटी सुधारा", { position: "top-center" });
            }
            else {
                // Handle general error
                setGeneralError(responseData.message || "अपेक्षित त्रुटी आली");
                toast.error(responseData.message || "काहीतरी चूक झाली. कृपया पुन्हा प्रयत्न करा.", { position: "top-center" });
            }

        } catch (error) {
            console.error("Signup error:", error);
            setGeneralError("नेटवर्क किंवा सर्व्हर एरर. कृपया नंतर पुन्हा प्रयत्न करा.");
            toast.error("कनेक्शन त्रुटी. कृपया तुमचे इंटरनेट तपासा आणि पुन्हा प्रयत्न करा.", {
                position: "top-center",
                autoClose: 5000,
            });
        } finally {
            setIsSubmitting(false);
        }
    };


    return (<>
        <ToastContainer
            position="top-left"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
        />
        <div className="relative grid grid-cols-1 place-items-center w-full min-h-screen">
            <img
                src="/bg.gif"
                alt="background"
                className="absolute top-0 left-0 w-full h-full object-cover z-[-1]"
            />
            <img
                src="/Logoo.png"
                alt="Shakti AI Logo"
                className="absolute top-4 right-8 w-20 mb-5"
            />

            <div className="container ml-2 mr-2 w-full max-w-5xl p-4 rounded-lg bg-white bg-opacity-30">
                <h1 className="text-2xl text-white mb-4">
                    नवीन <span className="text-pink-400">खाते तयार करा!</span>
                </h1>
                {generalError && (
                    <div className="col-span-3 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
                        <span className="block sm:inline">{generalError}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="grid grid-cols-3 gap-4">
                    <div className="flex flex-col col-span-3 items-center mb-4">
                        <label htmlFor="profile-upload" className="mb-2 text-white font-medium">प्रोफाईल फोटो <span className="text-red-500">*</span></label>
                        <div className="relative w-32 h-32 mb-2 rounded-full overflow-hidden bg-gray-200 bg-opacity-30 flex items-center justify-center border-2 border-dashed border-white border-opacity-40">
                            {profileImg ? (
                                <img src={profileImg} alt="Profile Preview" className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-white text-4xl">👤</span>
                            )}
                        </div>
                        <label htmlFor="profile-upload" className="cursor-pointer bg-pink-500 hover:bg-pink-600 text-white py-2 px-4 rounded-md text-sm transition duration-300">
                            {profileImg ? "फोटो बदला" : "फोटो अपलोड करा"}
                        </label>
                        <input
                            id="profile-upload"
                            type="file"
                            name="profileImg"
                            accept="image/*"
                            onChange={handleChange}
                            className="hidden"
                        />
                        <p className="text-gray-300 text-xs mt-1">कमाल साईज: 10MB (कॉम्प्रेस केले जाईल)</p>
                    </div>
                    <div className="flex flex-col">
                        <input
                            type="text"
                            name="fullName"
                            value={fullName}
                            onChange={handleChange}
                            placeholder="पूर्ण नाव *"
                            required
                            className={`p-3 rounded-md bg-white bg-opacity-20 text-white placeholder-gray-400 focus:ring-2 focus:ring-pink-400 ${formErrors.fullName ? 'border-2 border-red-500' : ''}`}
                        />
                        {formErrors.fullName && <p className="text-red-500 text-sm mt-1">{formErrors.fullName}</p>}
                    </div>
                    <div className="flex flex-col">
                        <input
                            type="email"
                            name="email"
                            value={email}
                            onChange={handleChange}
                            placeholder="ईमेल पत्ता *"
                            required
                            className={`p-3 rounded-md bg-white bg-opacity-20 text-white placeholder-gray-400 focus:ring-2 focus:ring-pink-400 ${formErrors.email ? 'border-2 border-red-500' : ''}`}
                        />
                        {formErrors.email && <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>}
                    </div>
                    <div className="flex flex-col">
                        <input
                            type="text"
                            name="mobileNo"
                            value={mobileNo}
                            onChange={handleChange}
                            placeholder="मोबाईल नंबर *"
                            required
                            className={`p-3 rounded-md bg-white bg-opacity-20 text-white placeholder-gray-400 focus:ring-2 focus:ring-pink-400 ${formErrors.mobileNo ? 'border-2 border-red-500' : ''}`}
                        />
                        {formErrors.mobileNo && <p className="text-red-500 text-sm mt-1">{formErrors.mobileNo}</p>}
                    </div>
                    <input
                        type="text"
                        name="address"
                        value={address}
                        onChange={handleChange}
                        placeholder="पत्ता *"
                        required
                        className="p-3 rounded-md bg-white bg-opacity-20 text-white placeholder-gray-400 focus:ring-2 focus:ring-pink-400"
                    />
                    <input
                        type="text"
                        name="DOB"
                        value={DOB}
                        onChange={handleChange}
                        placeholder="जन्मतारीख *"
                        required
                        className="p-3 rounded-md bg-white bg-opacity-20 text-white placeholder-gray-400 focus:ring-2 focus:ring-pink-400"
                    />
                    <div className="flex flex-col">
                        <input
                            type="text"
                            name="education"
                            value={education}
                            onChange={handleChange}
                            placeholder="शिक्षण *"
                            required
                            className={`p-3 rounded-md bg-white bg-opacity-20 text-white placeholder-gray-400 focus:ring-2 focus:ring-pink-400 ${formErrors.education ? 'border-2 border-red-500' : ''}`}
                        />
                        {formErrors.education && <p className="text-red-500 text-sm mt-1">{formErrors.education}</p>}
                    </div>
                    <div className="flex flex-col">
                        <input
                            type="text"
                            name="collageName"
                            value={collageName}
                            onChange={handleChange}
                            placeholder="कॉलेजचे नाव *"
                            required
                            className={`p-3 rounded-md bg-white bg-opacity-20 text-white placeholder-gray-400 focus:ring-2 focus:ring-pink-400 ${formErrors.collageName ? 'border-2 border-red-500' : ''}`}
                        />
                        {formErrors.collageName && <p className="text-red-500 text-sm mt-1">{formErrors.collageName}</p>}
                    </div>

                    <div className="flex flex-col relative">
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={password}
                            onChange={handlePasswordChange}
                            placeholder="पासवर्ड *"
                            required
                            className={`w-full p-3 rounded-md bg-white bg-opacity-20 text-white placeholder-gray-400 focus:ring-2 focus:ring-pink-400 ${formErrors.password ? 'border-2 border-red-500' : ''}`}
                        />
                        <span
                            className="absolute top-1/2 right-3 transform -translate-y-1/2 cursor-pointer text-white"
                            onClick={(e) => handlePasswordToggle(e, "password")}
                        >
                            👁️
                        </span>
                        {formErrors.password && <p className="text-red-500 text-sm mt-1">{formErrors.password}</p>}

                        {/* Password strength indicator */}
                        {password && (
                            <div className="mt-1">
                                <div className="flex justify-between items-center mb-1">
                                    <span className={`text-xs ${passwordStrength === 0 ? 'text-gray-400' :
                                        passwordStrength === 1 ? 'text-red-400' :
                                            passwordStrength === 2 ? 'text-yellow-400' : 'text-green-400'}`}>
                                        {passwordStrength === 0 ? 'पासवर्ड प्रविष्ट करा' :
                                            passwordStrength === 1 ? 'कमकुवत (Weak)' :
                                                passwordStrength === 2 ? 'मध्यम (Medium)' : 'मजबूत (Strong)'}
                                    </span>
                                </div>
                                <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
                                    <div className={`h-full ${passwordStrength === 0 ? 'w-0' :
                                        passwordStrength === 1 ? 'w-1/3 bg-red-400' :
                                            passwordStrength === 2 ? 'w-2/3 bg-yellow-400' : 'w-full bg-green-400'}`}>
                                    </div>
                                </div>

                                {/* Password requirements */}
                                <ul className="text-xs space-y-1 mt-2 text-gray-300">
                                    <li className={passwordValidation.minLength ? 'text-green-400' : ''}>
                                        {passwordValidation.minLength ? '✓' : '○'} किमान ८ अक्षरे
                                    </li>
                                    <li className={passwordValidation.hasUppercase ? 'text-green-400' : ''}>
                                        {passwordValidation.hasUppercase ? '✓' : '○'} किमान एक कॅपिटल अक्षर (A-Z)
                                    </li>
                                    <li className={passwordValidation.hasLowercase ? 'text-green-400' : ''}>
                                        {passwordValidation.hasLowercase ? '✓' : '○'} किमान एक लहान अक्षर (a-z)
                                    </li>
                                    <li className={passwordValidation.hasNumber ? 'text-green-400' : ''}>
                                        {passwordValidation.hasNumber ? '✓' : '○'} किमान एक अंक (0-9)
                                    </li>
                                    <li className={passwordValidation.hasSpecial ? 'text-green-400' : ''}>
                                        {passwordValidation.hasSpecial ? '✓' : '○'} किमान एक विशेष चिन्ह (!@#$%^&*)
                                    </li>
                                </ul>
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col relative">
                        <input
                            type="password"
                            id="confirm-password"
                            value={confirmPassword}
                            onChange={handleConfirmPasswordChange}
                            placeholder="पासवर्डची पुष्टी करा *"
                            required
                            className={`w-full p-3 rounded-md bg-white bg-opacity-20 text-white placeholder-gray-400 focus:ring-2 focus:ring-pink-400 ${passwordError ? 'border-2 border-red-500' : ''}`}
                        />
                        <span
                            className="absolute top-1/2 right-3 transform -translate-y-1/2 cursor-pointer text-white"
                            onClick={(e) => handlePasswordToggle(e, "confirm-password")}
                        >
                            👁️
                        </span>
                        {passwordError && <p className="text-red-500 text-sm mt-1">{passwordError}</p>}
                    </div>

                    <div className="col-span-3 flex items-center justify-between mt-4">

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`px-6 py-3 text-white ${isSubmitting ? 'bg-gray-400' : 'bg-pink-400 hover:bg-pink-500'} rounded-md transition duration-300 flex items-center`}
                        >
                            {isSubmitting ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    प्रक्रिया सुरू आहे...
                                </>
                            ) : 'साइन अप'}
                        </button>
                        <div className="col-span-3 flex items-center justify-between text-white mt-4"><span className="text-red-500"> * </span> ने चिन्हांकित केलेली फील्ड आवश्यक आहेत</div>
                        <div className="text-white">
                            आधीच खाते आहे? <Link href="/login" className="text-pink-400 hover:underline">लॉगिन करा</Link>
                        </div>
                    </div>
                </form>
            </div>
        </div>

    </>
    );
};

export default SignUp;
