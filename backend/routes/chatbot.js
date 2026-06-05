const express = require("express");
const router = express.Router();
const groq = require("../utils/gemini");

router.post("/", async (req, res) => {
  try {
    const { messages } = req.body;

    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: `You are PlaceBot, an expert AI assistant for placement preparation.
          You help students with:
          - DSA concepts and problem solving approaches
          - System design concepts
          - HR interview tips and answers
          - Resume building advice
          - Company-specific interview preparation
          - Aptitude and reasoning tricks
          - Career guidance
          Keep answers concise, practical and student-friendly.
          Use bullet points and examples where helpful.`
        },
        ...messages
      ]
    });

    const reply = response.choices[0].message.content;
    res.json({ reply });

  } catch (err) {
    console.error("Chatbot error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;