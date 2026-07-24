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
    const allProgress = await UserProgress.find({ userId }).lean();

    // Create a map of problemId to progress for fast lookup
    const progressMap = new Map(
      allProgress.map(p => [p.problemId.toString(), p])
    );

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

      const userProblemData = progressMap.get(problem._id.toString()) || {};
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
      if (userProblemData.status === "Solved" || userProblemData.status === "solved") {
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

// Get single problem details
router.get("/problems/:problemId", authenticateUser, async (req, res) => {
  try {
    const { problemId } = req.params;
    const userId = req.userId;

    const problem = await Problem.findById(problemId).lean();
    if (!problem) {
      return res.status(404).json({ success: false, error: "Problem not found" });
    }

    const userProgress = await UserProgress.findOne({ userId, problemId }).lean();
    const problemProgress = userProgress || {};

    res.json({
      success: true,
      problem: {
        _id: problem._id,
        name: problem.name || problem.title,
        topic: problem.topic,
        difficulty: problem.difficulty,
        link: problem.link,
        description: problem.description || "",
        status: problemProgress.status || "Pending",
        timeSpent: problemProgress.timeSpent || 0,
        notes: problemProgress.notes || "",
        code: problemProgress.code || "",
        output: problemProgress.output || "",
        testResults: problemProgress.testResults || [],
        lastAttempted: problemProgress.lastAttempted || null,
      },
    });
  } catch (error) {
    console.error("Error fetching problem:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update problem status
router.post("/problems/:problemId/update", authenticateUser, async (req, res) => {
  try {
    const userId = req.userId;
    const { problemId } = req.params;
    const { status, timeSpent, notes } = req.body;

    const updatedProgress = await UserProgress.findOneAndUpdate(
      { userId, problemId },
      {
        $set: {
          status: status || "Pending",
          timeSpent: timeSpent || 0,
          lastAttempted: new Date(),
          ...(notes !== undefined && { notes })
        }
      },
      { new: true, upsert: true }
    );

    // Update milestones if solved
    if (status === "Solved" || status === "solved") {
      let milestones = await UserMilestones.findOne({ userId });
      if (!milestones) {
        milestones = new UserMilestones({ userId });
      }

      milestones.totalProblemsSolved = (milestones.totalProblemsSolved || 0) + 1;
      milestones.thisWeekSolved = (milestones.thisWeekSolved || 0) + 1;
      milestones.lastActivityDate = new Date();
      await milestones.save();
    }

    res.json({ success: true, progress: updatedProgress });
  } catch (error) {
    console.error("Error updating problem:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Save code solution
router.post("/problems/:problemId/save-code", authenticateUser, async (req, res) => {
  try {
    const userId = req.userId;
    const { problemId } = req.params;
    const { code, output, status, testResults } = req.body;

    const updatedProgress = await UserProgress.findOneAndUpdate(
      { userId, problemId },
      {
        $set: {
          code: code || "",
          output: output || "",
          status: status || "Pending",
          testResults: testResults || [],
          lastAttempted: new Date(),
          ...(status === "Solved" && { solvedAt: new Date() })
        }
      },
      { new: true, upsert: true }
    );

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

    res.json({ success: true, progress: updatedProgress });
  } catch (error) {
    console.error("Error saving code:", error);
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

    // Create progress record for the new problem
    const userProgress = new UserProgress({
      userId,
      problemId: savedProblem._id,
      status: status || "Pending",
      timeSpent: timeSpent || 0,
      notes: notes || "",
      lastAttempted: new Date(),
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

    const allProgress = await UserProgress.find({ userId }).lean();
    const milestones = await UserMilestones.findOne({ userId }).lean();

    const solved = allProgress.filter(
      (p) => p.status === "Solved" || p.status === "solved"
    ).length;
    const totalAttempted = allProgress.filter(
      (p) => p.status !== "Pending"
    ).length;

    res.json({
      success: true,
      stats: {
        totalSolved: milestones?.totalProblemsSolved || solved,
        totalAttempted: totalAttempted || allProgress.length,
        currentStreak: milestones?.currentStreak || 0,
        thisWeekSolved: milestones?.thisWeekSolved || 0,
      },
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get all solutions (saved code with tests passing)
router.get("/solutions", authenticateUser, async (req, res) => {
  try {
    const userId = req.userId;

    // Get all solved problems with code
    const solvedProblems = await UserProgress.find({ 
      userId, 
      status: { $in: ["Solved", "solved"] },
      code: { $exists: true, $ne: "" }
    }).lean().populate("problemId");

    const solutions = solvedProblems
      .filter(p => p.problemId) // Only include if problem exists
      .map(p => ({
        _id: p._id,
        problemId: p.problemId._id,
        name: p.problemId.name || p.problemId.title,
        topic: p.problemId.topic,
        difficulty: p.problemId.difficulty,
        code: p.code,
        output: p.output,
        testResults: p.testResults || [],
        solvedAt: p.solvedAt,
        timeSpent: p.timeSpent,
      }))
      .sort((a, b) => new Date(b.solvedAt) - new Date(a.solvedAt));

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

module.exports = router;