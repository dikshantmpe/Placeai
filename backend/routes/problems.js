const express = require("express");
const router = express.Router();
const Problem = require("../models/Problem");
const UserProgress = require("../models/UserProgress");
const requireAuth = require("../middleware/auth");

// GET all problems, merged with this user's solved status
router.get("/", requireAuth, async (req, res) => {
  try {
    const problems = await Problem.find().lean();
    const progress = await UserProgress.find({ userId: req.user.userId }).lean();

    const solvedSet = new Set(progress.map((p) => String(p.problemId)));

    const merged = problems.map((p) => ({
      ...p,
      status: solvedSet.has(String(p._id)), // per-user, not global anymore
    }));

    res.json(merged);
  } catch (err) {
    console.error("Get problems error:", err.message);
    res.status(500).json({ error: "Failed to fetch problems" });
  }
});

// PUT toggle solved status for the current user only
router.put("/:id", requireAuth, async (req, res) => {
  try {
    const problem = await Problem.findById(req.params.id);
    if (!problem) {
      return res.status(404).json({ error: "Problem not found" });
    }

    const existing = await UserProgress.findOne({
      userId: req.user.userId,
      problemId: req.params.id,
    });

    if (existing) {
      // Already solved by this user -> unsolve (toggle off)
      await UserProgress.deleteOne({ _id: existing._id });
      return res.json({ ...problem.toObject(), status: false });
    } else {
      // Not yet solved by this user -> mark solved (toggle on)
      await UserProgress.create({
        userId: req.user.userId,
        problemId: req.params.id,
      });
      return res.json({ ...problem.toObject(), status: true });
    }
  } catch (err) {
    console.error("Toggle problem error:", err.message);
    res.status(500).json({ error: "Failed to update problem" });
  }
});

module.exports = router;