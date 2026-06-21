const express = require("express");
const axios = require("axios");
const router = express.Router();

const mockDaily = {
  dsa: {
    title: "Two Sum Problem",
    topic: "Array/HashMap",
    difficulty: "Easy",
    link: "https://leetcode.com/problems/two-sum/"
  },
  quiz: {
    question: "What is 25% of 400?",
    options: ["50", "100", "150", "200"],
    answer: 1
  }
};

router.get("/", async (req, res) => {
  try {
    if (!process.env.COHERE_API_KEY) {
      return res.json(mockDaily);
    }

    const prompt = `Generate today's daily challenge. Return ONLY JSON:
{"dsa":{"title":"...","topic":"...","difficulty":"Easy|Medium|Hard","link":"leetcode.com link"},"quiz":{"question":"...","options":["A","B","C","D"],"answer":0}}`;

    const response = await axios.post(
      "https://api.cohere.ai/v1/chat",
      {
        model: "command-a-03-2025",
        message: prompt
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.COHERE_API_KEY}`,
          "Content-Type": "application/json"
        },
        timeout: 30000
      }
    );

    let text = response.data.text;
    text = text.replace(/```json/g, "").replace(/```/g, "").trim();
    const jsonStart = text.indexOf("{");
    const jsonEnd = text.lastIndexOf("}");

    if (jsonStart === -1 || jsonEnd === -1) {
      console.error("Daily challenge: no JSON found in Cohere response:", text);
      return res.json(mockDaily);
    }

    const challenge = JSON.parse(text.substring(jsonStart, jsonEnd + 1));
    res.json(challenge);
  } catch (err) {
    console.error("Daily challenge error:", err.response?.data || err.message);
    res.json(mockDaily);
  }
});

module.exports = router;