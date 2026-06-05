const express = require("express");
const router = express.Router();
const CompanyQuestion = require("../models/CompanyQuestion");

// Get all questions (optional filter by company)
router.get("/", async (req, res) => {
  try {
    const { company } = req.query;
    const filter = company ? { company } : {};
    const questions = await CompanyQuestion.find(filter);
    res.json(questions);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch questions" });
  }
});

// Add a new question
router.post("/", async (req, res) => {
  try {
    const question = new CompanyQuestion(req.body);
    await question.save();
    res.json(question);
  } catch (err) {
    res.status(500).json({ error: "Failed to add question" });
  }
});

module.exports = router;