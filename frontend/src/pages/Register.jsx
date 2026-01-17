import React, { useState } from 'react';
import emailjs from '@emailjs/browser';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FaUserPlus, FaCheckCircle, FaEnvelope } from 'react-icons/fa';

// 🔹 Initialize EmailJS ONCE (outside component is also fine)
emailjs.init('Mjrt59vo5ZEcSa_k_'); // your public key

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  // 🔹 Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  // 🔹 Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setEmailSent(false);

    // 🔸 Validations
    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match');
    }

    if (formData.password.length < 6) {
      return setError('Password must be at least 6 characters');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      return setError('Please enter a valid email address');
    }

    setLoading(true);

    try {
      // 🔹 Send welcome email
      try {
        await emailjs.send(
          'service_6b4x16e',      // Service ID
          'template_ra6l6ec',     // Template ID
          {
            to_email: formData.email,
            to_name: formData.email.split('@')[0],
            from_name: 'Notes App',
            message: 'Welcome to Notes App! Start organizing your notes.',
            login_url: 'http://localhost:3000/login'
          }
        );
      } catch (emailError) {
        console.error('Email failed:', emailError);
        // Registration should still continue
      }

      // 🔹 Register user
      const result = await register(formData.email, formData.password);

      if (result?.success) {
        setEmailSent(true);

        setTimeout(() => {
          navigate('/login', {
            state: { message: 'Registration successful! Please login.' }
          });
        }, 5000);
      } else {
        setError(result?.error || 'Registration failed');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ✅ SUCCESS SCREEN
  if (emailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full bg-white p-8 rounded-lg shadow text-center">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
              <FaEnvelope className="text-green-600 h-8 w-8" />
            </div>
          </div>

          <h2 className="text-2xl font-bold mb-2">Check Your Email</h2>
          <p className="text-gray-600 mb-2">We sent a welcome email to</p>
          <p className="font-semibold text-blue-700 mb-4">{formData.email}</p>

          <div className="bg-blue-50 border border-blue-200 p-4 rounded mb-4 text-left">
            <div className="flex">
              <FaCheckCircle className="text-blue-600 mr-3 mt-1" />
              <div>
                <p className="font-medium text-blue-900">What’s next?</p>
                <p className="text-sm text-blue-800">
                  Login and start creating notes 🚀
                </p>
              </div>
            </div>
          </div>

          <p className="text-sm text-gray-500 mb-4">
            Redirecting to login in 5 seconds...
          </p>

          <button
            onClick={() => navigate('/login')}
            className="w-full bg-blue-700 text-white py-3 rounded hover:bg-blue-800"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // ✅ REGISTRATION FORM
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-6">
          <div className="flex justify-center mb-3">
            <div className="h-12 w-12 bg-blue-700 rounded-full flex items-center justify-center">
              <FaUserPlus className="text-white h-6 w-6" />
            </div>
          </div>

          <h1 className="text-2xl font-bold">Create your account</h1>
          <p className="text-gray-600 mt-1">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-700 font-medium">
              Sign in
            </Link>
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full p-3 border rounded"
            />

            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full p-3 border rounded"
            />

            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              className="w-full p-3 border rounded"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-700 text-white py-3 rounded hover:bg-blue-800 disabled:opacity-50"
            >
              {loading ? 'Creating Account...' : 'Create Account & Send Email'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
