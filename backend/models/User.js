const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name:      { type: String, required: true },
  email:     { type: String, required: true, unique: true },
  password:  { type: String },
  avatar:    { type: String },
  provider:  { type: String, default: "email" },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.User || mongoose.model("User", userSchema);