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
  { question: "Choose correct spelling", category: "Verbal", difficulty: "Easy", options: ["Bussiness", "Business", "Bisness", "Bussnes"], answer: 1 },
  { question: "What is the LCM of 12, 18, 24?", category: "Quant", difficulty: "Medium", options: ["36", "48", "72", "84"], answer: 2 }
];

router.get("/", async (req, res) => {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");

  try {
    const apiKey = process.env.COHERE_API_KEY;

    if (!apiKey) {
      console.log("No Cohere API key found. Using mock questions.");
      return res.json(mockQuestions);
    }

    console.log("Fetching quiz questions from Cohere...");

    const prompt = `
Generate exactly 20 aptitude quiz questions.

Rules:
- Return ONLY a valid JSON array.
- Do NOT include markdown.
- Do NOT include explanations.
- Do NOT include code blocks.

Format:

[
  {
    "question": "What is 50% of 200?",
    "category": "Quant",
    "difficulty": "Easy",
    "options": ["50", "100", "150", "200"],
    "answer": 1
  }
]

Requirements:
- 7 Quant questions
- 7 Logical questions
- 6 Verbal questions
- Each question must have exactly 4 options.
- "answer" must be the correct option index (0-3).
- Difficulty should be Easy, Medium or Hard.
`;

    const response = await axios.post(
      "https://api.cohere.ai/v1/chat",
      {
        model: "command-r",
        message: prompt
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        timeout: 30000
      }
    );
     console.log("=================================");
console.log("FULL COHERE RESPONSE");
console.log(JSON.stringify(response.data, null, 2));
console.log("=================================");
    console.log(
      "Cohere response:",
      JSON.stringify(response.data, null, 2)
    );

    let text =
      response.data?.text ||
      response.data?.message ||
      "";

    if (!text) {
      console.log("Empty response from Cohere.");
      return res.json(mockQuestions);
    }

    // Remove markdown if present
    text = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    // Extract JSON array
    const startIndex = text.indexOf("[");
    const endIndex = text.lastIndexOf("]");

    if (startIndex === -1 || endIndex === -1) {
      console.log("JSON array not found.");
      return res.json(mockQuestions);
    }

    const jsonString = text.substring(
      startIndex,
      endIndex + 1
    );

    let questions;

    try {
      questions = JSON.parse(jsonString);
    } catch (parseError) {
      console.log("Failed to parse JSON.");
      console.log(parseError.message);
      return res.json(mockQuestions);
    }

    if (!Array.isArray(questions)) {
      console.log("Questions are not an array.");
      return res.json(mockQuestions);
    }

    if (questions.length < 20) {
      console.log("Less than 20 questions generated.");
      return res.json(mockQuestions);
    }

    // Validate questions
    questions = questions.slice(0, 20).map((q, index) => ({
      question: q.question || `Question ${index + 1}`,
      category: ["Quant", "Logical", "Verbal"].includes(q.category)
        ? q.category
        : "Quant",
      difficulty: ["Easy", "Medium", "Hard"].includes(q.difficulty)
        ? q.difficulty
        : "Easy",
      options:
        Array.isArray(q.options) && q.options.length === 4
          ? q.options
          : ["Option A", "Option B", "Option C", "Option D"],
      answer:
        typeof q.answer === "number" &&
        q.answer >= 0 &&
        q.answer <= 3
          ? q.answer
          : 0
    }));

    console.log("Successfully generated quiz.");

    return res.json(questions);

  } catch (err) {
    console.error(
      "Cohere Error:",
      err.response?.data || err.message
    );

    console.log("Using fallback mock questions.");

    return res.json(mockQuestions);
  }
});

module.exports = router;