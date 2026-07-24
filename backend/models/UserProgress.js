const mongoose = require("mongoose");

const userProgressSchema = new mongoose.Schema({
  // FIXED: Changed from ObjectId to String for Firebase UIDs
  userId: { type: String, required: true },
  
  problemId: { type: mongoose.Schema.Types.ObjectId, ref: "Problem", required: true },
  
  status: { type: String, enum: ["attempted", "solved", "pending", "revision_needed"], default: "pending" },
  
  solvedAt: { type: Date },
  attemptedAt: { type: Date, default: Date.now },
  lastAttempted: { type: Date },
  
  // Code solution storage
  code: { type: String },
  
  // Test output storage
  output: { type: String },
  
  // Test results
  testResults: [
    {
      testNum: Number,
      passed: Boolean,
      input: mongoose.Schema.Types.Mixed,
      expected: mongoose.Schema.Types.Mixed,
      output: mongoose.Schema.Types.Mixed,
      error: String
    }
  ],
  
  timeSpent: { type: Number, default: 0 },
  notes: { type: String },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Indexes for fast queries
userProgressSchema.index({ userId: 1 });
userProgressSchema.index({ userId: 1, problemId: 1 }, { unique: true });

module.exports = mongoose.models.UserProgress || mongoose.model("UserProgress", userProgressSchema);