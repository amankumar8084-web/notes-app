// import React, { useState } from 'react';
// import { useNavigate, Link } from 'react-router-dom';
// import { useAuth } from '../contexts/AuthContext';
// import { FaUserPlus, FaUser, FaEnvelope, FaLock } from 'react-icons/fa';

// const Register = () => {
//   const [formData, setFormData] = useState({
//     username: '',
//     email: '',
//     password: '',
//     confirmPassword: ''
//   });
//   const [error, setError] = useState('');
//   const [success, setSuccess] = useState('');
//   const [loading, setLoading] = useState(false);
  
//   const { register, login } = useAuth();
//   const navigate = useNavigate();

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       [name]: value
//     }));
//   };

//   const validateForm = () => {
//     setError('');

//     if (formData.username.trim().length < 3) {
//       setError('Username must be at least 3 characters');
//       return false;
//     }

//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     if (!emailRegex.test(formData.email)) {
//       setError('Please enter a valid email address');
//       return false;
//     }

//     if (formData.password.length < 6) {
//       setError('Password must be at least 6 characters');
//       return false;
//     }

//     if (formData.password !== formData.confirmPassword) {
//       setError('Passwords do not match');
//       return false;
//     }

//     return true;
//   };

//   // Send welcome email using EmailJS
//   const sendWelcomeEmail = async (userEmail, userName) => {
//     try {
//       console.log('Sending welcome email to:', userEmail);
      
//       // Dynamically import EmailJS
//       const emailjsModule = await import('@emailjs/browser');
//       const emailjs = emailjsModule.default || emailjsModule;
      
//       // Initialize with your public key
//       emailjs.init('Mjrt59vo5ZEcSa_k_');
      
//       // Send the welcome email
//       await emailjs.send(
//         'service_6b4x16e',
//         'template_ra6l6ec',
//         {
//           to_email: userEmail,
//           to_name: userName,
//           user_email: userEmail,
//           app_url: 'https://lekhan.netlify.app',
//           year: new Date().getFullYear().toString()
//         }
//       );
      
//       console.log('Welcome email sent successfully!');
//       return { success: true };
      
//     } catch (error) {
//       console.error('Email sending failed:', error);
//       // Don't fail registration if email fails
//       return { 
//         success: false, 
//         error: error.text || error.message 
//       };
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
    
//     if (!validateForm()) {
//       return;
//     }

//     setLoading(true);
//     setError('');
//     setSuccess('');

//     try {
//       // 1. Register user in backend
//       const registrationResult = await register(
//         formData.email, 
//         formData.password, 
//         formData.username
//       );
      
//       if (!registrationResult.success) {
//         setError(registrationResult.error || 'Registration failed');
//         setLoading(false);
//         return;
//       }

//       console.log('Registration successful');
//       setSuccess('Account created successfully!');
      
//       // 2. Send welcome email (non-blocking)
//       sendWelcomeEmail(formData.email, formData.username)
//         .then(emailResult => {
//           if (emailResult.success) {
//             console.log('Welcome email sent successfully!');
//           } else {
//             console.warn('Welcome email failed:', emailResult.error);
//           }
//         })
//         .catch(err => {
//           console.error('Email error:', err);
//         });

//       // 3. Try auto login
//       try {
//         const loginResult = await login(formData.email, formData.password);
        
//         if (loginResult.success) {
//           setSuccess('✅ Account created! Welcome email sent. Redirecting...');
          
//           setTimeout(() => {
//             navigate('/', { 
//               state: { 
//                 message: 'Registration successful! Welcome to Lekhan!' 
//               } 
//             });
//           }, 2000);
//         } else {
//           // If auto-login fails, redirect to login page
//           setSuccess('✅ Account created! Please login manually.');
//           setTimeout(() => {
//             navigate('/login', { 
//               state: { 
//                 message: 'Registration successful! Please login.' 
//               } 
//             });
//           }, 2000);
//         }
//       } catch (loginErr) {
//         console.warn('Auto-login error:', loginErr);
//         setSuccess('✅ Account created! Redirecting to login...');
//         setTimeout(() => {
//           navigate('/login', { 
//             state: { 
//               message: 'Registration successful! Please login.' 
//             } 
//           });
//         }, 2000);
//       }
      
//     } catch (err) {
//       console.error('Registration error:', err);
//       setError('An unexpected error occurred. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-50 py-12 px-4 sm:px-6 lg:px-8">
//       <div className="max-w-md w-full">
//         <div className="text-center mb-10">
//           <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg mb-6">
//             <FaUserPlus className="h-8 w-8 text-white" />
//           </div>
//           <h2 className="text-3xl font-extrabold text-gray-900">
//             Join Lekhan
//           </h2>
//           <p className="mt-3 text-gray-600">
//             Create your account and start writing
//           </p>
//           <p className="mt-2 text-sm text-gray-500">
//             Already have an account?{' '}
//             <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500 transition">
//               Sign in here
//             </Link>
//           </p>
//         </div>
        
