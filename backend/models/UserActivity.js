const mongoose = require("mongoose");

const userActivitySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  
  // Activity type: "problem_solved", "interview_completed", "quiz_attempted", "resume_updated"
  activityType: { 
    type: String, 
    enum: ["problem_solved", "interview_completed", "quiz_attempted", "resume_updated", "milestone_reached"],
    required: true 
  },
  
  // Reference IDs
  problemId: { type: mongoose.Schema.Types.ObjectId, ref: "Problem" },
  interviewId: { type: mongoose.Schema.Types.ObjectId, ref: "Interview" },
  quizId: { type: mongoose.Schema.Types.ObjectId, ref: "Question" },
  
  // Activity details
  details: {
    category: String, // e.g., "Arrays", "Trees", "DP"
    difficulty: String, // "Easy", "Medium", "Hard"
    timeTaken: Number, // in minutes
    score: Number, // if applicable
    feedback: String
  },
  
  // Timestamp
  createdAt: { type: Date, default: Date.now }
});

// Index for fast queries
userActivitySchema.index({ userId: 1, createdAt: -1 });
userActivitySchema.index({ userId: 1, activityType: 1 });

module.exports = mongoose.models.UserActivity || mongoose.model("UserActivity", userActivitySchema);