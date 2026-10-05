
const express = require("express");
const mongoose = require("mongoose");
const Bookmark = require("../models/Bookmark");
const Event = require("../models/Event");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

// Get student's bookmarks
router.get("/my", protect, authorize("student"), async (req, res) => {
  try {
    const bookmarks = await Bookmark.find({
      student: req.user.id,
    })
      .populate("event")
      .sort({ createdAt: -1 });

    res.status(200).json(bookmarks.filter((item) => item.event));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add a bookmark
router.post("/:eventId", protect, authorize("student"), async (req, res) => {
  try {
    const { eventId } = req.params;

    if (!mongoose.isValidObjectId(eventId)) {
      return res.status(400).json({ message: "Invalid event ID" });
    }

    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    const existing = await Bookmark.findOne({
      student: req.user.id,
      event: eventId,
    });

    if (existing) {
      return res.status(200).json({
        message: "Event is already bookmarked",
        bookmark: existing,
      });
    }

    const bookmark = await Bookmark.create({
      student: req.user.id,
      event: eventId,
    });

    res.status(201).json({
      message: "Event bookmarked successfully",
      bookmark,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(200).json({ message: "Event is already bookmarked" });
    }
    res.status(500).json({ message: error.message });
  }
});

// Remove a bookmark
router.delete("/:eventId", protect, authorize("student"), async (req, res) => {
  try {
    const { eventId } = req.params;

    if (!mongoose.isValidObjectId(eventId)) {
      return res.status(400).json({ message: "Invalid event ID" });
    }

    const bookmark = await Bookmark.findOneAndDelete({
      student: req.user.id,
      event: eventId,
    });

    if (!bookmark) {
      return res.status(404).json({ message: "Bookmark not found" });
    }

    res.status(200).json({ message: "Bookmark removed successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;