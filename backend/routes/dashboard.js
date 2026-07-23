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

    // 1. GET USER STATS & MILESTONES (or create if missing)
    let userStats = await UserStats.findOne({ userId }).lean();
    if (!userStats) {
      const newStats = new UserStats({ userId });
      await newStats.save();
      userStats = { aptitudePercent: 0, csPercent: 0, interviewPercent: 0, mockInterviewsCount: 0, resumeScore: 0 };
    }

    let userMilestones = await UserMilestones.findOne({ userId }).lean();
    if (!userMilestones) {
      const newMilestones = new UserMilestones({ userId });
      await newMilestones.save();
      userMilestones = { currentStreak: 0, longestStreak: 0, totalProblemsSolved: 0, thisWeekSolved: 0 };
    }

    // 2. GET RECENT ACTIVITIES (limits queries with lean)
    const recentActivities = await UserActivity.find({ userId })
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    // 3. CALCULATE ACTIVITY STATS
    const thisWeekSolved = recentActivities.filter(a => 
      a.activityType === "problem_solved" && a.createdAt >= weekAgo
    ).length;

    // 4. CALCULATE STREAK
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

    // 5. GET DSA DATA
    const allProblems = await Problem.find().select("_id topic").lean();
    const allProgress = await UserProgress.find({ userId }).lean();
    
    const problemsByTopic = {};
    allProblems.forEach(p => {
      if (!problemsByTopic[p.topic]) problemsByTopic[p.topic] = [];
      problemsByTopic[p.topic].push(String(p._id));
    });
    const totalDSA = allProblems.length;
    const solvedIds = new Set(allProgress.map(p => String(p.problemId)));
    const dsaDone = solvedIds.size;
    const dsaPercent = totalDSA ? Math.round((dsaDone / totalDSA) * 100) : 0;

    // 6. DSA BY TOPIC
    const topics = ["Arrays", "Linked List", "Trees", "Binary Search", "DP", "Stack", "Graphs"];
    const dsaByTopic = topics.map(topic => {
      const topicIds = problemsByTopic[topic] || [];
      const done = topicIds.filter(id => solvedIds.has(id)).length;
      return {
        topic,
        total: topicIds.length,
        done,
        percent: topicIds.length ? Math.round((done / topicIds.length) * 100) : 0,
      };
    });

    // 7. CALCULATE READINESS
    const readinessScore = Math.round(
      dsaPercent * 0.4 +
      (userStats.aptitudePercent || 0) * 0.2 +
      (userStats.csPercent || 0) * 0.2 +
      (userStats.interviewPercent || 0) * 0.2
    );

    // 8. UPDATE STATS (upsert to avoid errors)
    await UserStats.findOneAndUpdate(
      { userId },
      { 
        dsaPercent, 
        readinessScore,
        aptitudePercent: userStats.aptitudePercent || 0,
        csPercent: userStats.csPercent || 0,
        interviewPercent: userStats.interviewPercent || 0,
        mockInterviewsCount: userStats.mockInterviewsCount || 0,
        resumeScore: userStats.resumeScore || 0,
      },
      { upsert: true, new: true }
    );

    // 9. UPDATE MILESTONES
    await UserMilestones.findOneAndUpdate(
      { userId },
      {
        currentStreak: streak,
        longestStreak: Math.max(userMilestones.longestStreak || 0, streak),
        totalProblemsSolved: dsaDone,
        thisWeekSolved,
        lastActivityDate: recentActivities[0]?.createdAt || null,
      },
      { upsert: true }
    );

    // 10. GET COMPANY & QUIZ DATA
    const totalQuestions = await Question.countDocuments();
    const companyStats = await CompanyQuestion.aggregate([
      { $group: { _id: "$company", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // 11. RETURN COMPLETE DATA
    res.json({
      dsa: { total: totalDSA, done: dsaDone, percent: dsaPercent },
      dsaByTopic,
      aptitude: { percent: userStats.aptitudePercent || 0 },
      coreCs: { percent: userStats.csPercent || 0 },
      interviews: { percent: userStats.interviewPercent || 0 },
      readiness: readinessScore,
      streak,
      longestStreak: userMilestones.longestStreak || 0,
      thisWeekSolved,
      mockInterviewsCount: userStats.mockInterviewsCount || 0,
      resumeScore: userStats.resumeScore || 0,
      quiz: { total: totalQuestions },
      companyStats: companyStats.map(c => ({ company: c._id, count: c.count })),
      recentActivity: recentActivities.slice(0, 5).map(act => ({
        type: act.activityType,
        details: act.details,
        createdAt: act.createdAt,
      })),
    });

  } catch (err) {
    console.error("❌ Dashboard error:", err.message, err.stack);
    res.status(500).json({ 
      error: "Failed to fetch dashboard data",
      message: err.message 
    });
  }
});

module.exports = router;