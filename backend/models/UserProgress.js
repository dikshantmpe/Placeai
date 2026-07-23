const mongoose = require("mongoose");

const userProgressSchema = new mongoose.Schema({
  // FIXED: Changed from ObjectId to String for Firebase UIDs
  userId: { type: String, required: true },
  
  problemId: { type: mongoose.Schema.Types.ObjectId, ref: "Problem", required: true },
  
  // Updated enum to support the new frontend dropdown options without breaking old data
  status: { 
    type: String, 
    enum: ["Pending", "Solved", "Revision Needed", "attempted", "solved"], 
    default: "Pending" 
  },
  
  // New fields added from the frontend UI
  timeSpent: { type: Number, default: 0 },
  notes: { type: String, default: "" },
  
  solvedAt: { type: Date },
  lastAttempted: { type: Date, default: Date.now },
  attemptedAt: { type: Date, default: Date.now }, // Kept for backwards compatibility
  
  code: { type: String },
  
}, { timestamps: true }); // Mongoose handles createdAt and updatedAt automatically

// Indexes for fast queries
userProgressSchema.index({ userId: 1 });
userProgressSchema.index({ userId: 1, problemId: 1 }, { unique: true });

module.exports = mongoose.models.UserProgress || mongoose.model("UserProgress", userProgressSchema);