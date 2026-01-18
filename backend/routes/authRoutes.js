const express = require("express");
const router = express.Router();
const User = require("../models/user"); 
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const authMiddleware = require(("../middleware/authMiddleware"));
const { sendEmail } = require("../services/emailService");

// ================= SIGNUP =================
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

     // Send welcome email (don't await to prevent delay)
    sendEmail('welcome', email)
      .then(sent => {
        if (sent) {
          console.log(`✅ Welcome email sent to ${email}`);
        }
      })
      .catch(err => {
        console.error('Email send error:', err);
        // Don't fail signup if email fails
      });

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
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
