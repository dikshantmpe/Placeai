require("dotenv").config({ path: __dirname + "/.env" });
const mongoose = require("mongoose");
const Problem = require("./models/Problem");

const problemsData = [
  {
    title: "Two Sum",
    topic: "Arrays",
    difficulty: "Easy",
    description: `Given an array of integers nums and an integer target, return the indices of the two numbers that add up to target.

You may assume that each input has exactly one solution, and you may not use the same element twice.

You can return the answer in any order.

Example 1:
Input: nums = [2,7,11,15], target = 9
Output: [0,1]
Explanation: Because nums[0] + nums[1] == 9, we return [0, 1].

Example 2:
Input: nums = [3,2,4], target = 6
Output: [1,2]

Example 3:
Input: nums = [3,3], target = 6
Output: [0,1]

Constraints:
- 2 <= nums.length <= 104
- -109 <= nums[i] <= 109
- -109 <= target <= 109
- Only one valid answer exists.

Follow-up: Can you come up with an algorithm that is less than O(n²) time complexity?`,
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

Example 2:
Input: head = [1,2]
Output: [2,1]

Example 3:
Input: head = []
Output: []

Constraints:
- The number of nodes in the list is the range [0, 5000].
- -5000 <= Node.val <= 5000

Follow-up: A linked list can be reversed either iteratively or recursively. Could you implement both?`,
    link: "https://leetcode.com/problems/reverse-linked-list/"
  },
  {
    title: "0/1 Knapsack",
    topic: "DP",
    difficulty: "Medium",
    description: `Given weights and values of n items, put these items in a knapsack of capacity W to get the maximum total value in the knapsack.

You cannot break an item, either pick the complete item or don't pick it (0/1 property).

Example:
items = [
  {weight: 2, value: 3},
  {weight: 3, value: 4},
  {weight: 4, value: 5}
]
W = 5
Output: 9 (pick items with weight 2,3 and values 3,4)

Constraints:
- 1 <= n <= 1000
- 1 <= W <= 1000
- 1 <= weights[i] <= W
- 1 <= values[i] <= 100`,
    link: "https://leetcode.com/problems/partition-equal-subset-sum/"
  },
  {
    title: "Maximum Depth of Binary Tree",
    topic: "Trees",
    difficulty: "Easy",
    description: `Given the root of a binary tree, return its maximum depth.

A binary tree's maximum depth is the number of nodes along the longest path from the root node down to the farthest leaf node.

Example 1:
Input: root = [3,9,20,null,null,15,7]
Output: 3

Example 2:
Input: root = [1,null,2]
Output: 2

Constraints:
- The number of nodes in the tree is in the range [0, 104].
- -100 <= Node.val <= 100`,
    link: "https://leetcode.com/problems/maximum-depth-of-binary-tree/"
  },
  {
    title: "Binary Search",
    topic: "Binary Search",
    difficulty: "Easy",
    description: `Given an array of integers nums which is sorted in ascending order, and an integer target, write a function to search target in nums. If target exists, then return its index. Otherwise, return -1.

You must write an algorithm with O(log n) runtime complexity.

Example 1:
Input: nums = [-1,0,3,4,6,9,13,15], target = 13
Output: 4

Example 2:
Input: nums = [-1,0,3,4,6,9,13,15], target = 13
Output: -1

Constraints:
- 1 <= nums.length <= 10^4
- -10^4 < nums[i], target < 10^4
- All the integers in nums are unique.
- nums is sorted in ascending order.`,
    link: "https://leetcode.com/problems/binary-search/"
  }
];

async function seedProblems() {
  try {
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
    
    if (!mongoUri) {
      console.error("❌ MONGO_URI or MONGODB_URI not found in .env file");
      console.error("Make sure your .env file exists in the backend folder with MONGO_URI or MONGODB_URI set.");
      process.exit(1);
    }

    console.log("🔗 Connecting to MongoDB...");
    await mongoose.connect(mongoUri);
    
    console.log("📝 Seeding problems...");
    const result = await Problem.insertMany(problemsData);
    
    console.log(`✅ Successfully seeded ${result.length} problems!`);
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("❌ Error seeding problems:", err.message);
    process.exit(1);
  }
}

seedProblems();