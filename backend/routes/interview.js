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

    if (!messages || messages.length === 0) {
      console.error("No messages provided");
      return res.status(400).json({ error: "No messages provided" });
    }

    console.log("API key found, calling Cohere...");

    // ✅ UPDATED PREAMBLE: Added strict instruction for handling wrong/unknown answers
    const preamble = `You are a strict but fair technical interviewer at a top tech company.
You are interviewing for a ${role} role at ${difficulty} difficulty.
Rules:
- Ask one question at a time.
- Wait for the candidate to answer before asking the next question.
- IMPORTANT: If the candidate says "I don't know", gives a wrong answer, or gives an incomplete answer, politely correct them and explain the correct solution FIRST, then move on to the next question.
- Start by greeting and asking the first question immediately.
- After 5 questions say "Interview Complete" and give detailed feedback.
- Be professional and encouraging.`;

    // messages coming from frontend are assumed to look like:
    // [{ role: "user" | "assistant", content: "..." }, ...]
    // Convert to Cohere's format: last message becomes `message`,
    // everything before it becomes `chat_history`.

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
          "Content-Type": "application/json",
        },
        timeout: 30000,
      }
    );

    console.log("Cohere API response received");

    const reply = response.data.text;
    res.json({ reply });
  } catch (err) {
    console.error("Interview error:", err.response?.data || err.message);
    res.status(500).json({ error: err.message || "Failed to process interview" });
  }
});

module.exports = router;