const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name:      { type: String, required: true },
  email:     { type: String, required: true, unique: true },
  password:  { type: String, select: false },
  avatar:    { type: String },
  provider:  { type: String, default: "email" },
  loginAttempts: { type: Number, default: 0 },
  lockUntil: Date,
  createdAt: { type: Date, default: Date.now }
});

// Indexes for performance
userSchema.index({ email: 1 });

module.exports = mongoose.models.User || mongoose.model("User", userSchema);