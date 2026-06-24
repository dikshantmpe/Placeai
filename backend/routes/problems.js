const mongoose = require("mongoose");

const problemSchema = new mongoose.Schema({
  title:      { type: String, required: true },
  topic:      { type: String, required: true },
  difficulty: { type: String, enum: ["Easy", "Medium", "Hard"] },
  description: { type: String, default: "" },
  link:       { type: String },
  createdAt:  { type: Date, default: Date.now }
});

module.exports = mongoose.model("Problem", problemSchema);