const router = require("express").Router();
const axios = require("axios");

router.get("/", async (req, res) => {
  try {
    const response = await axios.post("https://api.x.ai/v1/chat/completions", {
      model: "grok-beta",
      messages: [
        {
          role: "user",
          content: `Generate 20 random aptitude quiz questions in JSON format. Include a mix of:
- 7 Quant questions (percentages, ratios, numbers)
- 7 Logical questions (patterns, sequences, puzzles)
- 6 Verbal questions (grammar, comprehension)

Each question should have:
- question: string
- category: "Quant" | "Logical" | "Verbal"
- difficulty: "Easy" | "Medium" | "Hard"
- options: array of 4 strings
- answer: number (0-3, index of correct option)

Make questions DIFFERENT EVERY TIME. Return ONLY valid JSON array, no markdown, no explanation.`
        }
      ]
    }, {
      headers: {
        "Authorization": `Bearer ${process.env.XAI_API_KEY}`,
        "Content-Type": "application/json"
      }
    });

    const content = response.data.choices[0].message.content;
    const jsonText = content.replace(/```json\n?|\n?```/g, "").trim();
    const questions = JSON.parse(jsonText);

    res.json(questions);
  } catch (err) {
    console.error("Quiz generation error:", err.response?.data || err.message);
    res.status(500).json({ error: "Failed to generate quiz questions" });
  }
});

module.exports = router;