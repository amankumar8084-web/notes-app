const express = require("express");
const router = express.Router();
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const authMiddleware = require("../middleware/authMiddleware");
const { sendEmailViaResend } = require("../services/resendEmailService");

// ================= SIGNUP =================
router.post("/signup", async (req, res) => {
  const { email, password, username } = req.body;

  try {
    // 1. Check existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // 2. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUsername = username || email.split("@")[0];

    // 3. Save user
    const newUser = new User({
      email,
      password: hashedPassword,
      username: newUsername
    });

    await newUser.save();

    // 4. Send welcome email (non-blocking, Resend)
    setTimeout(async () => {
      try {
        const emailResult = await sendEmailViaResend("welcome", email, {
          username: newUsername
        });

        console.log("📧 Email send result:", {
          success: emailResult.success,
          mode: emailResult.devMode ? "Dev Mode" : "Production",
          message: emailResult.message
        });

      } catch (emailError) {
        console.error("📧 Email background error:", emailError.message);
      }
    }, 100);

    // 5. Response
    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: newUser._id,
        email: newUser.email,
        username: newUser.username
      },
      note: "Welcome email has been sent to your inbox"
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
      token,
      user: {
        id: user._id,
        email: user.email,
        username: user.username
      }
    });

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// ================= PROFILE =================
router.get("/profile", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password");
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
