const express = require("express");
const router = express.Router();
const groq = require("../utils/gemini");

router.post("/chat", async (req, res) => {
  try {
    const { messages, role, difficulty } = req.body;

    const chatMessages = [
      {
        role: "system",
        content: `You are a strict but fair technical interviewer at a top tech company.
        You are interviewing for a ${role} role at ${difficulty} difficulty.
        Rules:
        - Ask ONE question at a time
        - Wait for the candidate to answer before asking next question
        - Start by greeting and asking the first question immediately
        - After 5 questions say "Interview Complete!" and give detailed feedback
        - Be professional and encouraging`
      },
      ...messages.map(m => ({
        role: m.role === "model" ? "assistant" : "user",
        content: m.content
      }))
    ];

    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: chatMessages
    });

    const reply = response.choices[0].message.content;
    res.json({ reply });

  } catch (err) {
    console.error("FULL ERROR:", err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;