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
    // FIX: Firebase tokens use 'uid', not 'userId'
    const userId = req.user.uid;

    // ═══════════════════════════════════════════════════════════════
    // 1. FETCH OR CREATE USER STATS
    // ═══════════════════════════════════════════════════════════════
    let userStats = await UserStats.findOne({ userId });
    if (!userStats) {
      userStats = new UserStats({ userId });
      await userStats.save();
    }

    // ═══════════════════════════════════════════════════════════════
    // 2. FETCH OR CREATE USER MILESTONES
    // ═══════════════════════════════════════════════════════════════
    let userMilestones = await UserMilestones.findOne({ userId });
    if (!userMilestones) {
      userMilestones = new UserMilestones({ userId });
      await userMilestones.save();
    }

    // ═══════════════════════════════════════════════════════════════
    // 3. CALCULATE DSA STATS (user-specific)
    // ═══════════════════════════════════════════════════════════════
    const totalDSA = await Problem.countDocuments();
    const doneDSA = await UserProgress.countDocuments({ userId });
    const dsaPercent = totalDSA ? Math.round((doneDSA / totalDSA) * 100) : 0;

    // ═══════════════════════════════════════════════════════════════
    // 4. CALCULATE DSA BY TOPIC (user-specific)
    // ═══════════════════════════════════════════════════════════════
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
        return {
          topic,
          total,
          done,
          percent: total ? Math.round((done / total) * 100) : 0,
        };
      })
    );

    // ═══════════════════════════════════════════════════════════════
    // 5. CALCULATE THIS WEEK & MONTH ACTIVITY
    // ═══════════════════════════════════════════════════════════════
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const thisWeekSolved = await UserActivity.countDocuments({
      userId,
      activityType: "problem_solved",
      createdAt: { $gte: weekAgo },
    });

    const thisMonthSolved = await UserActivity.countDocuments({
      userId,
      activityType: "problem_solved",
      createdAt: { $gte: monthAgo },
    });

    // ═══════════════════════════════════════════════════════════════
    // 6. CALCULATE STREAK (consecutive days with activity)
    // ═══════════════════════════════════════════════════════════════
    const recentActivities = await UserActivity.find({ userId })
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    let streak = 0;
    if (recentActivities.length > 0) {
      const uniqueDates = new Set(
        recentActivities.map((act) => act.createdAt.toDateString())
      );
      const sortedDates = Array.from(uniqueDates)
        .map((d) => new Date(d))
        .sort((a, b) => b - a);

      // Check if today or yesterday has activity
      const today = new Date().toDateString();
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();

      if (
        sortedDates[0].toDateString() === today ||
        sortedDates[0].toDateString() === yesterday
      ) {
        // Calculate streak
        let currentDate = new Date(sortedDates[0]);
        for (const checkDate of sortedDates) {
          const dayDiff =
            (currentDate - checkDate) / (1000 * 60 * 60 * 24);
          if (dayDiff <= 1) {
            streak++;
            currentDate = checkDate;
          } else {
            break;
          }
        }
      }
    }

    // ═══════════════════════════════════════════════════════════════
    // 7. UPDATE MILESTONES
    // ═══════════════════════════════════════════════════════════════
    userMilestones.currentStreak = streak;
    userMilestones.longestStreak = Math.max(
      userMilestones.longestStreak,
      streak
    );
    userMilestones.totalProblemsSolved = doneDSA;
    userMilestones.thisWeekSolved = thisWeekSolved;
    userMilestones.lastActivityDate = recentActivities[0]?.createdAt || null;
    await userMilestones.save();

    // ═══════════════════════════════════════════════════════════════
    // 8. CALCULATE READINESS SCORE (weighted average)
    // ═══════════════════════════════════════════════════════════════
    const readinessScore = Math.round(
      dsaPercent * 0.4 +
      (userStats.aptitudePercent || 0) * 0.2 +
      (userStats.csPercent || 0) * 0.2 +
      (userStats.interviewPercent || 0) * 0.2
    );

    userStats.dsaPercent = dsaPercent;
    userStats.readinessScore = readinessScore;
    await userStats.save();

    // ═══════════════════════════════════════════════════════════════
    // 9. QUIZ & COMPANY STATS (global, not user-specific)
    // ═══════════════════════════════════════════════════════════════
    const totalQuestions = await Question.countDocuments();

    const companies = ["Google", "Amazon", "Microsoft", "Flipkart", "Infosys", "TCS"];
    const companyStats = await Promise.all(
      companies.map(async (company) => {
        const count = await CompanyQuestion.countDocuments({ company });
        return { company, count };
      })
    );

    // ═══════════════════════════════════════════════════════════════
    // 10. RECENT ACTIVITY FOR FEED
    // ═══════════════════════════════════════════════════════════════
    const recentActivity = await UserActivity.find({ userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    // ═══════════════════════════════════════════════════════════════
    // 11. RETURN COMPLETE DASHBOARD DATA
    // ═══════════════════════════════════════════════════════════════
    res.json({
      // DSA Progress
      dsa: {
        total: totalDSA,
        done: doneDSA,
        percent: dsaPercent,
      },
      dsaByTopic,

      // Category Percentages
      aptitude: { percent: userStats.aptitudePercent },
      coreCs: { percent: userStats.csPercent },
      interviews: { percent: userStats.interviewPercent },

      // Overall Readiness
      readiness: readinessScore,

      // Milestones & Streak
      streak: userMilestones.currentStreak,
      longestStreak: userMilestones.longestStreak,
      thisWeekSolved,
      mockInterviewsCount: userStats.mockInterviewsCount,
      resumeScore: userStats.resumeScore,

      // Quiz
      quiz: { total: totalQuestions },

      // Companies
      companyStats,

      // Recent Activity
      recentActivity: recentActivity.map((act) => ({
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