import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FaSignInAlt, FaUserPlus } from 'react-icons/fa';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateRegistrationForm = () => {
    if (!isLogin) {
      if (formData.username.trim().length < 3) {
        setError('Username must be at least 3 characters');
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
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }

    return true;
  };

  const sendWelcomeEmail = async (userEmail, userName) => {
    console.log('📧 Sending welcome email to:', userEmail);
    
    try {
      
      const emailjsModule = await import('@emailjs/browser');
      const emailjs = emailjsModule.default || emailjsModule;
      
      
      emailjs.init('Mjrt59vo5ZEcSa_k_');
      
      
      const response = await emailjs.send(
        'service_6b4x16e',
        'template_ra6l6ec',
        {
          to_email: userEmail,
          to_name: userName,
          user_email: userEmail,
          app_url: 'https://lekhan.netlify.app',
          year: new Date().getFullYear().toString()
        }
      );
      
      console.log(' Welcome email sent successfully!', response);
      return { success: true };
      
    } catch (error) {
      console.error(' Email sending error:', error);
      return { 
        success: false, 
        error: error.text || error.message || 'Failed to send email'
      };
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!validateRegistrationForm()) {
      return;
    }

    setLoading(true);

    try {
      let result;
      
      if (isLogin) {
        
        result = await login(formData.email, formData.password);

        if (result.success) {
          navigate('/');
        } else {
          setError(result.error);
        }
      } else {
        
        console.log(' Starting registration process...');
        
        
        result = await register(formData.email, formData.password, formData.username);
        
        console.log('Registration result:', result);
        
        if (!result.success) {
          setError(result.error || 'Registration failed');
          setLoading(false);
          return;
        }

        console.log(' Registration successful');
    
        
        
        sendWelcomeEmail(formData.email, formData.username)
          .then(emailResult => {
            if (emailResult.success) {
              console.log('✅ Welcome email sent successfully!');
              
            } else {
              console.warn('⚠️ Welcome email failed:', emailResult.error);
              setSuccess('✅ Account created! (Welcome email could not be sent)');
            }
          })
          .catch(err => {
            console.error('Email error:', err);
          });

        
        try {
          const loginResult = await login(formData.email, formData.password);
          
          if (loginResult.success) {
            setSuccess(prev => prev + ' Logging you in...');
            
            setTimeout(() => {
              navigate('/', { 
                state: { 
                  message: 'Registration successful! Welcome to Lekhan!' 
                } 
              });
            }, 2000);
          } else {
            
            setTimeout(() => {
              navigate('/login', { 
                state: { 
                  message: 'Registration successful! Please login.' 
                } 
              });
            }, 2000);
          }
        } catch (loginErr) {
          console.warn('Auto-login error:', loginErr);
          
          setTimeout(() => {
            navigate('/login', { 
              state: { 
                message: 'Registration successful! Please login.' 
              } 
            });
          }, 2000);
        }
      }
      
    } catch (err) {
      console.error('Error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg mb-6">
            {isLogin ? (
              <FaSignInAlt className="h-8 w-8 text-white" />
            ) : (
              <FaUserPlus className="h-8 w-8 text-white" />
            )}
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900">
            {isLogin ? 'Welcome' : 'Create Account'}
          </h2>
          <p className="mt-2 text-gray-600">
            {isLogin ? 'Sign in to your account' : 'Join Lekhan and start writing'}
          </p>
          <p className="mt-2 text-sm text-gray-500">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
                setSuccess('');
                setFormData({
                  email: formData.email,
                  password: '',
                  username: '',
                  confirmPassword: ''
                });
              }}
              className="font-medium text-blue-600 hover:text-blue-500 transition"
            >
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
        
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex">
                    <div className="ml-3">
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  </div>
                </div>
              )}
              
              {success && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex">
                    <div className="ml-3">
                      <p className="text-sm text-green-700">{success}</p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Username  */}
              {!isLogin && (
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                    Username
                  </label>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    autoComplete="username"
                    required={!isLogin}
                    value={formData.username}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
                    placeholder="Enter your name"
                    minLength="3"
                    maxLength="30"
                  />
                </div>
              )}

              {/* Email  */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
                  placeholder="Enter your email"
                />
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete={isLogin ? "current-password" : "new-password"}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
                  placeholder={isLogin ? "Enter your password" : "Create a strong password"}
                  minLength="6"
                />
                {!isLogin && (
                  <p className="mt-1 text-xs text-gray-500">
                    Minimum 6 characters
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              {!isLogin && (
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm Password
                  </label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    required={!isLogin}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
                    placeholder="Re-enter your password"
                  />
                </div>
              )}

              {/* Submit Button */}
              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent text-base font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {isLogin ? 'Signing in...' : 'Creating Account...'}
                    </>
                  ) : (
                    <>
                      {isLogin ? (
                        <>
                          <FaSignInAlt className="mr-2 h-5 w-5" />
                          Sign In
                        </>
                      ) : (
                        <>
                          <FaUserPlus className="mr-2 h-5 w-5" />
                          Create Account
                        </>
                      )}
                    </>
                  )}
                </button>
              </div>

              {!isLogin && (
                <div className="text-center mt-4">
                  <p className="text-xs text-gray-500">
                    By creating an account, you agree to our{' '}
                    <a href="#" className="text-blue-600 hover:text-blue-500">Terms</a>{' '}
                    and{' '}
                    <a href="#" className="text-blue-600 hover:text-blue-500">Privacy Policy</a>
                  </p>
                </div>
              )}
            </form>
          </div>
          
          <div className="bg-gray-50 px-8 py-6 border-t border-gray-100">
            <div className="text-center">
              <p className="text-sm text-gray-600">
                {isLogin ? 'Need help signing in? ' : 'Need help with registration? '}
                <a href="amankumar8084227421@gmail.com" className="font-medium text-blue-600 hover:text-blue-500">
                  Contact support
                </a>
              </p>
            </div>
          </div>
        </div>
        
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500">
            {!isLogin && "You'll receive a welcome email after registration. Check your spam folder if you don't see it."}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;