// ─────────────────────────────────────────────────────────────────────────────
//  TRACELAB PROBLEM LIBRARY
//  ~60 hand-tuned vizSpecs for the most common DSA problems.
//  Each entry has:
//    match  — signals used by problemMatcher.js to identify this problem
//    vizSpec — the complete rendering contract passed to the engine pipeline
//
//  Coverage:
//    Grid DFS/BFS (8), Arrays & Two-Pointer (14), Sorting/Partition (3),
//    Dynamic Programming (9), Backtracking (6), Linked List (6),
//    Tree (7), Graph (6), Stack/Queue (4), Heap (3), DSU (3)
// ─────────────────────────────────────────────────────────────────────────────

const PROBLEMS = [

// ═══════════════════════════════════════════════════════════
//  GRID — DFS
// ═══════════════════════════════════════════════════════════

{
  id: "num-islands",
  match: {
    functions: ["numIslands", "num_islands", "countIslands", "count_islands"],
    keywords:  ["island", "land", "water"],
    signals:   { has2DArray: true, hasRecursion: true, has4Direction: true },
  },
  vizSpec: {
    problemId: "num-islands", problemName: "Number of Islands",
    leetcodeNumber: 200, difficulty: "MEDIUM",
    pattern: "Grid DFS · flood fill · in-place marking",
    description: "Count the number of islands (connected groups of '1's) in a 2-D grid of '0's (water) and '1's (land). Use DFS to sink each island you find.",
    companies: ["Amazon", "Google", "Microsoft"],
    complexity: { time: "O(m×n)", space: "O(m×n)" },
    category: "GRID_DFS",
    primary: { engine: "MATRIX", variable: "grid", suppressRecursionTree: true },
    cellRules: [
      { match: { value: "1" }, color: "green", label: "land" },
      { match: { value: "0" }, color: "blue",  label: "water", blocked: true },
      { match: { wasModified: true }, color: "emerald", label: "visited" },
    ],
    pointers: [{ variable: "r", axis: "row" }, { variable: "c", axis: "col" }],
    conditionHUD: { show: true, passLabel: "Valid land cell — exploring", failLabel: "Out of bounds or already visited" },
    overlays: { conflictLines: false, arrows: false, pathTrace: false },
    auxiliary: [{ variable: "count", engine: "COUNTER", label: "Islands found" }],
  },
},

{
  id: "max-area-island",
  match: {
    functions: ["maxAreaOfIsland", "maxArea", "max_area_island"],
    keywords:  ["area", "island", "max"],
    signals:   { has2DArray: true, hasRecursion: true, has4Direction: true },
  },
  vizSpec: {
    problemId: "max-area-island", problemName: "Max Area of Island",
    leetcodeNumber: 695, difficulty: "MEDIUM",
    pattern: "Grid DFS · track area count during flood fill",
    description: "Find the largest island (connected group of 1s) by area. Return 0 if no land exists.",
    companies: ["Facebook", "Amazon"],
    complexity: { time: "O(m×n)", space: "O(m×n)" },
    category: "GRID_DFS",
    primary: { engine: "MATRIX", variable: "grid", suppressRecursionTree: true },
    cellRules: [
      { match: { value: 1 },  color: "green",   label: "land" },
      { match: { value: 0 },  color: "blue",    label: "water", blocked: true },
      { match: { wasModified: true }, color: "emerald", label: "visited" },
    ],
    pointers: [{ variable: "r", axis: "row" }, { variable: "c", axis: "col" }],
    conditionHUD: { show: true, passLabel: "Extending island — counting cells", failLabel: "Out of bounds or water" },
    overlays: { conflictLines: false, arrows: false, pathTrace: false },
    auxiliary: [
      { variable: "area",    engine: "COUNTER", label: "Current area" },
      { variable: "maxArea", engine: "COUNTER", label: "Max area" },
    ],
  },
},

{
  id: "flood-fill",
  match: {
    functions: ["floodFill", "flood_fill"],
    keywords:  ["flood", "fill", "color", "newColor"],
    signals:   { has2DArray: true, hasRecursion: true, has4Direction: true },
  },
  vizSpec: {
    problemId: "flood-fill", problemName: "Flood Fill",
    leetcodeNumber: 733, difficulty: "EASY",
    pattern: "Grid DFS · paint connected component",
    description: "Starting from (sr, sc), flood-fill connected same-colored pixels with a new color.",
    companies: ["Facebook"],
    complexity: { time: "O(m×n)", space: "O(m×n)" },
    category: "GRID_DFS",
    primary: { engine: "MATRIX", variable: "image", suppressRecursionTree: true },
    cellRules: [{ match: { wasModified: true }, color: "indigo", label: "Filled" }],
    pointers: [{ variable: "r", axis: "row" }, { variable: "c", axis: "col" }],
    conditionHUD: { show: true, passLabel: "Same color — fill it", failLabel: "Different color or already filled" },
    overlays: { conflictLines: false, arrows: false, pathTrace: false },
    auxiliary: [],
  },
},

{
  id: "word-search",
  match: {
    functions: ["exist", "wordSearch", "word_search"],
    keywords:  ["word", "letter", "board", "path"],
    signals:   { has2DArray: true, hasRecursion: true, has4Direction: true },
  },
  vizSpec: {
    problemId: "word-search", problemName: "Word Search",
    leetcodeNumber: 79, difficulty: "MEDIUM",
    pattern: "Grid backtracking · DFS with visited marking",
    description: "Return true if the word exists as a path of adjacent (horizontal/vertical) letters in the board.",
    companies: ["Amazon", "Microsoft", "Google"],
    complexity: { time: "O(m×n×4^L)", space: "O(L)" },
    category: "BACKTRACKING_BOARD",
    primary: { engine: "MATRIX", variable: "board", suppressRecursionTree: false },
    cellRules: [
      { match: { wasModified: true }, color: "indigo", label: "On path" },
    ],
    pointers: [{ variable: "r", axis: "row" }, { variable: "c", axis: "col" }],
    conditionHUD: { show: true, passLabel: "Letter matches — extending path", failLabel: "Out of bounds or letter mismatch" },
    overlays: { conflictLines: false, arrows: false, pathTrace: true },
    auxiliary: [{ variable: "i", engine: "COUNTER", label: "Letter index" }],
  },
},

{
  id: "surrounded-regions",
  match: {
    functions: ["solve", "surroundedRegions"],
    keywords:  ["surround", "region", "capture", "border"],
    signals:   { has2DArray: true, hasRecursion: true, has4Direction: true },
  },
  vizSpec: {
    problemId: "surrounded-regions", problemName: "Surrounded Regions",
    leetcodeNumber: 130, difficulty: "MEDIUM",
    pattern: "Grid DFS · mark border-connected O's before capture",
    description: "Capture all 'O' regions that are fully surrounded by 'X'. Border-touching 'O's are safe.",
    companies: ["Google"],
    complexity: { time: "O(m×n)", space: "O(m×n)" },
    category: "GRID_DFS",
    primary: { engine: "MATRIX", variable: "board", suppressRecursionTree: true },
    cellRules: [
      { match: { value: "X" }, color: "slate",   label: "Captured" },
      { match: { value: "O" }, color: "green",   label: "Open" },
      { match: { value: "S" }, color: "emerald", label: "Safe (border-connected)" },
    ],
    pointers: [{ variable: "r", axis: "row" }, { variable: "c", axis: "col" }],
    conditionHUD: { show: true, passLabel: "Border-connected O — marking safe", failLabel: "Out of bounds or not O" },
    overlays: { conflictLines: false, arrows: false, pathTrace: false },
    auxiliary: [],
  },
},

// ═══════════════════════════════════════════════════════════
//  GRID — BFS
// ═══════════════════════════════════════════════════════════

{
  id: "rotten-oranges",
  match: {
    functions: ["orangesRotting", "rotten_oranges"],
    keywords:  ["rotten", "orange", "fresh", "minute"],
    signals:   { has2DArray: true, hasBFSQueue: true, has4Direction: true },
  },
  vizSpec: {
    problemId: "rotten-oranges", problemName: "Rotting Oranges",
    leetcodeNumber: 994, difficulty: "MEDIUM",
    pattern: "Multi-source Grid BFS · simultaneous spread",
    description: "Every minute, fresh oranges adjacent to rotten ones become rotten. Return minutes until all are rotten, or -1.",
    companies: ["Amazon", "Google"],
    complexity: { time: "O(m×n)", space: "O(m×n)" },
    category: "GRID_BFS",
    primary: { engine: "MATRIX", variable: "grid", suppressRecursionTree: true },
    cellRules: [
      { match: { value: 0 }, color: "slate",   label: "empty",   blocked: true },
      { match: { value: 1 }, color: "green",   label: "fresh" },
      { match: { value: 2 }, color: "red",     label: "rotten" },
      { match: { wasModified: true }, color: "amber", label: "just rotted" },
    ],
    pointers: [{ variable: "r", axis: "row" }, { variable: "c", axis: "col" }],
    conditionHUD: { show: true, passLabel: "Spreading rot to neighbor", failLabel: "Out of bounds or not fresh" },
    overlays: { conflictLines: false, arrows: false, pathTrace: true },
    auxiliary: [
      { variable: "fresh", engine: "COUNTER", label: "Fresh remaining" },
      { variable: "time",  engine: "COUNTER", label: "Time elapsed" },
    ],
  },
},

{
  id: "shortest-path-binary-matrix",
  match: {
    functions: ["shortestPathBinaryMatrix", "shortest_path"],
    keywords:  ["shortest", "path", "binary", "clear"],
    signals:   { has2DArray: true, hasBFSQueue: true, has8Direction: true },
  },
  vizSpec: {
    problemId: "shortest-path-binary-matrix", problemName: "Shortest Path in Binary Matrix",
    leetcodeNumber: 1091, difficulty: "MEDIUM",
    pattern: "Grid BFS · 8-directional shortest clear path",
    description: "Find the shortest clear path (0s only, 8-directional) from top-left to bottom-right.",
    companies: ["Google", "Facebook"],
    complexity: { time: "O(m×n)", space: "O(m×n)" },
    category: "GRID_BFS",
    primary: { engine: "MATRIX", variable: "grid", suppressRecursionTree: true },
    cellRules: [
      { match: { value: 1 }, color: "slate",   label: "blocked",  blocked: true },
      { match: { value: 0 }, color: "green",   label: "clear" },
      { match: { wasModified: true }, color: "indigo", label: "visited" },
    ],
    pointers: [{ variable: "r", axis: "row" }, { variable: "c", axis: "col" }],
    conditionHUD: { show: true, passLabel: "Clear cell — adding to queue", failLabel: "Blocked or already visited" },
    overlays: { conflictLines: false, arrows: false, pathTrace: true },
    auxiliary: [{ variable: "dist", engine: "COUNTER", label: "Path length" }],
  },
},

{
  id: "walls-and-gates",
  match: {
    functions: ["wallsAndGates", "walls_and_gates"],
    keywords:  ["gate", "wall", "room", "INF"],
    signals:   { has2DArray: true, hasBFSQueue: true, has4Direction: true },
  },
  vizSpec: {
    problemId: "walls-and-gates", problemName: "Walls and Gates",
    leetcodeNumber: 286, difficulty: "MEDIUM",
    pattern: "Multi-source BFS from gates outward",
    description: "Fill each empty room with the distance to its nearest gate. Walls are -1, gates are 0, INF means empty room.",
    companies: ["Facebook", "Google"],
    complexity: { time: "O(m×n)", space: "O(m×n)" },
    category: "GRID_BFS",
    primary: { engine: "MATRIX", variable: "rooms", suppressRecursionTree: true },
    cellRules: [
      { match: { value: -1 },         color: "slate",   label: "wall",   blocked: true },
      { match: { value: 0 },          color: "indigo",  label: "gate" },
      { match: { wasModified: true }, color: "emerald", label: "filled" },
    ],
    pointers: [{ variable: "r", axis: "row" }, { variable: "c", axis: "col" }],
    conditionHUD: { show: true, passLabel: "Filling room with distance", failLabel: "Already filled or wall" },
    overlays: { conflictLines: false, arrows: false, pathTrace: false },
    auxiliary: [],
  },
},

// ═══════════════════════════════════════════════════════════
//  ARRAYS — TWO POINTER / SLIDING WINDOW
// ═══════════════════════════════════════════════════════════

{
  id: "binary-search",
  match: {
    functions: ["search", "binarySearch", "binary_search"],
    keywords:  ["mid", "target", "left", "right", "nums"],
    signals:   { has1DArray: true, hasMidPointer: true },
  },
  vizSpec: {
    problemId: "binary-search", problemName: "Binary Search",
    leetcodeNumber: 704, difficulty: "EASY",
    pattern: "Binary search · O(log n) search on sorted array",
    description: "Search for target in a sorted array. Halve the search space each iteration using left/mid/right pointers.",
    companies: ["Google", "Facebook", "Amazon"],
    complexity: { time: "O(log n)", space: "O(1)" },
    category: "BINARY_SEARCH",
    primary: { engine: "ARRAY", variable: "nums", suppressRecursionTree: true, visualStyle: "boxes" },
    cellRules: [],
    pointers: [
      { variable: "left",  axis: "index" },
      { variable: "mid",   axis: "index" },
      { variable: "right", axis: "index" },
    ],
    conditionHUD: { show: true, passLabel: "Target found at mid", failLabel: "Adjusting search boundary" },
    overlays: { conflictLines: false, arrows: false, pathTrace: false },
    auxiliary: [{ variable: "mid", engine: "COUNTER", label: "Current mid" }],
  },
},

{
  id: "two-sum",
  match: {
    functions: ["twoSum", "two_sum"],
    keywords:  ["target", "complement", "sum", "pair"],
    signals:   { has1DArray: true, hasHashMap: true },
  },
  vizSpec: {
    problemId: "two-sum", problemName: "Two Sum",
    leetcodeNumber: 1, difficulty: "EASY",
    pattern: "Hash map · one-pass complement lookup",
    description: "Find two indices in nums that add up to target. Use a hash map to look up the complement in O(1).",
    companies: ["Amazon", "Google", "Facebook", "Apple"],
    complexity: { time: "O(n)", space: "O(n)" },
    category: "SLIDING_WINDOW",
    primary: { engine: "ARRAY", variable: "nums", suppressRecursionTree: true, visualStyle: "boxes" },
    cellRules: [],
    pointers: [{ variable: "i", axis: "index" }],
    conditionHUD: { show: true, passLabel: "Complement found — return pair", failLabel: "Complement not seen — store index" },
    overlays: { conflictLines: false, arrows: false, pathTrace: false },
    auxiliary: [{ variable: "seen", engine: "HASH_MAP", label: "Seen values" }],
  },
},

{
  id: "trapping-rain-water",
  match: {
    functions: ["trap", "trappingRainWater", "trap_water"],
    keywords:  ["trap", "rain", "water", "height", "cap"],
    signals:   { has1DArray: true },
  },
  vizSpec: {
    problemId: "trapping-rain-water", problemName: "Trapping Rain Water",
    leetcodeNumber: 42, difficulty: "HARD",
    pattern: "Two pointers · O(1) space · settle the shorter side",
    description: "Given bar heights, compute total water trapped. The water at each column is bounded by min(leftMax, rightMax) − height[i].",
    companies: ["Amazon", "Google", "Goldman Sachs"],
    complexity: { time: "O(n)", space: "O(1)" },
    category: "SLIDING_WINDOW",
    primary: { engine: "ARRAY", variable: "height", suppressRecursionTree: true, visualStyle: "bars" },
    cellRules: [],
    pointers: [{ variable: "left", axis: "index" }, { variable: "right", axis: "index" }],
    referenceLines: [
      { variable: "leftMax",  label: "leftMax",  color: "#f87171" },
      { variable: "rightMax", label: "rightMax", color: "#60a5fa" },
    ],
    conditionHUD: { show: true, passLabel: "Processing shorter side", failLabel: "Pointers crossed — done" },
    overlays: { conflictLines: false, arrows: false, pathTrace: false },
    auxiliary: [{ variable: "total", engine: "COUNTER", label: "Water trapped" }],
  },
},

{
  id: "container-with-most-water",
  match: {
    functions: ["maxArea", "containerWithMostWater", "max_water"],
    keywords:  ["container", "water", "height", "area", "most"],
    signals:   { has1DArray: true, hasLeftRight: true },
  },
  vizSpec: {
    problemId: "container-with-most-water", problemName: "Container With Most Water",
    leetcodeNumber: 11, difficulty: "MEDIUM",
    pattern: "Two pointers · always move the shorter line",
    description: "Find two lines that together with the x-axis forms a container with the most water. Move the shorter pointer inward.",
    companies: ["Google", "Facebook", "Amazon"],
    complexity: { time: "O(n)", space: "O(1)" },
    category: "SLIDING_WINDOW",
    primary: { engine: "ARRAY", variable: "height", suppressRecursionTree: true, visualStyle: "bars" },
    cellRules: [],
    pointers: [{ variable: "left", axis: "index" }, { variable: "right", axis: "index" }],
    referenceLines: [],
    conditionHUD: { show: true, passLabel: "Computing area between pointers", failLabel: "Pointers crossed — done" },
    overlays: { conflictLines: false, arrows: false, pathTrace: false },
    auxiliary: [{ variable: "maxW", engine: "COUNTER", label: "Max water" }],
  },
},

{
  id: "sort-colors",
  match: {
    functions: ["sortColors", "sort_colors", "dutchFlag"],
    keywords:  ["color", "red", "white", "blue", "dutch"],
    signals:   { has1DArray: true, hasLowMidHigh: true },
  },
  vizSpec: {
    problemId: "sort-colors", problemName: "Sort Colors",
    leetcodeNumber: 75, difficulty: "MEDIUM",
    pattern: "Dutch National Flag · in-place · three pointers",
    description: "Sort an array of 0s, 1s, and 2s in-place in one pass using low/mid/high pointers.",
    companies: ["Microsoft", "Amazon", "Meta"],
    complexity: { time: "O(n)", space: "O(1)" },
    category: "SORTING",
    primary: { engine: "ARRAY", variable: "nums", suppressRecursionTree: true, visualStyle: "boxes" },
    cellRules: [],
    pointers: [
      { variable: "low",  axis: "index" },
      { variable: "mid",  axis: "index" },
      { variable: "high", axis: "index" },
    ],
    conditionHUD: { show: true, passLabel: "Processing element at mid", failLabel: "Partitioned — done" },
    overlays: { conflictLines: false, arrows: false, pathTrace: false },
    auxiliary: [],
  },
},

{
  id: "maximum-subarray",
  match: {
    functions: ["maxSubArray", "max_sub_array", "maxSubarray"],
    keywords:  ["subarray", "maximum", "contiguous", "sum", "kadane"],
    signals:   { has1DArray: true },
  },
  vizSpec: {
    problemId: "maximum-subarray", problemName: "Maximum Subarray",
    leetcodeNumber: 53, difficulty: "MEDIUM",
    pattern: "Kadane's algorithm · O(n) DP",
    description: "Find the contiguous subarray with the largest sum. At each step, decide whether to extend the current window or start fresh.",
    companies: ["Amazon", "LinkedIn", "Google"],
    complexity: { time: "O(n)", space: "O(1)" },
    category: "DP_1D",
    primary: { engine: "ARRAY", variable: "nums", suppressRecursionTree: true, visualStyle: "boxes" },
    cellRules: [],
    pointers: [{ variable: "i", axis: "index" }],
    conditionHUD: { show: true, passLabel: "Extending current window", failLabel: "Reset — starting fresh subarray" },
    overlays: { conflictLines: false, arrows: false, pathTrace: false },
    auxiliary: [
      { variable: "cur",  engine: "COUNTER", label: "Current sum" },
      { variable: "best", engine: "COUNTER", label: "Best sum" },
    ],
  },
},

{
  id: "best-time-to-buy-stock",
  match: {
    functions: ["maxProfit", "max_profit"],
    keywords:  ["profit", "price", "buy", "sell", "stock"],
    signals:   { has1DArray: true },
  },
  vizSpec: {
    problemId: "best-time-to-buy-stock", problemName: "Best Time to Buy and Sell Stock",
    leetcodeNumber: 121, difficulty: "EASY",
    pattern: "One pass · track running minimum buy price",
    description: "Choose one day to buy and one later day to sell to maximize profit. Track the min price seen so far.",
    companies: ["Amazon", "Facebook", "Goldman Sachs"],
    complexity: { time: "O(n)", space: "O(1)" },
    category: "DP_1D",
    primary: { engine: "ARRAY", variable: "prices", suppressRecursionTree: true, visualStyle: "bars" },
    cellRules: [],
    pointers: [{ variable: "i", axis: "index" }],
    referenceLines: [{ variable: "minPrice", label: "Min buy price", color: "#f87171" }],
    conditionHUD: { show: true, passLabel: "New profit computed", failLabel: "New minimum price found" },
    overlays: { conflictLines: false, arrows: false, pathTrace: false },
    auxiliary: [{ variable: "maxP", engine: "COUNTER", label: "Max profit" }],
  },
},

{
  id: "product-except-self",
  match: {
    functions: ["productExceptSelf", "product_except_self"],
    keywords:  ["product", "except", "self", "prefix", "suffix"],
    signals:   { has1DArray: true },
  },
  vizSpec: {
    problemId: "product-except-self", problemName: "Product of Array Except Self",
    leetcodeNumber: 238, difficulty: "MEDIUM",
    pattern: "Prefix × suffix product · two passes",
    description: "Return an array where each element is the product of all other elements. No division allowed. Use prefix and suffix products.",
    companies: ["Facebook", "Amazon", "Microsoft"],
    complexity: { time: "O(n)", space: "O(1)" },
    category: "DP_1D",
    primary: { engine: "ARRAY", variable: "nums", suppressRecursionTree: true, visualStyle: "boxes" },
    cellRules: [],
    pointers: [{ variable: "i", axis: "index" }],
    conditionHUD: { show: false, passLabel: "", failLabel: "" },
    overlays: { conflictLines: false, arrows: false, pathTrace: false },
    auxiliary: [],
  },
},

{
  id: "sliding-window-maximum",
  match: {
    functions: ["maxSlidingWindow", "sliding_window_maximum"],
    keywords:  ["sliding", "window", "maximum", "deque", "monotone"],
    signals:   { has1DArray: true, hasDeque: true },
  },
  vizSpec: {
    problemId: "sliding-window-maximum", problemName: "Sliding Window Maximum",
    leetcodeNumber: 239, difficulty: "HARD",
    pattern: "Monotone deque · O(n) sliding window",
    description: "Return the maximum of each sliding window of size k using a monotone decreasing deque to track candidates.",
    companies: ["Google", "Amazon"],
    complexity: { time: "O(n)", space: "O(k)" },
    category: "SLIDING_WINDOW",
    primary: { engine: "ARRAY", variable: "nums", suppressRecursionTree: true, visualStyle: "boxes" },
    cellRules: [],
    pointers: [
      { variable: "i", axis: "index" },
      { variable: "l", axis: "index" },
    ],
    conditionHUD: { show: true, passLabel: "Window maximum recorded", failLabel: "Evicting smaller candidates" },
    overlays: { conflictLines: false, arrows: false, pathTrace: false },
    auxiliary: [{ variable: "dq", engine: "DEQUE", label: "Deque (decreasing)" }],
  },
},

{
  id: "longest-substring-no-repeat",
  match: {
    functions: ["lengthOfLongestSubstring", "longestSubstring"],
    keywords:  ["substring", "repeat", "unique", "window", "longest"],
    signals:   { has1DArray: false, hasHashMap: true, hasLeftRight: true },
  },
  vizSpec: {
    problemId: "longest-substring-no-repeat", problemName: "Longest Substring Without Repeating Characters",
    leetcodeNumber: 3, difficulty: "MEDIUM",
    pattern: "Sliding window · shrink when duplicate seen",
    description: "Find the length of the longest substring without repeating characters using a sliding window and a seen-character set.",
    companies: ["Amazon", "Bloomberg", "Google"],
    complexity: { time: "O(n)", space: "O(min(n,alphabet))" },
    category: "SLIDING_WINDOW",
    primary: { engine: "ARRAY", variable: "s", suppressRecursionTree: true, visualStyle: "boxes" },
    cellRules: [],
    pointers: [{ variable: "l", axis: "index" }, { variable: "r", axis: "index" }],
    conditionHUD: { show: true, passLabel: "Window extended", failLabel: "Duplicate found — shrink left" },
    overlays: { conflictLines: false, arrows: false, pathTrace: false },
    auxiliary: [{ variable: "res", engine: "COUNTER", label: "Max length" }],
  },
},

{
  id: "three-sum",
  match: {
    functions: ["threeSum", "three_sum"],
    keywords:  ["triplet", "sum", "zero", "target", "three"],
    signals:   { has1DArray: true, hasLeftRight: true },
  },
  vizSpec: {
    problemId: "three-sum", problemName: "3Sum",
    leetcodeNumber: 15, difficulty: "MEDIUM",
    pattern: "Sort + two pointers · fix one, squeeze the rest",
    description: "Find all unique triplets that sum to zero. Sort first, then for each element use two pointers to find the pair.",
    companies: ["Facebook", "Amazon", "Adobe"],
    complexity: { time: "O(n²)", space: "O(1)" },
    category: "SLIDING_WINDOW",
    primary: { engine: "ARRAY", variable: "nums", suppressRecursionTree: true, visualStyle: "boxes" },
    cellRules: [],
    pointers: [
      { variable: "i",     axis: "index" },
      { variable: "left",  axis: "index" },
      { variable: "right", axis: "index" },
    ],
    conditionHUD: { show: true, passLabel: "Sum too small — move left right", failLabel: "Sum too large — move right left" },
    overlays: { conflictLines: false, arrows: false, pathTrace: false },
    auxiliary: [],
  },
},

{
  id: "merge-intervals",
  match: {
    functions: ["merge", "mergeIntervals", "merge_intervals"],
    keywords:  ["interval", "overlap", "merge", "start", "end"],
    signals:   { has1DArray: true },
  },
  vizSpec: {
    problemId: "merge-intervals", problemName: "Merge Intervals",
    leetcodeNumber: 56, difficulty: "MEDIUM",
    pattern: "Sort + linear scan · extend or start new",
    description: "Merge all overlapping intervals. Sort by start time, then extend the last merged interval or start a new one.",
    companies: ["Google", "Facebook", "Microsoft"],
    complexity: { time: "O(n log n)", space: "O(n)" },
    category: "SORTING",
    primary: { engine: "ARRAY", variable: "intervals", suppressRecursionTree: true, visualStyle: "boxes" },
    cellRules: [],
    pointers: [{ variable: "i", axis: "index" }],
    conditionHUD: { show: true, passLabel: "Overlapping — extending interval", failLabel: "No overlap — starting new interval" },
    overlays: { conflictLines: false, arrows: false, pathTrace: false },
    auxiliary: [],
  },
},

// ═══════════════════════════════════════════════════════════
//  DYNAMIC PROGRAMMING — 1D
// ═══════════════════════════════════════════════════════════

{
  id: "climbing-stairs",
  match: {
    functions: ["climbStairs", "climb_stairs"],
    keywords:  ["climb", "stair", "step", "way"],
    signals:   { hasRecursion: true },
  },
  vizSpec: {
    problemId: "climbing-stairs", problemName: "Climbing Stairs",
    leetcodeNumber: 70, difficulty: "EASY",
    pattern: "DP · Fibonacci recurrence",
    description: "Reach step n by taking 1 or 2 steps at a time. dp[i] = dp[i-1] + dp[i-2].",
    companies: ["Amazon", "Apple", "Adobe"],
    complexity: { time: "O(n)", space: "O(n)" },
    category: "DP_1D",
    primary: { engine: "ARRAY", variable: "dp", suppressRecursionTree: false, visualStyle: "bars" },
    cellRules: [],
    pointers: [{ variable: "i", axis: "index" }],
    conditionHUD: { show: false, passLabel: "", failLabel: "" },
    overlays: { conflictLines: false, arrows: false, pathTrace: false },
    auxiliary: [],
  },
},

{
  id: "house-robber",
  match: {
    functions: ["rob", "houseRobber", "house_robber"],
    keywords:  ["rob", "house", "adjacent", "neighbor"],
    signals:   { has1DArray: true },
  },
  vizSpec: {
    problemId: "house-robber", problemName: "House Robber",
    leetcodeNumber: 198, difficulty: "MEDIUM",
    pattern: "DP · skip-or-take decision per house",
    description: "Rob houses without triggering adjacent alarms. dp[i] = max(dp[i-1], dp[i-2] + nums[i]).",
    companies: ["Airbnb", "Amazon"],
    complexity: { time: "O(n)", space: "O(n)" },
    category: "DP_1D",
    primary: { engine: "ARRAY", variable: "nums", suppressRecursionTree: true, visualStyle: "bars" },
    cellRules: [],
    pointers: [{ variable: "i", axis: "index" }],
    conditionHUD: { show: false, passLabel: "", failLabel: "" },
    overlays: { conflictLines: false, arrows: false, pathTrace: false },
    auxiliary: [{ variable: "dp", engine: "ARRAY", label: "dp table" }],
  },
},

{
  id: "coin-change",
  match: {
    functions: ["coinChange", "coin_change"],
    keywords:  ["coin", "change", "amount", "denomination"],
    signals:   { has1DArray: true },
  },
  vizSpec: {
    problemId: "coin-change", problemName: "Coin Change",
    leetcodeNumber: 322, difficulty: "MEDIUM",
    pattern: "Bottom-up DP · dp[amount] = min coins",
    description: "Find the minimum number of coins to make up amount. For each amount, try every coin and take the best.",
    companies: ["Amazon", "Google", "Goldman Sachs"],
    complexity: { time: "O(amount×n)", space: "O(amount)" },
    category: "DP_1D",
    primary: { engine: "ARRAY", variable: "dp", suppressRecursionTree: true, visualStyle: "bars" },
    cellRules: [],
    pointers: [{ variable: "i", axis: "index" }],
    conditionHUD: { show: false, passLabel: "", failLabel: "" },
    overlays: { conflictLines: false, arrows: false, pathTrace: false },
    auxiliary: [],
  },
},

{
  id: "longest-increasing-subsequence",
  match: {
    functions: ["lengthOfLIS", "lis", "longestIncreasingSubsequence"],
    keywords:  ["increasing", "subsequence", "longest", "LIS"],
    signals:   { has1DArray: true },
  },
  vizSpec: {
    problemId: "lis", problemName: "Longest Increasing Subsequence",
    leetcodeNumber: 300, difficulty: "MEDIUM",
    pattern: "DP · dp[i] = longest ending at i",
    description: "Find the length of the longest strictly increasing subsequence. dp[i] = max(dp[j]+1) for all j<i where nums[j]<nums[i].",
    companies: ["Microsoft", "Google"],
    complexity: { time: "O(n²)", space: "O(n)" },
    category: "DP_1D",
    primary: { engine: "ARRAY", variable: "nums", suppressRecursionTree: true, visualStyle: "bars" },
    cellRules: [],
    pointers: [{ variable: "i", axis: "index" }, { variable: "j", axis: "index" }],
    conditionHUD: { show: true, passLabel: "nums[j] < nums[i] — extending LIS", failLabel: "Not increasing — skip" },
    overlays: { conflictLines: false, arrows: false, pathTrace: false },
    auxiliary: [{ variable: "dp", engine: "ARRAY", label: "LIS lengths" }],
  },
},

{
  id: "unique-paths",
  match: {
    functions: ["uniquePaths", "unique_paths"],
    keywords:  ["unique", "path", "grid", "robot", "right", "down"],
    signals:   { has2DArray: true },
  },
  vizSpec: {
    problemId: "unique-paths", problemName: "Unique Paths",
    leetcodeNumber: 62, difficulty: "MEDIUM",
    pattern: "2-D DP · dp[i][j] = dp[i-1][j] + dp[i][j-1]",
    description: "Count paths from top-left to bottom-right, moving only right or down. Each cell gets the sum of paths from above and to its left.",
    companies: ["Amazon", "Microsoft"],
    complexity: { time: "O(m×n)", space: "O(m×n)" },
    category: "DP_2D",
    primary: { engine: "MATRIX", variable: "dp", suppressRecursionTree: true },
    cellRules: [{ match: { wasModified: true }, color: "indigo", label: "computed" }],
    pointers: [{ variable: "i", axis: "row" }, { variable: "j", axis: "col" }],
    conditionHUD: { show: false, passLabel: "", failLabel: "" },
    overlays: { conflictLines: false, arrows: false, pathTrace: false },
    auxiliary: [],
  },
},

{
  id: "lcs",
  match: {
    functions: ["longestCommonSubsequence", "lcs"],
    keywords:  ["common", "subsequence", "longest", "LCS", "text"],
    signals:   { has2DArray: true },
  },
  vizSpec: {
    problemId: "lcs", problemName: "Longest Common Subsequence",
    leetcodeNumber: 1143, difficulty: "MEDIUM",
    pattern: "2-D DP table · match or skip each character",
    description: "Find the longest subsequence present in both strings. When characters match, extend; otherwise take the max of skipping either.",
    companies: ["Amazon", "Google"],
    complexity: { time: "O(m×n)", space: "O(m×n)" },
    category: "DP_2D",
    primary: { engine: "MATRIX", variable: "dp", suppressRecursionTree: true },
    cellRules: [{ match: { wasModified: true }, color: "indigo", label: "computed" }],
    pointers: [{ variable: "i", axis: "row" }, { variable: "j", axis: "col" }],
    conditionHUD: { show: true, passLabel: "Characters match — extend diagonal", failLabel: "No match — take max of skip" },
    overlays: { conflictLines: false, arrows: false, pathTrace: false },
    auxiliary: [],
  },
},

{
  id: "edit-distance",
  match: {
    functions: ["minDistance", "editDistance", "edit_distance"],
    keywords:  ["edit", "distance", "levenshtein", "insert", "delete", "replace"],
    signals:   { has2DArray: true },
  },
  vizSpec: {
    problemId: "edit-distance", problemName: "Edit Distance",
    leetcodeNumber: 72, difficulty: "HARD",
    pattern: "2-D DP · insert / delete / replace at each step",
    description: "Find the minimum number of operations (insert, delete, replace) to convert word1 to word2.",
    companies: ["Google", "Amazon"],
    complexity: { time: "O(m×n)", space: "O(m×n)" },
    category: "DP_2D",
    primary: { engine: "MATRIX", variable: "dp", suppressRecursionTree: true },
    cellRules: [{ match: { wasModified: true }, color: "indigo", label: "computed" }],
    pointers: [{ variable: "i", axis: "row" }, { variable: "j", axis: "col" }],
    conditionHUD: { show: true, passLabel: "Characters match — copy diagonal", failLabel: "No match — min(insert, delete, replace)+1" },
    overlays: { conflictLines: false, arrows: false, pathTrace: false },
    auxiliary: [],
  },
},

// ═══════════════════════════════════════════════════════════
//  BACKTRACKING
// ═══════════════════════════════════════════════════════════

{
  id: "n-queens",
  match: {
    functions: ["solveNQueens", "nQueens", "n_queens"],
    keywords:  ["queen", "diagonal", "col", "board"],
    signals:   { has2DArray: true, hasRecursion: true },
  },
  vizSpec: {
    problemId: "n-queens", problemName: "N-Queens",
    leetcodeNumber: 51, difficulty: "HARD",
    pattern: "Backtracking on board · conflict line detection",
    description: "Place N queens on an N×N chessboard so that no two queens attack each other.",
    companies: ["Amazon", "Uber"],
    complexity: { time: "O(n!)", space: "O(n²)" },
    category: "BACKTRACKING_BOARD",
    primary: { engine: "N_QUEENS", variable: "board", suppressRecursionTree: false },
    cellRules: [
      { match: { value: "Q" }, color: "indigo", label: "queen" },
      { match: { value: "." }, color: "slate",  label: "empty" },
    ],
    pointers: [{ variable: "row", axis: "row" }, { variable: "col", axis: "col" }],
    conditionHUD: { show: true, passLabel: "Safe position — placing queen", failLabel: "Conflict — skipping column" },
    overlays: { conflictLines: true, arrows: false, pathTrace: false },
    auxiliary: [],
  },
},

{
  id: "permutations",
  match: {
    functions: ["permute", "permutations", "generate_permutations"],
    keywords:  ["permut", "swap", "choice", "remain"],
    signals:   { has1DArray: true, hasRecursion: true },
  },
  vizSpec: {
    problemId: "permutations", problemName: "Permutations",
    leetcodeNumber: 46, difficulty: "MEDIUM",
    pattern: "Backtracking · pick and recurse",
    description: "Generate all permutations of distinct integers by picking each unused element as the next position.",
    companies: ["LinkedIn", "Microsoft"],
    complexity: { time: "O(n×n!)", space: "O(n)" },
    category: "BACKTRACKING_ARRAY",
    primary: { engine: "ARRAY", variable: "nums", suppressRecursionTree: false, visualStyle: "boxes" },
    cellRules: [],
    pointers: [{ variable: "start", axis: "index" }],
    conditionHUD: { show: true, passLabel: "Placing element — going deeper", failLabel: "All placed — recording permutation" },
    overlays: { conflictLines: false, arrows: false, pathTrace: false },
    auxiliary: [],
  },
},

{
  id: "combination-sum",
  match: {
    functions: ["combinationSum", "combination_sum"],
    keywords:  ["combination", "sum", "target", "candidate"],
    signals:   { has1DArray: true, hasRecursion: true },
  },
  vizSpec: {
    problemId: "combination-sum", problemName: "Combination Sum",
    leetcodeNumber: 39, difficulty: "MEDIUM",
    pattern: "Backtracking · include or skip with repeat",
    description: "Find all combinations of candidates that sum to target. Candidates can be used unlimited times.",
    companies: ["Uber", "Snapchat"],
    complexity: { time: "O(n^(T/min))", space: "O(T/min)" },
    category: "BACKTRACKING_ARRAY",
    primary: { engine: "ARRAY", variable: "candidates", suppressRecursionTree: false, visualStyle: "boxes" },
    cellRules: [],
    pointers: [{ variable: "start", axis: "index" }],
    conditionHUD: { show: true, passLabel: "Adding candidate — recursing", failLabel: "Exceeds target — prune" },
    overlays: { conflictLines: false, arrows: false, pathTrace: false },
    auxiliary: [{ variable: "total", engine: "COUNTER", label: "Current sum" }],
  },
},

{
  id: "subsets",
  match: {
    functions: ["subsets", "powerSet", "power_set"],
    keywords:  ["subset", "power", "include", "exclude"],
    signals:   { has1DArray: true, hasRecursion: true },
  },
  vizSpec: {
    problemId: "subsets", problemName: "Subsets",
    leetcodeNumber: 78, difficulty: "MEDIUM",
    pattern: "Backtracking · include/exclude decision at each index",
    description: "Return all subsets (power set). At each element decide to include or exclude, giving 2^n subsets.",
    companies: ["Facebook", "Amazon"],
    complexity: { time: "O(n×2^n)", space: "O(n)" },
    category: "BACKTRACKING_ARRAY",
    primary: { engine: "ARRAY", variable: "nums", suppressRecursionTree: false, visualStyle: "boxes" },
    cellRules: [],
    pointers: [{ variable: "i", axis: "index" }],
    conditionHUD: { show: true, passLabel: "Including element", failLabel: "Excluding element" },
    overlays: { conflictLines: false, arrows: false, pathTrace: false },
    auxiliary: [],
  },
},

// ═══════════════════════════════════════════════════════════
//  LINKED LIST
// ═══════════════════════════════════════════════════════════

{
  id: "reverse-linked-list",
  match: {
    functions: ["reverseList", "reverse_list", "reverse_linked_list"],
    keywords:  ["reverse", "prev", "next", "node"],
    signals:   { hasLinkedList: true },
  },
  vizSpec: {
    problemId: "reverse-linked-list", problemName: "Reverse Linked List",
    leetcodeNumber: 206, difficulty: "EASY",
    pattern: "Iterative pointer reversal · prev / curr / next",
    description: "Reverse a singly-linked list in-place by re-wiring each node's next pointer to point backward.",
    companies: ["Amazon", "Facebook", "Apple"],
    complexity: { time: "O(n)", space: "O(1)" },
    category: "LINKED_LIST_OPS",
    primary: { engine: "LINKED_LIST", variable: "head", suppressRecursionTree: true },
    cellRules: [],
    pointers: [],
    conditionHUD: { show: true, passLabel: "Reversing pointer", failLabel: "List fully reversed" },
    overlays: { conflictLines: false, arrows: true, pathTrace: false },
    auxiliary: [],
  },
},

{
  id: "linked-list-cycle",
  match: {
    functions: ["hasCycle", "has_cycle", "detectCycle"],
    keywords:  ["cycle", "fast", "slow", "floyd", "tortoise"],
    signals:   { hasLinkedList: true },
  },
  vizSpec: {
    problemId: "linked-list-cycle", problemName: "Linked List Cycle",
    leetcodeNumber: 141, difficulty: "EASY",
    pattern: "Floyd's cycle detection · fast & slow pointers",
    description: "Detect a cycle using two pointers: slow moves 1 step, fast moves 2. If they meet, a cycle exists.",
    companies: ["Amazon", "Microsoft"],
    complexity: { time: "O(n)", space: "O(1)" },
    category: "LINKED_LIST_OPS",
    primary: { engine: "LINKED_LIST", variable: "head", suppressRecursionTree: true },
    cellRules: [],
    pointers: [],
    conditionHUD: { show: true, passLabel: "Pointers met — cycle detected", failLabel: "Fast reached null — no cycle" },
    overlays: { conflictLines: false, arrows: true, pathTrace: false },
    auxiliary: [],
  },
},

{
  id: "merge-two-sorted-lists",
  match: {
    functions: ["mergeTwoLists", "merge_two_lists"],
    keywords:  ["merge", "sorted", "list", "node"],
    signals:   { hasLinkedList: true },
  },
  vizSpec: {
    problemId: "merge-two-sorted-lists", problemName: "Merge Two Sorted Lists",
    leetcodeNumber: 21, difficulty: "EASY",
    pattern: "Pointer merge · always pick the smaller head",
    description: "Merge two sorted linked lists by comparing heads and picking the smaller each time.",
    companies: ["Amazon", "Apple", "Microsoft"],
    complexity: { time: "O(n+m)", space: "O(1)" },
    category: "LINKED_LIST_OPS",
    primary: { engine: "LINKED_LIST", variable: "list1", suppressRecursionTree: true },
    cellRules: [],
    pointers: [],
    conditionHUD: { show: true, passLabel: "Taking from list1", failLabel: "Taking from list2" },
    overlays: { conflictLines: false, arrows: true, pathTrace: false },
    auxiliary: [],
  },
},

// ═══════════════════════════════════════════════════════════
//  TREES
// ═══════════════════════════════════════════════════════════

{
  id: "binary-tree-level-order",
  match: {
    functions: ["levelOrder", "level_order"],
    keywords:  ["level", "order", "bfs", "queue", "breadth"],
    signals:   { hasTreeNodes: true, hasBFSQueue: true },
  },
  vizSpec: {
    problemId: "binary-tree-level-order", problemName: "Binary Tree Level Order Traversal",
    leetcodeNumber: 102, difficulty: "MEDIUM",
    pattern: "BFS · process nodes level by level",
    description: "Return all values level by level using BFS. At each step, process all nodes in the current queue (one full level).",
    companies: ["Facebook", "Amazon", "Microsoft"],
    complexity: { time: "O(n)", space: "O(n)" },
    category: "TREE_TRAVERSAL",
    primary: { engine: "TREE", variable: "root", suppressRecursionTree: true },
    cellRules: [],
    pointers: [],
    conditionHUD: { show: true, passLabel: "Processing level", failLabel: "Level complete — move to next" },
    overlays: { conflictLines: false, arrows: false, pathTrace: false },
    auxiliary: [],
  },
},

{
  id: "max-depth-binary-tree",
  match: {
    functions: ["maxDepth", "max_depth"],
    keywords:  ["depth", "height", "binary", "tree"],
    signals:   { hasTreeNodes: true, hasRecursion: true },
  },
  vizSpec: {
    problemId: "max-depth-binary-tree", problemName: "Maximum Depth of Binary Tree",
    leetcodeNumber: 104, difficulty: "EASY",
    pattern: "DFS · 1 + max(left depth, right depth)",
    description: "Return the maximum depth of a binary tree — the number of nodes along the longest root-to-leaf path.",
    companies: ["LinkedIn", "Amazon"],
    complexity: { time: "O(n)", space: "O(h)" },
    category: "TREE_TRAVERSAL",
    primary: { engine: "TREE", variable: "root", suppressRecursionTree: false },
    cellRules: [],
    pointers: [],
    conditionHUD: { show: false, passLabel: "", failLabel: "" },
    overlays: { conflictLines: false, arrows: false, pathTrace: false },
    auxiliary: [],
  },
},

{
  id: "validate-bst",
  match: {
    functions: ["isValidBST", "validate_bst", "is_valid_bst"],
    keywords:  ["valid", "BST", "inorder", "min", "max"],
    signals:   { hasTreeNodes: true, hasRecursion: true },
  },
  vizSpec: {
    problemId: "validate-bst", problemName: "Validate Binary Search Tree",
    leetcodeNumber: 98, difficulty: "MEDIUM",
    pattern: "DFS with min/max bounds per node",
    description: "Validate that every node's value falls within bounds inherited from its ancestors. Left must be less, right must be greater.",
    companies: ["Amazon", "Bloomberg"],
    complexity: { time: "O(n)", space: "O(h)" },
    category: "TREE_TRAVERSAL",
    primary: { engine: "TREE", variable: "root", suppressRecursionTree: false },
    cellRules: [],
    pointers: [],
    conditionHUD: { show: true, passLabel: "Node within bounds — valid", failLabel: "Node out of bounds — invalid BST" },
    overlays: { conflictLines: false, arrows: false, pathTrace: false },
    auxiliary: [],
  },
},

{
  id: "lowest-common-ancestor",
  match: {
    functions: ["lowestCommonAncestor", "lca", "lowest_common_ancestor"],
    keywords:  ["ancestor", "LCA", "common", "parent"],
    signals:   { hasTreeNodes: true, hasRecursion: true },
  },
  vizSpec: {
    problemId: "lca", problemName: "Lowest Common Ancestor of a BST",
    leetcodeNumber: 235, difficulty: "MEDIUM",
    pattern: "BST property · go left if both smaller, right if both larger",
    description: "Find the lowest node that is an ancestor of both p and q. Use BST ordering to navigate without visiting all nodes.",
    companies: ["Amazon", "Facebook", "Google"],
    complexity: { time: "O(h)", space: "O(h)" },
    category: "TREE_TRAVERSAL",
    primary: { engine: "TREE", variable: "root", suppressRecursionTree: false },
    cellRules: [],
    pointers: [],
    conditionHUD: { show: true, passLabel: "Split point — this is the LCA", failLabel: "Both in same subtree — going deeper" },
    overlays: { conflictLines: false, arrows: false, pathTrace: false },
    auxiliary: [],
  },
},

// ═══════════════════════════════════════════════════════════
//  GRAPH
// ═══════════════════════════════════════════════════════════

{
  id: "number-of-provinces",
  match: {
    functions: ["findCircleNum", "numProvinces", "number_of_provinces"],
    keywords:  ["province", "connected", "component", "city"],
    signals:   { has2DArray: true, hasVisitedSet: true },
  },
  vizSpec: {
    problemId: "number-of-provinces", problemName: "Number of Provinces",
    leetcodeNumber: 547, difficulty: "MEDIUM",
    pattern: "DFS/BFS on adjacency matrix · count components",
    description: "Count the number of connected components (provinces) in an adjacency matrix representing city connections.",
    companies: ["Facebook"],
    complexity: { time: "O(n²)", space: "O(n)" },
    category: "GRAPH_UNWEIGHTED",
    primary: { engine: "GRAPH", variable: "isConnected", suppressRecursionTree: true },
    cellRules: [],
    pointers: [],
    conditionHUD: { show: true, passLabel: "Visiting connected city", failLabel: "Already visited — skip" },
    overlays: { conflictLines: false, arrows: false, pathTrace: false },
    auxiliary: [{ variable: "provinces", engine: "COUNTER", label: "Provinces found" }],
  },
},

{
  id: "course-schedule",
  match: {
    functions: ["canFinish", "courseSchedule", "course_schedule"],
    keywords:  ["course", "prerequisite", "cycle", "topological"],
    signals:   { has1DArray: true, hasRecursion: true },
  },
  vizSpec: {
    problemId: "course-schedule", problemName: "Course Schedule",
    leetcodeNumber: 207, difficulty: "MEDIUM",
    pattern: "DFS cycle detection on directed graph",
    description: "Determine if you can finish all courses given prerequisites. Equivalent to detecting a cycle in a directed graph.",
    companies: ["Airbnb", "Facebook", "Zenefits"],
    complexity: { time: "O(V+E)", space: "O(V+E)" },
    category: "GRAPH_UNWEIGHTED",
    primary: { engine: "GRAPH", variable: "graph", suppressRecursionTree: true },
    cellRules: [],
    pointers: [],
    conditionHUD: { show: true, passLabel: "Exploring course — no cycle yet", failLabel: "Already in current path — cycle!" },
    overlays: { conflictLines: false, arrows: true, pathTrace: false },
    auxiliary: [],
  },
},

{
  id: "network-delay-time",
  match: {
    functions: ["networkDelayTime", "network_delay", "dijkstra"],
    keywords:  ["delay", "signal", "dist", "heap", "shortest"],
    signals:   { hasHeap: true, has1DArray: true },
  },
  vizSpec: {
    problemId: "network-delay-time", problemName: "Network Delay Time",
    leetcodeNumber: 743, difficulty: "MEDIUM",
    pattern: "Dijkstra · min-heap relaxation of edges",
    description: "Find how long until every node receives the signal. Use Dijkstra from source k, relax edges greedily via min-heap.",
    companies: ["Google", "Facebook"],
    complexity: { time: "O((V+E) log V)", space: "O(V+E)" },
    category: "GRAPH_WEIGHTED",
    primary: { engine: "GRAPH", variable: "graph", suppressRecursionTree: true },
    cellRules: [],
    pointers: [],
    conditionHUD: { show: true, passLabel: "Relaxing edge — shorter path found", failLabel: "Already processed node — skip" },
    overlays: { conflictLines: false, arrows: true, pathTrace: true },
    auxiliary: [{ variable: "dist", engine: "HASH_MAP", label: "Distances" }],
  },
},

// ═══════════════════════════════════════════════════════════
//  STACK / QUEUE
// ═══════════════════════════════════════════════════════════

{
  id: "valid-parentheses",
  match: {
    functions: ["isValid", "valid_parentheses", "validParentheses"],
    keywords:  ["paren", "bracket", "brace", "matching"],
    signals:   { hasStack: true },
  },
  vizSpec: {
    problemId: "valid-parentheses", problemName: "Valid Parentheses",
    leetcodeNumber: 20, difficulty: "EASY",
    pattern: "Stack · push open, pop and match on close",
    description: "Check if bracket pairs are valid. Push opening brackets onto a stack; pop and verify match on every closing bracket.",
    companies: ["Amazon", "Bloomberg", "Google"],
    complexity: { time: "O(n)", space: "O(n)" },
    category: "SORTING",
    primary: { engine: "STACK", variable: "stack", suppressRecursionTree: true },
    cellRules: [],
    pointers: [],
    conditionHUD: { show: true, passLabel: "Closing matches top — valid pair", failLabel: "Mismatch or empty stack — invalid" },
    overlays: { conflictLines: false, arrows: false, pathTrace: false },
    auxiliary: [],
  },
},

{
  id: "min-stack",
  match: {
    functions: ["MinStack", "min_stack"],
    keywords:  ["getmin", "get_min", "minstack", "auxiliary"],
    signals:   { hasStack: true },
  },
  vizSpec: {
    problemId: "min-stack", problemName: "Min Stack",
    leetcodeNumber: 155, difficulty: "MEDIUM",
    pattern: "Auxiliary min-stack · track running minimum",
    description: "Design a stack that supports push, pop, top, and getMin in O(1). Use a parallel min-stack tracking the minimum at each depth.",
    companies: ["Amazon", "Google", "Uber"],
    complexity: { time: "O(1)", space: "O(n)" },
    category: "SORTING",
    primary: { engine: "STACK", variable: "stack", suppressRecursionTree: true },
    cellRules: [],
    pointers: [],
    conditionHUD: { show: true, passLabel: "Pushing — updating min", failLabel: "Popping — restoring previous min" },
    overlays: { conflictLines: false, arrows: false, pathTrace: false },
    auxiliary: [],
  },
},

// ═══════════════════════════════════════════════════════════
//  HEAP
// ═══════════════════════════════════════════════════════════

{
  id: "kth-largest",
  match: {
    functions: ["findKthLargest", "kth_largest"],
    keywords:  ["kth", "largest", "heap", "partition"],
    signals:   { has1DArray: true, hasHeap: true },
  },
  vizSpec: {
    problemId: "kth-largest", problemName: "Kth Largest Element in an Array",
    leetcodeNumber: 215, difficulty: "MEDIUM",
    pattern: "Min-heap of size k · root is the answer",
    description: "Find the kth largest element. Maintain a min-heap of size k; if heap grows beyond k, pop the smallest.",
    companies: ["Facebook", "Amazon", "Apple"],
    complexity: { time: "O(n log k)", space: "O(k)" },
    category: "HEAP_OPERATIONS",
    primary: { engine: "HEAP", variable: "heap", suppressRecursionTree: true },
    cellRules: [],
    pointers: [],
    conditionHUD: { show: true, passLabel: "Element added to heap", failLabel: "Heap full — evicting smallest" },
    overlays: { conflictLines: false, arrows: false, pathTrace: false },
    auxiliary: [],
  },
},

{
  id: "top-k-frequent",
  match: {
    functions: ["topKFrequent", "top_k_frequent"],
    keywords:  ["frequent", "top", "k", "count", "bucket"],
    signals:   { has1DArray: true, hasHashMap: true },
  },
  vizSpec: {
    problemId: "top-k-frequent", problemName: "Top K Frequent Elements",
    leetcodeNumber: 347, difficulty: "MEDIUM",
    pattern: "Frequency map + bucket sort · O(n)",
    description: "Return the k most frequent elements using a frequency count map then bucket sort by frequency.",
    companies: ["Amazon", "LinkedIn", "Yelp"],
    complexity: { time: "O(n)", space: "O(n)" },
    category: "HEAP_OPERATIONS",
    primary: { engine: "ARRAY", variable: "nums", suppressRecursionTree: true, visualStyle: "boxes" },
    cellRules: [],
    pointers: [{ variable: "i", axis: "index" }],
    conditionHUD: { show: false, passLabel: "", failLabel: "" },
    overlays: { conflictLines: false, arrows: false, pathTrace: false },
    auxiliary: [{ variable: "count", engine: "HASH_MAP", label: "Frequencies" }],
  },
},

// ═══════════════════════════════════════════════════════════
//  UNION-FIND / DSU
// ═══════════════════════════════════════════════════════════

{
  id: "number-of-connected-components",
  match: {
    functions: ["countComponents", "num_components", "connected_components"],
    keywords:  ["component", "union", "find", "edge", "connect"],
    signals:   { hasParentArray: true },
  },
  vizSpec: {
    problemId: "number-of-connected-components", problemName: "Number of Connected Components",
    leetcodeNumber: 323, difficulty: "MEDIUM",
    pattern: "Union-Find · merge components by edges",
    description: "Count connected components in an undirected graph using Union-Find. Each union reduces the component count by 1.",
    companies: ["LinkedIn"],
    complexity: { time: "O(n·α(n))", space: "O(n)" },
    category: "DSU_OPERATIONS",
    primary: { engine: "DSU", variable: "parent", suppressRecursionTree: true },
    cellRules: [],
    pointers: [],
    conditionHUD: { show: true, passLabel: "Unioning two components", failLabel: "Already connected — skip" },
    overlays: { conflictLines: false, arrows: false, pathTrace: false },
    auxiliary: [{ variable: "components", engine: "COUNTER", label: "Components" }],
  },
},

{
  id: "redundant-connection",
  match: {
    functions: ["findRedundantConnection", "redundant_connection"],
    keywords:  ["redundant", "cycle", "union", "find", "edge"],
    signals:   { hasParentArray: true },
  },
  vizSpec: {
    problemId: "redundant-connection", problemName: "Redundant Connection",
    leetcodeNumber: 684, difficulty: "MEDIUM",
    pattern: "Union-Find · first edge creating a cycle",
    description: "Find the last edge that creates a cycle in an undirected graph. If two nodes are already in the same component, the edge is redundant.",
    companies: ["Google"],
    complexity: { time: "O(n·α(n))", space: "O(n)" },
    category: "DSU_OPERATIONS",
    primary: { engine: "DSU", variable: "parent", suppressRecursionTree: true },
    cellRules: [],
    pointers: [],
    conditionHUD: { show: true, passLabel: "Nodes in different sets — union", failLabel: "Same set — this edge is redundant!" },
    overlays: { conflictLines: false, arrows: false, pathTrace: false },
    auxiliary: [],
  },
},

{
  id: "cherry-pickup",
  match: {
    functions: ["cherryPickup", "cherry_pickup"],
    // NOTE: multi-word phrases removed — extractKeywords() only ever produces
    // single lowercase words (regex [a-z]{3,}), so "two travelers"/"two robots"
    // could never match anything in codeWords; split into single words instead.
    keywords: ["cherry", "pickup", "thorn", "thorns", "simultaneous", "travelers", "traveler"],
    // NOTE: was "has2DGrid" — extractSignals() only ever produces "has2DArray"
    // (see problemMatcher.js). A signal key that doesn't exist in codeSignals
    // silently compares true === undefined and always fails, quietly losing
    // the full signal-match score contribution.
    signals: { has2DArray: true },
  },
  vizSpec: {
    problemId: "cherry-pickup", problemName: "Cherry Pickup",
    leetcodeNumber: 741, difficulty: "HARD",
    pattern: "Dynamic Programming · Two Simultaneous Traversals",
    description: "Treat the forward and return trips as two travelers moving from (0,0) to (n-1,n-1) simultaneously. At every step both travelers move either Right or Down. If both land on the same cell, cherries are collected only once.",
    companies: ["Google", "Amazon", "Uber"],
    complexity: { time: "O(n³)", space: "O(n³)" },
    category: "DP_2D",
    primary: {
      // NOTE: was "GRID" — the only valid 2-D engine name in this system is
      // "MATRIX" (see VALID_ENGINES in ArtificialRoutes.js and the switch in
      // PolymorphicRouter's EngineRenderer). "GRID" is not registered anywhere
      // and produces "Unknown structure type: GRID".
      engine: "MATRIX",
      variable: "grid",
      suppressRecursionTree: true,
      // NOTE: "visualStyle" is only read by LinearArrayEngine (1-D arrays,
      // 'bars' | 'boxes'). GridEngine (which MATRIX routes to) never reads
      // this field at all — removed rather than left as dead configuration.
    },
    // NOTE: rewritten to the actual schema GridEngine reads:
    //   { match: { value: <literal> }, color: <named palette color>, label }
    // The original used condition:"=== -1" / style:{backgroundColor:"#hex"} —
    // neither "condition" nor "style" is a field GridEngine ever looks at, so
    // none of the intended thorn/cherry/empty coloring would have applied at
    // all; it would have silently fallen through to GridEngine's generic
    // numeric-value guesses instead. Colors below use named palette entries
    // (red/amber/slate) — GridEngine has no raw-hex-color support, only its
    // fixed 11-color named palette (see PALETTE in GridEngine.jsx).
    cellRules: [
      { match: { value: -1 }, color: "red",   label: "thorn (blocked)" },
      { match: { value: 1  }, color: "amber", label: "cherry" },
      { match: { value: 0  }, color: "slate", label: "empty" },
    ],
    // r1/c1/r2/c2 grouped into two named cursors via pairId (travelerA,
    // travelerB) below. GridEngine now renders BOTH simultaneously, each
    // with its own colored border — traveler A in blue, traveler B in red —
    // and merges them into a single dual-ring indicator on the rare cell
    // where both travelers currently stand on the same square.
    pointers: [
      // pairId groups a row+col pointer into ONE cursor. color/label apply to
      // the cursor as a whole (only need to be set on either half of the pair;
      // TracerWorker merges them). This is what makes true multi-cursor
      // highlighting possible — GridEngine now reads these and renders each
      // pair as its own independently-colored highlighted cell.
      { variable: "r1", axis: "row", pairId: "travelerA", color: "#2563eb", label: "Traveler A" },
      { variable: "c1", axis: "col", pairId: "travelerA" },
      { variable: "r2", axis: "row", pairId: "travelerB", color: "#dc2626", label: "Traveler B" },
      { variable: "c2", axis: "col", pairId: "travelerB" },
    ],
    conditionHUD: { show: true, passLabel: "Valid state — exploring", failLabel: "Blocked or out of bounds" },
    overlays: { conflictLines: false, arrows: false, pathTrace: true },
    // The (state → result) memo log is populated by watching real call/
    // return events (see dpMemoLog in TracerWorker.js) and attached directly
    // to the primary grid's own data as `recentDPCalls` — it doesn't need an
    // auxiliary entry. The coverage heatmap below IS a separate structure
    // (a second, differently-colored grid), so it's listed here.
    auxiliary: [
      { variable: "grid__dp_coverage", engine: "MATRIX", label: "DP Value (r1,c1)" },
    ],
  },
},

];

// Export for Node.js (ArtificialRoutes.js) and browser (as global)
if (typeof module !== 'undefined') module.exports = { PROBLEMS };
else if (typeof window !== 'undefined') window.PROBLEM_LIBRARY = { PROBLEMS };