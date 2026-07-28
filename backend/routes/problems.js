const express = require("express");
const router = express.Router();
const Problem = require("../models/Problem");
const requireAuth = require("../middleware/auth"); 

// GET all problems
router.get("/", requireAuth, async (req, res) => {
  try {
    const problems = await Problem.find({});
    res.json(problems);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT to toggle status locally for the frontend
router.put("/:id", requireAuth, async (req, res) => {
  try {
    const problem = await Problem.findById(req.params.id);
    if (!problem) {
      return res.status(404).json({ error: "Problem not found" });
    }
    
    // TEMPORARY FIX: We do NOT save to the global Problem model here anymore.
    // When you are ready, you will create a UserProgress model and save the status there.
    
    // For now, just send a 200 OK back so the frontend React state can update smoothly without breaking the global DB.
    res.status(200).json({ 
      message: "Status updated locally", 
      problemId: req.params.id 
    });
    
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;