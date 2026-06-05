const mongoose = require("mongoose");

const problemSchema = new mongoose.Schema({
  title:      { type: String, required: true },
  topic:      { type: String, required: true },
  difficulty: { type: String, enum: ["Easy", "Medium", "Hard"] },
  link:       { type: String },
  status:     { type: Boolean, default: false }
});

module.exports = mongoose.model("Problem", problemSchema);