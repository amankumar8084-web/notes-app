const express = require("express");
const router = express.Router();
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const authMiddleware = require("../middleware/authMiddleware");


// NEW: Using EmailJS (will send to user's email)
const { sendWelcomeEmail, testEmailJS } = require("../services/emailjsService");

// ================= CHECK EMAIL CONFIG =================
router.get("/check-email-config", (req, res) => {
  console.log('\n🔍 Checking email configuration...');
  
  const config = {
    EMAILJS_SERVICE_ID_EXISTS: !!process.env.EMAILJS_SERVICE_ID,
    EMAILJS_TEMPLATE_ID_EXISTS: !!process.env.EMAILJS_TEMPLATE_ID,
    EMAILJS_USER_ID_EXISTS: !!process.env.EMAILJS_USER_ID,
    FRONTEND_URL: process.env.FRONTEND_URL || 'Not set',
    NODE_ENV: process.env.NODE_ENV || 'development',
    JWT_SECRET_EXISTS: !!process.env.JWT_SECRET
  };
  
  console.log('📊 Email Config:', config);
  
  // Give clear instructions
  let message = "Configuration check completed";
  let help = [];
  let allSet = true;
  
  if (!config.EMAILJS_SERVICE_ID_EXISTS) {
    message = "EMAILJS_SERVICE_ID is NOT SET";
    help.push("1. Go to https://www.emailjs.com and sign up");
    help.push("2. Create email service and template");
    help.push("3. Copy Service ID to Render: EMAILJS_SERVICE_ID=your_id");
    allSet = false;
  }
  
  if (!config.EMAILJS_TEMPLATE_ID_EXISTS) {
    message = "EMAILJS_TEMPLATE_ID is NOT SET";
    help.push("1. Create email template in EmailJS dashboard");
    help.push("2. Copy Template ID to Render: EMAILJS_TEMPLATE_ID=your_id");
    allSet = false;
  }
  
  if (!config.EMAILJS_USER_ID_EXISTS) {
    message = "EMAILJS_USER_ID is NOT SET";
    help.push("1. Get User ID from EmailJS Integration page");
    help.push("2. Copy to Render: EMAILJS_USER_ID=your_id");
    allSet = false;
  }
  
  if (allSet) {
    message = "✅ EmailJS configuration looks good!";
    help.push("Test with /test-email endpoint");
  }
  
  res.json({
    success: true,
    message: message,
    config: config,
    help: help,
    test_endpoint: "POST /api/auth/test-email with {email: 'test@example.com'}"
  });
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
    
    console.log('📊 Test result:', result.success ? 'SUCCESS' : 'FAILED');
    
    if (result.success) {
      res.status(200).json({
        success: true,
        message: "✅ Email test completed successfully",
        result: {
          service: result.service || 'EmailJS',
          status: result.status,
          to: email,
          mode: result.devMode ? 'Development (logged to console)' : 'Production (real email sent)'
        }
      });
    } else {
      res.status(500).json({
        success: false,
        message: "❌ Email test failed",
        error: result.error,
        help: [
          "Check if EmailJS credentials are set in environment variables",
          "Verify Service ID, Template ID, and User ID are correct",
          "Check Render logs for more details"
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
    
    // Use immediate async function
    (async () => {
      try {
        console.log('📧 Background: Starting EmailJS send...');
        const emailResult = await sendWelcomeEmail(email, newUsername);

        console.log('📧 EmailJS result:', {
          success: emailResult.success,
          service: emailResult.service || 'EmailJS',
          error: emailResult.error || 'None',
          devMode: emailResult.devMode || false
        });

        if (emailResult.success) {
          console.log('✅ Welcome email sent successfully to user!');
        } else {
          console.warn('⚠️ Email sending failed but signup succeeded');
          console.warn('💡 User can still use the app');
          if (emailResult.error) {
            console.warn('💡 Error:', emailResult.error);
          }
        }
        
      } catch (emailError) {
        console.error('📧 Email background error:', emailError.message);
        console.error('📧 Full error:', emailError);
        // Don't throw - email failure shouldn't fail signup
      }
    })(); // Immediately invoked

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
      note: "Welcome email is being sent to your inbox"
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
      "POST /api/auth/test-email"
    ]
  });
});

module.exports = router;