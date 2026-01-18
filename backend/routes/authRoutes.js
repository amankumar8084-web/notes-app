const express = require("express");
const router = express.Router();
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const authMiddleware = require("../middleware/authMiddleware");
const axios = require("axios"); // Added for debug endpoint

// ================= EMAILJS IMPORT =================
const { sendWelcomeEmail, testEmailJS } = require("../services/emailjsService");

// ================= CHECK EMAIL CONFIG =================
router.get("/check-email-config", (req, res) => {
  console.log('\n🔍 Checking EmailJS configuration...');
  
  const config = {
    EMAILJS_SERVICE_ID_EXISTS: !!process.env.EMAILJS_SERVICE_ID,
    EMAILJS_TEMPLATE_ID_EXISTS: !!process.env.EMAILJS_TEMPLATE_ID,
    EMAILJS_USER_ID_EXISTS: !!process.env.EMAILJS_USER_ID,
    EMAILJS_SERVICE_ID_PREVIEW: process.env.EMAILJS_SERVICE_ID ? 
      `${process.env.EMAILJS_SERVICE_ID.substring(0, 10)}...` : 'Not set',
    EMAILJS_TEMPLATE_ID_PREVIEW: process.env.EMAILJS_TEMPLATE_ID ? 
      `${process.env.EMAILJS_TEMPLATE_ID.substring(0, 10)}...` : 'Not set',
    FRONTEND_URL: process.env.FRONTEND_URL || 'Not set',
    NODE_ENV: process.env.NODE_ENV || 'development',
    JWT_SECRET_EXISTS: !!process.env.JWT_SECRET
  };
  
  console.log('📊 EmailJS Config:', config);
  
  // Give clear instructions
  let message = "Configuration check completed";
  let help = [];
  let allSet = true;
  
  if (!config.EMAILJS_SERVICE_ID_EXISTS) {
    message = "EMAILJS_SERVICE_ID is NOT SET";
    help.push("1. Go to https://www.emailjs.com → Email Services");
    help.push("2. Copy 'Service ID'");
    help.push("3. Add to Render: EMAILJS_SERVICE_ID=service_xxxxx");
    allSet = false;
  }
  
  if (!config.EMAILJS_TEMPLATE_ID_EXISTS) {
    message = "EMAILJS_TEMPLATE_ID is NOT SET";
    help.push("1. Go to https://www.emailjs.com → Email Templates");
    help.push("2. Create template with {{to_email}}, {{to_name}} variables");
    help.push("3. Copy 'Template ID' to Render: EMAILJS_TEMPLATE_ID=template_xxxx");
    allSet = false;
  }
  
  if (!config.EMAILJS_USER_ID_EXISTS) {
    message = "EMAILJS_USER_ID is NOT SET";
    help.push("1. Go to https://www.emailjs.com → Integration");
    help.push("2. Copy 'User ID' (Public Key)");
    help.push("3. Add to Render: EMAILJS_USER_ID=user_xxxxxxxx");
    allSet = false;
  }
  
  if (allSet) {
    message = "✅ EmailJS configuration looks good!";
    help.push("Test with: POST /api/auth/test-email");
    help.push("Test with: POST /api/auth/debug-emailjs");
  }
  
  res.json({
    success: true,
    message: message,
    config: config,
    help: help,
    test_endpoints: [
      "POST /api/auth/test-email with {email: 'your@email.com'}",
      "POST /api/auth/debug-emailjs with {email: 'your@email.com'}"
    ]
  });
});

