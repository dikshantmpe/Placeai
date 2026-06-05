const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name:     { type: String, required: true },
  email:    { type: String, required: true, unique: true },
  password: { type: String },        // optional for Google login users
  avatar:   { type: String },        // profile picture URL
  provider: { type: String, default: "email" }, // "email" or "google"
  createdAt:{ type: Date, default: Date.now }
});

module.exports = mongoose.model("User", userSchema);