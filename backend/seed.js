require("dotenv").config();
const mongoose = require("mongoose");
const Problem = require("./models/Problem");

const problems = [
  { title: "Two Sum", topic: "Arrays", difficulty: "Easy", link: "https://leetcode.com/problems/two-sum/" },
  { title: "Best Time to Buy and Sell Stock", topic: "Arrays", difficulty: "Easy", link: "https://leetcode.com/problems/best-time-to-buy-and-sell-stock/" },
  { title: "Maximum Subarray", topic: "Arrays", difficulty: "Medium", link: "https://leetcode.com/problems/maximum-subarray/" },
  { title: "Contains Duplicate", topic: "Arrays", difficulty: "Easy", link: "https://leetcode.com/problems/contains-duplicate/" },
  { title: "Product of Array Except Self", topic: "Arrays", difficulty: "Medium", link: "https://leetcode.com/problems/product-of-array-except-self/" },
  { title: "Reverse Linked List", topic: "Linked List", difficulty: "Easy", link: "https://leetcode.com/problems/reverse-linked-list/" },
  { title: "Merge Two Sorted Lists", topic: "Linked List", difficulty: "Easy", link: "https://leetcode.com/problems/merge-two-sorted-lists/" },
  { title: "Linked List Cycle", topic: "Linked List", difficulty: "Easy", link: "https://leetcode.com/problems/linked-list-cycle/" },
  { title: "Remove Nth Node From End", topic: "Linked List", difficulty: "Medium", link: "https://leetcode.com/problems/remove-nth-node-from-end-of-list/" },
  { title: "Invert Binary Tree", topic: "Trees", difficulty: "Easy", link: "https://leetcode.com/problems/invert-binary-tree/" },
  { title: "Maximum Depth of Binary Tree", topic: "Trees", difficulty: "Easy", link: "https://leetcode.com/problems/maximum-depth-of-binary-tree/" },
  { title: "Validate Binary Search Tree", topic: "Trees", difficulty: "Medium", link: "https://leetcode.com/problems/validate-binary-search-tree/" },
  { title: "Level Order Traversal", topic: "Trees", difficulty: "Medium", link: "https://leetcode.com/problems/binary-tree-level-order-traversal/" },
  { title: "Binary Search", topic: "Binary Search", difficulty: "Easy", link: "https://leetcode.com/problems/binary-search/" },
  { title: "Find Minimum in Rotated Sorted Array", topic: "Binary Search", difficulty: "Medium", link: "https://leetcode.com/problems/find-minimum-in-rotated-sorted-array/" },
  { title: "Search in Rotated Sorted Array", topic: "Binary Search", difficulty: "Medium", link: "https://leetcode.com/problems/search-in-rotated-sorted-array/" },
  { title: "Climbing Stairs", topic: "DP", difficulty: "Easy", link: "https://leetcode.com/problems/climbing-stairs/" },
  { title: "House Robber", topic: "DP", difficulty: "Medium", link: "https://leetcode.com/problems/house-robber/" },
  { title: "Longest Common Subsequence", topic: "DP", difficulty: "Medium", link: "https://leetcode.com/problems/longest-common-subsequence/" },
  { title: "0/1 Knapsack", topic: "DP", difficulty: "Medium", link: "https://www.geeksforgeeks.org/0-1-knapsack-problem-dp-10/" },
  { title: "Valid Parentheses", topic: "Stack", difficulty: "Easy", link: "https://leetcode.com/problems/valid-parentheses/" },
  { title: "Min Stack", topic: "Stack", difficulty: "Medium", link: "https://leetcode.com/problems/min-stack/" },
  { title: "Number of Islands", topic: "Graphs", difficulty: "Medium", link: "https://leetcode.com/problems/number-of-islands/" },
  { title: "Clone Graph", topic: "Graphs", difficulty: "Medium", link: "https://leetcode.com/problems/clone-graph/" },
  { title: "Course Schedule", topic: "Graphs", difficulty: "Medium", link: "https://leetcode.com/problems/course-schedule/" },
];

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    await Problem.deleteMany(); // clear old data first
    await Problem.insertMany(problems);
    console.log("✅ Problems seeded successfully!");
    process.exit();
  })
  .catch((err) => {
    console.error("DB Error:", err);
    process.exit(1);
  });