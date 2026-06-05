require("dotenv").config();
const mongoose = require("mongoose");
const CompanyQuestion = require("./models/CompanyQuestion");

const questions = [
  // Google
  { company: "Google", round: "DSA", question: "Find the median of two sorted arrays.", difficulty: "Hard" },
  { company: "Google", round: "DSA", question: "Given a string, find the longest substring without repeating characters.", difficulty: "Medium" },
  { company: "Google", round: "System Design", question: "Design Google Search.", difficulty: "Hard" },
  { company: "Google", round: "HR", question: "Tell me about a time you had a conflict with a teammate and how you resolved it.", difficulty: "Easy" },
  { company: "Google", round: "Technical", question: "Explain the difference between processes and threads.", difficulty: "Medium" },

  // Amazon
  { company: "Amazon", round: "DSA", question: "Find the maximum sum subarray (Kadane's Algorithm).", difficulty: "Medium" },
  { company: "Amazon", round: "DSA", question: "Given a binary tree, find its maximum depth.", difficulty: "Easy" },
  { company: "Amazon", round: "System Design", question: "Design Amazon's shopping cart system.", difficulty: "Hard" },
  { company: "Amazon", round: "HR", question: "Describe a situation where you showed leadership.", difficulty: "Easy" },
  { company: "Amazon", round: "Technical", question: "What is the difference between SQL and NoSQL databases?", difficulty: "Medium" },

  // Microsoft
  { company: "Microsoft", round: "DSA", question: "Reverse a linked list.", difficulty: "Easy" },
  { company: "Microsoft", round: "DSA", question: "Find all permutations of a string.", difficulty: "Medium" },
  { company: "Microsoft", round: "System Design", question: "Design Microsoft Teams.", difficulty: "Hard" },
  { company: "Microsoft", round: "HR", question: "Why do you want to work at Microsoft?", difficulty: "Easy" },
  { company: "Microsoft", round: "Technical", question: "Explain OOPS concepts with examples.", difficulty: "Medium" },

  // Flipkart
  { company: "Flipkart", round: "DSA", question: "Given an array, find the two numbers that add up to a target.", difficulty: "Easy" },
  { company: "Flipkart", round: "DSA", question: "Find the lowest common ancestor of a binary tree.", difficulty: "Medium" },
  { company: "Flipkart", round: "System Design", question: "Design Flipkart's product recommendation system.", difficulty: "Hard" },
  { company: "Flipkart", round: "HR", question: "Where do you see yourself in 5 years?", difficulty: "Easy" },
  { company: "Flipkart", round: "Technical", question: "What is the difference between REST and GraphQL?", difficulty: "Medium" },

  // Infosys
  { company: "Infosys", round: "Technical", question: "What is polymorphism? Give an example.", difficulty: "Easy" },
  { company: "Infosys", round: "Technical", question: "Explain the MVC architecture.", difficulty: "Medium" },
  { company: "Infosys", round: "DSA", question: "Write a program to check if a string is a palindrome.", difficulty: "Easy" },
  { company: "Infosys", round: "HR", question: "What are your strengths and weaknesses?", difficulty: "Easy" },
  { company: "Infosys", round: "Technical", question: "What is normalization in databases?", difficulty: "Medium" },

  // TCS
  { company: "TCS", round: "Technical", question: "Explain the concept of inheritance in OOP.", difficulty: "Easy" },
  { company: "TCS", round: "DSA", question: "Write a program to find the factorial of a number.", difficulty: "Easy" },
  { company: "TCS", round: "Technical", question: "What is the difference between TCP and UDP?", difficulty: "Medium" },
  { company: "TCS", round: "HR", question: "Are you comfortable with relocation?", difficulty: "Easy" },
  { company: "TCS", round: "Technical", question: "What is a deadlock and how can it be prevented?", difficulty: "Medium" },
];

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    await CompanyQuestion.deleteMany();
    await CompanyQuestion.insertMany(questions);
    console.log("✅ Company questions seeded successfully!");
    process.exit();
  })
  .catch(err => {
    console.error("DB Error:", err);
    process.exit(1);
  });