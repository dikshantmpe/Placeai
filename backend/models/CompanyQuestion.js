const mongoose = require("mongoose");

const companyQuestionSchema = new mongoose.Schema({
  company: { type: String, required: true },
  round: { type: String },       // "DSA", "System Design", "HR", "Technical"
  question: { type: String, required: true },
  difficulty: { type: String },  // "Easy", "Medium", "Hard"
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("CompanyQuestion", companyQuestionSchema);