//         <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
//           <div className="p-8">
//             <form onSubmit={handleSubmit} className="space-y-6">
//               {error && (
//                 <div className="bg-red-50 border border-red-200 rounded-lg p-4">
//                   <div className="flex">
//                     <div className="flex-shrink-0">
//                       <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
//                         <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
//                       </svg>
//                     </div>
//                     <div className="ml-3">
//                       <p className="text-sm text-red-700">{error}</p>
//                     </div>
//                   </div>
//                 </div>
//               )}
              
//               {success && (
//                 <div className="bg-green-50 border border-green-200 rounded-lg p-4">
//                   <div className="flex">
//                     <div className="flex-shrink-0">
//                       <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
//                         <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
//                       </svg>
//                     </div>
//                     <div className="ml-3">
//                       <p className="text-sm text-green-700">{success}</p>
//                     </div>
//                   </div>
//                 </div>
//               )}
              
//               {/* Username Field */}
//               <div>
//                 <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
//                   Username
//                 </label>
//                 <div className="relative">
//                   <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                     <FaUser className="h-5 w-5 text-gray-400" />
//                   </div>
//                   <input
//                     id="username"
//                     name="username"
//                     type="text"
//                     autoComplete="username"
//                     required
//                     value={formData.username}
//                     onChange={handleChange}
//                     className="pl-10 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
//                     placeholder="Enter your username"
//                     minLength="3"
//                     maxLength="30"
//                   />
//                 </div>
//                 <p className="mt-1 text-xs text-gray-500">
//                   This is how you'll appear to others
//                 </p>
//               </div>

//               {/* Email Field */}
//               <div>
//                 <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
//                   Email Address
//                 </label>
//                 <div className="relative">
//                   <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                     <FaEnvelope className="h-5 w-5 text-gray-400" />
//                   </div>
//                   <input
//                     id="email"
//                     name="email"
//                     type="email"
//                     autoComplete="email"
//                     required
//                     value={formData.email}
//                     onChange={handleChange}
//                     className="pl-10 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
//                     placeholder="your.email@example.com"
//                   />
//                 </div>
//                 <p className="mt-1 text-xs text-gray-500">
//                   We'll send a welcome email to this address
//                 </p>
//               </div>

//               {/* Password Field */}
//               <div>
//                 <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
//                   Password
//                 </label>
//                 <div className="relative">
//                   <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                     <FaLock className="h-5 w-5 text-gray-400" />
//                   </div>
//                   <input
//                     id="password"
//                     name="password"
//                     type="password"
//                     required
//                     value={formData.password}
//                     onChange={handleChange}
//                     className="pl-10 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
//                     placeholder="Create a strong password"
//                     minLength="6"
//                   />
//                 </div>
//                 <p className="mt-1 text-xs text-gray-500">
//                   Minimum 6 characters
//                 </p>
//               </div>

//               {/* Confirm Password Field */}
//               <div>
//                 <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
//                   Confirm Password
//                 </label>
//                 <div className="relative">
//                   <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                     <FaLock className="h-5 w-5 text-gray-400" />
//                   </div>
//                   <input
//                     id="confirmPassword"
//                     name="confirmPassword"
//                     type="password"
//                     required
//                     value={formData.confirmPassword}
//                     onChange={handleChange}
//                     className="pl-10 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
//                     placeholder="Re-enter your password"
//                   />
//                 </div>
//               </div>

//               {/* Submit Button */}
//               <div>
//                 <button
//                   type="submit"
//                   disabled={loading}
//                   className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent text-base font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg"
//                 >
//                   {loading ? (
//                     <>
//                       <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                         <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                         <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                       </svg>
//                       Creating Account...
//                     </>
//                   ) : (
//                     <>
//                       <FaUserPlus className="mr-2 h-5 w-5" />
//                       Create Account
//                     </>
//                   )}
//                 </button>
//               </div>

//               <div className="text-center mt-6">
//                 <p className="text-xs text-gray-500">
//                   By creating an account, you agree to our{' '}
//                   <a href="#" className="text-blue-600 hover:text-blue-500">Terms</a>{' '}
//                   and{' '}
//                   <a href="#" className="text-blue-600 hover:text-blue-500">Privacy Policy</a>
//                 </p>
//               </div>
//             </form>
//           </div>
          
//           <div className="bg-gray-50 px-8 py-6 border-t border-gray-100">
//             <div className="text-center">
//               <p className="text-sm text-gray-600">
//                 Need help?{' '}
//                 <a href="mailto:support@lekhan.com" className="font-medium text-blue-600 hover:text-blue-500">
//                   Contact support
//                 </a>
//               </p>
//             </div>
//           </div>
//         </div>
        
//         <div className="mt-8 text-center">
//           <p className="text-xs text-gray-500">
//             You'll receive a welcome email after registration. Check your spam folder if you don't see it.
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Register;