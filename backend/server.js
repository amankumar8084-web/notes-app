const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const noteRoutes = require("./routes/noteRoutes");

const app = express();

// Enable CORS for frontend
app.use(cors());

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

// 4. 404 handler for API routes (FIXED: Don't use "*" wildcard)
app.use((req, res, next) => {
  res.status(404).json({
    error: "Route not found",
    message: `Cannot ${req.method} ${req.originalUrl}`,
    availableRoutes: [
      "GET /",
      "GET /health",
      "POST /api/signup",
      "POST /api/login",
      "GET /api/profile",
      "GET /api/notes",
      "POST /api/notes"
    ]
  });
});

// 5. Global error handler
app.use((err, req, res, next) => {
  console.error("Server Error:", err);
  res.status(500).json({
    error: "Internal server error",
    message: process.env.NODE_ENV === "development" ? err.message : "Something went wrong"
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
  
  console.log("📚 Available Endpoints:");
  console.log("   GET  /           - API documentation");
  console.log("   GET  /health     - Health check");
  console.log("   POST /api/signup - User registration");
  console.log("   POST /api/login  - User login");
  console.log("   GET  /api/profile - User profile (protected)");
  console.log("   GET  /api/notes  - Get all notes (protected)");
  console.log("   POST /api/notes  - Create note (protected)");
});