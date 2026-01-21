import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FaUserPlus, FaUser, FaEnvelope, FaLock } from 'react-icons/fa';
import { sendWelcomeEmail } from '../services/emailService'; 

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
  const [debugLogs, setDebugLogs] = useState([]);
  
  const { register, login } = useAuth();
  const navigate = useNavigate();

  const addDebugLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    const log = `${timestamp}: ${message}`;
    setDebugLogs(prev => [...prev, { message: log, type }]);
    console.log(`[${type.toUpperCase()}] ${message}`);
  };

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

  // IMPROVED EMAILJS FUNCTION
  const sendWelcomeEmailSimple = async (userEmail, userName) => {
    addDebugLog(`📞 Calling EmailJS for: ${userEmail}`);
    
    try {
      // IMPORTANT: Call EmailJS directly without any wrapper
      const emailjs = await import('@emailjs/browser');
      
      // Initialize with your public key
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
      
      addDebugLog(`✅ Email sent successfully! Status: ${response.status}`, 'success');
      return { 
        success: true, 
        emailSent: true,
        response: response
      };
      
    } catch (error) {
      addDebugLog(`❌ Email error: ${error.text || error.message}`, 'error');
      addDebugLog(`Status: ${error.status}`, 'error');
      
      return { 
        success: false,
        emailFailed: true,
        error: error.text || error.message
      };
    }
  };

  // DIRECT EMAILJS TEST FUNCTION
  const directEmailTest = async () => {
    const testEmail = formData.email || 'amankumar8084227421@gmail.com'; // CHANGE THIS TO YOUR EMAIL
    const testName = formData.username || 'Test User';
    
    addDebugLog('⚡ DIRECT EmailJS Test');
    addDebugLog(`Using email: ${testEmail}`);
    
    try {
      // Load EmailJS directly
      const emailjs = await import('@emailjs/browser');
      emailjs.init('Mjrt59vo5ZEcSa_k_');
      
      const response = await emailjs.send(
        'service_6b4x16e',
        'template_ra6l6ec',
        {
          to_email: testEmail,
          to_name: testName,
          user_email: testEmail,
          app_url: 'https://lekhan.netlify.app',
          year: '2024'
        }
      );
      
      addDebugLog(`✅ DIRECT TEST SUCCESS! Status: ${response.status}`, 'success');
      alert(`✅ Email sent to ${testEmail}! Check your inbox.`);
      
    } catch (error) {
      addDebugLog(`❌ DIRECT TEST ERROR: ${error.text || error.message}`, 'error');
      addDebugLog(`Error status: ${error.status}`, 'error');
      alert(`❌ Error: ${error.text || error.message}`);
    }
  };

  // IMPROVED TEST FUNCTION
  const testEmailJSNow = async () => {
    addDebugLog('🔧 Testing EmailJS via service...');
    const testEmail = formData.email || 'test@example.com'; 
    const testName = formData.username || 'Test User';
    
    if (!testEmail.includes('@')) {
      alert('⚠️ Please enter a valid email address first');
      addDebugLog('❌ Test failed: Invalid email address', 'error');
      return;
    }
    
    try {
      addDebugLog(`Testing with email: ${testEmail}, name: ${testName}`);
      const result = await sendWelcomeEmail(testEmail, testName);
      
      if (result.success) {
        addDebugLog(`✅ EmailJS Test Success!`, 'success');
        alert(`✅ EmailJS Working!\nCheck ${testEmail} for welcome email.`);
      } else {
        addDebugLog(`❌ EmailJS Test Failed: ${result.error}`, 'error');
        alert(`❌ EmailJS Failed:\n${result.error || 'Unknown error'}`);
      }
    } catch (err) {
      addDebugLog(`💥 Test Error: ${err.message}`, 'error');
      alert(`❌ Test Error: ${err.message}`);
    }
  };

  // DEBUG FUNCTION
  const debugRegistrationFlow = async () => {
    addDebugLog('🐛 Debugging registration flow...');
    
    const testEmail = formData.email || 'test' + Date.now() + '@example.com';
    const testPassword = 'TestPassword123';
    const testUsername = formData.username || 'TestUser';
    
    addDebugLog(`Test data - Email: ${testEmail}, Username: ${testUsername}`);
    
    try {
      // 1. Test backend registration
      addDebugLog('1️⃣ Testing backend registration API...');
      const registerResponse = await fetch('https://notes-app-backend-mga4.onrender.com/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: testEmail,
          password: testPassword,
          username: testUsername
        })
      });
      
      const registerData = await registerResponse.json();
      addDebugLog(`Backend response: ${registerResponse.status} - ${registerData.message || 'No message'}`);
      
      if (registerData.success) {
        addDebugLog('✅ Backend registration successful!', 'success');
        
        // 2. Test EmailJS directly
        addDebugLog('2️⃣ Testing EmailJS directly...');
        const emailjs = await import('@emailjs/browser');
        emailjs.init('Mjrt59vo5ZEcSa_k_');
        
        const emailResult = await emailjs.send(
          'service_6b4x16e',
          'template_ra6l6ec',
          {
            to_email: testEmail,
            to_name: testUsername,
            user_email: testEmail,
            app_url: 'https://lekhan.netlify.app',
            year: new Date().getFullYear().toString()
          }
        );
        
        addDebugLog(`✅ EmailJS direct test success: ${emailResult.status}`, 'success');
        alert('✅ Both registration and EmailJS working! Check console for details.');
        
      } else {
        addDebugLog(`❌ Backend registration failed: ${registerData.message}`, 'error');
        alert('❌ Registration failed: ' + registerData.message);
      }
      
    } catch (error) {
      addDebugLog(`💥 Debug error: ${error.message}`, 'error');
      alert('❌ Debug error: ' + error.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    addDebugLog('🚀 Form submission started');
    
    if (!validateForm()) {
      addDebugLog('❌ Form validation failed', 'error');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');
    setDebugLogs([]);

    try {
      addDebugLog(`📤 Attempting to register user: ${formData.email}`);
      
      // 1. Register user
      const result = await register(
        formData.email, 
        formData.password, 
        formData.username
      );
      
      addDebugLog(`📥 Register API response: ${result.success ? 'Success' : 'Failed'}`);
      
      if (!result.success) {
        addDebugLog(`❌ Registration failed: ${result.error}`, 'error');
        setError(result.error || 'Registration failed');
        setLoading(false);
        return;
      }

      addDebugLog('✅ Registration successful, sending welcome email...', 'success');
      
      // 2. Send welcome email (fire and forget - don't wait for completion)
      sendWelcomeEmailSimple(formData.email, formData.username)
        .then(emailResult => {
          addDebugLog(`📧 Email result: ${emailResult.emailSent ? 'Sent' : 'Failed'}`, 
                     emailResult.emailSent ? 'success' : 'error');
        })
        .catch(emailErr => {
          addDebugLog(`💥 Email error (non-blocking): ${emailErr.message}`, 'error');
        });

      // 3. Try auto login
      addDebugLog('🔐 Attempting auto-login...');
      try {
        const loginResult = await login(formData.email, formData.password);
        
        if (loginResult.success) {
          addDebugLog('✅ Auto-login successful!', 'success');
          setSuccess('✅ Account created successfully! Welcome email sent. Redirecting...');
          
          setTimeout(() => {
            navigate('/', { 
              state: { 
                message: 'Registration successful! Welcome!' 
              } 
            });
          }, 2000);
        } else {
          addDebugLog(`⚠️ Auto-login failed: ${loginResult.error}`, 'warning');
          setSuccess('✅ Account created! Please login manually.');
          setTimeout(() => {
            navigate('/login', { 
              state: { 
                message: 'Registration successful! Please login.' 
              } 
            });
          }, 2000);
        }
      } catch (loginErr) {
        addDebugLog(`⚠️ Auto-login error: ${loginErr.message}`, 'warning');
        setSuccess('✅ Account created! Redirecting to login...');
        setTimeout(() => {
          navigate('/login', { 
            state: { 
              message: 'Registration successful! Please login.' 
            } 
          });
        }, 2000);
      }
      
    } catch (err) {
      addDebugLog(`💥 Registration error: ${err.message}`, 'error');
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-4 px-3 sm:py-8 sm:px-6 lg:px-8">
      <div className="w-full max-w-4xl mx-auto">
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
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Registration Form */}
          <div className="bg-white rounded-lg shadow border border-gray-200 py-6 px-4 sm:px-8">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Debug Tools</h3>
              
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={directEmailTest}
                  className="w-full py-2 px-4 bg-green-600 hover:bg-green-700 text-white font-medium rounded transition"
                >
                  ⚡ Direct EmailJS Test
                </button>
                
                <button
                  type="button"
                  onClick={testEmailJSNow}
                  className="w-full py-2 px-4 bg-yellow-500 hover:bg-yellow-600 text-white font-medium rounded transition"
                >
                  🧪 Test EmailJS Service
                </button>
                
                <button
                  type="button"
                  onClick={debugRegistrationFlow}
                  className="w-full py-2 px-4 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded transition"
                >
                  🐛 Debug Registration Flow
                </button>
              </div>
              
              <p className="text-xs text-gray-500 mt-2 text-center">
                Test EmailJS directly or through service layer
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
                <p className="mt-1 text-xs text-gray-400 italic">
                  Use your real email to receive test emails
                </p>
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

          {/* Right Column - Debug Logs */}
          <div className="bg-gray-900 rounded-lg shadow border border-gray-800 p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-white font-semibold">Debug Console</h3>
              <button
                onClick={() => setDebugLogs([])}
                className="text-sm bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded"
              >
                Clear Logs
              </button>
            </div>
            
            <div className="h-[400px] overflow-y-auto bg-black rounded p-3">
              {debugLogs.length === 0 ? (
                <p className="text-gray-500 text-sm italic">No logs yet. Use test buttons or register to see logs.</p>
              ) : (
                debugLogs.map((log, index) => (
                  <div 
                    key={index} 
                    className={`text-sm font-mono mb-1 ${
                      log.type === 'error' ? 'text-red-400' :
                      log.type === 'success' ? 'text-green-400' :
                      log.type === 'warning' ? 'text-yellow-400' :
                      'text-gray-300'
                    }`}
                  >
                    {log.message}
                  </div>
                ))
              )}
            </div>
            
            <div className="mt-4 text-xs text-gray-400">
              <p className="font-medium mb-1">Test Instructions:</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Enter your real email above</li>
                <li>Click <span className="text-green-400">"⚡ Direct EmailJS Test"</span></li>
                <li>Check if email arrives in your inbox</li>
                <li>Check debug console for errors/success</li>
              </ol>
            </div>
          </div>
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