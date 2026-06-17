const router = require("express").Router();
const axios = require("axios");

router.get("/", async (req, res) => {
  // Set no-cache headers
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");

  try {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);

    const prompt = `[GEN-${timestamp}-${random}] GENERATE 20 BRAND NEW RANDOM QUESTIONS. DO NOT REPEAT PREVIOUS QUESTIONS. Each time should be completely different.

Categories:
- 7 Quant: profit/loss, percentages, ratios, speed, time, work, algebra
- 7 Logical: pattern recognition, sequence, reasoning, puzzles, analogy
- 6 Verbal: grammar, comprehension, antonyms, synonyms, sentence correction

Format as JSON only (no markdown, no explanation):
[
  {
    "question": "...",
    "category": "Quant|Logical|Verbal",
    "difficulty": "Easy|Medium|Hard",
    "options": ["A", "B", "C", "D"],
    "answer": 0
  }
]`;

    const response = await axios.post(
      "https://api.x.ai/v1/chat/completions",
      {
        model: "grok-beta",
        messages: [{ role: "user", content: prompt }],
        temperature: 1.5,
        max_tokens: 5000,
        top_p: 0.95
      },
      {
        headers: {
          "Authorization": `Bearer ${process.env.XAI_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    let content = response.data.choices[0].message.content;

    // Remove all markdown
    content = content.replace(/```[\s\S]*?```/g, "");
    content = content.replace(/^[\s\n]*/, "");
    content = content.trim();

    // Extract JSON array
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      console.error("No JSON found in response:", content);
      return res.status(500).json({ error: "Invalid API response" });
    }

    const questions = JSON.parse(jsonMatch[0]);

    if (!Array.isArray(questions) || questions.length < 20) {
      return res.status(500).json({ error: "Insufficient questions generated" });
    }

    res.json(questions);
  } catch (err) {
    console.error("Error:", err.message);
    res.status(500).json({ error: "Failed to generate questions" });
  }
});

module.exports = router;