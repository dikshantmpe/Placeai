const mongoose = require("mongoose");

const userProgressSchema = new mongoose.Schema({
  userId:    { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  problemId: { type: mongoose.Schema.Types.ObjectId, ref: "Problem", required: true },
  solved:    { type: Boolean, default: true },
  solvedAt:  { type: Date, default: Date.now }
});

userProgressSchema.index({ userId: 1, problemId: 1 }, { unique: true });

module.exports = mongoose.models.UserProgress || mongoose.model("UserProgress", userProgressSchema);