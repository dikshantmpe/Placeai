const express = require("express");
const router = express.Router();
const Question = require("../models/Question");

// Get 20 random questions
router.get("/", async (req, res) => {
  try {
    const questions = await Question.aggregate([{ $sample: { size: 20 } }]);
    res.json(questions);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch questions" });
  }
});

module.exports = router;