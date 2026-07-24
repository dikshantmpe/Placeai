const mongoose = require("mongoose");

const userProgressSchema = new mongoose.Schema({
  // User and Problem reference
  userId: { type: String, required: true },
  problemId: { type: mongoose.Schema.Types.ObjectId, ref: "Problem", required: true },
  
  // Problem tracking
  status: { 
    type: String, 
    enum: [
      "Pending", "PENDING", "pending", 
      "Solved", "SOLVED", "solved", 
      "Revision Needed", "REVISION NEEDED", 
      "Attempted", "ATTEMPTED", "attempted"
    ], 
    default: "Pending" 
  },
  
  // Tracking fields
  timeSpent: { type: Number, default: 0 },
  notes: { type: String, default: "" },
  
  // Code and solution storage
  code: { type: String, default: "" },
  output: { type: String, default: "" },
  testResults: [{
    testName: String,
    passed: Boolean,
    // 🚨 FIXED: Changed to Mixed so Mongoose accepts Arrays, Objects, and Numbers
    input: mongoose.Schema.Types.Mixed,
    expected: mongoose.Schema.Types.Mixed,
    actual: mongoose.Schema.Types.Mixed,
    error: String,
  }],
  
  // Timestamps
  solvedAt: { type: Date },
  lastAttempted: { type: Date, default: Date.now },
  attemptedAt: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
}, { timestamps: true });

// Indexes for fast queries
userProgressSchema.index({ userId: 1 });
userProgressSchema.index({ userId: 1, problemId: 1 }, { unique: true });
userProgressSchema.index({ userId: 1, status: 1 });
userProgressSchema.index({ userId: 1, solvedAt: 1 });

// Update lastAttempted on save
userProgressSchema.pre("save", function(next) {
  this.lastAttempted = new Date();
  next();
});

module.exports = mongoose.models.UserProgress || mongoose.model("UserProgress", userProgressSchema);