const mongoose = require("mongoose");

/**
 * Notification Schema
 * Tracks notifications sent to users regarding quiz updates, result availability, and account status.
 */
const NotificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    read: {
      type: Boolean,
      default: false,
      index: true,
    },
    type: {
      type: String,
      enum: [
        "quiz_published",
        "quiz_updated",
        "result_available",
        "password_changed",
        "email_verified",
      ],
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", NotificationSchema);
