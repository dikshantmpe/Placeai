require("dotenv").config();
const mongoose = require("mongoose");
const Question = require("./models/Question");

const questions = [
  // QUANT
  { question: "What is 15% of 200?", options: ["25", "30", "35", "40"], answer: 1, category: "Quant", difficulty: "Easy" },
  { question: "A train travels 60 km in 1 hour. How far will it travel in 2.5 hours?", options: ["120 km", "150 km", "180 km", "200 km"], answer: 1, category: "Quant", difficulty: "Easy" },
  { question: "If a product costs $80 after a 20% discount, what was the original price?", options: ["$96", "$100", "$104", "$112"], answer: 1, category: "Quant", difficulty: "Medium" },
  { question: "The ratio of boys to girls in a class is 3:2. If there are 30 students, how many are girls?", options: ["10", "12", "15", "18"], answer: 1, category: "Quant", difficulty: "Easy" },
  { question: "What is the simple interest on $1000 at 5% per year for 3 years?", options: ["$100", "$150", "$200", "$250"], answer: 1, category: "Quant", difficulty: "Easy" },
  { question: "If 6 workers complete a job in 8 days, how many days will 4 workers take?", options: ["10", "12", "14", "16"], answer: 1, category: "Quant", difficulty: "Medium" },
  { question: "A car depreciates by 10% each year. What is its value after 2 years if it cost $10000?", options: ["$8000", "$8100", "$8200", "$9000"], answer: 1, category: "Quant", difficulty: "Medium" },
  { question: "What is the LCM of 12 and 18?", options: ["24", "36", "48", "72"], answer: 1, category: "Quant", difficulty: "Easy" },
  { question: "A pipe fills a tank in 6 hours. Another pipe empties it in 8 hours. How long to fill if both are open?", options: ["20 hrs", "24 hrs", "28 hrs", "32 hrs"], answer: 1, category: "Quant", difficulty: "Hard" },
  { question: "If x + y = 10 and x - y = 4, what is x?", options: ["5", "6", "7", "8"], answer: 2, category: "Quant", difficulty: "Easy" },

  // LOGICAL
  { question: "Find the next number: 2, 4, 8, 16, ?", options: ["24", "28", "32", "36"], answer: 2, category: "Logical", difficulty: "Easy" },
  { question: "If all Bloops are Razzles and all Razzles are Lazzles, then all Bloops are definitely?", options: ["Not Lazzles", "Lazzles", "Not Razzles", "None"], answer: 1, category: "Logical", difficulty: "Easy" },
  { question: "Find the odd one out: Apple, Mango, Banana, Carrot", options: ["Apple", "Mango", "Banana", "Carrot"], answer: 3, category: "Logical", difficulty: "Easy" },
  { question: "Find the next: A, C, E, G, ?", options: ["H", "I", "J", "K"], answer: 1, category: "Logical", difficulty: "Easy" },
  { question: "If BOOK is coded as CPPL, how is DESK coded?", options: ["EFLT", "EFTL", "DFTL", "EFTK"], answer: 1, category: "Logical", difficulty: "Medium" },
  { question: "A is B's sister. C is B's mother. D is C's father. E is D's mother. How is A related to D?", options: ["Granddaughter", "Daughter", "Grandmother", "Sister"], answer: 0, category: "Logical", difficulty: "Hard" },
  { question: "Find the next: 1, 1, 2, 3, 5, 8, ?", options: ["11", "12", "13", "14"], answer: 2, category: "Logical", difficulty: "Easy" },
  { question: "Which number should come next: 144, 121, 100, 81, ?", options: ["64", "60", "58", "72"], answer: 0, category: "Logical", difficulty: "Medium" },
  { question: "If in a code language CAT = 3120, then DOG = ?", options: ["4156", "41521", "4157", "4152"], answer: 1, category: "Logical", difficulty: "Medium" },
  { question: "Pointing to a photograph, a man says 'She is the daughter of my grandfather's only son.' How is she related to him?", options: ["Sister", "Cousin", "Niece", "Daughter"], answer: 0, category: "Logical", difficulty: "Hard" },

  // VERBAL
  { question: "Choose the synonym of 'Abundant':", options: ["Scarce", "Plentiful", "Limited", "Rare"], answer: 1, category: "Verbal", difficulty: "Easy" },
  { question: "Choose the antonym of 'Benevolent':", options: ["Kind", "Generous", "Malicious", "Helpful"], answer: 2, category: "Verbal", difficulty: "Easy" },
  { question: "Fill in the blank: She __ to the store yesterday.", options: ["go", "goes", "went", "gone"], answer: 2, category: "Verbal", difficulty: "Easy" },
  { question: "Choose the correctly spelled word:", options: ["Accomodate", "Accommodate", "Acommodate", "Acomodate"], answer: 1, category: "Verbal", difficulty: "Medium" },
  { question: "Choose the synonym of 'Eloquent':", options: ["Silent", "Articulate", "Confused", "Boring"], answer: 1, category: "Verbal", difficulty: "Medium" },
  { question: "Identify the error: 'He don't know the answer.'", options: ["He", "don't", "know", "answer"], answer: 1, category: "Verbal", difficulty: "Easy" },
  { question: "Choose the antonym of 'Ambiguous':", options: ["Unclear", "Vague", "Clear", "Confusing"], answer: 2, category: "Verbal", difficulty: "Medium" },
  { question: "Fill in the blank: Neither John nor his friends __ coming.", options: ["is", "are", "was", "were"], answer: 1, category: "Verbal", difficulty: "Hard" },
  { question: "Choose the synonym of 'Perseverance':", options: ["Laziness", "Persistence", "Ignorance", "Arrogance"], answer: 1, category: "Verbal", difficulty: "Easy" },
  { question: "Choose the correctly spelled word:", options: ["Neccessary", "Necesary", "Necessary", "Necessery"], answer: 2, category: "Verbal", difficulty: "Medium" },
];

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    await Question.deleteMany();
    await Question.insertMany(questions);
    console.log("✅ Quiz questions seeded successfully!");
    process.exit();
  })
  .catch(err => {
    console.error("DB Error:", err);
    process.exit(1);
  });