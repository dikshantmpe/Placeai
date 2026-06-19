const router = require("express").Router();

router.get("/", (req, res) => {
  res.json([
    {
      question: "What is 50% of 200?",
      category: "Quant",
      difficulty: "Easy",
      options: ["50", "100", "150", "200"],
      answer: 1
    },
    {
      question: "Find the next number: 2, 4, 8, 16, ?",
      category: "Logical",
      difficulty: "Easy",
      options: ["24", "32", "36", "48"],
      answer: 1
    },
    {
      question: "Choose the correct spelling.",
      category: "Verbal",
      difficulty: "Easy",
      options: ["Occasion", "Ocassion", "Occassion", "Ocasion"],
      answer: 0
    }
  ]);
});

module.exports = router;