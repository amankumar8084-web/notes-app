const express = require("express");
const router = express.Router();
const Note = require("../models/Note");
const authMiddleware = require("../middleware/authMiddleware");

// CREATE NOTE
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { title, content } = req.body;
    const note = new Note({
      title,
      content,
      user: req.user.userId
    });

    await note.save();
    res.status(201).json(note);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// GET ALL NOTES
router.get("/", authMiddleware, async (req, res) => {
  try {
    const notes = await Note.find({ user: req.user.userId });
    res.json(notes);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// GET SINGLE NOTE
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const note = await Note.findOne({ 
      _id: req.params.id, 
      user: req.user.userId 
    });
    
    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }
    
    res.json(note);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// UPDATE NOTE
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const { title, content } = req.body;
    const note = await Note.findOneAndUpdate(
      { _id: req.params.id, user: req.user.userId },
      { title, content },
      { new: true }
    );
    
    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }
    
    res.json(note);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE NOTE
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const note = await Note.findOneAndDelete({ 
      _id: req.params.id, 
      user: req.user.userId 
    });
    
    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }
    
    res.json({ message: "Note deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;