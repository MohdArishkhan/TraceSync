const express = require('express');
const router = express.Router();
const { matchAndGetSpec } = require('../problemLibrary/problemMatcher');
const { PROBLEMS }        = require('../problemLibrary/problemLibrary');

// ─────────────────────────────────────────────────────────────────────────────
//  VIZSPEC SCHEMA — what the LLM must output inside "vizSpec"
// ─────────────────────────────────────────────────────────────────────────────
const VIZSPEC_SCHEMA = `
"vizSpec": {
  "problemId": "kebab-case-identifier",
  "problemName": "Human Readable Problem Name",
  "leetcodeNumber": <number or null — the LeetCode problem number if this is a known problem>,
  "difficulty": "<EASY | MEDIUM | HARD>",
  "pattern": "<short pattern name, e.g. 'Dutch National Flag · in-place · three pointers' or 'Two pointers · O(1) space'>",
  "description": "<one or two plain-English sentences describing what the function does, written for someone seeing it for the first time>",
  "companies": ["<companies this is commonly asked at, e.g. 'Amazon', 'Google' — only if genuinely well-known, otherwise empty array>"],
  "complexity": { "time": "<e.g. O(n)>", "space": "<e.g. O(1)>" },
  "category": "<one of the 15 categories below>",

  "primary": {
    "engine": "<one of: MATRIX | GRAPH | ARRAY | TREE | STACK | QUEUE | DEQUE | HEAP | HASH_MAP | DSU | SEGMENT_TREE | RECURSION_TREE | N_QUEENS | LINKED_LIST>",
    "variable": "<exact variable name from the user code>",
    "suppressRecursionTree": <true if engine is MATRIX/GRAPH/HEAP/DSU/SORTING, false if RECURSION_TREE/TREE/BACKTRACKING>,
    "visualStyle": "<'bars' ONLY for 1-D numeric arrays representing magnitudes/heights (e.g. trapping rain water, histogram, container with most water) — 'boxes' for everything else, including this field only when engine is ARRAY>"
  },

  "cellRules": [
    { "match": { "value": "<literal cell value like '0','1','#',true,false,-1>" }, "color": "<color>", "label": "<label>", "blocked": <true|false> },
    { "match": { "wasModified": true }, "color": "<color>", "label": "<label>" }
  ],

  "pointers": [
    { "variable": "<exact loop variable name: r,c,row,col,i,j,left,right,low,high,mid>", "axis": "<row|col|index>" }
  ],

  "referenceLines": [
    { "variable": "<exact variable name holding a running max/threshold, e.g. 'leftMax'>", "label": "<display label>", "color": "<color, optional>" }
  ],

  "conditionHUD": {
    "show": <true|false>,
    "passLabel": "<what it means when condition passes, e.g. 'Valid cell — exploring'>",
    "failLabel": "<what it means when guard returns early, e.g. 'Out of bounds or visited'>"
  },

  "overlays": {
    "conflictLines": <true only for N-Queens/Sudoku>,
    "arrows": <true only for graph shortest path>,
    "pathTrace": <true only for maze/BFS path>
  },

  "auxiliary": [
    { "variable": "<exact variable name>", "engine": "COUNTER", "label": "<display label>" }
  ]
}
`;

// ─────────────────────────────────────────────────────────────────────────────
//  15 TEMPLATE CATEGORIES
// ─────────────────────────────────────────────────────────────────────────────
const CATEGORIES = `
GRID_DFS           → 2D grid + DFS recursion (numIslands, maxAreaIsland, floodFill, wordSearch)
GRID_BFS           → 2D grid + BFS queue (rottenOranges, wallsAndGates, shortestPathBinary)
BACKTRACKING_BOARD → 2D board + constraint checking with backtrack (nQueens, sudokuSolver)
GRAPH_WEIGHTED     → nodes + weighted edges + heap (dijkstra, prim, astar)
GRAPH_UNWEIGHTED   → nodes + unweighted edges + BFS/DFS (cloneGraph, courseSchedule, wordLadder)
DP_2D              → 2D DP table filled iteratively (LCS, editDistance, coinChange2D)
DP_1D              → 1D array filled iteratively (fibonacci, climbingStairs, houseRobber)
TREE_TRAVERSAL     → binary/n-ary tree traversal (inorder, levelOrder, LCA)
SORTING            → array rearrangement (bubbleSort, mergeSort, quickSort)
BINARY_SEARCH      → array + low/mid/high pointers (binarySearch, searchRotated)
SLIDING_WINDOW     → array + left/right window (maxSlidingWindow, longestSubstring)
DSU_OPERATIONS     → union-find parent array (unionFind, connectedComponents, kruskal)
HEAP_OPERATIONS    → priority queue push/pop (kthLargest, medianFinder, taskScheduler)
LINKED_LIST_OPS    → node pointer following (reverseList, mergeLists, detectCycle)
BACKTRACKING_ARRAY → 1D array + recursion + pruning (permutations, combinations, subsets)
`;

