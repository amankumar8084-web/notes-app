const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const noteRoutes = require("./routes/noteRoutes");

const app = express();

// ============ CORS CONFIGURATION ============
const allowedOrigins = [
  'https://lekhan.netlify.app', // 🔴 replace with your real Netlify URL
  'http://localhost:3000'              // Local development
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (Postman, curl, mobile apps)
    if (!origin) return callback(null, true);

    if (!allowedOrigins.includes(origin)) {
      const msg = 'The CORS policy does not allow access from this origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Parse JSON bodies
app.use(express.json());

// ============ ROUTES ============

// 1. Root route
app.get("/", (req, res) => {
  res.json({
    message: "Welcome to Notes App API",
    version: "1.0.0",
    endpoints: {
      auth: {
        signup: "POST /api/signup",
        login: "POST /api/login",
        profile: "GET /api/profile"
      },
      notes: {
        createNote: "POST /api/notes",
        getNotes: "GET /api/notes",
        updateNote: "PUT /api/notes/:id",
        deleteNote: "DELETE /api/notes/:id"
      }
    },
    status: "Server is running 🚀"
  });
});

// 2. Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? "connected" : "disconnected"
  });
});

// 3. API Routes
app.use("/api", authRoutes);
app.use("/api/notes", noteRoutes);

// ============ ERROR HANDLING ============

// 4. 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: "Route not found",
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
});

// 5. Global error handler
app.use((err, req, res, next) => {
  console.error("Server Error:", err.message);
  res.status(500).json({
    error: "Internal server error",
    message: process.env.NODE_ENV === "development"
      ? err.message
      : "Something went wrong"
  });
});

// ============ DATABASE CONNECTION ============
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("✅ MongoDB connected successfully");
    console.log(`📊 Database: ${mongoose.connection.name}`);
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  });

// ============ START SERVER ============
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`\n=====================================`);
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 Local: http://localhost:${PORT}`);
  console.log(`🔧 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`=====================================\n`);
});
