const mongoose = require("mongoose");

const problemSchema = new mongoose.Schema({
  title:       { type: String, required: true },
  topic:       { type: String, required: true },
  difficulty:  { type: String, enum: ["Easy", "Medium", "Hard"] },
  description: { type: String, default: "" },
  link:        { type: String },
  createdAt:   { type: Date, default: Date.now },
  
  // 👇 This allows Mongoose to save your test cases!
  testCases: [
    {
      input: { type: mongoose.Schema.Types.Mixed },
      expected: { type: mongoose.Schema.Types.Mixed }
    }
  ]
});

// Guard against OverwriteModelError when server hot-reloads
module.exports = mongoose.models.Problem || mongoose.model("Problem", problemSchema);