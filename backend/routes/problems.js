const express = require("express");
const router = express.Router();
const Problem = require("../models/Problem");

// GET all problems
router.get("/", async (req, res) => {
  try {
    const problems = await Problem.find();
    res.json(problems);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch problems" });
  }
});

// PUT toggle status
router.put("/:id", async (req, res) => {
  try {
    const problem = await Problem.findById(req.params.id);
    problem.status = !problem.status;
    await problem.save();
    res.json(problem);
  } catch (err) {
    res.status(500).json({ error: "Failed to update problem" });
  }
});

module.exports = router;