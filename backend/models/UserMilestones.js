const mongoose = require("mongoose");

const userMilestonesSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  
  // Streak tracking
  currentStreak: { type: Number, default: 0 },
  longestStreak: { type: Number, default: 0 },
  lastActivityDate: { type: Date },
  
  // Activity tracking
  totalProblemsAttempted: { type: Number, default: 0 },
  totalProblemsSolved: { type: Number, default: 0 },
  weeklyProblemsCount: { type: Number, default: 0 },
  monthlyProblemsCount: { type: Number, default: 0 },
  
  // Daily activity log (for heatmap)
  activityLog: [
    {
      date: { type: Date, required: true },
      problemsSolvedCount: { type: Number, default: 0 },
      interviewsCount: { type: Number, default: 0 }
    }
  ],
  
  // Milestones reached
  milestonesReached: [
    {
      title: String,
      description: String,
      reachedAt: { type: Date, default: Date.now }
    }
  ],
  
  // User's progress deltas (for notifications)
  thisWeekSolved: { type: Number, default: 0 },
  thisMonthImprovement: { type: Number, default: 0 },
  
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  lastUpdated: { type: Date, default: Date.now }
});

// Update lastUpdated on every save
userMilestonesSchema.pre("save", function(next) {
  this.lastUpdated = Date.now();
  next();
});

// Indexes for fast queries
userMilestonesSchema.index({ userId: 1 });
userMilestonesSchema.index({ "activityLog.date": 1 });

module.exports = mongoose.models.UserMilestones || mongoose.model("UserMilestones", userMilestonesSchema);