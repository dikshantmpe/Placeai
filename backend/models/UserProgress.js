const mongoose = require("mongoose");

const userProgressSchema = new mongoose.Schema({
  // FIXED: Changed from ObjectId to String for Firebase UIDs
  userId: { type: String, required: true },
  
  problemId: { type: mongoose.Schema.Types.ObjectId, ref: "Problem", required: true },
  
  status: { type: String, enum: ["attempted", "solved"], default: "attempted" },
  
  solvedAt: { type: Date },
  attemptedAt: { type: Date, default: Date.now },
  
  code: { type: String },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Indexes for fast queries
userProgressSchema.index({ userId: 1 });
userProgressSchema.index({ userId: 1, problemId: 1 }, { unique: true });

module.exports = mongoose.models.UserProgress || mongoose.model("UserProgress", userProgressSchema);