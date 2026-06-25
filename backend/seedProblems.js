require("dotenv").config({ path: __dirname + "/.env" });
const mongoose = require("mongoose");
const Problem = require("./models/Problem");

const problemsData = [
  {
    title: "Two Sum",
    topic: "Arrays",
    difficulty: "Easy",
    link: "https://leetcode.com/problems/two-sum/",
    description: `Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.

You may assume that each input would have exactly one solution, and you may not use the same element twice.
You can return the answer in any order.

Example 1:
Input: nums = [2,7,11,15], target = 9
Output: [0,1]
Explanation: Because nums[0] + nums[1] == 9, we return [0, 1].

Constraints:
- 2 <= nums.length <= 104
- -109 <= nums[i] <= 109
- -109 <= target <= 109
- Only one valid answer exists.`
  },
  {
    title: "Best Time to Buy and Sell Stock",
    topic: "Arrays",
    difficulty: "Easy",
    link: "https://leetcode.com/problems/best-time-to-buy-and-sell-stock/",
    description: `You are given an array prices where prices[i] is the price of a given stock on the ith day.

You want to maximize your profit by choosing a single day to buy one stock and choosing a different day in the future to sell that stock.
Return the maximum profit you can achieve from this transaction. If you cannot achieve any profit, return 0.

Example 1:
Input: prices = [7,1,5,3,6,4]
Output: 5
Explanation: Buy on day 2 (price = 1) and sell on day 5 (price = 6), profit = 6 - 1 = 5.

Constraints:
- 1 <= prices.length <= 105
- 0 <= prices[i] <= 104`
  },
  {
    title: "Contains Duplicate",
    topic: "Arrays",
    difficulty: "Easy",
    link: "https://leetcode.com/problems/contains-duplicate/",
    description: `Given an integer array nums, return true if any value appears at least twice in the array, and return false if every element is distinct.

Example 1:
Input: nums = [1,2,3,1]
Output: true

Example 2:
Input: nums = [1,2,3,4]
Output: false

Constraints:
- 1 <= nums.length <= 105
- -109 <= nums[i] <= 109`
  },
  {
    title: "Valid Anagram",
    topic: "Strings",
    difficulty: "Easy",
    link: "https://leetcode.com/problems/valid-anagram/",
    description: `Given two strings s and t, return true if t is an anagram of s, and false otherwise.

An Anagram is a word or phrase formed by rearranging the letters of a different word or phrase, typically using all the original letters exactly once.

Example 1:
Input: s = "anagram", t = "nagaram"
Output: true

Constraints:
- 1 <= s.length, t.length <= 5 * 104
- s and t consist of lowercase English letters.`
  },
  {
    title: "Valid Parentheses",
    topic: "Strings",
    difficulty: "Easy",
    link: "https://leetcode.com/problems/valid-parentheses/",
    description: `Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.

An input string is valid if:
1. Open brackets must be closed by the same type of brackets.
2. Open brackets must be closed in the correct order.
3. Every close bracket has a corresponding open bracket of the same type.

Example 1:
Input: s = "()"
Output: true

Example 2:
Input: s = "()[]{}"
Output: true

Constraints:
- 1 <= s.length <= 104
- s consists of parentheses only '()[]{}'.`
  },
  {
    title: "Maximum Subarray",
    topic: "Arrays",
    difficulty: "Medium",
    link: "https://leetcode.com/problems/maximum-subarray/",
    description: `Given an integer array nums, find the subarray with the largest sum, and return its sum.

Example 1:
Input: nums = [-2,1,-3,4,-1,2,1,-5,4]
Output: 6
Explanation: The subarray [4,-1,2,1] has the largest sum 6.

Constraints:
- 1 <= nums.length <= 105
- -104 <= nums[i] <= 104`
  },
  {
    title: "Product of Array Except Self",
    topic: "Arrays",
    difficulty: "Medium",
    link: "https://leetcode.com/problems/product-of-array-except-self/",
    description: `Given an integer array nums, return an array answer such that answer[i] is equal to the product of all the elements of nums except nums[i].

The product of any prefix or suffix of nums is guaranteed to fit in a 32-bit integer.
You must write an algorithm that runs in O(n) time and without using the division operation.

Example 1:
Input: nums = [1,2,3,4]
Output: [24,12,8,6]

Constraints:
- 2 <= nums.length <= 105
- -30 <= nums[i] <= 30`
  },
  {
    title: "Merge Intervals",
    topic: "Arrays",
    difficulty: "Medium",
    link: "https://leetcode.com/problems/merge-intervals/",
    description: `Given an array of intervals where intervals[i] = [starti, endi], merge all overlapping intervals, and return an array of the non-overlapping intervals that cover all the intervals in the input.

Example 1:
Input: intervals = [[1,3],[2,6],[8,10],[15,18]]
Output: [[1,6],[8,10],[15,18]]
Explanation: Since intervals [1,3] and [2,6] overlap, merge them into [1,6].

Constraints:
- 1 <= intervals.length <= 104
- intervals[i].length == 2
- 0 <= starti <= endi <= 104`
  },
  {
    title: "Reverse Linked List",
    topic: "Linked Lists",
    difficulty: "Easy",
    link: "https://leetcode.com/problems/reverse-linked-list/",
    description: `Given the head of a singly linked list, reverse the list, and return the reversed list.

Example 1:
Input: head = [1,2,3,4,5]
Output: [5,4,3,2,1]

Constraints:
- The number of nodes in the list is the range [0, 5000].
- -5000 <= Node.val <= 5000`
  },
  {
    title: "Linked List Cycle",
    topic: "Linked Lists",
    difficulty: "Easy",
    link: "https://leetcode.com/problems/linked-list-cycle/",
    description: `Given head, the head of a linked list, determine if the linked list has a cycle in it.

There is a cycle in a linked list if there is some node in the list that can be reached again by continuously following the next pointer. Internally, pos is used to denote the index of the node that tail's next pointer is connected to. Note that pos is not passed as a parameter.

Return true if there is a cycle in the linked list. Otherwise, return false.

Example 1:
Input: head = [3,2,0,-4], pos = 1
Output: true
Explanation: There is a cycle in the linked list, where the tail connects to the 1st node (0-indexed).`
  },
  {
    title: "Merge Two Sorted Lists",
    topic: "Linked Lists",
    difficulty: "Easy",
    link: "https://leetcode.com/problems/merge-two-sorted-lists/",
    description: `You are given the heads of two sorted linked lists list1 and list2.

Merge the two lists into one sorted list. The list should be made by splicing together the nodes of the first two lists.
Return the head of the merged linked list.

Example 1:
Input: list1 = [1,2,4], list2 = [1,3,4]
Output: [1,1,2,3,4,4]

Constraints:
- The number of nodes in both lists is in the range [0, 50].
- -100 <= Node.val <= 100
- Both list1 and list2 are sorted in non-decreasing order.`
  },
  {
    title: "Invert Binary Tree",
    topic: "Trees",
    difficulty: "Easy",
    link: "https://leetcode.com/problems/invert-binary-tree/",
    description: `Given the root of a binary tree, invert the tree, and return its root.

Example 1:
Input: root = [4,2,7,1,3,6,9]
Output: [4,7,2,9,6,3,1]

Constraints:
- The number of nodes in the tree is in the range [0, 100].
- -100 <= Node.val <= 100`
  },
  {
    title: "Maximum Depth of Binary Tree",
    topic: "Trees",
    difficulty: "Easy",
    link: "https://leetcode.com/problems/maximum-depth-of-binary-tree/",
    description: `Given the root of a binary tree, return its maximum depth.

A binary tree's maximum depth is the number of nodes along the longest path from the root node down to the farthest leaf node.

Example 1:
Input: root = [3,9,20,null,null,15,7]
Output: 3

Constraints:
- The number of nodes in the tree is in the range [0, 104].
- -100 <= Node.val <= 100`
  },
  {
    title: "Binary Tree Level Order Traversal",
    topic: "Trees",
    difficulty: "Medium",
    link: "https://leetcode.com/problems/binary-tree-level-order-traversal/",
    description: `Given the root of a binary tree, return the level order traversal of its nodes' values. (i.e., from left to right, level by level).

Example 1:
Input: root = [3,9,20,null,null,15,7]
Output: [[3],[9,20],[15,7]]

Constraints:
- The number of nodes in the tree is in the range [0, 2000].
- -1000 <= Node.val <= 1000`
  },
  {
    title: "Lowest Common Ancestor of a Binary Search Tree",
    topic: "Trees",
    difficulty: "Medium",
    link: "https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-search-tree/",
    description: `Given a binary search tree (BST), find the lowest common ancestor (LCA) node of two given nodes in the BST.

According to the definition of LCA on Wikipedia: "The lowest common ancestor is defined between two nodes p and q as the lowest node in T that has both p and q as descendants (where we allow a node to be a descendant of itself)."

Example 1:
Input: root = [6,2,8,0,4,7,9,null,null,3,5], p = 2, q = 8
Output: 6
Explanation: The LCA of nodes 2 and 8 is 6.`
  },
  {
    title: "Climbing Stairs",
    topic: "Dynamic Programming",
    difficulty: "Easy",
    link: "https://leetcode.com/problems/climbing-stairs/",
    description: `You are climbing a staircase. It takes n steps to reach the top.

Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?

Example 1:
Input: n = 2
Output: 2
Explanation: There are two ways to climb to the top.
1. 1 step + 1 step
2. 2 steps

Constraints:
- 1 <= n <= 45`
  },
  {
    title: "Coin Change",
    topic: "Dynamic Programming",
    difficulty: "Medium",
    link: "https://leetcode.com/problems/coin-change/",
    description: `You are given an integer array coins representing coins of different denominations and an integer amount representing a total amount of money.

Return the fewest number of coins that you need to make up that amount. If that amount of money cannot be made up by any combination of the coins, return -1.

You may assume that you have an infinite number of each kind of coin.

Example 1:
Input: coins = [1,2,5], amount = 11
Output: 3
Explanation: 11 = 5 + 5 + 1

Constraints:
- 1 <= coins.length <= 12
- 1 <= coins[i] <= 231 - 1
- 0 <= amount <= 104`
  },
  {
    title: "Longest Increasing Subsequence",
    topic: "Dynamic Programming",
    difficulty: "Medium",
    link: "https://leetcode.com/problems/longest-increasing-subsequence/",
    description: `Given an integer array nums, return the length of the longest strictly increasing subsequence.

Example 1:
Input: nums = [10,9,2,5,3,7,101,18]
Output: 4
Explanation: The longest increasing subsequence is [2,3,7,101], therefore the length is 4.

Constraints:
- 1 <= nums.length <= 2500
- -104 <= nums[i] <= 104`
  },
  {
    title: "Number of Islands",
    topic: "Graphs",
    difficulty: "Medium",
    link: "https://leetcode.com/problems/number-of-islands/",
    description: `Given an m x n 2D binary grid grid which represents a map of '1's (land) and '0's (water), return the number of islands.

An island is surrounded by water and is formed by connecting adjacent lands horizontally or vertically. You may assume all four edges of the grid are all surrounded by water.

Example 1:
Input: grid = [
  ["1","1","1","1","0"],
  ["1","1","0","1","0"],
  ["1","1","0","0","0"],
  ["0","0","0","0","0"]
]
Output: 1

Constraints:
- m == grid.length
- n == grid[i].length
- 1 <= m, n <= 300
- grid[i][j] is '0' or '1'.`
  },
  {
    title: "Clone Graph",
    topic: "Graphs",
    difficulty: "Medium",
    link: "https://leetcode.com/problems/clone-graph/",
    description: `Given a reference of a node in a connected undirected graph.
Return a deep copy (clone) of the graph.

Each node in the graph contains a value (int) and a list (List[Node]) of its neighbors.

Example 1:
Input: adjList = [[2,4],[1,3],[2,4],[1,3]]
Output: [[2,4],[1,3],[2,4],[1,3]]
Explanation: There are 4 nodes in the graph.
Node 1's value is 1, and it has two neighbors: Node 2 and 4.
Node 2's value is 2, and it has two neighbors: Node 1 and 3.

Constraints:
- The number of nodes in the graph is in the range [0, 100].
- 1 <= Node.val <= 100`
  }
];