// ─────────────────────────────────────────────────────────────────────────────
//  6 FEW-SHOT EXAMPLES (the most critical part of the prompt)
// ─────────────────────────────────────────────────────────────────────────────
const FEW_SHOT_EXAMPLES = `
=== EXAMPLE 1: Number of Islands (GRID_DFS) ===
CODE:
def numIslands(grid):
    rows, cols = len(grid), len(grid[0])
    count = 0
    def dfs(r, c):
        if r < 0 or c < 0 or r >= rows or c >= cols or grid[r][c] == "0":
            return
        grid[r][c] = "0"
        dfs(r+1,c); dfs(r-1,c); dfs(r,c+1); dfs(r,c-1)
    for i in range(rows):
        for j in range(cols):
            if grid[i][j] == "1":
                count += 1; dfs(i, j)
    return count

VIZSPEC:
{
  "problemId": "num-islands",
  "problemName": "Number of Islands",
  "category": "GRID_DFS",
  "primary": { "engine": "MATRIX", "variable": "grid", "suppressRecursionTree": true },
  "cellRules": [
    { "match": { "value": "1" }, "color": "green", "label": "land" },
    { "match": { "value": "0" }, "color": "blue", "label": "water", "blocked": true },
    { "match": { "wasModified": true }, "color": "emerald", "label": "visited" }
  ],
  "pointers": [
    { "variable": "r", "axis": "row" },
    { "variable": "c", "axis": "col" }
  ],
  "conditionHUD": {
    "show": true,
    "passLabel": "Valid land cell — exploring",
    "failLabel": "Out of bounds or already visited"
  },
  "overlays": { "conflictLines": false, "arrows": false, "pathTrace": false },
  "auxiliary": [
    { "variable": "count", "engine": "COUNTER", "label": "Islands found" }
  ]
}

=== EXAMPLE 2: N-Queens (BACKTRACKING_BOARD) ===
CODE:
def solveNQueens(n):
    board = [["." for _ in range(n)] for _ in range(n)]
    cols = set(); diag1 = set(); diag2 = set()
    res = []
    def backtrack(row):
        if row == n:
            res.append(["".join(r) for r in board])
            return
        for col in range(n):
            if col in cols or (row-col) in diag1 or (row+col) in diag2:
                continue
            board[row][col] = "Q"
            cols.add(col); diag1.add(row-col); diag2.add(row+col)
            backtrack(row+1)
            board[row][col] = "."; cols.remove(col); diag1.remove(row-col); diag2.remove(row+col)
    backtrack(0)
    return res

VIZSPEC:
{
  "problemId": "n-queens",
  "problemName": "N-Queens",
  "category": "BACKTRACKING_BOARD",
  "primary": { "engine": "N_QUEENS", "variable": "board", "suppressRecursionTree": false },
  "cellRules": [
    { "match": { "value": "Q" }, "color": "indigo", "label": "queen" },
    { "match": { "value": "." }, "color": "slate", "label": "empty" }
  ],
  "pointers": [
    { "variable": "row", "axis": "row" },
    { "variable": "col", "axis": "col" }
  ],
  "conditionHUD": {
    "show": true,
    "passLabel": "Safe position — placing queen",
    "failLabel": "Conflict detected — skipping column"
  },
  "overlays": { "conflictLines": true, "arrows": false, "pathTrace": false },
  "auxiliary": []
}

=== EXAMPLE 3: Binary Search (BINARY_SEARCH) ===
CODE:
def search(nums, target):
    left, right = 0, len(nums) - 1
    while left <= right:
        mid = (left + right) // 2
        if nums[mid] == target:
            return mid
        elif nums[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1

VIZSPEC:
{
  "problemId": "binary-search",
  "problemName": "Binary Search",
  "category": "BINARY_SEARCH",
  "primary": { "engine": "ARRAY", "variable": "nums", "suppressRecursionTree": true },
  "cellRules": [
    { "match": { "value": null }, "color": "slate", "label": "element" }
  ],
  "pointers": [
    { "variable": "left", "axis": "index" },
    { "variable": "mid", "axis": "index" },
    { "variable": "right", "axis": "index" }
  ],
  "conditionHUD": {
    "show": true,
    "passLabel": "Target found at mid",
    "failLabel": "Adjusting search boundary"
  },
  "overlays": { "conflictLines": false, "arrows": false, "pathTrace": false },
  "auxiliary": [
    { "variable": "mid", "engine": "COUNTER", "label": "Current mid index" }
  ]
}

=== EXAMPLE 4: Rotten Oranges / BFS Grid (GRID_BFS) ===
CODE:
from collections import deque
def orangesRotting(grid):
    rows, cols = len(grid), len(grid[0])
    queue = deque()
    fresh = 0
    for r in range(rows):
        for c in range(cols):
            if grid[r][c] == 2: queue.append((r, c, 0))
            elif grid[r][c] == 1: fresh += 1
    time = 0
    while queue:
        r, c, t = queue.popleft()
        for dr, dc in [(1,0),(-1,0),(0,1),(0,-1)]:
            nr, nc = r+dr, c+dc
            if 0<=nr<rows and 0<=nc<cols and grid[nr][nc]==1:
                grid[nr][nc] = 2
                fresh -= 1
                queue.append((nr, nc, t+1))
                time = t + 1
    return time if fresh == 0 else -1

VIZSPEC:
{
  "problemId": "rotten-oranges",
  "problemName": "Rotten Oranges",
  "category": "GRID_BFS",
  "primary": { "engine": "MATRIX", "variable": "grid", "suppressRecursionTree": true },
  "cellRules": [
    { "match": { "value": "0" }, "color": "slate", "label": "empty", "blocked": true },
    { "match": { "value": "1" }, "color": "green", "label": "fresh orange" },
    { "match": { "value": "2" }, "color": "red", "label": "rotten orange" },
    { "match": { "wasModified": true }, "color": "amber", "label": "just rotted" }
  ],
  "pointers": [
    { "variable": "r", "axis": "row" },
    { "variable": "c", "axis": "col" }
  ],
  "conditionHUD": {
    "show": true,
    "passLabel": "Spreading rot to neighbor",
    "failLabel": "Out of bounds or not fresh"
  },
  "overlays": { "conflictLines": false, "arrows": false, "pathTrace": true },
  "auxiliary": [
    { "variable": "fresh", "engine": "COUNTER", "label": "Fresh oranges left" },
    { "variable": "time", "engine": "COUNTER", "label": "Time elapsed" }
  ]
}

=== EXAMPLE 5: Fibonacci Memoization (RECURSION_TREE / DP_1D) ===
CODE:
def fib(n, memo={}):
    if n <= 1: return n
    if n in memo: return memo[n]
    memo[n] = fib(n-1, memo) + fib(n-2, memo)
    return memo[n]

VIZSPEC:
{
  "problemId": "fibonacci-memo",
  "problemName": "Fibonacci with Memoization",
  "category": "DP_1D",
  "primary": { "engine": "RECURSION_TREE", "variable": "memo", "suppressRecursionTree": false },
  "cellRules": [
    { "match": { "wasModified": true }, "color": "emerald", "label": "computed & cached" }
  ],
  "pointers": [
    { "variable": "n", "axis": "index" }
  ],
  "conditionHUD": {
    "show": true,
    "passLabel": "Computing fib(n) recursively",
    "failLabel": "Cache hit — returning memo[n]"
  },
  "overlays": { "conflictLines": false, "arrows": false, "pathTrace": false },
  "auxiliary": [
    { "variable": "memo", "engine": "HASH_MAP", "label": "Memoization cache" }
  ]
}

=== EXAMPLE 6: Dijkstra Shortest Path (GRAPH_WEIGHTED) ===
CODE:
import heapq
def dijkstra(graph, src):
    dist = {node: float('inf') for node in graph}
    dist[src] = 0
    pq = [(0, src)]
    while pq:
        d, u = heapq.heappop(pq)
        for v, w in graph[u]:
            if dist[u] + w < dist[v]:
                dist[v] = dist[u] + w
                heapq.heappush(pq, (dist[v], v))
    return dist

VIZSPEC:
{
  "problemId": "dijkstra",
  "problemName": "Dijkstra Shortest Path",
  "category": "GRAPH_WEIGHTED",
  "primary": { "engine": "GRAPH", "variable": "graph", "suppressRecursionTree": true },
  "cellRules": [],
  "pointers": [
    { "variable": "u", "axis": "index" },
    { "variable": "v", "axis": "index" }
  ],
  "conditionHUD": {
    "show": true,
    "passLabel": "Relaxing edge — updating distance",
    "failLabel": "Distance not improved — skipping"
  },
  "overlays": { "conflictLines": false, "arrows": true, "pathTrace": true },
  "auxiliary": [
    { "variable": "dist", "engine": "HASH_MAP", "label": "Shortest distances" }
  ]
}

=== EXAMPLE 7: Trapping Rain Water (BAR-CHART MODE + reference lines) ===
CODE:
def trap(height):
    n = len(height)
    maxL = [0] * n
    maxR = [0] * n
    maxL[0] = height[0]
    for i in range(1, n):
        maxL[i] = max(maxL[i-1], height[i])
    maxR[n-1] = height[n-1]
    for i in range(n-2, -1, -1):
        maxR[i] = max(maxR[i+1], height[i])
    total = 0
    for i in range(n):
        total += max(0, min(maxL[i], maxR[i]) - height[i])
    return total

VIZSPEC:
{
  "problemId": "trapping-rain-water",
  "problemName": "Trapping Rain Water",
  "leetcodeNumber": 42,
  "difficulty": "HARD",
  "pattern": "Precompute maxL[] and maxR[] arrays",
  "description": "Given an elevation map of bar heights, compute how many units of water can be trapped between the bars after rain.",
  "companies": ["Amazon", "Google", "Goldman Sachs"],
  "complexity": { "time": "O(n)", "space": "O(n)" },
  "category": "DP_1D",
  "primary": { "engine": "ARRAY", "variable": "height", "suppressRecursionTree": true, "visualStyle": "bars" },
  "cellRules": [],
  "pointers": [
    { "variable": "i", "axis": "index" }
  ],
  "referenceLines": [
    { "variable": "maxL", "label": "leftMax", "color": "#f87171" },
    { "variable": "maxR", "label": "rightMax", "color": "#60a5fa" }
  ],
  "conditionHUD": { "show": false, "passLabel": "", "failLabel": "" },
  "overlays": { "conflictLines": false, "arrows": false, "pathTrace": false },
  "auxiliary": [
    { "variable": "total", "engine": "COUNTER", "label": "Water trapped" }
  ]
}
`;

