const mongoose = require("mongoose");

/**
 * Activity Log Schema
 * Stores user activities (e.g., attempt history, creation) for the dashboard feed.
 * Features a TTL (Time-To-Live) index to automatically clear logs older than 30 days.
 */
const ActivityLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    activity: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

// Auto-delete records older than 30 days (2,592,000 seconds)
ActivityLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 2592000 });

module.exports = mongoose.model("ActivityLog", ActivityLogSchema);
