const mongoose = require("mongoose");

const userStatsSchema = new mongoose.Schema({
  // FIX: Changed to String because Firebase UIDs are strings, not MongoDB ObjectIds
  userId: { type: String, required: true, unique: true, index: true },
  
  // Overall readiness (0-100)
  readinessScore: { type: Number, default: 0, min: 0, max: 100 },
  
  // Category percentages (0-100)
  dsaPercent: { type: Number, default: 0, min: 0, max: 100 },
  aptitudePercent: { type: Number, default: 0, min: 0, max: 100 },
  csPercent: { type: Number, default: 0, min: 0, max: 100 },
  interviewPercent: { type: Number, default: 0, min: 0, max: 100 },
  
  // Resume score (0-100)
  resumeScore: { type: Number, default: 0, min: 0, max: 100 },
  
  // Mock interviews count
  mockInterviewsCount: { type: Number, default: 0 },
  
  // Quiz attempts
  quizAttemptsCount: { type: Number, default: 0 },
  
  // Last updated timestamp
  lastUpdated: { type: Date, default: Date.now }
});

// Update lastUpdated on every save
userStatsSchema.pre("save", function(next) {
  this.lastUpdated = Date.now();
  next();
});

module.exports = mongoose.models.UserStats || mongoose.model("UserStats", userStatsSchema);