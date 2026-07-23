const mongoose = require("mongoose");

const userStatsSchema = new mongoose.Schema({
  // FIXED: Changed from ObjectId to String for Firebase UIDs
  userId: { type: String, required: true, unique: true },

  // DSA progress
  dsaPercent: { type: Number, default: 0 },
  
  // Category percentages
  aptitudePercent: { type: Number, default: 0 },
  csPercent: { type: Number, default: 0 },
  interviewPercent: { type: Number, default: 0 },

  // Overall readiness
  readinessScore: { type: Number, default: 0 },

  // Interview stats
  mockInterviewsCount: { type: Number, default: 0 },
  
  // Resume score
  resumeScore: { type: Number, default: 0 },

  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update updatedAt on every save
userStatsSchema.pre("save", function(next) {
  this.updatedAt = Date.now();
  next();
});

// Indexes
userStatsSchema.index({ userId: 1 });

module.exports = mongoose.models.UserStats || mongoose.model("UserStats", userStatsSchema);