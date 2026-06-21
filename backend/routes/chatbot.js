const express = require("express");
const axios = require("axios");
const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { messages } = req.body;

    if (!process.env.COHERE_API_KEY) {
      return res.status(500).json({ error: "API key not configured" });
    }

    if (!messages || messages.length === 0) {
      return res.status(400).json({ error: "No messages provided" });
    }

    const preamble = `You are PlaceBot, an expert AI assistant for placement preparation.
You help students with:
- DSA concepts and problem solving approaches
- HR interview tips and answers
- Resume building advice
- Company-specific interview preparation
- Aptitude and reasoning tricks
- General guidance

Keep answers concise, practical and student-friendly.
Use bullet points where helpful.`;

    // messages from frontend: [{ role: "user" | "assistant", content: "..." }, ...]
    // Convert to Cohere v1 format: last message -> `message`, rest -> `chat_history`
    const lastMessage = messages[messages.length - 1];
    const history = messages.slice(0, -1).map((m) => ({
      role: m.role === "assistant" ? "CHATBOT" : "USER",
      message: m.content,
    }));

    const response = await axios.post(
      "https://api.cohere.ai/v1/chat",
      {
        model: "command-a-03-2025",
        message: lastMessage.content,
        chat_history: history,
        preamble: preamble,
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
    console.error("Chatbot error:", err.response?.data || err.message);
    res.status(500).json({ error: err.message || "Chatbot error" });
  }
});

module.exports = router;