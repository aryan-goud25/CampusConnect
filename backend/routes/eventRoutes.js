
const express = require("express");
const Event = require("../models/Event");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

// GET: Retrieve approved events (Public)
router.get("/", async (req, res) => {
  try {
    const events = await Event.find({ approvalStatus: "approved" })
      .sort({ date: 1 });

    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET: Organizer's own events (Organizer/Admin)
router.get(
  "/my",
  protect,
  authorize("organizer", "admin"),
  async (req, res) => {
    try {
      const filter =
        req.user.role === "admin" ? {} : { createdBy: req.user.id };

      const events = await Event.find(filter).sort({ createdAt: -1 });
      res.status(200).json(events);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// GET: All pending events (Admin only)
router.get(
  "/admin/pending",
  protect,
  authorize("admin"),
  async (req, res) => {
    try {
      const events = await Event.find({ approvalStatus: "pending" })
        .populate("createdBy", "name email")
        .sort({ createdAt: -1 });

      res.status(200).json(events);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// POST: Create event (Organizer/Admin only)
router.post(
  "/",
  protect,
  authorize("organizer", "admin"),
  async (req, res) => {
    try {
      const {
        approvalStatus,
        rejectionReason,
        createdBy,
        _id,
        __v,
        ...eventData
      } = req.body;

      const newEvent = new Event({
        ...eventData,
        createdBy: req.user.id,
        approvalStatus: "pending",
        rejectionReason: "",
      });

      const savedEvent = await newEvent.save();
      res.status(201).json(savedEvent);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
);

// PATCH: Approve event (Admin only)
router.patch(
  "/:id/approve",
  protect,
  authorize("admin"),
  async (req, res) => {
    try {
      const event = await Event.findById(req.params.id);

      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }

      event.approvalStatus = "approved";
      event.rejectionReason = "";

      await event.save();

      res.status(200).json({
        message: "Event approved successfully",
        event,
      });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
);

// PATCH: Reject event (Admin only)
router.patch(
  "/:id/reject",
  protect,
  authorize("admin"),
  async (req, res) => {
    try {
      const { reason } = req.body;

      if (!reason || !reason.trim()) {
        return res.status(400).json({
          message: "Please provide a rejection reason",
        });
      }

      const event = await Event.findById(req.params.id);

      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }

      event.approvalStatus = "rejected";
      event.rejectionReason = reason.trim();

      await event.save();

      res.status(200).json({
        message: "Event rejected successfully",
        event,
      });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
);

// GET: Retrieve one approved event (Public)
router.get("/:id", async (req, res) => {
  try {
    const event = await Event.findOne({
      _id: req.params.id,
      approvalStatus: "approved",
    });

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.status(200).json(event);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT: Update event (Owner/Admin only)
router.put(
  "/:id",
  protect,
  authorize("organizer", "admin"),
  async (req, res) => {
    try {
      const event = await Event.findById(req.params.id);

      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }

      const isOwner = event.createdBy?.toString() === req.user.id;

      if (req.user.role !== "admin" && !isOwner) {
        return res.status(403).json({
          message: "You can only update your own events",
        });
      }

      const {
        createdBy,
        approvalStatus,
        rejectionReason,
        _id,
        __v,
        ...updates
      } = req.body;

      Object.assign(event, updates);

      // If an organizer edits an event, send it for approval again.
      if (req.user.role !== "admin") {
        event.approvalStatus = "pending";
        event.rejectionReason = "";
      }

      const updatedEvent = await event.save();
      res.status(200).json(updatedEvent);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
);

// DELETE: Delete event (Owner/Admin only)
router.delete(
  "/:id",
  protect,
  authorize("organizer", "admin"),
  async (req, res) => {
    try {
      const event = await Event.findById(req.params.id);

      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }

      const isOwner = event.createdBy?.toString() === req.user.id;

      if (req.user.role !== "admin" && !isOwner) {
        return res.status(403).json({
          message: "You can only delete your own events",
        });
      }

      await event.deleteOne();

      res.status(200).json({
        message: "Event deleted successfully",
      });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
);

module.exports = router;
