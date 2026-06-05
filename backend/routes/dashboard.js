const express = require("express");
const router = express.Router();
const Problem = require("../models/Problem");
const Question = require("../models/Question");
const CompanyQuestion = require("../models/CompanyQuestion");

router.get("/", async (req, res) => {
  try {
    // DSA Stats
    const totalDSA = await Problem.countDocuments();
    const doneDSA = await Problem.countDocuments({ status: true });

    // DSA by topic
    const topics = ["Arrays", "Linked List", "Trees", "Binary Search", "DP", "Stack", "Graphs"];
    const dsaByTopic = await Promise.all(
      topics.map(async (topic) => {
        const total = await Problem.countDocuments({ topic });
        const done = await Problem.countDocuments({ topic, status: true });
        return { topic, total, done, percent: total ? Math.round((done / total) * 100) : 0 };
      })
    );

    // Quiz Stats
    const totalQuestions = await Question.countDocuments();

    // Company Stats
    const companies = ["Google", "Amazon", "Microsoft", "Flipkart", "Infosys", "TCS"];
    const companyStats = await Promise.all(
      companies.map(async (company) => {
        const count = await CompanyQuestion.countDocuments({ company });
        return { company, count };
      })
    );

    res.json({
      dsa: { total: totalDSA, done: doneDSA, percent: Math.round((doneDSA / totalDSA) * 100) },
      dsaByTopic,
      quiz: { total: totalQuestions },
      companyStats
    });

  } catch (err) {
    res.status(500).json({ error: "Failed to fetch dashboard data" });
  }
});

module.exports = router;