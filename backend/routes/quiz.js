const router = require("express").Router();
const axios = require("axios");

router.get("/", async (req, res) => {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");

  try {
    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "API key not configured" });
    }

    const response = await axios.post(
      "https://api.x.ai/v1/chat/completions",
      {
        model: "grok-beta",
        messages: [
          {
            role: "user",
            content: `Generate exactly 20 aptitude quiz questions as a JSON array. No markdown, no code blocks, just pure JSON.
            
Format:
[
  {"question": "What is 50% of 200?", "category": "Quant", "difficulty": "Easy", "options": ["50", "100", "150", "200"], "answer": 1},
  ...20 questions total...
]

Include 7 Quant, 7 Logical, 6 Verbal questions. Vary difficulty. Each time generate completely different questions.`
          }
        ],
        temperature: 1.5,
        max_tokens: 4000
      },
      {
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        timeout: 30000
      }
    );

    let text = response.data?.choices?.[0]?.message?.content;
    
    if (!text) {
      console.error("No content in response");
      return res.status(500).json({ error: "Empty API response" });
    }

    // Clean markdown
    text = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

    // Find JSON array
    const startIdx = text.indexOf("[");
    const endIdx = text.lastIndexOf("]");
    
    if (startIdx === -1 || endIdx === -1) {
      console.error("No JSON array found in response:", text.substring(0, 200));
      return res.status(500).json({ error: "Invalid response format" });
    }

    const jsonStr = text.substring(startIdx, endIdx + 1);
    const questions = JSON.parse(jsonStr);

    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(500).json({ error: "No questions generated" });
    }

    res.json(questions);
  } catch (err) {
    console.error("Quiz error:", err.message);
    res.status(500).json({ error: err.message || "Failed to generate questions" });
  }
});

module.exports = router;