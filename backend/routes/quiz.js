const router = require("express").Router();
const axios = require("axios");

// Fallback mock questions
const mockQuestions = [
  { question: "What is 25% of 400?", category: "Quant", difficulty: "Easy", options: ["50", "100", "150", "200"], answer: 1 },
  { question: "If A:B = 3:4 and B:C = 4:5, find A:B:C", category: "Quant", difficulty: "Medium", options: ["3:4:5", "3:5:6", "2:3:4", "4:5:6"], answer: 0 },
  { question: "Find the next number: 2, 4, 8, 16, ?", category: "Logical", difficulty: "Easy", options: ["24", "32", "36", "48"], answer: 1 },
  { question: "Which word is the opposite of 'Abundant'?", category: "Verbal", difficulty: "Easy", options: ["Scarce", "Plentiful", "Sufficient", "Ample"], answer: 0 },
  { question: "In a race, A finishes 100m ahead of B. If A takes 10 seconds, how long does B take?", category: "Quant", difficulty: "Medium", options: ["11s", "12s", "13s", "14s"], answer: 1 },
  { question: "What number should replace the question mark? 1, 1, 2, 3, 5, 8, ?", category: "Logical", difficulty: "Medium", options: ["11", "12", "13", "14"], answer: 2 },
  { question: "Choose the correctly spelled word", category: "Verbal", difficulty: "Easy", options: ["Occassion", "Occasion", "Ocasion", "Occassoin"], answer: 1 },
  { question: "If x² + 2x + 1 = 0, find x", category: "Quant", difficulty: "Hard", options: ["-1", "1", "2", "-2"], answer: 0 },
  { question: "Which shape comes next? Triangle, Square, Pentagon, ?", category: "Logical", difficulty: "Easy", options: ["Hexagon", "Octagon", "Heptagon", "Nonagon"], answer: 0 },
  { question: "Select the grammatically correct sentence", category: "Verbal", difficulty: "Medium", options: ["She go to school", "She goes to school", "She going to school", "She gone to school"], answer: 1 },
  { question: "A train travels 240 km in 4 hours. What is its speed?", category: "Quant", difficulty: "Easy", options: ["50 km/h", "60 km/h", "70 km/h", "80 km/h"], answer: 1 },
  { question: "What comes next in the series: AB, CD, EF, ?", category: "Logical", difficulty: "Easy", options: ["GH", "HI", "IJ", "JK"], answer: 0 },
  { question: "The antonym of 'Harsh' is", category: "Verbal", difficulty: "Easy", options: ["Soft", "Gentle", "Kind", "All of above"], answer: 3 },
  { question: "A shopkeeper buys at Rs. 50 and sells at Rs. 75. Profit % is", category: "Quant", difficulty: "Easy", options: ["25%", "50%", "33.33%", "75%"], answer: 1 },
  { question: "Find odd one out: 4, 9, 16, 25, 36, 49, 50", category: "Logical", difficulty: "Medium", options: ["9", "25", "36", "50"], answer: 3 },
  { question: "Fill the blank: He is ___ honest man", category: "Verbal", difficulty: "Easy", options: ["a", "an", "the", "none"], answer: 1 },
  { question: "If 3 men can do a job in 10 days, how many days will 5 men take?", category: "Quant", difficulty: "Medium", options: ["5", "6", "6.5", "7"], answer: 2 },
  { question: "What should replace ? : 1, 4, 9, 16, 25, ?", category: "Logical", difficulty: "Easy", options: ["30", "35", "36", "40"], answer: 2 },
  { question: "Choose correct spelling: Bussiness", category: "Verbal", difficulty: "Easy", options: ["Bussiness", "Business", "Bisness", "Bussnes"], answer: 1 },
  { question: "What is the LCM of 12, 18, 24?", category: "Quant", difficulty: "Medium", options: ["36", "48", "72", "84"], answer: 2 }
];

router.get("/", async (req, res) => {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");

  try {
    const apiKey = process.env.COHERE_API_KEY;
    
    if (!apiKey) {
      console.log("No Cohere API key, using mock questions");
      return res.json(mockQuestions);
    }

    console.log("Fetching questions from Cohere API...");

    const response = await axios.post(
      "https://api.cohere.ai/v1/chat",
      {
        model: "command-r",
        messages: [
          {
            role: "user",
            content: `Generate exactly 20 aptitude quiz questions as a JSON array. No markdown, no code blocks, just pure JSON.

Format (MUST be valid JSON):
[
  {"question": "What is 50% of 200?", "category": "Quant", "difficulty": "Easy", "options": ["50", "100", "150", "200"], "answer": 1},
  {"question": "Find the next number: 2, 4, 8, 16, ?", "category": "Logical", "difficulty": "Easy", "options": ["24", "32", "36", "48"], "answer": 1},
  ...continue with 18 more questions...
]

Include 7 Quant (percentages, ratios, profit/loss, speed/time, work), 7 Logical (patterns, sequences, puzzles), 6 Verbal (grammar, vocabulary, comprehension) questions.

Vary difficulty (Easy, Medium, Hard). Each answer is 0-3 index.

Return ONLY valid JSON array, nothing else.`
          }
        ]
      },
      {
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        timeout: 30000
      }
    );

    let text = response.data?.text;
    
    if (!text) {
      console.log("Empty response, using mock questions");
      return res.json(mockQuestions);
    }

    // Clean text
    text = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

    // Find JSON array
    const startIdx = text.indexOf("[");
    const endIdx = text.lastIndexOf("]");
    
    if (startIdx === -1 || endIdx === -1) {
      console.log("No JSON found in response, using mock");
      return res.json(mockQuestions);
    }

    const jsonStr = text.substring(startIdx, endIdx + 1);
    let questions = JSON.parse(jsonStr);

    // Validate questions format
    if (!Array.isArray(questions) || questions.length < 20) {
      console.log("Invalid format or insufficient questions, using mock");
      return res.json(mockQuestions);
    }

    // Ensure each question has required fields
    questions = questions.slice(0, 20).map((q, i) => ({
      question: q.question || `Question ${i + 1}`,
      category: q.category || "Quant",
      difficulty: q.difficulty || "Easy",
      options: Array.isArray(q.options) ? q.options : ["A", "B", "C", "D"],
      answer: typeof q.answer === "number" ? q.answer : 0
    }));

    console.log("Cohere API questions loaded successfully");
    res.json(questions);
  } catch (err) {
    console.error("Cohere API error:", err.message);
    console.log("Falling back to mock questions");
    res.json(mockQuestions);
  }
});

module.exports = router;