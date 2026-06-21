const router = require("express").Router();
const axios = require("axios");

const mockQuestions = [
  { question: "What is 25% of 400?", category: "Quant", difficulty: "Easy", options: ["50", "100", "150", "200"], answer: 1 },
  { question: "If A:B = 3:4, find B:C when B:C = 4:5", category: "Quant", difficulty: "Medium", options: ["3:4:5", "3:5:6", "2:3:4", "4:5:6"], answer: 0 },
  { question: "A train travels 240 km in 4 hours. Speed?", category: "Quant", difficulty: "Easy", options: ["50 km/h", "60 km/h", "70 km/h", "80 km/h"], answer: 1 },
  { question: "If 3 men do a job in 10 days, 5 men take?", category: "Quant", difficulty: "Medium", options: ["5", "6", "6.5", "7"], answer: 2 },
  { question: "What is the LCM of 12, 18, 24?", category: "Quant", difficulty: "Medium", options: ["36", "48", "72", "84"], answer: 2 },
  { question: "Profit % if buy at Rs.50, sell at Rs.75", category: "Quant", difficulty: "Easy", options: ["25%", "50%", "33.33%", "75%"], answer: 1 },
  { question: "If x² + 2x + 1 = 0, find x", category: "Quant", difficulty: "Hard", options: ["-1", "1", "2", "-2"], answer: 0 },
  { question: "Find next: 2, 4, 8, 16, ?", category: "Logical", difficulty: "Easy", options: ["24", "32", "36", "48"], answer: 1 },
  { question: "1, 1, 2, 3, 5, 8, ?", category: "Logical", difficulty: "Medium", options: ["11", "12", "13", "14"], answer: 2 },
  { question: "What comes next: AB, CD, EF, ?", category: "Logical", difficulty: "Easy", options: ["GH", "HI", "IJ", "JK"], answer: 0 },
  { question: "Complete: 1, 4, 9, 16, 25, ?", category: "Logical", difficulty: "Easy", options: ["30", "35", "36", "40"], answer: 2 },
  { question: "Triangle, Square, Pentagon, ?", category: "Logical", difficulty: "Easy", options: ["Hexagon", "Octagon", "Heptagon", "Nonagon"], answer: 0 },
  { question: "Find odd: 4, 9, 16, 25, 36, 49, 50", category: "Logical", difficulty: "Medium", options: ["9", "25", "36", "50"], answer: 3 },
  { question: "Complete: 2, 6, 12, 20, ?", category: "Logical", difficulty: "Medium", options: ["28", "30", "32", "36"], answer: 1 },
  { question: "Choose correct spelling", category: "Verbal", difficulty: "Easy", options: ["Occasion", "Ocassion", "Occassion", "Ocasion"], answer: 0 },
  { question: "Antonym of Harsh", category: "Verbal", difficulty: "Easy", options: ["Soft", "Gentle", "Kind", "All"], answer: 3 },
  { question: "Fill blank: He is ___ honest man", category: "Verbal", difficulty: "Easy", options: ["a", "an", "the", "none"], answer: 1 },
  { question: "Correct sentence?", category: "Verbal", difficulty: "Medium", options: ["She go", "She goes", "She going", "She gone"], answer: 1 },
  { question: "Synonym of Quick", category: "Verbal", difficulty: "Easy", options: ["Slow", "Fast", "Lazy", "Tired"], answer: 1 },
  { question: "Spelling: Business", category: "Verbal", difficulty: "Easy", options: ["Bussiness", "Business", "Bisness", "Bussnes"], answer: 1 }
];

router.get("/", async (req, res) => {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");

  try {
    const apiKey = process.env.COHERE_API_KEY;

    if (!apiKey) {
      console.log("No API key, using mock");
      return res.json(mockQuestions);
    }

    const prompt = `Generate 20 quiz questions as JSON array only. 7 Quant, 7 Logical, 6 Verbal.
[{"question":"...","category":"Quant","difficulty":"Easy","options":["A","B","C","D"],"answer":0}]`;

    const response = await axios.post(
      "https://api.cohere.ai/v1/chat",
      {
        model: "command-a-03-2025",
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

    let text = response.data.text || "";
    text = text.replace(/```json/g, "").replace(/```/g, "").trim();

    const start = text.indexOf("[");
    const end = text.lastIndexOf("]");

    if (start === -1 || end === -1) {
      console.error("Quiz: no JSON array found in Cohere response:", text);
      return res.json(mockQuestions);
    }

    const json = text.substring(start, end + 1);
    const questions = JSON.parse(json);

    if (!Array.isArray(questions) || questions.length < 20) {
      console.error("Quiz: invalid or too few questions returned:", questions?.length);
      return res.json(mockQuestions);
    }

    const validated = questions.slice(0, 20).map((q) => ({
      question: String(q.question || "Question"),
      category: ["Quant", "Logical", "Verbal"].includes(q.category) ? q.category : "Quant",
      difficulty: ["Easy", "Medium", "Hard"].includes(q.difficulty) ? q.difficulty : "Easy",
      options: Array.isArray(q.options) && q.options.length === 4 ? q.options.map(String) : ["A", "B", "C", "D"],
      answer: typeof q.answer === "number" && q.answer >= 0 && q.answer < 4 ? q.answer : 0
    }));

    res.json(validated);
  } catch (err) {
    console.error("Quiz error:", err.response?.data || err.message);
    res.json(mockQuestions);
  }
});

module.exports = router;