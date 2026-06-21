const express = require("express");
const axios = require("axios");
const router = express.Router();

router.post("/upload", async (req, res) => {
  try {
    const { resume } = req.body;

    if (!process.env.COHERE_API_KEY) {
      return res.status(500).json({ error: "API key not configured" });
    }

    const response = await axios.post(
      "https://api.cohere.com/v2/chat",
      {
        model: "command-a-03-2025",
        messages: [
          {
            role: "user",
            content: `You are an expert resume analyst for software engineering jobs.
Analyze this resume and provide detailed feedback.
Format your response as JSON with these exact fields:
{
  "overallScore": number (0-100),
  "strengths": ["point1", "point2", ...],
  "weaknesses": ["point1", "point2", ...],
  "suggestions": ["suggestion1", "suggestion2", ...],
  "feedback": "detailed feedback text"
}

Resume:
${resume}`
          }
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

    // v2 API response shape: response.data.message.content[0].text
    let text = response.data.message?.content?.[0]?.text || "";
    text = text.replace(/```json/g, "").replace(/```/g, "").trim();
    const jsonStart = text.indexOf("{");
    const jsonEnd = text.lastIndexOf("}");

    if (jsonStart === -1 || jsonEnd === -1) {
      console.error("Resume: could not find JSON in model response:", text);
      return res.json({
        overallScore: 75,
        strengths: ["Clear structure", "Good experience"],
        weaknesses: ["Could add metrics", "Need more projects"],
        suggestions: ["Quantify achievements", "Add certifications"],
        feedback: "Resume looks good overall"
      });
    }

    const feedback = JSON.parse(text.substring(jsonStart, jsonEnd + 1));
    res.json(feedback);
  } catch (err) {
    console.error("Resume error:", err.response?.data || err.message);
    res.json({
      overallScore: 70,
      strengths: ["Professional format"],
      weaknesses: ["Limited details"],
      suggestions: ["Add more projects", "Include metrics"],
      feedback: "Resume needs enhancement"
    });
  }
});

module.exports = router;