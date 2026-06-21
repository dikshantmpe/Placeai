const express = require("express");
const router = express.Router();
const Problem = require("../models/Problem");
const Question = require("../models/Question");
const CompanyQuestion = require("../models/CompanyQuestion");
const UserProgress = require("../models/UserProgress");
const requireAuth = require("../middleware/auth");

router.get("/", requireAuth, async (req, res) => {
  try {
    const userId = req.user.userId;

    // DSA Stats — scoped to this user
    const totalDSA = await Problem.countDocuments();
    const doneDSA = await UserProgress.countDocuments({ userId });

    // DSA by topic — scoped to this user
    const topics = ["Arrays", "Linked List", "Trees", "Binary Search", "DP", "Stack", "Graphs"];
    const dsaByTopic = await Promise.all(
      topics.map(async (topic) => {
        const total = await Problem.countDocuments({ topic });
        const topicProblems = await Problem.find({ topic }).select("_id").lean();
        const topicIds = topicProblems.map((p) => p._id);
        const done = await UserProgress.countDocuments({
          userId,
          problemId: { $in: topicIds },
        });
        return { topic, total, done, percent: total ? Math.round((done / total) * 100) : 0 };
      })
    );

    // Quiz Stats — global catalog size is fine here (quiz attempts aren't tracked per-user yet)
    const totalQuestions = await Question.countDocuments();

    // Company Stats — global catalog, not user-specific
    const companies = ["Google", "Amazon", "Microsoft", "Flipkart", "Infosys", "TCS"];
    const companyStats = await Promise.all(
      companies.map(async (company) => {
        const count = await CompanyQuestion.countDocuments({ company });
        return { company, count };
      })
    );

    res.json({
      dsa: {
        total: totalDSA,
        done: doneDSA,
        percent: totalDSA ? Math.round((doneDSA / totalDSA) * 100) : 0,
      },
      dsaByTopic,
      quiz: { total: totalQuestions },
      companyStats,
    });
  } catch (err) {
    console.error("Dashboard error:", err.message);
    res.status(500).json({ error: "Failed to fetch dashboard data" });
  }
});

module.exports = router;