// ─────────────────────────────────────────────────────────────────────────────
//  SYSTEM PROMPT
// ─────────────────────────────────────────────────────────────────────────────
const buildSystemPrompt = () => `
You are an expert algorithm visualization architect for a code tracer tool called TraceLab.
Your job: analyze user code and return a JSON object with TWO sections:
1. Standard analysis (summary, suggestions, variables, selectedEngine)
2. A vizSpec — a precise rendering contract that tells the visualization engine exactly what to show

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 COMPLETE RESPONSE SCHEMA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
{
  "summary": "1-2 sentence overview of what the code does",
  "suggestions": ["suggestion 1", "suggestion 2"],
  "templateCategory": "Human readable category (e.g. Grid DFS, Binary Search, Dynamic Programming)",
  "algorithm": "Core algorithm name (e.g. DFS, Dijkstra, Union-Find)",
  "topic": "Specific problem topic (e.g. Island counting, Backtracking, Shortest path)",
  "variables": [
    { "name": "exact_var_name", "role": "What this variable does in the algorithm" }
  ],
  "selectedEngine": "<engine name from legacy list below>",
  "engineReasoning": "1 sentence: why this engine was chosen",
  ${VIZSPEC_SCHEMA}
}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 LEGACY selectedEngine LIST (for backwards compatibility)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
GridEngine, PhysicsGraphEngine, SvgTreeEngine, RecursionTreeEngine,
StackEngine, QueueEngine, DequeEngine, HeapEngine, HashMapEngine,
DSUEngine, SegmentTreeEngine

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 15 TEMPLATE CATEGORIES (use in vizSpec.category)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${CATEGORIES}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 CRITICAL RULES FOR vizSpec
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. vizSpec.primary.variable MUST be an exact variable name that appears in the code
2. vizSpec.pointers MUST use exact variable names from the code (r, c, row, col, i, j, left, right, mid, etc.)
3. vizSpec.auxiliary MUST only include variables that have display meaning (counters, results) — NOT internal bookkeeping
4. cellRules: "value" must be the EXACT string/number the code puts in cells (check the condition: if grid[r][c] == "0" → value is "0")
5. suppressRecursionTree: true for MATRIX, GRAPH, HEAP, DSU, SORTING, BINARY_SEARCH, SLIDING_WINDOW
6. suppressRecursionTree: false for RECURSION_TREE, TREE, BACKTRACKING_BOARD, BACKTRACKING_ARRAY
7. For non-grid problems (ARRAY, GRAPH, TREE), cellRules can be an empty array []
8. If a variable name is unclear or uses unusual naming, still include it exactly as written
9. conditionHUD: write passLabel/failLabel in plain English describing what happens at the algorithm's guard condition

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 COLOR PALETTE (use these exact color names)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
"green"   → valid/traversable/land
"blue"    → water/empty/blocked/wall  
"emerald" → visited/already explored/modified
"amber"   → current active cell being checked
"red"     → conflict/error/rotten/blocked
"indigo"  → special marker (queen, selected node)
"purple"  → path/solution/result
"slate"   → default unvisited/neutral

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 7 WORKED EXAMPLES (study these carefully)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${FEW_SHOT_EXAMPLES}

Now analyze the user's code and return the complete JSON. Return ONLY valid JSON, no markdown, no explanation.
`;

