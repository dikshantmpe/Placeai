const express = require("express");
const router = express.Router();
const Problem = require("../models/Problem");
const UserProgress = require("../models/UserProgress");
const UserMilestones = require("../models/UserMilestones");

// Simple Firebase auth middleware
const authenticateUser = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, error: "No auth token" });
  }
  req.userId = req.headers["x-user-id"] || "demo-user";
  next();
};

// Get all DSA problems with user's progress
router.get("/problems", authenticateUser, async (req, res) => {
  try {
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
        output: userProblemData.output || "",
        testResults: userProblemData.testResults || [],
      };

      topicMap[problem.topic].problems.push(problemData);
      topicMap[problem.topic].total += 1;
      if (userProblemData.status === "Solved") {
        topicMap[problem.topic].solved += 1;
      }
    });

    res.json({
      success: true,
      topics: Object.values(topicMap),
      totalProblems: problems.length,
    });
  } catch (error) {
    console.error("Error fetching problems:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get all solutions (for Solutions Gallery)
router.get("/solutions", authenticateUser, async (req, res) => {
  try {
    const userId = req.userId;
    const { topic, difficulty, search } = req.query;

    // Fetch all solved problems for this user
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

    let solutions = userProgress.map((p) => ({
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
    }));

    // Apply filters
    if (topic) {
      solutions = solutions.filter((s) => s.topic === topic);
    }
    if (difficulty) {
      solutions = solutions.filter((s) => s.difficulty === difficulty);
    }
    if (search) {
      const searchLower = search.toLowerCase();
      solutions = solutions.filter((s) =>
        s.name.toLowerCase().includes(searchLower) ||
        s.topic.toLowerCase().includes(searchLower)
      );
    }

    res.json({
      success: true,
      solutions,
      count: solutions.length,
    });
  } catch (error) {
    console.error("Error fetching solutions:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get single problem details
router.get("/problems/:problemId", authenticateUser, async (req, res) => {
  try {
    const { problemId } = req.params;
    const userId = req.userId;

    const problem = await Problem.findById(problemId).lean();
    if (!problem) {
      return res.status(404).json({ success: false, error: "Problem not found" });
    }

    const userProgress = await UserProgress.findOne({
      userId,
      problemId,
    }).lean();

    res.json({
      success: true,
      problem: {
        _id: problem._id,
        name: problem.name || problem.title,
        topic: problem.topic,
        difficulty: problem.difficulty,
        link: problem.link,
        description: problem.description || "",
        status: userProgress?.status || "Pending",
        timeSpent: userProgress?.timeSpent || 0,
        notes: userProgress?.notes || "",
        code: userProgress?.code || "",
        output: userProgress?.output || "",
        testResults: userProgress?.testResults || [],
        lastAttempted: userProgress?.lastAttempted || null,
      },
    });
  } catch (error) {
    console.error("Error fetching problem:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Save code (auto-save when tests pass)
router.post("/problems/:problemId/save-code", authenticateUser, async (req, res) => {
  try {
    const userId = req.userId;
    const { problemId } = req.params;
    const { code, output, testResults, status, timeSpent } = req.body;

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

    // If solved, set solvedAt
    if (status === "Solved") {
      userProgress.solvedAt = new Date();
    }

    await userProgress.save();

    // Update milestones if solved
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

    res.json({
      success: true,
      message: "Code saved successfully",
      progress: userProgress,
    });
  } catch (error) {
    console.error("Error saving code:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update problem status
router.post("/problems/:problemId/update", authenticateUser, async (req, res) => {
  try {
    const userId = req.userId;
    const { problemId } = req.params;
    const { status, timeSpent, notes, code, output, testResults } = req.body;

    let userProgress = await UserProgress.findOne({ userId, problemId });

    if (!userProgress) {
      userProgress = new UserProgress({ userId, problemId });
    }

    userProgress.status = status || userProgress.status || "Pending";
    userProgress.timeSpent = timeSpent || userProgress.timeSpent || 0;
    userProgress.notes = notes !== undefined ? notes : userProgress.notes || "";
    userProgress.code = code || userProgress.code || "";
    userProgress.output = output || userProgress.output || "";
    userProgress.testResults = testResults || userProgress.testResults || [];
    userProgress.lastAttempted = new Date();

    if (status === "Solved") {
      userProgress.solvedAt = new Date();
    }

    await userProgress.save();

    // Update milestones if solved
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

    res.json({ success: true, message: "Problem updated" });
  } catch (error) {
    console.error("Error updating problem:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Add custom problem
router.post("/problems/add", authenticateUser, async (req, res) => {
  try {
    const userId = req.userId;
    const { name, link, topic, difficulty, status, timeSpent, notes, description } = req.body;

    if (!name || !topic || !difficulty) {
      return res.status(400).json({ success: false, error: "Missing required fields" });
    }

    const problem = new Problem({
      title: name,
      name: name,
      link: link || "",
      topic,
      difficulty,
      description: description || "",
      createdBy: userId,
      isCustom: true,
    });

    const savedProblem = await problem.save();

    let userProgress = new UserProgress({
      userId,
      problemId: savedProblem._id,
      status: status || "Pending",
      timeSpent: timeSpent || 0,
      notes: notes || "",
    });

    await userProgress.save();

    res.json({
      success: true,
      problem: {
        _id: savedProblem._id,
        name: savedProblem.name,
        link: savedProblem.link,
        topic: savedProblem.topic,
        difficulty: savedProblem.difficulty,
        status: status || "Pending",
      },
    });
  } catch (error) {
    console.error("Error adding problem:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get stats
router.get("/stats", authenticateUser, async (req, res) => {
  try {
    const userId = req.userId;

    const userProgress = await UserProgress.find({ userId }).lean();
    const milestones = await UserMilestones.findOne({ userId }).lean();

    const solved = userProgress.filter((p) => p.status === "Solved").length;
    const totalAttempted = userProgress.filter(
      (p) => p.status !== "Pending"
    ).length;

    res.json({
      success: true,
      stats: {
        totalSolved: milestones?.totalProblemsSolved || solved,
        totalAttempted,
        currentStreak: milestones?.currentStreak || 0,
        thisWeekSolved: milestones?.thisWeekSolved || 0,
      },
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;