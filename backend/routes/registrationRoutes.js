const express = require("express");
const crypto = require("crypto");
const router = express.Router();

const Registration = require("../models/Registration");
const Event = require("../models/Event");
const { protect, authorize } = require("../middleware/authMiddleware");

// Get registrations of logged-in student
router.get("/my", protect, authorize("student"), async (req, res) => {
  try {
    const registrations = await Registration.find({
      student: req.user.id,
    })
      .populate("event")
      .sort({ registeredAt: -1 });

    res.status(200).json(registrations);
  } catch (error) {
    console.error("Fetch registrations error:", error);
    res.status(500).json({
      message: "Unable to fetch your registrations.",
    });
  }
});

// Check the logged-in student's registration for one event
router.get(
  "/:eventId/status",
  protect,
  authorize("student"),
  async (req, res) => {
    try {
      const registration = await Registration.findOne({
        student: req.user.id,
        event: req.params.eventId,
        status: { $in: ["registered", "attended"] },
      }).select("status");

      return res.status(200).json({
        registered: Boolean(registration),
        status: registration?.status || null,
      });
    } catch (error) {
      console.error("Registration status error:", error);

      return res.status(500).json({
        message: "Unable to check registration status.",
      });
    }
  }
);

// Verify QR pass and mark attendance
router.post(
  "/verify",
  protect,
  authorize("organizer", "admin"),
  async (req, res) => {
    try {
      const { qrToken } = req.body;

      if (!qrToken || typeof qrToken !== "string") {
        return res.status(400).json({
          message: "QR token is required.",
        });
      }

      const registration = await Registration.findOne({
        qrToken: qrToken.trim(),
      }).populate("event");

      if (!registration || !registration.event) {
        return res.status(404).json({
          message: "Invalid QR pass or event not found.",
        });
      }

      const event = registration.event;

      if (event.approvalStatus !== "approved") {
        return res.status(403).json({
          message: "This event is not approved. Attendance cannot be marked.",
        });
      }

      if (
        req.user.role !== "admin" &&
        event.createdBy?.toString() !== req.user.id
      ) {
        return res.status(403).json({
          message: "You are not authorized to verify this event.",
        });
      }

      if (registration.status === "cancelled") {
        return res.status(400).json({
          message: "This registration has been cancelled.",
        });
      }

      if (registration.status === "attended") {
        return res.status(200).json({
          message: "Attendance was already marked.",
          event: event.title,
          status: registration.status,
        });
      }

      registration.status = "attended";
      await registration.save();

      return res.status(200).json({
        message: "Attendance marked successfully!",
        event: event.title,
        status: registration.status,
      });
    } catch (error) {
      console.error("QR verification error:", error);
      return res.status(500).json({
        message: "Unable to verify QR pass.",
      });
    }
  }
);

// Register a student for an event
router.post("/:eventId", protect, authorize("student"), async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);

    if (!event) {
      return res.status(404).json({
        message: "Event not found.",
      });
    }

    if (event.approvalStatus !== "approved") {
      return res.status(403).json({
        message: "This event is not approved for registration.",
      });
    }

    const registration = await Registration.create({
      student: req.user.id,
      event: event._id,
      qrToken: crypto.randomBytes(32).toString("hex"),
    });

    return res.status(201).json({
      message: "Successfully registered for the event!",
      registration,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "You are already registered for this event.",
      });
    }

    console.error("Registration error:", error);
    return res.status(500).json({
      message: "Unable to register for event.",
    });
  }
});

// Cancel a student's registration
router.patch(
  "/:registrationId/cancel",
  protect,
  authorize("student"),
  async (req, res) => {
    try {
      const registration = await Registration.findOne({
        _id: req.params.registrationId,
        student: req.user.id,
      }).populate("event");

      if (!registration) {
        return res.status(404).json({
          message: "Registration not found.",
        });
      }

      if (registration.status === "cancelled") {
        return res.status(400).json({
          message: "This registration is already cancelled.",
        });
      }

      if (registration.status === "attended") {
        return res.status(400).json({
          message: "You cannot cancel a registration after attendance is marked.",
        });
      }

      registration.status = "cancelled";
      await registration.save();

      return res.status(200).json({
        message: "Registration cancelled successfully.",
        registration,
      });
    } catch (error) {
      console.error("Cancellation error:", error);
      return res.status(500).json({
        message: "Unable to cancel registration.",
      });
    }
  }
);

module.exports = router;