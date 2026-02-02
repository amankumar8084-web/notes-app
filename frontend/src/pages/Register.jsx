import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FaUserPlus, FaUser, FaEnvelope, FaLock } from 'react-icons/fa';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { register, login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    setError('');

    if (formData.username.trim().length < 3) {
      setError('Username must be at least 3 characters');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    return true;
  };

  // FIXED: Correct EmailJS function with proper error handling
  const sendWelcomeEmail = async (userEmail, userName) => {
    try {
      console.log('📧 Attempting to send welcome email to:', userEmail);
      
      // Check if EmailJS is available
      if (typeof window === 'undefined') {
        console.error('EmailJS: Window object not available');
        return { success: false, error: 'Browser environment required' };
      }

      // Dynamically import EmailJS
      const emailjsModule = await import('@emailjs/browser');
      const emailjs = emailjsModule.default || emailjsModule;
      
      console.log('EmailJS module loaded:', !!emailjs);
      
      // Check if EmailJS is initialized
      if (!emailjs.init) {
        console.error('EmailJS init function not found');
        return { success: false, error: 'EmailJS initialization failed' };
      }

      // Initialize EmailJS with PUBLIC KEY
      emailjs.init('Mjrt59vo5ZEcSa_k_');
      console.log('EmailJS initialized');
      
      // Send the welcome email
      console.log('Sending email with parameters:', {
        to_email: userEmail,
        to_name: userName,
        user_email: userEmail,
        app_url: 'https://lekhan.netlify.app',
        year: new Date().getFullYear().toString()
      });

      const response = await emailjs.send(
        'service_6b4x16e', // Service ID
        'template_ra6l6ec', // Template ID
        {
          to_email: userEmail,
          to_name: userName,
          user_email: userEmail,
          app_url: 'https://lekhan.netlify.app',
          year: new Date().getFullYear().toString()
        }
      );
      
      console.log('✅ Email sent successfully!', response);
      return { 
        success: true, 
        response: response,
        message: 'Welcome email sent successfully'
      };
      
    } catch (error) {
      console.error('❌ EmailJS Error Details:', {
        message: error.message,
        text: error.text,
        status: error.status,
        fullError: error
      });
      
      // Return specific error messages based on error type
      let errorMessage = 'Failed to send welcome email';
      if (error.text) {
        errorMessage = error.text;
      } else if (error.message) {
        errorMessage = error.message;
      } else if (error.status === 0) {
        errorMessage = 'Network error. Check internet connection.';
      }
      
      return { 
        success: false, 
        error: errorMessage,
        details: error
      };
    }
  };

  // TEST FUNCTION - Add this temporary button to test email
  const testEmailButton = async () => {
    if (!formData.email || !formData.email.includes('@')) {
      alert('Please enter a valid email address first');
      return;
    }
    
    setLoading(true);
    try {
      console.log('🧪 Testing EmailJS with:', formData.email);
      const result = await sendWelcomeEmail(formData.email, formData.username || 'Test User');
      
      if (result.success) {
        alert(`✅ Test email sent successfully to ${formData.email}! Check your inbox (and spam folder).`);
        console.log('Test result:', result);
      } else {
        alert(`❌ Failed to send test email: ${result.error}`);
        console.error('Test failed:', result);
      }
    } catch (err) {
      alert(`❌ Test error: ${err.message}`);
      console.error('Test error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      console.log('🚀 Starting registration process for:', formData.email);
      
      // 1. Register user in backend
      console.log('📤 Calling register API...');
      const registrationResult = await register(
        formData.email, 
        formData.password, 
        formData.username
      );
      
      console.log('Register API response:', registrationResult);
      
      if (!registrationResult.success) {
        console.error('Registration failed:', registrationResult.error);
        setError(registrationResult.error || 'Registration failed');
        setLoading(false);
        return;
      }

      console.log('✅ Registration successful');
      setSuccess('Account created successfully! Sending welcome email...');
      
      // 2. Send welcome email
      console.log('📧 Attempting to send welcome email...');
      const emailResult = await sendWelcomeEmail(formData.email, formData.username);
      
      if (emailResult.success) {
        console.log('✅ Welcome email sent successfully');
        setSuccess(prev => prev + ' Welcome email sent!');
      } else {
        console.warn('⚠️ Welcome email failed:', emailResult.error);
        // Don't fail registration if email fails, just show warning
        setSuccess(prev => prev + ' (Welcome email could not be sent)');
      }

      // 3. Try auto login
      console.log('🔐 Attempting auto-login...');
      try {
        const loginResult = await login(formData.email, formData.password);
        
        if (loginResult.success) {
          console.log('✅ Auto-login successful');
          setSuccess('✅ Registration complete! Redirecting to dashboard...');
          
          setTimeout(() => {
            navigate('/', { 
              state: { 
                message: 'Registration successful! Welcome!' 
              } 
            });
          }, 2000);
        } else {
          console.warn('⚠️ Auto-login failed:', loginResult.error);
          setSuccess('✅ Registration complete! Please login manually.');
          setTimeout(() => {
            navigate('/login', { 
              state: { 
                message: 'Registration successful! Please login.' 
              } 
            });
          }, 2000);
        }
      } catch (loginErr) {
        console.warn('⚠️ Auto-login error:', loginErr);
        setSuccess('✅ Registration complete! Redirecting to login...');
        setTimeout(() => {
          navigate('/login', { 
            state: { 
              message: 'Registration successful! Please login.' 
            } 
          });
        }, 2000);
      }
      
    } catch (err) {
      console.error('💥 Registration process error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="h-16 w-16 rounded-full bg-blue-600 flex items-center justify-center">
              <FaUserPlus className="h-8 w-8 text-white" />
            </div>
          </div>
          <h2 className="mt-2 text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
              Sign in here
            </Link>
          </p>
        </div>
        
        <div className="bg-white py-8 px-6 shadow rounded-lg sm:px-10">
          {/* TEMPORARY TEST BUTTON - Remove after testing */}
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
            <h3 className="text-sm font-medium text-yellow-800 mb-2">Email Testing</h3>
            <p className="text-xs text-yellow-700 mb-3">
              Enter your email and click below to test EmailJS. Check browser console for detailed logs.
            </p>
            <button
              type="button"
              onClick={testEmailButton}
              disabled={loading || !formData.email}
              className="w-full py-2 px-4 bg-yellow-600 hover:bg-yellow-700 text-white font-medium rounded-md transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              🧪 Test EmailJS Now
            </button>
          </div>
          
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border-l-4 border-red-400 p-4">
                <div className="flex">
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}
            
            {success && (
              <div className="bg-green-50 border-l-4 border-green-400 p-4">
                <div className="flex">
                  <div className="ml-3">
                    <p className="text-sm text-green-700">{success}</p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Username Field */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaUser className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  value={formData.username}
                  onChange={handleChange}
                  className="pl-10 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="johndoe"
                  minLength="3"
                  maxLength="30"
                />
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaEnvelope className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="pl-10 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="you@example.com"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                A welcome email will be sent to this address
              </p>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="pl-10 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="••••••••"
                  minLength="6"
                />
              </div>
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="pl-10 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition duration-150 ease-in-out"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating Account...
                  </>
                ) : (
                  <>
                    <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                      <FaUserPlus className="h-5 w-5 text-blue-500 group-hover:text-blue-400" />
                    </span>
                    Create Account
                  </>
                )}
              </button>
            </div>
          </form>
          
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Check spam folder for welcome email
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;