
const mongoose = require("mongoose");

const registrationSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
    status: {
      type: String,
      enum: ["registered", "cancelled", "attended"],
      default: "registered",
    },
    registeredAt: {
      type: Date,
      default: Date.now,
    },
    qrToken: {
      type: String,
      unique: true,
      sparse: true,
    },
  },
  { timestamps: true }
);

registrationSchema.index(
  { student: 1, event: 1 },
  { unique: true }
);

module.exports = mongoose.model("Registration", registrationSchema);