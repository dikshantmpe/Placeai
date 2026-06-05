const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
  question: String,
  options: [String],      // 4 options
  answer: Number,         // index of correct option (0,1,2,3)
  category: String,       // "Quant", "Logical", "Verbal"
  difficulty: String      // "Easy", "Medium", "Hard"
});

module.exports = mongoose.model("Question", questionSchema);