// ================= DEBUG EMAILJS ENDPOINT =================
router.post("/debug-emailjs", async (req, res) => {
  console.log('\n🐛🐛🐛 DEBUGGING EMAILJS 🐛🐛🐛');
  
  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({ 
      success: false, 
      message: "Email is required",
      example: { "email": "test@example.com" }
    });
  }
  
  console.log('🔧 Testing EmailJS with email:', email);
  
  // Validate email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      message: "Invalid email format"
    });
  }
  
  try {
    // Check environment variables
    console.log('📋 Environment Check:');
    console.log('EMAILJS_SERVICE_ID:', process.env.EMAILJS_SERVICE_ID ? '✅ Set' : '❌ Not Set');
    console.log('EMAILJS_TEMPLATE_ID:', process.env.EMAILJS_TEMPLATE_ID ? '✅ Set' : '❌ Not Set');
    console.log('EMAILJS_USER_ID:', process.env.EMAILJS_USER_ID ? '✅ Set' : '❌ Not Set');
    
    if (!process.env.EMAILJS_SERVICE_ID || !process.env.EMAILJS_TEMPLATE_ID || !process.env.EMAILJS_USER_ID) {
      console.log('❌ Missing EmailJS credentials');
      return res.json({
        success: false,
        message: "EmailJS credentials missing",
        help: "Add EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, EMAILJS_USER_ID to Render environment"
      });
    }
    
    // Test with simple EmailJS request
    const testData = {
      service_id: process.env.EMAILJS_SERVICE_ID,
      template_id: process.env.EMAILJS_TEMPLATE_ID,
      user_id: process.env.EMAILJS_USER_ID,
      template_params: {
        to_email: email,
        to_name: 'Test User',
        from_name: 'Notes App',
        subject: 'Test Email from Notes App',
        message: 'This is a test email from Notes App debug endpoint.',
        app_url: process.env.FRONTEND_URL || 'https://lekhan.netlify.app',
        year: new Date().getFullYear()
      }
    };
    
    console.log('📤 Sending test request to EmailJS...');
    console.log('Request data:', JSON.stringify(testData, null, 2));
    
    const response = await axios.post(
      'https://api.emailjs.com/api/v1.0/email/send',
      testData,
      {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        timeout: 30000
      }
    );
    
    console.log('✅ EmailJS Response Status:', response.status);
    console.log('✅ Response Data:', JSON.stringify(response.data, null, 2));
    
    res.json({
      success: true,
      message: "EmailJS debug test successful",
      status: response.status,
      data: response.data,
      note: "Check your email inbox (and spam folder)"
    });
    
  } catch (error) {
    console.error('❌ Debug error:', error.message);
    
    let errorDetails = {};
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
      errorDetails = {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers
      };
    } else if (error.request) {
      console.error('No response received');
      errorDetails = { noResponse: true };
    } else {
      console.error('Setup error:', error.message);
      errorDetails = { message: error.message };
    }
    
    res.status(500).json({
      success: false,
      message: "EmailJS debug test failed",
      error: error.message,
      details: errorDetails,
      help: [
        "Check EmailJS template uses {{to_email}} and {{to_name}} variables",
        "Verify Service ID, Template ID, and User ID are correct",
        "Make sure template is published in EmailJS dashboard"
      ]
    });
  }
  
  console.log('🐛🐛🐛 DEBUG COMPLETE 🐛🐛🐛\n');
});

