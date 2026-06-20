const express = require("express");
const axios = require("axios");
const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { messages } = req.body;

    if (!process.env.COHERE_API_KEY) {
      return res.status(500).json({ error: "API key not configured" });
    }

    const systemPrompt = `You are PlaceBot, an expert AI assistant for placement preparation.
You help students with:
- DSA concepts and problem solving approaches
- HR interview tips and answers
- Resume building advice
- Company-specific interview preparation
- Aptitude and reasoning tricks
- General guidance

Keep answers concise, practical and student-friendly.
Use bullet points where helpful.`;

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

    const reply = response.data.text;
    res.json({ reply });
  } catch (err) {
    console.error("Chatbot error:", err.message);
    res.status(500).json({ error: err.message || "Chatbot error" });
  }
});

module.exports = router;
