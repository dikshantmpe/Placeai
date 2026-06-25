const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
  question:   { type: String, required: true },
  category:   { type: String },
  difficulty: { type: String, enum: ["Easy", "Medium", "Hard"] },
  options:    [{ type: String }],
  answer:     { type: Number },
  createdAt:  { type: Date, default: Date.now }
});

module.exports = mongoose.models.Question || mongoose.model("Question", questionSchema);