// ─────────────────────────────────────────────────────────────────────────────
//  VALIDATE & SANITIZE vizSpec from LLM output
//  Prevents bad LLM outputs from crashing the rendering engines
// ─────────────────────────────────────────────────────────────────────────────
const VALID_ENGINES = new Set([
  'MATRIX','GRAPH','ARRAY','TREE','STACK','QUEUE','DEQUE',
  'HEAP','HASH_MAP','DSU','SEGMENT_TREE','RECURSION_TREE','N_QUEENS','LINKED_LIST'
]);

const VALID_COLORS = new Set([
  'green','blue','emerald','amber','red','indigo','purple','slate','cyan','rose','orange'
]);

const VALID_CATEGORIES = new Set([
  'GRID_DFS','GRID_BFS','BACKTRACKING_BOARD','GRAPH_WEIGHTED','GRAPH_UNWEIGHTED',
  'DP_2D','DP_1D','TREE_TRAVERSAL','SORTING','BINARY_SEARCH','SLIDING_WINDOW',
  'DSU_OPERATIONS','HEAP_OPERATIONS','LINKED_LIST_OPS','BACKTRACKING_ARRAY'
]);

const sanitizeVizSpec = (spec, code) => {
  if (!spec || typeof spec !== 'object') return null;

  // Validate primary engine
  const engine = String(spec.primary?.engine ?? '').toUpperCase();
  if (!VALID_ENGINES.has(engine)) {
    console.warn('[VizSpec] Invalid engine:', engine, '— falling back to ARRAY');
    if (spec.primary) spec.primary.engine = 'ARRAY';
  }

  // Validate category
  if (spec.category && !VALID_CATEGORIES.has(spec.category)) {
    spec.category = 'GRID_DFS'; // safe default
  }

  // Validate primary variable exists in code (prevent hallucination)
  const primaryVar = spec.primary?.variable;
  if (primaryVar && !code.includes(primaryVar)) {
    console.warn('[VizSpec] Primary variable not found in code:', primaryVar);
    // Don't null it — the LLM might have used a slightly different form
  }

  // Sanitize cellRules colors
  if (Array.isArray(spec.cellRules)) {
    spec.cellRules = spec.cellRules.filter(rule => {
      if (!rule.match) return false;
      if (rule.color && !VALID_COLORS.has(rule.color)) rule.color = 'slate';
      return true;
    });
  }

  // Ensure auxiliary is array
  if (!Array.isArray(spec.auxiliary)) spec.auxiliary = [];
  if (!Array.isArray(spec.pointers)) spec.pointers = [];
  if (!Array.isArray(spec.cellRules)) spec.cellRules = [];

  // Ensure overlays object
  spec.overlays = {
    conflictLines: false,
    arrows: false,
    pathTrace: false,
    ...(spec.overlays || {})
  };

  // Ensure conditionHUD
  spec.conditionHUD = {
    show: true,
    passLabel: 'Condition passed',
    failLabel: 'Condition failed — returning',
    ...(spec.conditionHUD || {})
  };

  // ── Problem header fields — never block rendering on these, just normalize ──
  const VALID_DIFFICULTY = new Set(['EASY', 'MEDIUM', 'HARD']);
  if (spec.difficulty && !VALID_DIFFICULTY.has(String(spec.difficulty).toUpperCase())) {
    spec.difficulty = null;
  } else if (spec.difficulty) {
    spec.difficulty = String(spec.difficulty).toUpperCase();
  }
  if (!Array.isArray(spec.companies)) spec.companies = [];
  if (spec.complexity && typeof spec.complexity !== 'object') spec.complexity = null;

  // ── visualStyle — only 'bars' or 'boxes' allowed, only meaningful for ARRAY ──
  if (spec.primary?.visualStyle && !['bars', 'boxes'].includes(spec.primary.visualStyle)) {
    spec.primary.visualStyle = 'boxes';
  }

  // ── referenceLines — drop malformed entries, cap at 4 to avoid chart clutter ──
  if (Array.isArray(spec.referenceLines)) {
    spec.referenceLines = spec.referenceLines
      .filter((r) => r && typeof r.variable === 'string')
      .slice(0, 4);
  } else {
    spec.referenceLines = [];
  }

  return spec;
};

