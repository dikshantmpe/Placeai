const express = require("express");
const router = express.Router();
const Problem = require("../models/Problem");
const Question = require("../models/Question");
const CompanyQuestion = require("../models/CompanyQuestion");
const UserProgress = require("../models/UserProgress");
const UserStats = require("../models/UserStats");
const UserMilestones = require("../models/UserMilestones");
const UserActivity = require("../models/UserActivity");
const requireAuth = require("../middleware/auth");

router.get("/", requireAuth, async (req, res) => {
  try {
    console.log("✅ Dashboard request started");
    const userId = req.user.uid;
    console.log("✅ User ID:", userId);

    // FETCH CRITICAL DATA FIRST
    console.log("⏳ Fetching user stats...");
    const userStats = await UserStats.findOne({ userId }).lean().catch(e => {
      console.error("❌ UserStats error:", e.message);
      return null;
    });
    console.log("✅ User stats:", userStats ? "found" : "not found");

    console.log("⏳ Fetching milestones...");
    const userMilestones = await UserMilestones.findOne({ userId }).lean().catch(e => {
      console.error("❌ UserMilestones error:", e.message);
      return null;
    });
    console.log("✅ User milestones:", userMilestones ? "found" : "not found");

    console.log("⏳ Fetching activities...");
    const recentActivities = await UserActivity.find({ userId }).sort({ createdAt: -1 }).limit(100).lean().catch(e => {
      console.error("❌ UserActivity error:", e.message);
      return [];
    });
    console.log("✅ Recent activities:", recentActivities.length);

    // SIMPLE CALCULATIONS
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thisWeekSolved = recentActivities.filter(a => 
      a.activityType === "problem_solved" && a.createdAt >= weekAgo
    ).length;

    console.log("✅ This week solved:", thisWeekSolved);

    // RETURN MINIMAL DATA FIRST TO TEST
    return res.json({
      dsa: { total: 0, done: 0, percent: 0 },
      dsaByTopic: [],
      aptitude: { percent: userStats?.aptitudePercent || 0 },
      coreCs: { percent: userStats?.csPercent || 0 },
      interviews: { percent: userStats?.interviewPercent || 0 },
      readiness: 0,
      streak: userMilestones?.currentStreak || 0,
      longestStreak: userMilestones?.longestStreak || 0,
      thisWeekSolved,
      mockInterviewsCount: userStats?.mockInterviewsCount || 0,
      resumeScore: userStats?.resumeScore || 0,
      quiz: { total: 0 },
      companyStats: [],
      recentActivity: [],
    });

  } catch (err) {
    console.error("❌ DASHBOARD ERROR:", err.message);
    console.error("Stack:", err.stack);
    res.status(500).json({ 
      error: "Failed to fetch dashboard data",
      details: err.message 
    });
  }
});

module.exports = router;