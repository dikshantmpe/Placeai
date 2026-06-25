async function seedDatabase() {
  try {
    // Require inside function to avoid model recompilation
    const mongoose = require("mongoose");

// Define or get the Problem model
let Problem;
try {
  Problem = require("./models/Problem");
} catch (err) {
  if (err.message.includes("Cannot overwrite")) {
    Problem = mongoose.model("Problem");
  } else {
    throw err;
  }
}

    const problemsData = [
      {
        title: "Two Sum",
        topic: "Arrays",
        difficulty: "Easy",
        description: `Given an array of integers nums and an integer target, return the indices of the two numbers that add up to target.

You may assume that each input has exactly one solution, and you may not use the same element twice.

Example 1:
Input: nums = [2,7,11,15], target = 9
Output: [0,1]

Constraints:
- 2 <= nums.length <= 104
- -109 <= nums[i] <= 109`,
        link: "https://leetcode.com/problems/two-sum/"
      },
      {
        title: "Reverse Linked List",
        topic: "Linked List",
        difficulty: "Easy",
        description: `Given the head of a singly linked list, reverse the list, and return the reversed list.

Example 1:
Input: head = [1,2,3,4,5]
Output: [5,4,3,2,1]

Constraints:
- The number of nodes in the list is the range [0, 5000].
- -5000 <= Node.val <= 5000`,
        link: "https://leetcode.com/problems/reverse-linked-list/"
      },
      {
        title: "0/1 Knapsack",
        topic: "DP",
        difficulty: "Medium",
        description: `Given weights and values of n items, put these items in a knapsack of capacity W to get the maximum total value.

You cannot break an item, either pick the complete item or don't pick it.

Constraints:
- 1 <= n <= 1000
- 1 <= W <= 1000`,
        link: "https://leetcode.com/problems/partition-equal-subset-sum/"
      },
      {
        title: "Maximum Depth of Binary Tree",
        topic: "Trees",
        difficulty: "Easy",
        description: `Given the root of a binary tree, return its maximum depth.

A binary tree's maximum depth is the number of nodes along the longest path from the root node down to the farthest leaf node.

Constraints:
- The number of nodes in the tree is in the range [0, 104].
- -100 <= Node.val <= 100`,
        link: "https://leetcode.com/problems/maximum-depth-of-binary-tree/"
      },
      {
        title: "Binary Search",
        topic: "Binary Search",
        difficulty: "Easy",
        description: `Given a sorted array of integers and a target, return the index of the target if found, otherwise return -1.

You must write an algorithm with O(log n) runtime complexity.

Constraints:
- 1 <= nums.length <= 10^4
- -10^4 < nums[i], target < 10^4`,
        link: "https://leetcode.com/problems/binary-search/"
      }
    ];

    const count = await Problem.countDocuments();
    
    if (count === 0) {
      console.log("🌱 Seeding problems...");
      await Problem.insertMany(problemsData);
      console.log("✅ Problems seeded successfully!");
    } else {
      console.log(`✅ Database already has ${count} problems, skipping seed.`);
    }
  } catch (err) {
    console.error("❌ Seeding error:", err.message);
  }
}

module.exports = seedDatabase;