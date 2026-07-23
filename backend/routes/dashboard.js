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
    const userId = req.user.uid;
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // BATCH ALL QUERIES TOGETHER (parallel, not sequential)
    const [userStats, userMilestones, recentActivities, allProgress] = await Promise.all([
      UserStats.findOne({ userId }).lean(),
      UserMilestones.findOne({ userId }).lean(),
      UserActivity.find({ userId })
        .sort({ createdAt: -1 })
        .limit(100)
        .lean(),
      UserProgress.find({ userId }).lean(), // Get ALL user progress once
    ]);

    // CREATE IF NOT EXISTS
    if (!userStats) {
      const newStats = new UserStats({ userId });
      await newStats.save();
    }
    if (!userMilestones) {
      const newMilestones = new UserMilestones({ userId });
      await newMilestones.save();
    }

    // OPTIMIZATION: Cache problem IDs in memory to avoid N+1
    const allProblems = await Problem.find().select("_id topic").lean();
    const problemsByTopic = {};
    allProblems.forEach(p => {
      if (!problemsByTopic[p.topic]) problemsByTopic[p.topic] = [];
      problemsByTopic[p.topic].push(p._id);
    });
    const totalDSA = allProblems.length;

    // Convert progress to Set for O(1) lookup
    const solvedProblemIds = new Set(allProgress.map(p => String(p.problemId)));

    // CALCULATE STATS WITHOUT EXTRA QUERIES
    const dsaDone = solvedProblemIds.size;
    const dsaPercent = totalDSA ? Math.round((dsaDone / totalDSA) * 100) : 0;

    // DSA BY TOPIC (no extra queries, use cached data)
    const topics = ["Arrays", "Linked List", "Trees", "Binary Search", "DP", "Stack", "Graphs"];
    const dsaByTopic = topics.map(topic => {
      const topicIds = problemsByTopic[topic] || [];
      const done = topicIds.filter(id => solvedProblemIds.has(String(id))).length;
      return {
        topic,
        total: topicIds.length,
        done,
        percent: topicIds.length ? Math.round((done / topicIds.length) * 100) : 0,
      };
    });

    // ACTIVITY STATS (from recentActivities we already fetched)
    const thisWeekSolved = recentActivities.filter(
      a => a.activityType === "problem_solved" && a.createdAt >= weekAgo
    ).length;

    const thisMonthSolved = recentActivities.filter(
      a => a.activityType === "problem_solved" && a.createdAt >= monthAgo
    ).length;

    // STREAK CALCULATION (from same recentActivities)
    let streak = 0;
    if (recentActivities.length > 0) {
      const uniqueDates = new Set(
        recentActivities.map(act => act.createdAt.toDateString())
      );
      const sortedDates = Array.from(uniqueDates)
        .map(d => new Date(d))
        .sort((a, b) => b - a);

      const today = new Date().toDateString();
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();

      if (sortedDates[0].toDateString() === today || sortedDates[0].toDateString() === yesterday) {
        let currentDate = new Date(sortedDates[0]);
        for (const checkDate of sortedDates) {
          const dayDiff = (currentDate - checkDate) / (1000 * 60 * 60 * 24);
          if (dayDiff <= 1) {
            streak++;
            currentDate = checkDate;
          } else {
            break;
          }
        }
      }
    }

    // UPDATE MILESTONES
    if (userMilestones) {
      userMilestones.currentStreak = streak;
      userMilestones.longestStreak = Math.max(userMilestones.longestStreak || 0, streak);
      userMilestones.totalProblemsSolved = dsaDone;
      userMilestones.thisWeekSolved = thisWeekSolved;
      userMilestones.lastActivityDate = recentActivities[0]?.createdAt || null;
      await userMilestones.save();
    }

    // READINESS SCORE
    const stats = userStats || { aptitudePercent: 0, csPercent: 0, interviewPercent: 0, mockInterviewsCount: 0, resumeScore: 0 };
    const readinessScore = Math.round(
      dsaPercent * 0.4 +
      (stats.aptitudePercent || 0) * 0.2 +
      (stats.csPercent || 0) * 0.2 +
      (stats.interviewPercent || 0) * 0.2
    );

    if (userStats) {
      userStats.dsaPercent = dsaPercent;
      userStats.readinessScore = readinessScore;
      await userStats.save();
    }

    // FETCH REMAINING DATA IN PARALLEL
    const [totalQuestions, companyQuestions] = await Promise.all([
      Question.countDocuments().lean(),
      CompanyQuestion.aggregate([
        { $group: { _id: "$company", count: { $sum: 1 } } }
      ])
    ]);

    const companyStats = companyQuestions.map(c => ({
      company: c._id,
      count: c.count
    }));

    // RESPONSE
    res.json({
      dsa: { total: totalDSA, done: dsaDone, percent: dsaPercent },
      dsaByTopic,
      aptitude: { percent: stats.aptitudePercent || 0 },
      coreCs: { percent: stats.csPercent || 0 },
      interviews: { percent: stats.interviewPercent || 0 },
      readiness: readinessScore,
      streak,
      longestStreak: userMilestones?.longestStreak || 0,
      thisWeekSolved,
      mockInterviewsCount: stats.mockInterviewsCount || 0,
      resumeScore: stats.resumeScore || 0,
      quiz: { total: totalQuestions },
      companyStats,
      recentActivity: recentActivities.slice(0, 5).map(act => ({
        type: act.activityType,
        details: act.details,
        createdAt: act.createdAt,
      })),
    });
  } catch (err) {
    console.error("Dashboard error:", err.message);
    res.status(500).json({ error: "Failed to fetch dashboard data" });
  }
});

module.exports = router;