const mongoose = require("mongoose");

const userActivitySchema = new mongoose.Schema({
  // FIXED: Changed from ObjectId to String for Firebase UIDs
  userId: { type: String, required: true },
  
  activityType: { type: String, required: true }, // "problem_solved", "quiz_completed", etc.
  details: { type: String },
  
  createdAt: { type: Date, default: Date.now },
});

// Indexes for fast queries
userActivitySchema.index({ userId: 1, createdAt: -1 });
userActivitySchema.index({ userId: 1, activityType: 1, createdAt: -1 });

module.exports = mongoose.models.UserActivity || mongoose.model("UserActivity", userActivitySchema);