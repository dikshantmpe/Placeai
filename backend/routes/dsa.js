const express = require("express");
const router = express.Router();

// 🚨 Moved these to the TOP so they don't crash the individual routes!
const Problem = require("../models/Problem");
const UserProgress = require("../models/UserProgress");
const UserMilestones = require("../models/UserMilestones");

// ✅ NOTE: authMiddleware is now applied in server.js
// No need for inline auth here anymore!

// Test endpoint
router.get("/test", (req, res) => {
  return res.json({ success: true, message: "DSA route working" });
});

// Get all solutions (for Solutions Gallery)
router.get("/solutions", async (req, res) => {
  try {
    console.log("📍 GET /solutions called");

    const userId = req.user.uid; // ✅ Use Firebase UID from verified token
    const { topic, difficulty, search } = req.query;

    let progressFilter = { userId, status: "Solved" };
    
    const userProgress = await UserProgress.find(progressFilter)
      .populate("problemId")
      .lean();

    if (!userProgress || userProgress.length === 0) {
      return res.json({
        success: true,
        solutions: [],
        message: "No solutions yet",
      });
    }

    let solutions = userProgress.map((p) => {
      try {
        return {
          _id: p._id,
          problemId: p.problemId?._id,
          name: p.problemId?.name || p.problemId?.title || "Unknown",
          topic: p.problemId?.topic || "Unknown",
          difficulty: p.problemId?.difficulty || "Unknown",
          description: p.problemId?.description || "",
          link: p.problemId?.link || "#",
          code: p.code || "",
          output: p.output || "",
          testResults: p.testResults || [],
          timeSpent: p.timeSpent || 0,
          notes: p.notes || "",
          solvedAt: p.solvedAt || p.createdAt,
        };
      } catch (err) {
        return null;
      }
    }).filter(Boolean);

    // Apply filters
    if (topic) solutions = solutions.filter((s) => s.topic === topic);
    if (difficulty) solutions = solutions.filter((s) => s.difficulty === difficulty);
    if (search) {
      const searchLower = search.toLowerCase();
      solutions = solutions.filter((s) =>
        s.name.toLowerCase().includes(searchLower) ||
        s.topic.toLowerCase().includes(searchLower)
      );
    }

    return res.json({
      success: true,
      solutions,
      count: solutions.length,
    });
  } catch (error) {
    return res.status(500).json({ 
      success: false, 
      error: error.message || "Failed to fetch solutions"
    });
  }
});

