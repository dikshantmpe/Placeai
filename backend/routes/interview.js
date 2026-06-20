const express = require("express");
const axios = require("axios");
const router = express.Router();

router.post("/chat", async (req, res) => {
  try {
    const { messages, role, difficulty } = req.body;
    
    console.log("Interview request received:", { role, difficulty });

    if (!process.env.COHERE_API_KEY) {
      console.error("No COHERE_API_KEY found");
      return res.status(500).json({ error: "API key not configured" });
    }

    console.log("API key found, calling Cohere...");

    const systemPrompt = `You are a strict but fair technical interviewer at a top tech company.
You are interviewing for a ${role} role at ${difficulty} difficulty.
Rules:
- Ask one question at a time
- Wait for the candidate to answer before asking next question
- Start by greeting and asking the first question immediately
- After 5 questions say "Interview Complete" and give detailed feedback
- Be professional and encouraging`;

    const response = await axios.post(
      "https://api.cohere.ai/v1/chat",
      {
        model: "command-r",
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          ...messages
        ]
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.COHERE_API_KEY}`,
          "Content-Type": "application/json"
        },
        timeout: 30000
      }
    );

    console.log("Cohere API response received");
    
    const reply = response.data.text;
    res.json({ reply });
  } catch (err) {
    console.error("Interview error:", err.message);
    res.status(500).json({ error: err.message || "Failed to process interview" });
  }
});

module.exports = router;
