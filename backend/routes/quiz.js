const express = require("express");
const router = express.Router();
const Question = require("../models/Question");

router.get("/", async (req, res) => {
  try {
    // Get questions by category to ensure variety
    const quant = await Question.aggregate([
      { $match: { category: "Quant" } },
      { $sample: { size: 7 } }
    ]);
    const logical = await Question.aggregate([
      { $match: { category: "Logical" } },
      { $sample: { size: 7 } }
    ]);
    const verbal = await Question.aggregate([
      { $match: { category: "Verbal" } },
      { $sample: { size: 6 } }
    ]);

    // Combine and shuffle
    const combined = [...quant, ...logical, ...verbal];
    const shuffled = combined.sort(() => Math.random() - 0.5);

    res.json(shuffled);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch questions" });
  }
});

module.exports = router;