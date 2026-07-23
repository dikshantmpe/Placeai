const express = require("express");
const router = express.Router();
const Problem = require("../models/Problem");
const UserProgress = require("../models/UserProgress");
const UserMilestones = require("../models/UserMilestones");
const { authenticateFirebaseUser } = require("../middleware/auth");

// Get all DSA problems with user's progress
router.get("/problems", authenticateFirebaseUser, async (req, res) => {
  try {
    const userId = req.user.uid;
    const { topic, difficulty, status, search } = req.query;

    // Build filter
    let filter = {};
    if (topic) filter.topic = topic;
    if (difficulty) filter.difficulty = difficulty;
    if (search) filter.name = { $regex: search, $options: "i" };

    // Fetch all problems
    const problems = await Problem.find(filter).lean();

    // Fetch user's progress for these problems
    const userProgress = await UserProgress.findOne({ userId }).lean();
    const problemProgress = userProgress?.problems || {};

    // Organize by topic
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

      const userProblemData = problemProgress[problem._id.toString()] || {};
      const problemData = {
        _id: problem._id,
        name: problem.name,
        link: problem.link || "#",
        difficulty: problem.difficulty,
        status: userProblemData.status || "Pending",
        lastAttempted: userProblemData.lastAttempted || null,
        timeSpent: userProblemData.timeSpent || 0,
        notes: userProblemData.notes || "",
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

// Update problem status
router.post("/problems/:problemId/update", authenticateFirebaseUser, async (req, res) => {
  try {
    const userId = req.user.uid;
    const { problemId } = req.params;
    const { status, timeSpent, notes } = req.body;

    // Update user's progress
    let userProgress = await UserProgress.findOne({ userId });
    if (!userProgress) {
      userProgress = new UserProgress({ userId, problems: {} });
    }

    const problemIdStr = problemId.toString();
    userProgress.problems[problemIdStr] = {
      ...userProgress.problems[problemIdStr],
      status: status || userProgress.problems[problemIdStr]?.status || "Pending",
      timeSpent: timeSpent || userProgress.problems[problemIdStr]?.timeSpent || 0,
      notes: notes !== undefined ? notes : userProgress.problems[problemIdStr]?.notes || "",
      lastAttempted: new Date(),
    };

    await userProgress.save();

    // Update milestones if solved
    if (status === "Solved") {
      const problem = await Problem.findById(problemId).lean();
      let milestones = await UserMilestones.findOne({ userId });
      if (!milestones) {
        milestones = new UserMilestones({ userId });
      }

      milestones.totalProblemsSolved = (milestones.totalProblemsSolved || 0) + 1;
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
router.post("/problems/add", authenticateFirebaseUser, async (req, res) => {
  try {
    const userId = req.user.uid;
    const { name, link, topic, difficulty, status, timeSpent, notes } = req.body;

    // Validate
    if (!name || !topic || !difficulty) {
      return res.status(400).json({ success: false, error: "Missing required fields" });
    }

    // Create problem
    const problem = new Problem({
      name,
      link: link || "",
      topic,
      difficulty,
      createdBy: userId,
      isCustom: true,
    });

    const savedProblem = await problem.save();

    // Add to user's progress
    let userProgress = await UserProgress.findOne({ userId });
    if (!userProgress) {
      userProgress = new UserProgress({ userId, problems: {} });
    }

    userProgress.problems[savedProblem._id.toString()] = {
      status: status || "Pending",
      timeSpent: timeSpent || 0,
      notes: notes || "",
      lastAttempted: new Date(),
    };

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

// Get stats for DSA progress
router.get("/stats", authenticateFirebaseUser, async (req, res) => {
  try {
    const userId = req.user.uid;

    const userProgress = await UserProgress.findOne({ userId }).lean();
    const milestones = await UserMilestones.findOne({ userId }).lean();

    const problems = userProgress?.problems || {};
    const solved = Object.values(problems).filter((p) => p.status === "Solved").length;
    const totalAttempted = Object.values(problems).filter(
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