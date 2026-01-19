import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FaUserPlus, FaUser, FaEnvelope, FaLock } from 'react-icons/fa';
import { sendWelcomeEmail } from '../services/emailService'; // ADD THIS IMPORT

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

  // ACTUAL EMAILJS FUNCTION - REPLACED THE OLD ONE
  const sendWelcomeEmailSimple = async (userEmail, userName) => {
    console.log('📧 Sending welcome email via EmailJS to:', userEmail);
    
    try {
      const emailResult = await sendWelcomeEmail(userEmail, userName);
      
      if (emailResult.success) {
        console.log('✅ Email sent successfully!');
        return { 
          success: true, 
          message: 'Welcome email sent',
          emailSent: true 
        };
      } else {
        console.error('❌ EmailJS failed:', emailResult.error);
        // Still continue registration even if email fails
        return { 
          success: true, 
          message: 'Registration successful, but email failed',
          emailFailed: true,
          error: emailResult.error
        };
      }
    } catch (err) {
      console.error('❌ Email sending error:', err);
      // Still continue registration
      return { 
        success: true, 
        message: 'Registration successful',
        emailFailed: true 
      };
    }
  };

  // TEST FUNCTION FOR EMAILJS
  const testEmailJSNow = async () => {
    console.log('🔧 Testing EmailJS directly...');
    const testEmail = formData.email || 'test@example.com'; // Use form email if available
    const testName = formData.username || 'Test User';
    
    try {
      const result = await sendWelcomeEmail(testEmail, testName);
      console.log('Test Result:', result);
      if (result.success) {
        alert('✅ EmailJS Working! Check console for details.');
      } else {
        alert('❌ EmailJS Failed: ' + result.error);
      }
    } catch (err) {
      console.error('Test Error:', err);
      alert('❌ Test Error: ' + err.message);
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
      // 1. Register user
      const result = await register(
        formData.email, 
        formData.password, 
        formData.username
      );
      
      if (!result.success) {
        setError(result.error || 'Registration failed');
        setLoading(false);
        return;
      }

      // 2. Send welcome email (using actual EmailJS)
      const emailResult = await sendWelcomeEmailSimple(formData.email, formData.username);

      // 3. Auto login
      const loginResult = await login(formData.email, formData.password);
      
      if (loginResult.success) {
        if (emailResult.emailFailed) {
          setSuccess('✅ Account created! (Welcome email failed - check console) Redirecting...');
        } else {
          setSuccess('✅ Account created successfully! Welcome email sent. Redirecting...');
        }
        
        setTimeout(() => {
          navigate('/', { 
            state: { 
              message: 'Registration successful! Welcome!' 
            } 
          });
        }, 2000);
      } else {
        setSuccess('✅ Account created! Please login manually.');
        setTimeout(() => {
          navigate('/login', { 
            state: { 
              message: 'Registration successful! Please login.' 
            } 
          });
        }, 2000);
      }
      
    } catch (err) {
      console.error('Registration error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-4 px-3 sm:py-8 sm:px-6 lg:px-8">
      <div className="w-full max-w-md mx-auto">
        <div className="text-center mb-6 sm:mb-8">
          <div className="flex justify-center mb-4">
            <div className="h-12 w-12 rounded-full bg-blue-700 flex items-center justify-center">
              <FaUserPlus className="h-6 w-6 text-white" />
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Create your account
          </h1>
          <p className="mt-2 text-sm sm:text-base text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-blue-700 hover:text-blue-800">
              Sign in
            </Link>
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow border border-gray-200 py-6 px-4 sm:px-8">
          {/* Test EmailJS Button */}
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
            <button
              type="button"
              onClick={testEmailJSNow}
              className="w-full py-2 px-4 bg-yellow-500 hover:bg-yellow-600 text-white font-medium rounded transition"
            >
              🧪 Test EmailJS Service
            </button>
            <p className="text-xs text-yellow-700 mt-2 text-center">
              Test EmailJS before registering (uses your entered email)
            </p>
          </div>
          
          <form className="space-y-4" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-3 py-2 sm:px-4 sm:py-3 rounded text-sm sm:text-base">
                {error}
              </div>
            )}
            
            {success && (
              <div className="bg-green-50 border border-green-200 text-green-600 px-3 py-2 sm:px-4 sm:py-3 rounded text-sm sm:text-base">
                {success}
              </div>
            )}
            
            {/* Username Field */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
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
                  className="pl-10 w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-700 focus:border-blue-700 outline-none transition text-sm sm:text-base"
                  placeholder="johndoe"
                  minLength="3"
                  maxLength="30"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                This will be displayed in your profile (3-30 characters)
              </p>
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
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
                  className="pl-10 w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-700 focus:border-blue-700 outline-none transition text-sm sm:text-base"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
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
                  className="pl-10 w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-700 focus:border-blue-700 outline-none transition text-sm sm:text-base"
                  placeholder="••••••••"
                  minLength="6"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Must be at least 6 characters
              </p>
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
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
                  className="pl-10 w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-700 focus:border-blue-700 outline-none transition text-sm sm:text-base"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center py-2.5 sm:py-3 px-4 border border-transparent text-sm sm:text-base font-medium rounded-lg text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-700 disabled:opacity-50 transition min-h-[44px]"
              >
                {loading ? (
                  <>
                    <div className="h-4 w-4 sm:h-5 sm:w-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Creating Account...
                  </>
                ) : (
                  <>
                    <FaUserPlus className="mr-2" />
                    Create Account
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        <div className="mt-6 text-center">
          <p className="text-xs sm:text-sm text-gray-500">
            By creating an account, you agree to our Terms of Service and Privacy Policy
          </p>
          <p className="mt-2 text-xs text-gray-400">
            A welcome email will be sent to your email address after registration
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;