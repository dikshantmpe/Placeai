const express = require("express");
const axios = require("axios");
const router = express.Router();

router.get("/:companyName", async (req, res) => {
  try {
    const { companyName } = req.params;

    if (!process.env.COHERE_API_KEY) {
      return res.json([
        { question: "Tell us about yourself", difficulty: "Easy", category: "HR" },
        { question: "Why do you want to join our company?", difficulty: "Easy", category: "HR" },
        { question: "What are your strengths?", difficulty: "Medium", category: "HR" }
      ]);
    }

    const prompt = `Generate 10 interview questions for ${companyName}. Return ONLY valid JSON array:
[{"question":"...","difficulty":"Easy|Medium|Hard","category":"Technical|HR|Behavioral"},...10 total...]`;

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
    const jsonStart = text.indexOf("[");
    const jsonEnd = text.lastIndexOf("]");

    if (jsonStart === -1 || jsonEnd === -1) {
      console.error("Company questions: no JSON array found in Cohere response:", text);
      return res.json([
        { question: "Tell us about yourself", difficulty: "Easy", category: "HR" },
        { question: "Why do you want to join " + companyName + "?", difficulty: "Easy", category: "HR" },
        { question: "What are your strengths?", difficulty: "Medium", category: "HR" }
      ]);
    }

    const questions = JSON.parse(text.substring(jsonStart, jsonEnd + 1));
    res.json(questions.slice(0, 10));
  } catch (err) {
    console.error("Company questions error:", err.response?.data || err.message);
    res.json([
      { question: "Tell us about yourself", difficulty: "Easy", category: "HR" }
    ]);
  }
});

module.exports = router;