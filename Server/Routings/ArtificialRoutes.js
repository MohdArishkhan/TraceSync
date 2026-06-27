const express = require('express');
const router = express.Router();

router.post('/api/ai/analyze', async (req, res) => {
  try {
    const { code, language, runState, runOutput } = req.body;
    const prompt = `L:${language}\nS:${runState}\nO:${runOutput}\nC:\n${code}`;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        models: [
          "google/gemini-2.5-flash",
          "meta-llama/llama-3.1-8b-instruct:free",
          "qwen/qwen-2.5-coder-32b-instruct:free",
        ],
        messages: [
          {
            role: "system",
            content: `You are an expert debugger and algorithm visualization architect. Analyze the provided code and return ONLY a JSON object matching this exact structure:
            {
              "summary": "Brief overall analysis of the code",
              "suggestions": ["fix 1", "fix 2"],
              "templateCategory": "Algorithm, Data Structure, Math, etc.",
              "algorithm": "Core data structure or algorithm used",
              "topic": "The specific problem domain or topic",
              "variables": [
                { "name": "varName", "role": "What this variable does" }
              ],
              "selectedEngine": "EngineName",
              "engineReasoning": "1-sentence explanation of why this engine is the best fit."
            }
            
            ### Routing Rules for "selectedEngine":
            Choose ONLY from the following list. Prioritize the primary visual representation of the problem's domain over its underlying mechanics (e.g., N-Queens uses recursion, but it is fundamentally a board problem, so choose "GridEngine"). If none apply, return "None".
            
            1. "DequeEngine" - For double-ended queue operations.
            2. "DSUEngine" - For Disjoint Set Union (Union-Find), connected components, dynamic connectivity, and cycle detection.
            3. "GridEngine" - For 2D matrices, board games (Chess/N-Queens), Sudoku, Mazes, and 2D DP grids.
            4. "HashMapEngine" - For key-value pair mapping, hashing, and frequency counting.
            5. "HeapEngine" - For priority queues, min-heap, max-heap, and heap sort.
            6. "PhysicsGraphEngine" - For nodes and edges, shortest path (Dijkstra), MST, and network routing.
            7. "PolymorphicRouter" - For dynamic request handling, polymorphic behavior evaluation, or routing structures.
            8. "QueueEngine" - For standard FIFO operations, level-order traversals, and scheduling.
            9. "RecursionTreeEngine" - For visualizing pure function call stacks, recursive depths, and overlapping subproblems (like Fibonacci DP).
            10. "SegmentTreeEngine" - For range query structures, interval trees, range sum, and range minimum queries.
            11. "StackEngine" - For LIFO operations, valid parentheses, monotonic stacks, and basic DFS tracking.
            12. "SvgTreeEngine" - For Binary Trees, BSTs, Tries, and parent-child hierarchical data.`
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        max_tokens: 2000
      })
    });

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error.message || "OpenRouter API Error");
    }

    const aiContent = data.choices[0].message.content;
    res.json(JSON.parse(aiContent));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
