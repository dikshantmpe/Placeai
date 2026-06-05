const express = require("express");
const router = express.Router();
const multer = require("multer");
const pdfParse = require("pdf-parse");
const groq = require("../utils/gemini");

const upload = multer({ storage: multer.memoryStorage() });

router.post("/analyze", upload.single("resume"), async (req, res) => {
  try {
    const pdfData = await pdfParse(req.file.buffer);
    const resumeText = pdfData.text;

    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: "You are a placement expert who analyzes resumes for software engineering jobs."
        },
        {
          role: "user",
          content: `Analyze this resume for a software engineering job.
          Give your response in this exact format:

          STRENGTHS:
          - point 1
          - point 2

          WEAKNESSES:
          - point 1
          - point 2

          SUGGESTIONS:
          - point 1
          - point 2

          OVERALL SCORE: X/10

          Resume:
          ${resumeText}`
        }
      ]
    });

    const feedback = response.choices[0].message.content;
    res.json({ feedback });

  } catch (err) {
    console.error("FULL ERROR:", err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;