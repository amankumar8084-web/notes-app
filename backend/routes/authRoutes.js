const express = require("express");
const router = express.Router();
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const authMiddleware = require("../middleware/authMiddleware");

// ================= SIGNUP =================
router.post("/signup", async (req, res) => {
  console.log('\n👤 ======= NEW SIGNUP REQUEST =======');
  console.log('Time:', new Date().toISOString());
  
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

    // 4. Create JWT token for immediate login
    console.log('🔑 Creating JWT token...');
    const token = jwt.sign(
      { userId: newUser._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    console.log('✅ Token created');

    // 5. Send response
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
      note: "A welcome email will be sent to your inbox."
    });
    
    console.log('👤 ======= SIGNUP COMPLETE =======\n');

  } catch (error) {
    console.error('🚨 Signup error:', error.message);
    
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
      "GET /api/auth/profile"
    ]
  });
});

module.exports = router;