// ================= TEST EMAIL ENDPOINT =================
router.post("/test-email", async (req, res) => {
  console.log('\n🎯 TEST EMAIL ENDPOINT CALLED');
  
  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({ 
      success: false, 
      message: "Email is required in request body",
      example: { "email": "test@example.com" }
    });
  }
  
  console.log('Testing EmailJS with email:', email);
  
  try {
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format"
      });
    }
    
    console.log('📧 Calling sendWelcomeEmail (EmailJS)...');
    const result = await sendWelcomeEmail(email, 'Test User');
    
    console.log('📊 Test result:', result.success ? '✅ SUCCESS' : '❌ FAILED');
    
    if (result.success) {
      res.status(200).json({
        success: true,
        message: "✅ Email test completed successfully",
        result: {
          service: result.service || 'EmailJS',
          status: result.status,
          to: email,
          mode: result.devMode ? 'Development (logged to console)' : 'Production (real email sent)',
          note: "Check your email inbox (and spam folder)"
        }
      });
    } else {
      res.status(500).json({
        success: false,
        message: "❌ Email test failed",
        error: result.error,
        devMode: result.devMode,
        help: [
          "Check EmailJS credentials in environment variables",
          "Use /api/auth/debug-emailjs endpoint for detailed debugging",
          "Verify template variables match: {{to_email}}, {{to_name}}, etc."
        ],
        result: result
      });
    }
    
  } catch (error) {
    console.error("🚨 Email test error:", error);
    res.status(500).json({ 
      success: false,
      message: "Email test failed with exception",
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// ================= SIGNUP =================
router.post("/signup", async (req, res) => {
  console.log('\n👤 ======= NEW SIGNUP REQUEST =======');
  console.log('Time:', new Date().toISOString());
  console.log('Body:', JSON.stringify(req.body, null, 2));
  
  const { email, password, username } = req.body;

  // Validation
  if (!email || !password) {
    console.log('❌ Missing email or password');
    return res.status(400).json({ 
      success: false,
      message: "Email and password are required" 
    });
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    console.log('❌ Invalid email format:', email);
    return res.status(400).json({
      success: false,
      message: "Invalid email format"
    });
  }

  try {
    // 1. Check existing user
    console.log('🔍 Checking if user exists...');
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('❌ User already exists:', email);
      return res.status(400).json({ 
        success: false,
        message: "User already exists" 
      });
    }
    console.log('✅ User does not exist');

    // 2. Hash password
    console.log('🔐 Hashing password...');
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUsername = username || email.split("@")[0];
    console.log('✅ Password hashed');
    console.log('✅ Username:', newUsername);

    // 3. Save user
    console.log('💾 Saving user to database...');
    const newUser = new User({
      email,
      password: hashedPassword,
      username: newUsername
    });

    await newUser.save();
    console.log('✅ User saved with ID:', newUser._id);

    // 4. Send welcome email using EmailJS (non-blocking)
    console.log('📧 Scheduling welcome email via EmailJS...');
    
    // Use immediate async function with small delay
    (async () => {
      try {
        // Small delay to ensure response is sent to user first
        await new Promise(resolve => setTimeout(resolve, 300));
        
        console.log('📧 Background: Starting EmailJS send...');
        console.log('📧 Sending to:', email);
        console.log('📧 Username:', newUsername);
        
        const emailResult = await sendWelcomeEmail(email, newUsername);

        console.log('📧 EmailJS result:', {
          success: emailResult.success,
          service: 'EmailJS',
          error: emailResult.error || 'None',
          devMode: emailResult.devMode || false,
          fallback: emailResult.fallback || 'None'
        });

        if (emailResult.success) {
          console.log('✅✅✅ Welcome email sent successfully to user!');
          console.log('✅ Email ID:', emailResult.emailId || 'Not available');
        } else {
          console.warn('⚠️ Email sending failed but signup succeeded');
          if (emailResult.error) {
            console.warn('💡 Error:', emailResult.error);
          }
          if (emailResult.devMode) {
            console.warn('💡 Running in dev mode - check EmailJS configuration');
            console.warn('💡 Email was logged to console instead');
          }
          if (emailResult.fallback) {
            console.warn('💡 Fallback:', emailResult.fallback);
          }
        }
        
      } catch (emailError) {
        console.error('📧 Email background error:', emailError.message);
        console.error('📧 Stack:', emailError.stack);
        // Don't throw - email failure shouldn't fail signup
      }
    })();

    // 5. Create JWT token for immediate login
    console.log('🔑 Creating JWT token...');
    const token = jwt.sign(
      { userId: newUser._id },
      process.env.JWT_SECRET || 'fallback-secret-change-in-production',
      { expiresIn: "7d" } // Longer expiry for better UX
    );
    console.log('✅ Token created');

    // 6. Send response
    console.log('📤 Sending response to client...');
    res.status(201).json({
      success: true,
      message: "🎉 Account created successfully!",
      token: token,
      user: {
        id: newUser._id,
        email: newUser.email,
        username: newUsername,
        createdAt: newUser.createdAt
      },
      note: "Welcome email is being sent to your inbox. Check spam folder if not received."
    });
    
    console.log('👤 ======= SIGNUP COMPLETE =======\n');

  } catch (error) {
    console.error('🚨 Signup error:', error.message);
    console.error('🚨 Full error:', error);
    
    // Provide specific error messages
    let errorMessage = "Server error";
    if (error.name === 'ValidationError') {
      errorMessage = "Invalid user data";
    } else if (error.code === 11000) {
      errorMessage = "Email already exists";
    }
    
    res.status(500).json({
      success: false,
      message: errorMessage,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ================= LOGIN =================
router.post("/login", async (req, res) => {
  console.log('\n🔐 ======= LOGIN ATTEMPT =======');
  console.log('Email:', req.body.email);
  
  const { email, password } = req.body;

  // Validation
  if (!email || !password) {
    return res.status(400).json({ 
      success: false,
      message: "Email and password are required" 
    });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      console.log('❌ User not found:', email);
      return res.status(400).json({ 
        success: false,
        message: "Invalid email or password" 
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log('❌ Password mismatch for:', email);
      return res.status(400).json({ 
        success: false,
        message: "Invalid email or password" 
      });
    }

    console.log('✅ Login successful for:', email);
    
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      success: true,
      message: "Login successful",
      token: token,
      user: {
        id: user._id,
        email: user.email,
        username: user.username
      }
    });
    
    console.log('🔐 ======= LOGIN COMPLETE =======\n');

  } catch (error) {
    console.error('🚨 Login error:', error);
    res.status(500).json({ 
      success: false,
      message: "Server error" 
    });
  }
});

// ================= PROFILE =================
router.get("/profile", authMiddleware, async (req, res) => {
  console.log('\n👤 Profile request for user ID:', req.user.userId);
  
  try {
    const user = await User.findById(req.user.userId).select("-password");
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: "User not found" 
      });
    }

    res.json({
      success: true,
      message: "Profile retrieved successfully",
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        createdAt: user.createdAt
      }
    });
    
  } catch (error) {
    console.error('🚨 Profile error:', error);
    res.status(500).json({ 
      success: false,
      message: "Server error" 
    });
  }
});

// ================= HEALTH CHECK =================
router.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "Auth service is running",
    timestamp: new Date().toISOString(),
    endpoints: [
      "POST /api/auth/signup",
      "POST /api/auth/login", 
      "GET /api/auth/profile",
      "GET /api/auth/check-email-config",
      "POST /api/auth/test-email",
      "POST /api/auth/debug-emailjs"
    ],
    email_service: "EmailJS"
  });
});

module.exports = router;