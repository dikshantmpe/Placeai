const router = require("express").Router();
const axios = require("axios");

// Function to generate random seed
const getRandomSeed = () => Math.random().toString(36).substring(7);

router.get("/", async (req, res) => {
  try {
    const seed = getRandomSeed();
    const timestamp = Date.now();

    const response = await axios.post("https://api.x.ai/v1/chat/completions", {
      model: "grok-beta",
      messages: [
        {
          role: "user",
          content: `[UNIQUE REQUEST ${seed}-${timestamp}] Generate 20 COMPLETELY NEW random aptitude quiz questions in JSON format. Make sure these are DIFFERENT from any previous questions generated. Include a mix of:
- 7 Quant questions (percentages, ratios, numbers, algebra)
- 7 Logical questions (patterns, sequences, puzzles, reasoning)
- 6 Verbal questions (grammar, comprehension, vocabulary)

Each question must have:
- question: string (unique, creative question)
- category: "Quant" | "Logical" | "Verbal"
- difficulty: "Easy" | "Medium" | "Hard"
- options: array of 4 strings (realistic options)
- answer: number (0-3, index of correct option)

CRITICAL: Generate COMPLETELY DIFFERENT questions each time this endpoint is called. Vary the topics, numbers, scenarios, and wording. Return ONLY valid JSON array, no markdown, no explanation, no code blocks.

Example format:
[
  {
    "question": "If a train travels 240 km in 4 hours, what is its average speed?",
    "category": "Quant",
    "difficulty": "Easy",
    "options": ["60 km/h", "80 km/h", "100 km/h", "120 km/h"],
    "answer": 0
  }
]`
        }
      ],
      temperature: 1.2, // Higher temperature for more randomness
      max_tokens: 4000
    }, {
      headers: {
        "Authorization": `Bearer ${process.env.XAI_API_KEY}`,
        "Content-Type": "application/json"
      }
    });

    const content = response.data.choices[0].message.content;
    
    // Remove markdown code blocks if present
    const jsonText = content
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .replace(/^[\s\n]*/, "")
      .trim();
    
    const questions = JSON.parse(jsonText);

    if (!Array.isArray(questions) || questions.length === 0) {
      throw new Error("Invalid response format");
    }

    res.json(questions);
  } catch (err) {
    console.error("Quiz generation error:", err.response?.data || err.message);
    res.status(500).json({ error: "Failed to generate quiz questions. Please try again." });
  }
});

module.exports = router;