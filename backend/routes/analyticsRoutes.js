
const express = require("express");
const Event = require("../models/Event");
const Registration = require("../models/Registration");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

// Organizer analytics
router.get("/organizer", protect, authorize("organizer", "admin"), async (req, res) => {
  try {
    let eventFilter = {};

    // Organizers can only view their own events.
    // Admins can view all events.
    if (req.user.role !== "admin") {
      eventFilter.createdBy = req.user.id;
    }

    const events = await Event.find(eventFilter)
      .select("title category date location")
      .lean();

    const eventIds = events.map((event) => event._id);

    const stats = await Registration.aggregate([
      {
        $match: {
          event: { $in: eventIds },
        },
      },
      {
        $group: {
          _id: "$event",
          totalRegistrations: {
            $sum: {
              $cond: [{ $in: ["$status", ["registered", "attended"]] }, 1, 0],
            },
          },
          attended: {
            $sum: {
              $cond: [{ $eq: ["$status", "attended"] }, 1, 0],
            },
          },
          cancelled: {
            $sum: {
              $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0],
            },
          },
        },
      },
    ]);

    const statsMap = new Map(
      stats.map((item) => [String(item._id), item])
    );

    const eventStats = events.map((event) => {
      const stat = statsMap.get(String(event._id)) || {
        totalRegistrations: 0,
        attended: 0,
        cancelled: 0,
      };

      const attendanceRate = stat.totalRegistrations
        ? Number(
            ((stat.attended / stat.totalRegistrations) * 100).toFixed(2)
          )
        : 0;

      return {
        _id: event._id,
        title: event.title,
        category: event.category,
        date: event.date,
        location: event.location,
        totalRegistrations: stat.totalRegistrations,
        attended: stat.attended,
        cancelled: stat.cancelled,
        attendanceRate,
      };
    });

    const totalRegistrations = eventStats.reduce(
      (sum, event) => sum + event.totalRegistrations,
      0
    );

    const totalAttended = eventStats.reduce(
      (sum, event) => sum + event.attended,
      0
    );

    const totalCancelled = eventStats.reduce(
      (sum, event) => sum + event.cancelled,
      0
    );

    const attendanceRate = totalRegistrations
      ? Number(((totalAttended / totalRegistrations) * 100).toFixed(2))
      : 0;

    res.json({
      totalEvents: events.length,
      totalRegistrations,
      totalAttended,
      totalCancelled,
      attendanceRate,
      events: eventStats,
    });
  } catch (error) {
    console.error("Analytics error:", error);
    res.status(500).json({
      message: "Failed to fetch analytics.",
    });
  }
});

module.exports = router;
