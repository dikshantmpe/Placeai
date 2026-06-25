const mongoose = require("mongoose");

const companyQuestionSchema = new mongoose.Schema({
  company:    { type: String, required: true },
  question:   { type: String, required: true },
  difficulty: { type: String, enum: ["Easy", "Medium", "Hard"] },
  category:   { type: String },
  createdAt:  { type: Date, default: Date.now }
});

module.exports = mongoose.models.CompanyQuestion || mongoose.model("CompanyQuestion", companyQuestionSchema);