// ─────────────────────────────────────────────────────────────────────────────
//  ROUTE: POST /api/ai/analyze
//  Returns combined analysis + vizSpec
// ─────────────────────────────────────────────────────────────────────────────
router.post('/api/ai/analyze', async (req, res) => {
  try {
    const { code, language, runState, runOutput } = req.body;
    if (!code?.trim()) return res.status(400).json({ error: 'No code provided' });

    // ── FAST PATH: prebuilt library check ────────────────────────────────────
    // EXACT/HIGH matches have hand-tuned specs — no LLM needed, returns in <1ms.
    // MEDIUM match: pass the matched template to the LLM for a cheaper, faster call.
    const libraryMatch = matchAndGetSpec(code);
    if (libraryMatch && (libraryMatch.confidence === 'EXACT' || libraryMatch.confidence === 'HIGH')) {
      const spec = libraryMatch.vizSpec;
      console.log(`[Library HIT] ${libraryMatch.problemId} — ${libraryMatch.confidence} (${libraryMatch.score.toFixed(2)}) — LLM skipped`);
      return res.json({
        summary:          `${spec.problemName} — ${spec.pattern ?? spec.category}`,
        suggestions:      [],
        templateCategory: spec.category,
        algorithm:        spec.pattern ?? spec.category,
        topic:            spec.problemName,
        variables:        (spec.pointers ?? []).map(p => ({ name: p.variable, role: `${p.axis} pointer` })),
        selectedEngine:   spec.primary.engine,
        engineReasoning:  `Pre-matched from TraceLab library (${libraryMatch.confidence})`,
        _libraryMatch:    { problemId: libraryMatch.problemId, confidence: libraryMatch.confidence, score: libraryMatch.score },
        vizSpec: spec,
      });
    }

    const templateHint = libraryMatch?.confidence === 'MEDIUM'
      ? `\n\nCLOSEST TEMPLATE — reuse structure, only adjust variable names/cell values:\n${JSON.stringify(libraryMatch.vizSpec, null, 2)}`
      : '';

    const userPrompt = `Language: ${language}\nRun State: ${runState}\nRun Output: ${runOutput || 'none'}\n\nCode:\n\`\`\`${language}\n${code}\n\`\`\`${templateHint}`;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.APP_URL || "http://localhost:3000",
        "X-Title": "TraceLab Visualizer"
      },
      body: JSON.stringify({
        // Primary: Gemini 2.5 Flash (best at structured JSON + code)
        // Fallbacks in order if primary fails or is rate-limited
        models: [
          "google/gemini-2.5-flash",
          "anthropic/claude-3.5-haiku",
          "qwen/qwen-2.5-coder-32b-instruct:free",
          "meta-llama/llama-3.1-8b-instruct:free",
        ],
        route: "fallback",
        messages: [
          {
            role: "system",
            content: buildSystemPrompt()
          },
          {
            role: "user",
            content: userPrompt
          }
        ],
        response_format: { type: "json_object" },
        max_tokens: 3000,
        temperature: 0.1, // Low temp for deterministic structured output
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`OpenRouter API error ${response.status}: ${errText.slice(0, 200)}`);
    }

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error.message || "OpenRouter API Error");
    }

    const rawContent = data.choices?.[0]?.message?.content;
    if (!rawContent) throw new Error('Empty response from AI');

    // Parse and validate
    let parsed;
    try {
      // Strip any accidental markdown fences
      const cleaned = rawContent.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
      parsed = JSON.parse(cleaned);
    } catch (parseErr) {
      console.error('[AI] JSON parse failed:', parseErr.message);
      console.error('[AI] Raw content:', rawContent.slice(0, 500));
      throw new Error(`AI returned invalid JSON: ${parseErr.message}`);
    }

    // Sanitize vizSpec before sending to client
    if (parsed.vizSpec) {
      parsed.vizSpec = sanitizeVizSpec(parsed.vizSpec, code);
    }

    // Log what we're sending (for debugging)
    console.log('[AI] Engine:', parsed.vizSpec?.primary?.engine, '| Variable:', parsed.vizSpec?.primary?.variable, '| Category:', parsed.vizSpec?.category);

    res.json(parsed);

  } catch (error) {
    console.error('[AI Route Error]', error.message);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

// ─────────────────────────────────────────────────────────────────────────────
//  ROUTE: GET /api/library/problems
//  Returns the problem library catalogue (no vizSpec details, just metadata)
//  so the frontend can show a "Supported Problems" browser.
// ─────────────────────────────────────────────────────────────────────────────
// const { PROBLEMS } = require('../problemLibrary/problemLibrary');

router.get('/api/library/problems', (req, res) => {
  const catalogue = PROBLEMS.map(p => ({
    id:             p.id,
    name:           p.vizSpec.problemName,
    difficulty:     p.vizSpec.difficulty,
    pattern:        p.vizSpec.pattern,
    category:       p.vizSpec.category,
    leetcodeNumber: p.vizSpec.leetcodeNumber,
    companies:      p.vizSpec.companies,
    engine:         p.vizSpec.primary.engine,
  }));
  res.json({ count: catalogue.length, problems: catalogue });
});

// ─────────────────────────────────────────────────────────────────────────────
//  ROUTE: GET /api/library/match?code=<url-encoded-code>
//  Quick fingerprint check without running a full analysis.
//  Used by the frontend to show "✦ Optimized" badge before Analyze is clicked.
// ─────────────────────────────────────────────────────────────────────────────
router.get('/api/library/match', (req, res) => {
  const { code } = req.query;
  if (!code) return res.status(400).json({ error: 'code param required' });
  const match = matchAndGetSpec(decodeURIComponent(code));
  if (!match) return res.json({ matched: false });
  res.json({
    matched:    true,
    problemId:  match.problemId,
    confidence: match.confidence,
    score:      match.score,
    name:       match.vizSpec.problemName,
    engine:     match.vizSpec.primary.engine,
  });
});