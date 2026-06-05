const express = require("express");
const router = express.Router();
const Problem = require("../models/Problem");
const Question = require("../models/Question");

// Get today's daily challenge
router.get("/", async (req, res) => {
  try {
    // Use today's date as a seed to pick same questions all day
    const today = new Date().toISOString().split("T")[0]; // "2026-06-01"
    const seed = today.replace(/-/g, "");                 // "20260601"
    const index = parseInt(seed) % 20;                    // consistent index

    const dsaProblems = await Problem.find();
    const quizQuestions = await Question.find();

    const dsaChallenge = dsaProblems[index % dsaProblems.length];
    const quizChallenge = quizQuestions[index % quizQuestions.length];

    res.json({ date: today, dsa: dsaChallenge, quiz: quizChallenge });

  } catch (err) {
    res.status(500).json({ error: "Failed to fetch daily challenge" });
  }
});

module.exports = router;