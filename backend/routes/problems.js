const express = require("express");
const router = express.Router();
const Problem = require("../models/Problem");
const requireAuth = require("../middleware/auth"); // Adjust this path if your auth middleware is named differently

// GET all problems
router.get("/", requireAuth, async (req, res) => {
  try {
    const problems = await Problem.find({});
    // If you have a separate UserProgress model to track solved status, 
    // that logic goes here. For now, this returns the problems to stop the hanging!
    res.json(problems);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT to toggle status (since your DSATracker makes a PUT request)
router.put("/:id", requireAuth, async (req, res) => {
  try {
    const problem = await Problem.findById(req.params.id);
    if (!problem) {
      return res.status(404).json({ error: "Problem not found" });
    }
    
    // Toggle the status (assuming 'status' is tracked directly on the problem or via a joined progress model)
    // Note: If you use a separate UserProgress collection, update that here instead.
    problem.status = !problem.status; 
    await problem.save();
    
    res.json(problem);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;