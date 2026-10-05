const express = require("express");
const router = express.Router();

const User = require("../models/User");
const { protect, authorize } = require("../middleware/authMiddleware");

const allowedInterests = [
  "Technical",
  "Cultural",
  "Educational",
  "Sports",
  "Other",
];

// Save or update student interests
router.put("/", protect, authorize("student"), async (req, res) => {
  try {
    const { interests } = req.body;

    if (!Array.isArray(interests)) {
      return res.status(400).json({
        message: "Interests must be an array.",
      });
    }

    const uniqueInterests = [...new Set(interests)];

    if (uniqueInterests.some(
      (interest) => !allowedInterests.includes(interest)
    )) {
      return res.status(400).json({
        message: "One or more interests are invalid.",
        allowedInterests,
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: { interests: uniqueInterests } },
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "Student not found.",
      });
    }

    res.status(200).json({
      message: "Interests saved successfully!",
      interests: user.interests,
    });
  } catch (error) {
    console.error("Save interests error:", error);
    res.status(500).json({
      message: "Unable to save interests.",
    });
  }
});

// Get logged-in student's interests
router.get("/", protect, authorize("student"), async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("interests");

    if (!user) {
      return res.status(404).json({
        message: "Student not found.",
      });
    }

    res.status(200).json({
      interests: user.interests,
    });
  } catch (error) {
    console.error("Fetch interests error:", error);
    res.status(500).json({
      message: "Unable to fetch interests.",
    });
  }
});

module.exports = router;