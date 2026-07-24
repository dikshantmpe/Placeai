const express = require("express");
const router = express.Router();

// Inline middleware for auth
const authenticateUser = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.warn("❌ No auth header");
      return res.status(401).json({ success: false, error: "No auth token" });
    }
    
    req.userId = req.headers["x-user-id"] || "demo-user";
    console.log(`✅ Authenticated user: ${req.userId}`);
    next();
  } catch (error) {
    console.error("Auth error:", error);
    res.status(401).json({ success: false, error: "Auth failed" });
  }
};

// Test endpoint
router.get("/test", (req, res) => {
  return res.json({ success: true, message: "DSA route working" });
});

// Get all solutions (for Solutions Gallery)
router.get("/solutions", authenticateUser, async (req, res) => {
  try {
    console.log("📍 GET /solutions called");
    
    const Problem = require("../models/Problem");
    const UserProgress = require("../models/UserProgress");

    const userId = req.userId;
    const { topic, difficulty, search } = req.query;

    console.log("Fetching solutions for user:", userId);
    console.log("Filters - topic:", topic, "difficulty:", difficulty, "search:", search);

    // Fetch all solved problems for this user
    let progressFilter = { userId, status: "Solved" };
    
    const userProgress = await UserProgress.find(progressFilter)
      .populate("problemId")
      .lean();

    console.log("Found user progress records:", userProgress?.length || 0);

    if (!userProgress || userProgress.length === 0) {
      console.log("No solved problems found");
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
        console.error("Error mapping solution:", err);
        return null;
      }
    }).filter(Boolean);

    console.log("Mapped solutions:", solutions.length);

    // Apply filters
    if (topic) {
      solutions = solutions.filter((s) => s.topic === topic);
      console.log("After topic filter:", solutions.length);
    }
    if (difficulty) {
      solutions = solutions.filter((s) => s.difficulty === difficulty);
      console.log("After difficulty filter:", solutions.length);
    }
    if (search) {
      const searchLower = search.toLowerCase();
      solutions = solutions.filter((s) =>
        s.name.toLowerCase().includes(searchLower) ||
        s.topic.toLowerCase().includes(searchLower)
      );
      console.log("After search filter:", solutions.length);
    }

    console.log("✅ Returning solutions:", solutions.length);
    return res.json({
      success: true,
      solutions,
      count: solutions.length,
    });
  } catch (error) {
    console.error("❌ Error fetching solutions:", error);
    return res.status(500).json({ 
      success: false, 
      error: error.message || "Failed to fetch solutions"
    });
  }
});

// Get all problems
router.get("/problems", authenticateUser, async (req, res) => {
  try {
    console.log("📍 GET /problems called");

    const Problem = require("../models/Problem");
    const UserProgress = require("../models/UserProgress");

    const userId = req.userId;
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
    console.error("❌ Error fetching problems:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Save code
router.post("/problems/:problemId/save-code", authenticateUser, async (req, res) => {
  try {
    console.log("📍 POST /save-code called");

    const UserProgress = require("../models/UserProgress");
    const UserMilestones = require("../models/UserMilestones");

    const userId = req.userId;
    const { problemId } = req.params;
    const { code, output, testResults, status, timeSpent } = req.body;

    console.log("Saving code for problem:", problemId, "status:", status);

    let userProgress = await UserProgress.findOne({ userId, problemId });

    if (!userProgress) {
      userProgress = new UserProgress({
        userId,
        problemId,
      });
    }

    userProgress.code = code || userProgress.code;
    userProgress.output = output || userProgress.output;
    userProgress.testResults = testResults || userProgress.testResults;
    userProgress.status = status || userProgress.status;
    userProgress.timeSpent = timeSpent || userProgress.timeSpent;
    userProgress.lastAttempted = new Date();

    if (status === "Solved") {
      userProgress.solvedAt = new Date();
    }

    await userProgress.save();

    // Update milestones
    if (status === "Solved") {
      let milestones = await UserMilestones.findOne({ userId });
      if (!milestones) {
        milestones = new UserMilestones({ userId });
      }

      milestones.totalProblemsSolved = (milestones.totalProblemsSolved || 0) + 1;
      milestones.thisWeekSolved = (milestones.thisWeekSolved || 0) + 1;
      milestones.lastActivityDate = new Date();
      await milestones.save();
    }

    console.log("✅ Code saved successfully");
    return res.json({
      success: true,
      message: "Code saved successfully",
    });
  } catch (error) {
    console.error("❌ Error saving code:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Update problem status
router.post("/problems/:problemId/update", authenticateUser, async (req, res) => {
  try {
    console.log("📍 POST /update called");

    const UserProgress = require("../models/UserProgress");
    const UserMilestones = require("../models/UserMilestones");

    const userId = req.userId;
    const { problemId } = req.params;
    const { status, timeSpent, notes } = req.body;

    let userProgress = await UserProgress.findOne({ userId, problemId });

    if (!userProgress) {
      userProgress = new UserProgress({ userId, problemId });
    }

    userProgress.status = status || userProgress.status || "Pending";
    userProgress.timeSpent = timeSpent || userProgress.timeSpent || 0;
    userProgress.notes = notes || userProgress.notes || "";
    userProgress.lastAttempted = new Date();

    if (status === "Solved") {
      userProgress.solvedAt = new Date();
    }

    await userProgress.save();

    if (status === "Solved") {
      let milestones = await UserMilestones.findOne({ userId });
      if (!milestones) {
        milestones = new UserMilestones({ userId });
      }
      milestones.totalProblemsSolved = (milestones.totalProblemsSolved || 0) + 1;
      milestones.thisWeekSolved = (milestones.thisWeekSolved || 0) + 1;
      milestones.lastActivityDate = new Date();
      await milestones.save();
    }

    console.log("✅ Problem updated");
    return res.json({ success: true, message: "Problem updated" });
  } catch (error) {
    console.error("❌ Error updating problem:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Get stats
router.get("/stats", authenticateUser, async (req, res) => {
  try {
    console.log("📍 GET /stats called");

    const UserProgress = require("../models/UserProgress");
    const UserMilestones = require("../models/UserMilestones");

    const userId = req.userId;

    const userProgress = await UserProgress.find({ userId }).lean();
    const milestones = await UserMilestones.findOne({ userId }).lean();

    const solved = userProgress.filter((p) => p.status === "Solved").length;
    const totalAttempted = userProgress.filter(
      (p) => p.status !== "Pending"
    ).length;

    return res.json({
      success: true,
      stats: {
        totalSolved: milestones?.totalProblemsSolved || solved,
        totalAttempted,
        currentStreak: milestones?.currentStreak || 0,
        thisWeekSolved: milestones?.thisWeekSolved || 0,
      },
    });
  } catch (error) {
    console.error("❌ Error fetching stats:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;