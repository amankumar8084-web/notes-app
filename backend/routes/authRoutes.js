const express = require("express");
const router = express.Router();
const User = require("../models/user"); 
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const authMiddleware = require(("../middleware/authMiddleware"));
const { sendEmail } = require("../services/emailService");

// ================= SIGNUP =================
// ================= SIGNUP (Updated) =================
router.post("/signup", async (req, res) => {
  const { email, password, username } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      email,
      password: hashedPassword,
      username: username || email.split('@')[0]
    });

    await newUser.save();

    // Send welcome email with better logging
    console.log(`Attempting to send welcome email to: ${email}`);
    
    // Send email (non-blocking)
    setTimeout(async () => {
      try {
        const emailResult = await sendEmail('welcome', email);
        console.log('Email send result:', emailResult);
        
        if (emailResult.devMode && !emailResult.success) {
          console.warn(`⚠️ Email sent in development mode only. To send real emails, configure EMAIL_USER and EMAIL_PASSWORD in environment variables.`);
        } else if (emailResult.success) {
          console.log(`✅ Welcome email processed for ${email}`);
        }
      } catch (emailError) {
        console.error('Email error (non-blocking):', emailError.message);
        // Don't fail signup if email fails
      }
    }, 1000); // Delay 1 second to not block response

    res.status(201).json({ 
      message: "User registered successfully",
      user: {
        id: newUser._id,
        email: newUser.email,
        username: newUser.username
      }
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ 
      message: "Server error",
      error: error.message 
    });
  }
});

// ================= LOGIN =================
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
  { userId: user._id },
  process.env.JWT_SECRET,
  { expiresIn: "1h" }
);

res.status(200).json({
  message: "Login successful",
  token: token,
  user: {
    id: user._id,
    email: user.email,
    username: user.username
  }
});
  }catch (error) {
    res.status(500).json({ message: "Server error"});
  }
});


//============================PROFILE =======================
router.get("/profile", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.json({
      message: "Welcome to protected route",
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});



module.exports = router;