// Get all problems
router.get("/problems", async (req, res) => {
  try {
    console.log("📍 GET /problems called");

    const userId = req.user.uid; // ✅ Use Firebase UID from verified token
    const { topic, difficulty, search } = req.query;

    let filter = {};
    if (topic) filter.topic = topic;
    if (difficulty) filter.difficulty = difficulty;
    if (search) filter.name = { $regex: search, $options: "i" };

    const problems = await Problem.find(filter).lean();
    const userProgress = await UserProgress.find({ userId }).lean();
    
    const progressMap = {};
    userProgress.forEach((p) => {
      progressMap[p.problemId?.toString()] = p;
    });

    const topicMap = {};
    problems.forEach((problem) => {
      if (!topicMap[problem.topic]) {
        topicMap[problem.topic] = {
          topic: problem.topic,
          icon: problem.icon || "◇",
          total: 0,
          solved: 0,
          problems: [],
        };
      }

      const userProblemData = progressMap[problem._id.toString()] || {};
      const problemData = {
        _id: problem._id,
        name: problem.name || problem.title,
        link: problem.link || "#",
        difficulty: problem.difficulty,
        description: problem.description || "",
        status: userProblemData.status || "Pending",
        lastAttempted: userProblemData.lastAttempted || null,
        timeSpent: userProblemData.timeSpent || 0,
        notes: userProblemData.notes || "",
        code: userProblemData.code || "",
      };

      topicMap[problem.topic].problems.push(problemData);
      topicMap[problem.topic].total += 1;
      if (userProblemData.status === "Solved") {
        topicMap[problem.topic].solved += 1;
      }
    });

    return res.json({
      success: true,
      topics: Object.values(topicMap),
      totalProblems: problems.length,
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Save code
router.post("/problems/:problemId/save-code", async (req, res) => {
  try {
    console.log("📍 POST /save-code called");

    const userId = req.user.uid; // ✅ Use Firebase UID from verified token
    const { problemId } = req.params;
    const { code, output, testResults, status, timeSpent } = req.body;

    let userProgress = await UserProgress.findOne({ userId, problemId });
    let wasAlreadySolved = false;

    if (!userProgress) {
      userProgress = new UserProgress({ userId, problemId });
    } else {
      wasAlreadySolved = userProgress.status === "Solved";
    }

    userProgress.code = code || userProgress.code;
    userProgress.output = output || userProgress.output;
    userProgress.testResults = testResults || userProgress.testResults;
    userProgress.status = status || userProgress.status;
    userProgress.timeSpent = timeSpent || userProgress.timeSpent;
    userProgress.lastAttempted = new Date();

    if (status === "Solved" && !wasAlreadySolved) {
      userProgress.solvedAt = new Date();
    }

    await userProgress.save();

    if (status === "Solved" && !wasAlreadySolved) {
      let milestones = await UserMilestones.findOne({ userId });
      if (!milestones) {
        milestones = new UserMilestones({ userId });
      }

      milestones.totalProblemsSolved = (milestones.totalProblemsSolved || 0) + 1;
      milestones.thisWeekSolved = (milestones.thisWeekSolved || 0) + 1;
      milestones.lastActivityDate = new Date();
      await milestones.save();
    }

    return res.json({ success: true, message: "Code saved successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Update problem status
router.post("/problems/:problemId/update", async (req, res) => {
  try {
    console.log("📍 POST /update called");

    const userId = req.user.uid; // ✅ Use Firebase UID from verified token
    const { problemId } = req.params;
    const { status, timeSpent, notes } = req.body;

    let userProgress = await UserProgress.findOne({ userId, problemId });
    let wasAlreadySolved = false;

    if (!userProgress) {
      userProgress = new UserProgress({ userId, problemId });
    } else {
      wasAlreadySolved = userProgress.status === "Solved";
    }

    userProgress.status = status || userProgress.status || "Pending";
    userProgress.timeSpent = timeSpent || userProgress.timeSpent || 0;
    userProgress.notes = notes || userProgress.notes || "";
    userProgress.lastAttempted = new Date();

    if (status === "Solved" && !wasAlreadySolved) {
      userProgress.solvedAt = new Date();
    }

    await userProgress.save();

    if (status === "Solved" && !wasAlreadySolved) {
      let milestones = await UserMilestones.findOne({ userId });
      if (!milestones) {
        milestones = new UserMilestones({ userId });
      }
      milestones.totalProblemsSolved = (milestones.totalProblemsSolved || 0) + 1;
      milestones.thisWeekSolved = (milestones.thisWeekSolved || 0) + 1;
      milestones.lastActivityDate = new Date();
      await milestones.save();
    }

    return res.json({ success: true, message: "Problem updated" });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Get stats
router.get("/stats", async (req, res) => {
  try {
    console.log("📍 GET /stats called");

    const userId = req.user.uid; // ✅ Use Firebase UID from verified token

    const userProgress = await UserProgress.find({ userId }).lean();
    const milestones = await UserMilestones.findOne({ userId }).lean();

    // Calculate unique totals directly from the progress documents
    const solved = userProgress.filter((p) => p.status === "Solved").length;
    const totalAttempted = userProgress.filter((p) => p.status !== "Pending").length;

    // Calculate "Solved this week" dynamically (last 7 days)
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const thisWeekSolvedCount = userProgress.filter((p) => {
      if (p.status !== "Solved") return false;
      // Fallback to createdAt if solvedAt doesn't exist on older documents
      const dateToCheck = p.solvedAt ? new Date(p.solvedAt) : new Date(p.createdAt);
      return dateToCheck >= oneWeekAgo;
    }).length;

    return res.json({
      success: true,
      stats: {
        totalSolved: solved,
        totalAttempted: totalAttempted,
        currentStreak: milestones?.currentStreak || 0,
        thisWeekSolved: thisWeekSolvedCount,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;