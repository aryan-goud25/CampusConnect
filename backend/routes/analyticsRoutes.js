const express = require("express");
const ExcelJS = require("exceljs");

const Event = require("../models/Event");
const Registration = require("../models/Registration");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();


// =====================================================
// ORGANIZER / ADMIN ANALYTICS
// =====================================================
router.get(
  "/organizer",
  protect,
  authorize("organizer", "admin"),
  async (req, res) => {
    try {
      let eventFilter = {};

      // Organizer → only their own events
      // Admin → all events
      if (req.user.role !== "admin") {
        eventFilter.createdBy = req.user.id;
      }

      // No date filter here.
      // This includes upcoming, ongoing and past events.
      const events = await Event.find(eventFilter)
        .select("title category date location createdBy")
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
                $cond: [
                  { $in: ["$status", ["registered", "attended"]] },
                  1,
                  0,
                ],
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
              (
                (stat.attended / stat.totalRegistrations) *
                100
              ).toFixed(2)
            )
          : 0;

        return {
          _id: event._id,
          title: event.title,
          category: event.category,
          date: event.date,
          location: event.location,
          createdBy: event.createdBy,

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
        ? Number(
            ((totalAttended / totalRegistrations) * 100).toFixed(2)
          )
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
  }
);


// =====================================================
// PARTICIPANTS FOR ONE EVENT
// =====================================================
// Organizer → can only access participants of their own event
// Admin → can access participants of any event
router.get(
  "/organizer/event/:eventId/participants",
  protect,
  authorize("organizer", "admin"),
  async (req, res) => {
    try {
      const { eventId } = req.params;

      const event = await Event.findById(eventId)
        .select("title category date location createdBy")
        .lean();

      if (!event) {
        return res.status(404).json({
          message: "Event not found.",
        });
      }

      // IMPORTANT SECURITY CHECK
      // Organizer can only see their own event.
      if (
        req.user.role !== "admin" &&
        String(event.createdBy) !== String(req.user.id)
      ) {
        return res.status(403).json({
          message: "You are not authorized to view this event.",
        });
      }

      const registrations = await Registration.find({
        event: eventId,
      })
        .populate("student", "name email")
        .sort({ registeredAt: 1 })
        .lean();

      const participants = registrations.map((registration) => ({
        registrationId: registration._id,

        name: registration.student?.name || "Unknown",

        email: registration.student?.email || "Unknown",

        status: registration.status,

        registeredAt: registration.registeredAt,

        attended: registration.status === "attended",
      }));

      res.json({
        event: {
          _id: event._id,
          title: event.title,
          category: event.category,
          date: event.date,
          location: event.location,
        },

        totalParticipants: participants.length,

        attended: participants.filter(
          (student) => student.attended
        ).length,

        participants,
      });
    } catch (error) {
      console.error("Participants analytics error:", error);

      res.status(500).json({
        message: "Failed to fetch participants.",
      });
    }
  }
);

// =====================================================
// EXCEL REPORT FOR ONE EVENT
// =====================================================
// Organizer → only their own events
// Admin → any event
router.get(
  "/organizer/event/:eventId/excel",
  protect,
  authorize("organizer", "admin"),
  async (req, res) => {
    try {
      const { eventId } = req.params;

      const event = await Event.findById(eventId)
        .select("title category date location createdBy")
        .lean();

      if (!event) {
        return res.status(404).json({
          message: "Event not found.",
        });
      }

      // Organizer can only export their own event.
      if (
        req.user.role !== "admin" &&
        String(event.createdBy) !== String(req.user.id)
      ) {
        return res.status(403).json({
          message: "You are not authorized to export this event.",
        });
      }

      const registrations = await Registration.find({
        event: eventId,
      })
        .populate("student", "name email")
        .sort({ registeredAt: 1 })
        .lean();

      const workbook = new ExcelJS.Workbook();

      const worksheet = workbook.addWorksheet("Participants");

      worksheet.columns = [
        {
          header: "Student Name",
          key: "name",
          width: 25,
        },
        {
          header: "Email",
          key: "email",
          width: 35,
        },
        {
          header: "Registration Status",
          key: "status",
          width: 22,
        },
        {
          header: "Attendance",
          key: "attendance",
          width: 18,
        },
        {
          header: "Registered At",
          key: "registeredAt",
          width: 25,
        },
      ];

      registrations.forEach((registration) => {
        worksheet.addRow({
          name: registration.student?.name || "Unknown",
          email: registration.student?.email || "Unknown",
          status: registration.status,
          attendance:
            registration.status === "attended"
              ? "Attended"
              : "Not Attended",
          registeredAt: registration.registeredAt
            ? new Date(registration.registeredAt).toLocaleString("en-IN")
            : "",
        });
      });

      // Style the header
      worksheet.getRow(1).font = {
        bold: true,
      };

      worksheet.getRow(1).alignment = {
        vertical: "middle",
        horizontal: "center",
      };

      // Add event information
      const infoSheet = workbook.addWorksheet("Event Summary");

      infoSheet.columns = [
        {
          header: "Field",
          key: "field",
          width: 25,
        },
        {
          header: "Details",
          key: "details",
          width: 45,
        },
      ];

      infoSheet.addRows([
        {
          field: "Event",
          details: event.title,
        },
        {
          field: "Category",
          details: event.category,
        },
        {
          field: "Date",
          details: event.date
            ? new Date(event.date).toLocaleDateString("en-IN")
            : "",
        },
        {
          field: "Location",
          details: event.location,
        },
        {
          field: "Total Registrations",
          details: registrations.filter(
            (r) => ["registered", "attended"].includes(r.status)
          ).length,
        },
        {
          field: "Students Attended",
          details: registrations.filter(
            (r) => r.status === "attended"
          ).length,
        },
        {
          field: "Students Cancelled",
          details: registrations.filter(
            (r) => r.status === "cancelled"
          ).length,
        },
      ]);

      infoSheet.getRow(1).font = {
        bold: true,
      };

      infoSheet.getRow(1).alignment = {
        vertical: "middle",
        horizontal: "center",
      };

      const fileName = `${event.title
        .replace(/[^a-z0-9]/gi, "-")
        .toLowerCase()}-participants.xlsx`;

      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );

      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${fileName}"`
      );

      await workbook.xlsx.write(res);

      res.end();
    } catch (error) {
      console.error("Excel export error:", error);

      res.status(500).json({
        message: "Failed to generate Excel report.",
      });
    }
  }
);

module.exports = router;