const moreProblems = [
  {
    title: "3Sum",
    topic: "Two Pointers",
    difficulty: "Medium",
    link: "https://leetcode.com/problems/3sum/",
    description: `Given an integer array nums, return all the triplets [nums[i], nums[j], nums[k]] such that i != j, i != k, and j != k, and nums[i] + nums[j] + nums[k] == 0.

Notice that the solution set must not contain duplicate triplets.

Example 1:
Input: nums = [-1,0,1,2,-1,-4]
Output: [[-1,-1,2],[-1,0,1]]`
  },
  {
    title: "Container With Most Water",
    topic: "Two Pointers",
    difficulty: "Medium",
    link: "https://leetcode.com/problems/container-with-most-water/",
    description: `You are given an integer array height of length n. There are n vertical lines drawn such that the two endpoints of the ith line are (i, 0) and (i, height[i]).

Find two lines that together with the x-axis form a container, such that the container contains the most water.

Example 1:
Input: height = [1,8,6,2,5,4,8,3,7]
Output: 49`
  },
  {
    title: "Longest Substring Without Repeating Characters",
    topic: "Sliding Window",
    difficulty: "Medium",
    link: "https://leetcode.com/problems/longest-substring-without-repeating-characters/",
    description: `Given a string s, find the length of the longest substring without repeating characters.

Example 1:
Input: s = "abcabcbb"
Output: 3
Explanation: The answer is "abc", with the length of 3.`
  },
  {
    title: "Valid Palindrome",
    topic: "Two Pointers",
    difficulty: "Easy",
    link: "https://leetcode.com/problems/valid-palindrome/",
    description: `A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward.

Example 1:
Input: s = "A man, a plan, a canal: Panama"
Output: true`
  },
  {
    title: "Minimum Window Substring",
    topic: "Sliding Window",
    difficulty: "Hard",
    link: "https://leetcode.com/problems/minimum-window-substring/",
    description: `Given two strings s and t of lengths m and n respectively, return the minimum window substring of s such that every character in t (including duplicates) is included in the window. If there is no such substring, return the empty string "".

Example 1:
Input: s = "ADOBECODEBANC", t = "ABC"
Output: "BANC"`
  },
  {
    title: "Generate Parentheses",
    topic: "Stack",
    difficulty: "Medium",
    link: "https://leetcode.com/problems/generate-parentheses/",
    description: `Given n pairs of parentheses, write a function to generate all combinations of well-formed parentheses.

Example 1:
Input: n = 3
Output: ["((()))","(()())","(())()","()(())","()()()"]`
  },
  {
    title: "Daily Temperatures",
    topic: "Stack",
    difficulty: "Medium",
    link: "https://leetcode.com/problems/daily-temperatures/",
    description: `Given an array of integers temperatures represents the daily temperatures, return an array answer such that answer[i] is the number of days you have to wait after the ith day to get a warmer temperature.

Example 1:
Input: temperatures = [73,74,75,71,69,72,76,73]
Output: [1,1,4,2,1,1,0,0]`
  },
  {
    title: "Search in Rotated Sorted Array",
    topic: "Binary Search",
    difficulty: "Medium",
    link: "https://leetcode.com/problems/search-in-rotated-sorted-array/",
    description: `There is an integer array nums sorted in ascending order (with distinct values).
Prior to being passed to your function, nums is possibly rotated at an unknown pivot index k.

Given the array nums after the possible rotation and an integer target, return the index of target if it is in nums, or -1 if it is not in nums.

Example 1:
Input: nums = [4,5,6,7,0,1,2], target = 0
Output: 4`
  },
  {
    title: "Find Minimum in Rotated Sorted Array",
    topic: "Binary Search",
    difficulty: "Medium",
    link: "https://leetcode.com/problems/find-minimum-in-rotated-sorted-array/",
    description: `Suppose an array of length n sorted in ascending order is rotated between 1 and n times. 
Given the sorted rotated array nums of unique elements, return the minimum element of this array.

Example 1:
Input: nums = [3,4,5,1,2]
Output: 1`
  },
  {
    title: "Remove Nth Node From End of List",
    topic: "Linked Lists",
    difficulty: "Medium",
    link: "https://leetcode.com/problems/remove-nth-node-from-end-of-list/",
    description: `Given the head of a linked list, remove the nth node from the end of the list and return its head.

Example 1:
Input: head = [1,2,3,4,5], n = 2
Output: [1,2,3,5]`
  },
  {
    title: "Reorder List",
    topic: "Linked Lists",
    difficulty: "Medium",
    link: "https://leetcode.com/problems/reorder-list/",
    description: `You are given the head of a singly linked-list. The list can be represented as:
L0 → L1 → … → Ln - 1 → Ln
Reorder the list to be on the following form:
L0 → Ln → L1 → Ln - 1 → L2 → Ln - 2 → …

Example 1:
Input: head = [1,2,3,4]
Output: [1,4,2,3]`
  },
  {
    title: "Same Tree",
    topic: "Trees",
    difficulty: "Easy",
    link: "https://leetcode.com/problems/same-tree/",
    description: `Given the roots of two binary trees p and q, write a function to check if they are the same or not.
Two binary trees are considered the same if they are structurally identical, and the nodes have the same value.

Example 1:
Input: p = [1,2,3], q = [1,2,3]
Output: true`
  },
  {
    title: "Subtree of Another Tree",
    topic: "Trees",
    difficulty: "Easy",
    link: "https://leetcode.com/problems/subtree-of-another-tree/",
    description: `Given the roots of two binary trees root and subRoot, return true if there is a subtree of root with the same structure and node values of subRoot and false otherwise.

Example 1:
Input: root = [3,4,5,1,2], subRoot = [4,1,2]
Output: true`
  },
  {
    title: "Implement Trie (Prefix Tree)",
    topic: "Tries",
    difficulty: "Medium",
    link: "https://leetcode.com/problems/implement-trie-prefix-tree/",
    description: `A trie (pronounced as "try") or prefix tree is a tree data structure used to efficiently store and retrieve keys in a dataset of strings.
Implement the Trie class with insert, search, and startsWith methods.

Example:
Trie trie = new Trie();
trie.insert("apple");
trie.search("apple");   // return True`
  },
  {
    title: "Top K Frequent Elements",
    topic: "Heaps",
    difficulty: "Medium",
    link: "https://leetcode.com/problems/top-k-frequent-elements/",
    description: `Given an integer array nums and an integer k, return the k most frequent elements. You may return the answer in any order.

Example 1:
Input: nums = [1,1,1,2,2,3], k = 2
Output: [1,2]`
  },
  {
    title: "Kth Largest Element in an Array",
    topic: "Heaps",
    difficulty: "Medium",
    link: "https://leetcode.com/problems/kth-largest-element-in-an-array/",
    description: `Given an integer array nums and an integer k, return the kth largest element in the array.
Note that it is the kth largest element in the sorted order, not the kth distinct element.

Example 1:
Input: nums = [3,2,1,5,6,4], k = 2
Output: 5`
  },
  {
    title: "Combination Sum",
    topic: "Backtracking",
    difficulty: "Medium",
    link: "https://leetcode.com/problems/combination-sum/",
    description: `Given an array of distinct integers candidates and a target integer target, return a list of all unique combinations of candidates where the chosen numbers sum to target.

Example 1:
Input: candidates = [2,3,6,7], target = 7
Output: [[2,2,3],[7]]`
  },
  {
    title: "Word Search",
    topic: "Backtracking",
    difficulty: "Medium",
    link: "https://leetcode.com/problems/word-search/",
    description: `Given an m x n grid of characters board and a string word, return true if word exists in the grid.
The word can be constructed from letters of sequentially adjacent cells, where adjacent cells are horizontally or vertically neighboring.

Example 1:
Input: board = [["A","B","C","E"],["S","F","C","S"],["A","D","E","E"]], word = "ABCCED"
Output: true`
  },
  {
    title: "Pacific Atlantic Water Flow",
    topic: "Graphs",
    difficulty: "Medium",
    link: "https://leetcode.com/problems/pacific-atlantic-water-flow/",
    description: `There is an m x n rectangular island that borders both the Pacific Ocean and Atlantic Ocean.
Return a 2D list of grid coordinates result where result[i] = [ri, ci] denotes that rain water can flow from cell (ri, ci) to both the Pacific and Atlantic oceans.

Example 1:
Input: heights = [[1,2,2,3,5],[3,2,3,4,4],[2,4,5,3,1],[6,7,1,4,5],[5,1,1,2,4]]
Output: [[0,4],[1,3],[1,4],[2,2],[2,3],[2,4],[3,0],[3,1],[4,0]]`
  },
  {
    title: "Course Schedule",
    topic: "Graphs",
    difficulty: "Medium",
    link: "https://leetcode.com/problems/course-schedule/",
    description: `There are a total of numCourses courses you have to take. You are given an array prerequisites where prerequisites[i] = [ai, bi] indicates that you must take course bi first if you want to take course ai.

Return true if you can finish all courses. Otherwise, return false.

Example 1:
Input: numCourses = 2, prerequisites = [[1,0]]
Output: true`
  },
  {
    title: "House Robber",
    topic: "Dynamic Programming",
    difficulty: "Medium",
    link: "https://leetcode.com/problems/house-robber/",
    description: `You are a professional robber planning to rob houses along a street. Each house has a certain amount of money stashed, the only constraint stopping you from robbing each of them is that adjacent houses have security systems connected.

Given an integer array nums representing the amount of money of each house, return the maximum amount of money you can rob tonight without alerting the police.

Example 1:
Input: nums = [1,2,3,1]
Output: 4`
  },
  {
    title: "Decode Ways",
    topic: "Dynamic Programming",
    difficulty: "Medium",
    link: "https://leetcode.com/problems/decode-ways/",
    description: `A message containing letters from A-Z can be encoded into numbers using the following mapping:
'A' -> "1", 'B' -> "2", ... 'Z' -> "26"

Given a string s containing only digits, return the number of ways to decode it.

Example 1:
Input: s = "12"
Output: 2
Explanation: "12" could be decoded as "AB" (1 2) or "L" (12).`
  },
  {
    title: "Unique Paths",
    topic: "Dynamic Programming",
    difficulty: "Medium",
    link: "https://leetcode.com/problems/unique-paths/",
    description: `There is a robot on an m x n grid. The robot is initially located at the top-left corner (i.e., grid[0][0]). The robot tries to move to the bottom-right corner (i.e., grid[m - 1][n - 1]). The robot can only move either down or right at any point in time.

Given the two integers m and n, return the number of possible unique paths that the robot can take to reach the bottom-right corner.

Example 1:
Input: m = 3, n = 7
Output: 28`
  },
  {
    title: "Jump Game",
    topic: "Greedy",
    difficulty: "Medium",
    link: "https://leetcode.com/problems/jump-game/",
    description: `You are given an integer array nums. You are initially positioned at the array's first index, and each element in the array represents your maximum jump length at that position.

Return true if you can reach the last index, or false otherwise.

Example 1:
Input: nums = [2,3,1,1,4]
Output: true`
  },
  {
    title: "Insert Interval",
    topic: "Arrays",
    difficulty: "Medium",
    link: "https://leetcode.com/problems/insert-interval/",
    description: `You are given an array of non-overlapping intervals intervals where intervals[i] = [starti, endi] represent the start and the end of the ith interval and intervals is sorted in ascending order by starti. You are also given an interval newInterval = [start, end] that represents the start and end of another interval.

Insert newInterval into intervals such that intervals is still sorted in ascending order by starti and intervals still does not have any overlapping intervals.

Example 1:
Input: intervals = [[1,3],[6,9]], newInterval = [2,5]
Output: [[1,5],[6,9]]`
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

      // ADD THESE TWO LINES HERE:
      await Problem.deleteMany({});
      console.log("🗑️ Cleared old problems without descriptions");

      // Keep your existing insert line right below it:
      const result = await Problem.insertMany([...problemsData, ...moreProblems]);
    
    console.log(`✅ Successfully seeded ${result.length} problems!`);
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("❌ Error seeding problems:", err.message);
    process.exit(1);
  }
}

seedProblems();