// ─────────────────────────────────────────────────────────────────────────────
//  SET-MEMBERSHIP CONDITION PARSER
//  Detects the extremely common "if X in Y:" / "if X not in Y:" pattern —
//  visited-set checks, wordSet lookups, hash lookups, etc. This is the
//  membership-check equivalent of GridEngine's parseGridCondition, but works
//  for ANY container type (queue/stack/deque/heap/array), not just grids.
//  Needs `heap` to resolve container variables that are REF pointers.
// ─────────────────────────────────────────────────────────────────────────────
const MEMBERSHIP_RE = /\b(?:if|while|elif)\s+(\w+)\s+(not\s+)?in\s+(\w+)\s*:/;

const parseMembershipCondition = (lineText, locals, heap) => {
  const m = lineText.match(MEMBERSHIP_RE);
  if (!m) return null;
  const [, checkedVar, notFlag, containerVar] = m;
  const checkedValue = locals[checkedVar];
  const containerRaw = locals[containerVar];
  if (checkedValue === undefined || containerRaw === undefined) return null;

  const resolvedContainer = resolveDeep(containerRaw, heap);
  if (!Array.isArray(resolvedContainer)) return null; // dict/other — skip for now

  const isPresent   = resolvedContainer.some((v) => v === checkedValue);
  const isNegated   = !!notFlag;
  const conditionTrue = isNegated ? !isPresent : isPresent; // true = this branch is taken

  return {
    checkedVar, checkedValue, containerVar, isPresent, isNegated, conditionTrue,
    text: `${checkedVar} ${isNegated ? 'not ' : ''}in ${containerVar}`,
  };
};

// ─────────────────────────────────────────────────────────────────────────────
//  STEP NARRATION — template-based, instant, no LLM per step.
//  Produces a plain-English sentence explaining WHY this step happened,
//  grounded in the live local variables at this exact frame.
// ─────────────────────────────────────────────────────────────────────────────
const NARRATION_RULES = [
  // Set-membership check — the single most common pattern across BFS/DFS/
  // visited-tracking algorithms. Placed first: highly specific, should win
  // over generic fallback rules whenever it matches.
  { test: (l) => MEMBERSHIP_RE.test(l),
    build: (v, l, cond) => {
      if (!cond) return null;
      const val = typeof cond.checkedValue === 'string' ? `"${cond.checkedValue}"` : cond.checkedValue;
      if (cond.conditionTrue) {
        return cond.isNegated
          ? `${val} is not in ${cond.containerVar} — condition met.`
          : `${val} found in ${cond.containerVar} — proceeding.`;
      }
      return cond.isNegated
        ? `${val} is already in ${cond.containerVar} — skipping.`
        : `${val} not in ${cond.containerVar} — skipping.`;
    } },

  // Dutch-flag three-way partition
  { test: (l) => /\[\s*mid\s*\]\s*==\s*0/.test(l),
    build: (v) => `arr[mid] = 0 → swap into the 0-region, advance low and mid.` },
  { test: (l) => /\[\s*mid\s*\]\s*==\s*1/.test(l),
    build: (v) => `arr[mid] = 1 → already in place, just advance mid.` },
  { test: (l) => /\[\s*mid\s*\]\s*==\s*2/.test(l),
    build: (v) => `arr[mid] = 2 → swap into the 2-region, shrink high (mid stays put to recheck).` },

  // Trapping rain water: cap = min(leftMax, rightMax)
  { test: (l) => /min\s*\(\s*(maxL|leftMax|left_max)/.test(l),
    build: (v) => {
      const lm = v.maxL ?? v.leftMax ?? v.left_max;
      const rm = v.maxR ?? v.rightMax ?? v.right_max;
      const i  = v.i ?? v.idx;
      const h  = v.h ?? v.height ?? v.heights;
      if (lm === undefined || rm === undefined) return null;
      const cap = Math.min(lm, rm);
      const hi  = Array.isArray(h) && i !== undefined ? h[i] : undefined;
      if (hi !== undefined && hi >= cap) return `cap = min(${lm}, ${rm}) = ${cap}. h[${i}] = ${hi} already reaches the cap, so water[${i}] = 0. This column is a wall, not a valley.`;
      if (hi !== undefined) return `cap = min(${lm}, ${rm}) = ${cap}. water[${i}] = ${cap} − ${hi} = ${cap - hi}.`;
      return `cap = min(${lm}, ${rm}) = ${cap}.`;
    } },

  // Two-pointer rain water: which side to settle
  { test: (l) => /(h\[left\]|height\[left\]).*[<>]=?.*(h\[right\]|height\[right\])/.test(l),
    build: (v) => {
      const hl = Array.isArray(v.h) ? v.h[v.left] : v.height?.[v.left];
      const hr = Array.isArray(v.h) ? v.h[v.right] : v.height?.[v.right];
      if (hl === undefined || hr === undefined) return null;
      const side = hl < hr ? 'LEFT' : 'RIGHT';
      return `h[left] = ${hl}, h[right] = ${hr}. ${Math.max(hl, hr)} ≥ ${Math.min(hl, hr)} → settle the ${side} side.`;
    } },

  // Generic sliding-window pointer check
  { test: (l) => /\b(left|low)\s*[<>]=?\s*(right|high)\b/.test(l) && /while/.test(l),
    build: (v) => {
      const lo = v.left ?? v.low, hi = v.right ?? v.high;
      if (lo === undefined || hi === undefined) return null;
      return `Checking the window: pointers at ${lo} and ${hi}.`;
    } },

  // Generic for-loop pass counter (lowest priority fallback)
  { test: (l) => /^\s*for\s+\w+\s+in\s+range/.test(l),
    build: (v, l) => {
      const m = l.match(/for\s+(\w+)\s+in\s+range/);
      if (!m) return null;
      const idx = v[m[1]];
      return idx === undefined ? null : `Pass i = ${idx}.`;
    } },
];

const buildNarration = (lineText, locals, condition) => {
  if (!lineText) return null;
  for (const rule of NARRATION_RULES) {
    try {
      if (rule.test(lineText)) {
        const s = rule.build(locals, lineText, condition);
        if (s) return s;
      }
    } catch { continue; }
  }
  return null;
};

// ─────────────────────────────────────────────────────────────────────────────
//  POINTER & REGION DETECTION — for the linear-array engine
//  Pointers: named loop/scan variables that index into a 1-D array
//  Regions: contiguous spans with algorithmic meaning (settled/unprocessed)
// ─────────────────────────────────────────────────────────────────────────────
const POINTER_NAMES = ['low', 'mid', 'high', 'left', 'right', 'i', 'j', 'k', 'l', 'r', 'fast', 'slow', 'start', 'end'];

const detectPointers = (locals, arrLen) => {
  const pointers = [];
  for (const name of POINTER_NAMES) {
    const v = locals[name];
    if (typeof v === 'number' && v >= 0 && v < arrLen) {
      pointers.push({ variable: name, index: v });
    }
  }
  return pointers;
};

// Three-region detection for partition-style algorithms (Dutch flag, quicksort partition)
// Returns regions like [{ start, end, label, color }] when low/mid/high pattern is present
const detectRegions = (locals, arrLen) => {
  const { low, mid, high } = locals;
  if (typeof low === 'number' && typeof high === 'number' && typeof mid === 'number') {
    const regions = [];
    if (low > 0) regions.push({ start: 0, end: low - 1, label: '0 REGION (settled)', color: 'red' });
    regions.push({ start: low, end: high, label: 'UNPROCESSED', color: 'slate' });
    if (high < arrLen - 1) regions.push({ start: high + 1, end: arrLen - 1, label: '2 REGION (settled)', color: 'blue' });
    return regions;
  }
  return [];
};
const getProp = (obj, propName) => {
  if (!obj) return undefined;
  if (!Array.isArray(obj)) return obj[propName];

  if (typeof obj[0] === 'string' && (obj[0].startsWith('INSTANCE') || obj[0].startsWith('CLASS'))) {
    for (let i = 2; i < obj.length; i++) {
      if (Array.isArray(obj[i]) && obj[i][0] === propName) return obj[i][1];
    }
  }
  if (obj[0] === 'DICT') {
    for (let i = 1; i < obj.length; i++) {
      if (Array.isArray(obj[i]) && obj[i][0] === propName) return obj[i][1];
    }
  }
  return undefined;
};

// ─────────────────────────────────────────────────────────────────────────────
//  PARSE PYTHON CONTAINER REPR
//  Some C-implemented types (collections.deque, Counter, etc.) can't be
//  introspected attribute-by-attribute by the tracer — PythonTutor falls back
//  to giving us only the object's repr() string, e.g. "deque([(1, 0), (0, 1)])"
//  or "deque([])". Without this parser, that whole string gets treated as a
//  single fake queue item (showing the literal text as a cell). This converts
//  the repr into real JS values: tuples → arrays, so BFS coordinate queues
//  render as actual "(1, 0)" cells instead of one garbage string cell.
// ─────────────────────────────────────────────────────────────────────────────
const parsePythonContainerRepr = (str) => {
  const s = String(str).trim();
  const m = s.match(/^\w+\((\[.*\])\)$/s);
  if (!m) return null;
  let inner = m[1];
  // Python tuples (a, b) → JSON arrays [a, b] (only for simple, non-nested groups)
  inner = inner.replace(/\(([^()]*)\)/g, '[$1]');
  // Python single-quoted strings → JSON double-quoted strings
  inner = inner.replace(/'([^']*)'/g, '"$1"');
  try {
    const parsed = JSON.parse(inner);
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
};

const resolveDeep = (val, heap, depth = 0) => {
  if (depth > 15) return val;

  let actual = val;
  if (Array.isArray(val) && val[0] === 'REF') {
    actual = heap[val[1]];
    if (actual === undefined) return val;
  }

  if (Array.isArray(actual)) {
    if (typeof actual[0] === 'string') {
      const tag = actual[0];
      if (['LIST', 'TUPLE', 'SET'].includes(tag)) {
        return actual.slice(1).map(item => resolveDeep(item, heap, depth + 1));
      }
      if (tag === 'DICT') {
        const obj = {};
        for (let i = 1; i < actual.length; i++) {
          if (Array.isArray(actual[i]) && actual[i].length === 2) {
            obj[actual[i][0]] = resolveDeep(actual[i][1], heap, depth + 1);
          }
        }
        return obj;
      }
      if (tag.startsWith('INSTANCE') || tag.startsWith('CLASS') || tag.startsWith('FUNCTION')) {
        return String(actual[2] ?? actual[1] ?? tag);
      }
    }
    return actual.map(item => resolveDeep(item, heap, depth + 1));
  }
  return actual;
};

// Deep-equal helper for stable-id comparison. Strict === fails for arrays/
// objects (tuples like (word, level)) even when contents are identical,
// since resolveDeep produces a brand-new array reference every single frame.
// Without this, every queue/stack/deque holding tuples gets fresh random ids
// on every frame — causing constant, spurious enter/exit animation replay
// even when the container hasn't actually changed.
const deepEqual = (a, b) => {
  if (a === b) return true;
  if (typeof a !== typeof b) return false;
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    return a.every((v, i) => deepEqual(v, b[i]));
  }
  if (a && b && typeof a === 'object') {
    const ka = Object.keys(a), kb = Object.keys(b);
    if (ka.length !== kb.length) return false;
    return ka.every((k) => deepEqual(a[k], b[k]));
  }
  return false;
};

const generateStableArray = (rawArray, prevObjs) =>
  rawArray.map((val, idx) =>
    deepEqual(prevObjs[idx]?.value, val)
      ? prevObjs[idx]
      : { id: `v-${Math.random().toString(36).slice(2, 8)}`, value: val }
  );

const buildTree = (refVal, heap, visited = new Set()) => {
  if (!Array.isArray(refVal) || refVal[0] !== 'REF') return null;
  const refId = refVal[1];
  if (visited.has(refId)) return null;
  visited.add(refId);

  const obj = heap[refId];
  if (!obj) return null;

  const rawVal = getProp(obj, 'val') ?? getProp(obj, 'value') ?? getProp(obj, 'data') ?? '?';
  const node = { name: String(rawVal), id: String(refId), children: [] };

  const leftRef = getProp(obj, 'left');
  const rightRef = getProp(obj, 'right');
  const childrenRef = getProp(obj, 'children');

  if (leftRef)  { const c = buildTree(leftRef,  heap, visited); if (c) node.children.push(c); }
  if (rightRef) { const c = buildTree(rightRef, heap, visited); if (c) node.children.push(c); }

  if (childrenRef) {
    const kids = resolveDeep(childrenRef, heap);
    if (Array.isArray(kids)) {
      kids.forEach(k => {
        if (Array.isArray(k) && k[0] === 'REF') {
          const c = buildTree(k, heap, visited);
          if (c) node.children.push(c);
        }
      });
    }
  }

  if (node.children.length === 0) delete node.children;
  return node;
};

const buildLinkedList = (startRef, heap) => {
  const nodes = [], edges = [];
  const seen = new Set();
  let cur = startRef, x = 60;

  while (Array.isArray(cur) && cur[0] === 'REF') {
    const id = cur[1];
    if (seen.has(id)) break;
    seen.add(id);

    const obj = heap[id];
    if (!obj) break;

    const val = getProp(obj, 'val') ?? getProp(obj, 'value') ?? getProp(obj, 'data') ?? id;
    const prevId = nodes.length > 0 ? nodes[nodes.length - 1].id : null;

    nodes.push({ id: String(id), val: String(val), label: String(val), position: { x, y: 200 }, isActive: false, isHead: nodes.length === 0 });
    if (prevId !== null)
      edges.push({ id: `e-${prevId}-${id}`, source: String(prevId), target: String(id), isActive: false });

    x += 130;
    cur = getProp(obj, 'next') || null;
  }
  return { nodes, edges };
};

const buildGraph = (varName, rawVal, heap) => {
  const nodes = [], edges = [], edgeSet = new Set();
  const resolved = resolveDeep(rawVal, heap);

  if (Array.isArray(resolved) && resolved.length > 0 && resolved.every(r => Array.isArray(r))) {
    const n = resolved.length;
    const radius = Math.max(130, n * 28);
    resolved.forEach((neighbors, id) => {
      const angle = ((2 * Math.PI) / n) * id - Math.PI / 2;
      nodes.push({
        id: String(id), val: String(id), label: String(id),
        position: { x: 220 + radius * Math.cos(angle), y: 200 + radius * Math.sin(angle) },
        isActive: false
      });
      neighbors.forEach(entry => {
        // Detect weighted edge encoded as [target, weight] tuple (e.g. Dijkstra adjacency lists)
        let target = entry, weight;
        if (Array.isArray(entry) && entry.length === 2 && typeof entry[1] === 'number') {
          [target, weight] = entry;
        }
        const key = `${id}-${target}`;
        if (!edgeSet.has(key)) {
          edgeSet.add(key);
          edges.push({ id: `e-${id}-${target}`, source: String(id), target: String(target), isActive: false, ...(weight !== undefined ? { weight } : {}) });
        }
      });
    });
    return { nodes, edges };
  }
  return null;
};

const STACK_NAMES = /^(stack|stk|st|s|path|calls|callstack|dfs_stack)$/i;
const QUEUE_NAMES = /^(queue|q|bfs_queue|bfs|fifo|level|levels|tovisit|pq|minqueue|maxqueue|waiting|pending|worklist|frontier|open|openlist|que)$/i;
const DEQUE_NAMES = /^(deque|dq)$/i;
const HEAP_NAMES  = /^(heap|pq|priority_queue|min_heap|max_heap|h|hq)$/i;
const MAP_NAMES   = /^(map|hashmap|dict|counter|freq|frequency|memo|cache|seen|visited|dp|lookup|table|cnt|count|char_count|window|record)$/i;
const SET_NAMES   = /^(seen|visited|added|used|s|st|found|instack|onstack)$/i;
const DSU_NAMES   = /^(parent|dsu|uf|union_find|leader|root|size_arr|rank)$/i;
const SEG_TREE_NAMES = /^(seg_tree|segtree|st|fenwick|bit|tree_arr)$/i;
const TRIE_NAMES  = /^(trie|prefix_tree|dict_tree)$/i;
const NQUEENS_BOARD_NAMES = /^(board)$/i;
const NQUEENS_SUPPRESS_NAMES = /^(cols|diag1|diag2|col|res|result|results|solutions|backtrack)$/i;

const isNQueens2DMatrix = (arr) => {
  if (!Array.isArray(arr) || arr.length < 2) return false;
  const n = arr.length;
  return arr.every(row =>
    Array.isArray(row) &&
    row.length === n &&
    row.every(cell => cell === '.' || cell === 'Q')
  );
};

const is1DPrimitive = (arr) => Array.isArray(arr) && arr.length > 0 && !Array.isArray(arr[0]) && arr.every(v => typeof v !== 'object' || v === null);

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const getActiveRowCol = (locals) => {
  // 1. Prioritize neighbor/next coordinates (The cell being checked)
  const pairs = [
    ['nr', 'nc'], ['nx', 'ny'], ['new_r', 'new_c'],
    ['r', 'c'], ['row', 'col'], ['i', 'j'],
    // Numbered variants for multi-traveler/multi-agent grid problems
    // (e.g. Cherry Pickup's two simultaneous travelers r1/c1 and r2/c2).
    // NOTE: this only surfaces ONE position — whichever pair matches first —
    // not both simultaneously. See computeCursors() below for genuine
    // multi-cursor support driven by vizSpec.pointers.
    ['r1', 'c1'], ['r2', 'c2'],
  ];
  for (const [rName, cName] of pairs) {
    if (typeof locals[rName] === 'number' && typeof locals[cName] === 'number') {
      return [locals[rName], locals[cName]];
    }
  }
  return [null, null];
};

// ─────────────────────────────────────────────────────────────────────────────
//  MULTI-CURSOR SUPPORT — for grid problems with more than one simultaneous
//  position of interest (e.g. Cherry Pickup's two travelers). Two ways in:
//  1. A vizSpec's `pointers` entries opt in by sharing a `pairId`: one
//     row-axis and one col-axis entry with the same pairId become ONE
//     named cursor. Takes priority when present — carries explicit colors.
//  2. AUTO-DETECTION (fallback, always runs): scans locals directly for
//     numbered position pairs — r1/c1, r2/c2, r3/c3, row1/col1, row2/col2,
//     etc. — with zero dependency on any library/vizSpec configuration at
//     all. This exists specifically so multi-cursor rendering works from
//     TracerWorker.js alone, without requiring problemLibrary.js to be
//     perfectly in sync on every deploy — the single biggest source of
//     "why isn't this showing up" friction in practice.
// ─────────────────────────────────────────────────────────────────────────────
const CURSOR_AUTO_PALETTE = ['#2563eb', '#dc2626', '#16a34a', '#9333ea', '#d97706'];

const autoDetectNumberedCursors = (locals) => {
  const groups = {};
  for (const key of Object.keys(locals)) {
    // Matches r1, c1, row1, col1, r2, col2, etc. — a row/col-ish prefix
    // followed by a digit suffix that pairs them into one cursor.
    const m = key.match(/^(r|row|c|col)(\d+)$/i);
    if (!m) continue;
    const [, prefix, num] = m;
    const isRow = /^r(ow)?$/i.test(prefix);
    groups[num] ??= {};
    if (isRow) groups[num].rowVar = key; else groups[num].colVar = key;
  }
  const cursors = [];
  let colorIdx = 0;
  // Sorted numerically so traveler 1 always gets the same color as traveler 2, etc.
  for (const num of Object.keys(groups).sort((a, b) => Number(a) - Number(b))) {
    const g = groups[num];
    if (!g.rowVar || !g.colVar) continue; // only a real pair counts as a cursor
    const row = locals[g.rowVar];
    const col = locals[g.colVar];
    if (typeof row === 'number' && typeof col === 'number') {
      cursors.push({
        pairId: `auto${num}`, row, col,
        color: CURSOR_AUTO_PALETTE[colorIdx % CURSOR_AUTO_PALETTE.length],
        label: `Position ${num}`,
      });
      colorIdx++;
    }
  }
  return cursors;
};

const computeCursors = (vizSpec, locals) => {
  const ptrDefs = vizSpec?.pointers ?? [];
  const groups = {};
  for (const p of ptrDefs) {
    if (!p.pairId) continue;
    groups[p.pairId] ??= {};
    if (p.axis === 'row') groups[p.pairId].rowVar = p.variable;
    if (p.axis === 'col') groups[p.pairId].colVar = p.variable;
    if (p.color) groups[p.pairId].color = p.color;
    if (p.label) groups[p.pairId].label = p.label;
  }
  const cursors = [];
  for (const [pairId, g] of Object.entries(groups)) {
    const row = locals[g.rowVar];
    const col = locals[g.colVar];
    if (typeof row === 'number' && typeof col === 'number') {
      cursors.push({ pairId, row, col, color: g.color ?? '#f59e0b', label: g.label ?? pairId });
    }
  }
  // If the vizSpec didn't produce any cursors (missing pairId config, no
  // vizSpec at all, or a stale/un-synced library entry), fall back to
  // auto-detecting numbered position variables directly from the code.
  if (cursors.length >= 2) return cursors;
  const auto = autoDetectNumberedCursors(locals);
  return auto.length >= 2 ? auto : cursors;
};

const parseGridCondition = (lineNum, codeLines, varName, resolved, locals) => {
  let condText = codeLines[(lineNum || 1) - 1] || '';
  if (!/^\s*(if|while|elif)\b/i.test(condText)) return null;

  let fullText = condText;
  let lookahead = 0;
  let openP = (fullText.match(/\(/g) || []).length;
  let closedP = (fullText.match(/\)/g) || []).length;

  // 1. Piece together multi-line conditions wrapped in parentheses
  while (openP > closedP && lookahead < 4) {
    lookahead++;
    fullText += ' ' + (codeLines[(lineNum || 1) - 1 + lookahead] || '').trim();
    openP = (fullText.match(/\(/g) || []).length;
    closedP = (fullText.match(/\)/g) || []).length;
  }

  // 2. Peek into the block to determine intent (Guard vs Positive)
  let bodyText = '';
  for (let i = 1; i <= 3; i++) {
    let peek = codeLines[(lineNum || 1) - 1 + lookahead + i];
    if (peek) {
        if (/^\s*(if|while|elif|for|def)\b/i.test(peek) && i > 1) break; // Reached nested block
        bodyText += ' ' + peek;
    }
  }
  
  // If the block breaks/returns/continues, it's a Guard. Otherwise, it's Positive/Passing.
  const isGuard = /\b(return|continue|break)\b/i.test(bodyText) || /\b(return|continue|break)\b/i.test(fullText);

  let condBody = fullText
    .replace(/^\s*(if|elif|while)\s*\(?/i, '')
    .replace(/\)?\s*:?\s*\{?\s*(return.*|continue.*|break.*)?$/i, '')
    .replace(/\s+/g, ' ')
    .trim();

  let finalResult = null;
  const safeVar = escapeRegex(varName);

  // 3. Attempt direct cell-value evaluation (e.g. grid[nr][nc] == 0)
  const eqPattern = new RegExp(`\\b${safeVar}\\s*\\[\\s*([a-zA-Z_]\\w*)\\s*\\]\\s*\\[\\s*([a-zA-Z_]\\w*)\\s*\\]\\s*(==|!=)\\s*['"]?([\\w.]+)['"]?`);
  const eqMatch = condBody.match(eqPattern);
  if (eqMatch) {
     const [, idx1Name, idx2Name, op, literalRaw] = eqMatch;
     const idx1 = locals[idx1Name], idx2 = locals[idx2Name];
     if (typeof idx1 === 'number' && typeof idx2 === 'number' && resolved[idx1]) {
         const cellVal = resolved[idx1][idx2];
         let lit = literalRaw;
         if (/^true$/i.test(lit)) lit = true;
         else if (/^false$/i.test(lit)) lit = false;
         finalResult = op === '==' ? String(cellVal) === String(lit) : String(cellVal) !== String(lit);
     }
  }

  return { kind: finalResult !== null ? 'evaluated' : 'unknown', result: finalResult, isGuard, checkRow: null, checkCol: null, text: condBody };
};

const buildHashMap = (resolved, bucketCount = 8, activeKey = null) => {
  if (!resolved || typeof resolved !== 'object' || Array.isArray(resolved)) return null;

  const entries = Object.entries(resolved).map(([key, value]) => {
    let h = 0;
    const s = String(key);
    for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % bucketCount;
    return {
      key, value: typeof value === 'object' ? JSON.stringify(value) : String(value),
      bucket: h, isActive: key === activeKey, isNew: false,
    };
  });
  return { entries, bucketCount, activeKey };
};

self.onmessage = async (e) => {
  const { url, payload, aiMetadata } = e.data;
  const aiType = aiMetadata?.type;

  // ── Full AI context (vizSpec drives precise routing; legacy `type` is fallback) ──
  const vizSpec          = aiMetadata?.vizSpec ?? null;
  const aiPrimaryVar     = vizSpec?.primary?.variable ?? aiMetadata?.primaryVar ?? null;
  const aiAllVars        = aiMetadata?.allVars ?? [];
  const suppressRecTree  = vizSpec?.primary?.suppressRecursionTree ?? aiMetadata?.suppressRecursionTree ?? false;

  const aiVarRoles = {};
  for (const v of aiAllVars) {
    if (v?.name) aiVarRoles[v.name] = { role: v.role ?? '', isMain: !!v.isMain };
  }
  const isAiPrimary = (varName) => varName === aiPrimaryVar || aiVarRoles[varName]?.isMain === true;

  const codeLines = (payload?.code || '').split('\n');

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    
    if (!response.ok) throw new Error(`Execution failed: HTTP ${response.status}`);

    const result = await response.json();
    const rawTrace = result.trace || result.data?.trace || [];
    if (rawTrace.length === 0) throw new Error('No trace data was generated.');

    const stateHistory = new Map();
    const recursionTree = { id: 'v-root', name: 'Global', children: [], status: 'completed', args: '' };
    let callStackTracker = [recursionTree];
    let callNodeCounter = 0;
    // Carry-forward cache: the last frame where at least one real structure
    // was detected. A persistent object (like a Stack instance living in a
    // module-level variable) never actually disappears between calls into
    // its methods — but per-frame detection can miss it at some steps (e.g.
    // the interpreter snapshot's heap layout shifting between the module
    // frame and a function frame). Rather than flashing to "no structures"
    // and back, once something has been shown it stays visible until a
    // genuinely different non-empty state replaces it.
    let lastNonEmptyStructures = [];
    // Persistent visit-intensity tracker for multi-cursor grid DP problems
    // (Cherry Pickup and similar): counts how many frames traveler A's
    // position (the FIRST cursor pair, e.g. r1/c1) has appeared at, across
    // the ENTIRE trace so far. This is the closest honest 2-D proxy for the
    // otherwise-invisible 3-D memoization state space — cells visited more
    // show up "hotter". Keyed by "row,col", reset per new grid variable name
    // seen (handles multiple test cases / different grid sizes in one run).
    // Latest known DP VALUE per (r1,c1) — not a visit count, the actual
    // computed result. Built from dpMemoLog (real call/return events), so
    // this shows genuine dp(r1,c1,*) results, not a frequency proxy. Reset
    // when the grid's dimensions change (a new test case's grid started).
    const stateValueGrid = {};
    // Tracks how many dpMemoLog entries have already been folded into
    // stateValueGrid, so each frame only processes NEW entries instead of
    // rescanning the whole log every step.
    let dpMemoLogProcessedIdx = 0;
    let lastGridVarForHeatmap = null;
    // Independently-tracked memo log: (state variables at call time) → return
    // value, for every completed call to a function whose parameters match
    // the active vizSpec's pointer variables (e.g. r1/c1/r2 for Cherry
    // Pickup). Built purely by watching call/return events in the trace —
    // NOT by introspecting Python's actual @lru_cache object, which is a
    // C-level cache TracerWorker has no way to read. This gives a genuine,
    // accurate memoization table for DP problems without needing the real
    // cache's internals at all.
    const dpMemoLog = [];

    const normalizedTrace = rawTrace.map((step) => {
      if (step.event === 'call' && step.func_name !== '<module>') {
        const topFrame = step.stack_to_render[step.stack_to_render.length - 1];
        const callLocals = topFrame?.encoded_locals || {};
        const args = Object.entries(callLocals)
          .filter(([k, v]) => typeof v === 'number' || typeof v === 'string')
          .map(([k, v]) => `${v}`).join(',');

        const newNode = { id: `call-${callNodeCounter++}`, name: `${step.func_name}(${args})`, funcName: step.func_name, children: [], status: 'active' };
        callStackTracker[callStackTracker.length - 1].children.push(newNode);
        callStackTracker.push(newNode);

        // If this call's parameters match the active vizSpec's pointer
        // variables (the problem's actual DP state), remember them so the
        // matching return can log a complete (state → result) memo entry.
        // Only require the FIRST paired cursor's row/col (e.g. r1/c1) — not
        // every listed pointer. Some pointers (like c2 = r1+c1-r2) are
        // DERIVED locals computed on the function body's first line, so they
        // genuinely don't exist yet at this 'call' event — requiring all of
        // them meant this check always failed and dpMemoLog stayed empty.
        const ptrDefs = vizSpec?.pointers ?? [];
        const firstPairId = ptrDefs.find((p) => p.pairId)?.pairId ?? null;
        const firstPair = firstPairId
          ? ptrDefs.filter((p) => p.pairId === firstPairId)
          : ptrDefs.slice(0, 2); // fallback: first two listed pointers (row+col)
        const rowVar = firstPair.find((p) => p.axis === 'row')?.variable;
        const colVar = firstPair.find((p) => p.axis === 'col')?.variable;
        if (rowVar && colVar && typeof callLocals[rowVar] === 'number' && typeof callLocals[colVar] === 'number') {
          newNode.dpState = { row: callLocals[rowVar], col: callLocals[colVar] };
        }
      } else if (step.event === 'return' && step.func_name !== '<module>') {
        if (callStackTracker.length > 1) {
          const returnedNode = callStackTracker.pop();
          returnedNode.status = 'completed';
          returnedNode.returnValue = String(step.return_value ?? '');
          if (returnedNode.dpState) {
            dpMemoLog.push({ state: returnedNode.dpState, result: step.return_value, callOrder: dpMemoLog.length });
          }
        }
      }

      const currentTreeSnapshot = JSON.parse(JSON.stringify(recursionTree));

      const frame = {
        line: step.line ?? null, stdout: step.stdout ?? '', stack_to_render: step.stack_to_render ?? [],
        heap: step.heap ?? {}, event: step.event ?? '', variables: [], structures: [],
        vizSpec, // attached so PolymorphicRouter can use it even without a live prop
      };

      const rootNodes = currentTreeSnapshot.children;
      // Only push the recursion tree when there is GENUINE recursion — i.e.
      // the SAME function name reappears along a root-to-node call path
      // (direct: A→A, or indirect/mutual: A→B→A). Merely having a nested
      // call (e.g. pop() calling the helper is_empty()) is NOT recursion —
      // it's just normal function composition, and must never trigger this
      // engine. Checking "does any node have children" was not enough,
      // since almost any real program has ordinary non-recursive helper
      // calls that create exactly that shape.
      const hasSelfRecursion = (node, ancestorNames) => {
        if (ancestorNames.has(node.funcName)) return true;
        const next = new Set(ancestorNames);
        next.add(node.funcName);
        return (node.children || []).some((child) => hasSelfRecursion(child, next));
      };
      const hasGenuineRecursion = rootNodes.some((root) => hasSelfRecursion(root, new Set()));
      if (!suppressRecTree && hasGenuineRecursion) {
        frame.structures.push({
          id: 'recursion_trace', type: 'RECURSION_TREE', name: 'Call Stack Tree',
          data: { tree: rootNodes.length === 1 ? rootNodes[0] : currentTreeSnapshot }
        });
      }

      const locals = {};
      for (const f of frame.stack_to_render) {
        if (f.encoded_locals) Object.assign(locals, f.encoded_locals);
      }

      // ── Surface instance attributes (self.stack, self.queue, etc.) ──────────
      // Custom class-based data structures (a user-written Stack/Queue/LinkedList
      // class) keep their actual container as an ATTRIBUTE on `self`, not as a
      // top-level local variable. The detection loop below only ever looks at
      // top-level locals by name, so `self.stack` was completely invisible —
      // "self" doesn't match STACK_NAMES, and the list living inside the
      // instance was never reached. This flattens one level: for any local
      // that resolves to an INSTANCE/CLASS object, its named attributes get
      // injected as if they were ordinary top-level locals, so the EXISTING
      // STACK_NAMES/QUEUE_NAMES/etc. matching below picks them up unchanged.
      for (const [, rawVal] of Object.entries({ ...locals })) {
        if (!Array.isArray(rawVal) || rawVal[0] !== 'REF') continue;
        const refObj = frame.heap[rawVal[1]];
        if (!refObj || typeof refObj[0] !== 'string') continue;
        if (!refObj[0].startsWith('INSTANCE') && !refObj[0].startsWith('CLASS')) continue;

        for (let i = 2; i < refObj.length; i++) {
          const prop = refObj[i];
          if (!Array.isArray(prop) || prop.length !== 2 || typeof prop[0] !== 'string') continue;
          const [attrName, attrRawVal] = prop;
          // Don't clobber a genuine top-level local of the same name.
          if (locals[attrName] !== undefined) continue;
          locals[attrName] = attrRawVal;
        }
      }

      // ── Step narration: one plain-English sentence per frame, template-based ──
      const lineText = codeLines[(step.line ?? 1) - 1] ?? '';
      frame.membershipCondition = parseMembershipCondition(lineText, locals, frame.heap);
      frame.narration = buildNarration(lineText, locals, frame.membershipCondition);

      const pointers = [];
      for (const [key, val] of Object.entries(locals)) {
        if (/^(dir|dirs|directions)$/i.test(key)) continue;
        if (typeof val === 'number' && /^(i|j|k|l|r|left|right|low|high|mid|idx|index|ptr|curr|pos|row|col|x|y|n|m|start|end|fast|slow|top|bot|head|tail)$/i.test(key)) {
          pointers.push(val);
        }

        let displayVal = String(val);
        if (Array.isArray(val) && val[0] === 'REF') displayVal = `ref(@${val[1]})`;
        else if (typeof val === 'string') displayVal = `"${val}"`;
        else if (val === null) displayVal = 'null';
        else if (Array.isArray(val)) displayVal = '[...]';

        const resolved = resolveDeep(val, frame.heap);
        if (Array.isArray(resolved) && resolved.length > 8) continue;
        frame.variables.push({ name: key, value: displayVal });
      }

      const seenRefs = new Set();
      const emittedNames = new Set();

      for (const [varName, rawVal] of Object.entries(locals)) {
        if (/^(dir|dirs|directions|moves|dx|dy|delta)$/i.test(varName)) continue;
        // Test-harness bookkeeping — never the algorithm's actual data, just
        // the outer wrapper running multiple cases (this project's test
        // harnesses consistently use these names). Without this, a variable
        // like `test_cases` (a list of (grid, expected) tuples) happens to be
        // array-of-arrays shaped after resolveDeep and gets mistaken for a
        // genuine 2D grid by the generic MATRIX heuristic below, appearing as
        // an irrelevant auxiliary box alongside the real algorithm's grid.
        if (/^(test_cases|tests|test_data|results|expected|got|status)$/i.test(varName)) continue;
        if (frame._isNQueens && NQUEENS_SUPPRESS_NAMES.test(varName)) continue;

        const isQueueName = QUEUE_NAMES.test(varName);
        const aiWantsQueue = aiType === "QUEUE";
        const isStackName = STACK_NAMES.test(varName);
        const aiWantsStack = aiType === "STACK";
        const isDequeName = DEQUE_NAMES.test(varName);
        const aiWantsDeque = aiType === "DEQUE";
        const isDSUName = DSU_NAMES.test(varName);
        const aiWantsDSU = aiType === "DSU";       
        const isSegTreeName = SEG_TREE_NAMES.test(varName);
        const aiWantsSegTree = aiType === "SEGMENT_TREE" || aiType === "FENWICK_TREE";
        const isTrieName = TRIE_NAMES.test(varName);
        const aiWantsTrie = aiType === "TRIE";
        const aiWantsSort = aiType === "SORTING";
        const isNQueensName = NQUEENS_BOARD_NAMES.test(varName);
        const aiWantsNQueens = aiType === "N_QUEENS";

        const isReservedName = isQueueName || aiWantsQueue || isStackName || aiWantsStack || isDequeName || aiWantsDeque || isDSUName || aiWantsDSU || isSegTreeName || aiWantsSegTree || isTrieName || aiWantsTrie || aiWantsSort || isNQueensName || aiWantsNQueens;

        if (!isReservedName && Array.isArray(rawVal) && rawVal[0] === 'REF') {
          const refId = rawVal[1];
          if (seenRefs.has(refId)) continue;
          const obj = frame.heap[refId];
          if (!obj) continue;

          if (getProp(obj, 'left') !== undefined || getProp(obj, 'right') !== undefined || getProp(obj, 'children') !== undefined) {
            const tree = buildTree(rawVal, frame.heap);
            if (tree) {
              const activeNodes = [];
              for (const [, pVal] of Object.entries(locals)) {
                if (Array.isArray(pVal) && pVal[0] === 'REF') activeNodes.push(String(pVal[1]));
              }
              frame.structures.push({ id: varName, type: 'TREE', name: varName, data: { tree, activeNodes } });
              seenRefs.add(refId);
              emittedNames.add(varName);
            }
            continue;
          }

          if (getProp(obj, 'next') !== undefined) {
            const ll = buildLinkedList(rawVal, frame.heap);
            if (ll.nodes.length > 0) {
              for (const [, pVal] of Object.entries(locals)) {
                if (Array.isArray(pVal) && pVal[0] === 'REF') {
                  const aid = String(pVal[1]);
                  ll.nodes.forEach(n => { if (n.id === aid) n.isActive = true; });
                  ll.edges.forEach(ed => { if (ed.source === aid) ed.isActive = true; });
                }
              }
              frame.structures.push({ id: varName, type: 'LINKED_LIST', name: varName, data: ll });
              seenRefs.add(refId);
              emittedNames.add(varName);
            }
            continue;
          }
        }

        if (Array.isArray(rawVal) && rawVal[0] === 'REF' && !emittedNames.has(varName)) {
          const refObj = frame.heap[rawVal[1]];
          const isContainerInstance = refObj && Array.isArray(refObj) && (typeof refObj[0] === 'string') && (refObj[0].startsWith('INSTANCE') || refObj[0].startsWith('CLASS'));

          if (isContainerInstance) {
            const extractInternalArray = () => {
              for (let i = 2; i < refObj.length; i++) {
                if (Array.isArray(refObj[i]) && refObj[i].length === 2) {
                  const v = resolveDeep(refObj[i][1], frame.heap);
                  if (Array.isArray(v)) return v; 
                }
              }
              const directElements = [];
              for (let i = 2; i < refObj.length; i++) {
                 if (Array.isArray(refObj[i]) && refObj[i][0] === 'REF') directElements.push(resolveDeep(refObj[i], frame.heap));
                 else if (!Array.isArray(refObj[i])) directElements.push(refObj[i]);
              }
              // ── Fallback: PythonTutor gave us only a repr() string (deque, etc.) ──
              // Parse it into real elements instead of showing raw text as one item.
              if (directElements.length === 1 && typeof directElements[0] === 'string') {
                const parsed = parsePythonContainerRepr(directElements[0]);
                if (parsed !== null) return parsed;
              }
              return directElements;
            };

            if (isDequeName || aiWantsDeque) {
              const innerItems = extractInternalArray();
              const history = stateHistory.get(varName) || { array: [], objs: [] };
              const stableArr = generateStableArray(innerItems, history.objs);
              stateHistory.set(varName, { array: [...innerItems], objs: stableArr });
              frame.structures.push({ id: varName, type: 'DEQUE', name: varName, data: { array: stableArr, activeIndices: [], narration: frame.narration, condition: frame.membershipCondition } });
              emittedNames.add(varName);
              continue;
            }

            if (isQueueName || aiWantsQueue) {
              const innerItems = extractInternalArray();
              const history = stateHistory.get(varName) || { array: [], objs: [] };
              const stableArr = generateStableArray(innerItems, history.objs);
              stateHistory.set(varName, { array: [...innerItems], objs: stableArr });
              frame.structures.push({ id: varName, type: 'QUEUE', name: varName, data: { array: stableArr, activeIndices: [], frontIndex: 0, rearIndex: stableArr.length - 1, narration: frame.narration, condition: frame.membershipCondition } });
              emittedNames.add(varName);
              continue;
            }

            if (isStackName || aiWantsStack) {
              const innerItems = extractInternalArray();
              const history = stateHistory.get(varName) || { array: [], objs: [] };
              const stableArr = generateStableArray(innerItems, history.objs);
              stateHistory.set(varName, { array: [...innerItems], objs: stableArr });
              frame.structures.push({ id: varName, type: 'STACK', name: varName, data: { array: stableArr, activeIndices: [], topIndex: stableArr.length - 1, narration: frame.narration, condition: frame.membershipCondition } });
              emittedNames.add(varName);
              continue;
            }
          }
        }

        const isGraphName = /^(graph|adj|adjacency|g|edges|neighbors)$/i.test(varName);
        const aiWantsGraph = aiType === "GRAPH";

        if ((isGraphName || aiWantsGraph) && !emittedNames.has(varName)) {
          const graphData = buildGraph(varName, rawVal, frame.heap);
          if (graphData) {
            frame.structures.push({ id: varName, type: 'GRAPH', name: varName, data: graphData });
            emittedNames.add(varName);
            continue;
          }
        }

        const resolved = resolveDeep(rawVal, frame.heap);
        if (emittedNames.has(varName)) continue;

        const isDict = (Array.isArray(rawVal) && rawVal[0] === 'DICT') ||
          (Array.isArray(rawVal) && rawVal[0] === 'REF' && Array.isArray(frame.heap[rawVal[1]]) && frame.heap[rawVal[1]][0] === 'DICT') ||
          (typeof resolved === 'object' && !Array.isArray(resolved) && resolved !== null);

        if (isDict && MAP_NAMES.test(varName)) {
          const mapData = buildHashMap(resolved, 8, null);
          if (mapData && mapData.entries.length > 0) {
            frame.structures.push({ id: varName, type: 'HASH_MAP', name: varName, data: mapData });
            emittedNames.add(varName);
            continue;
          }
        }

        if (!Array.isArray(resolved)) continue;

        if (resolved.length > 0 && Array.isArray(resolved[0])) {
          const aiWantsNQHere = aiType === "N_QUEENS";
          if ((NQUEENS_BOARD_NAMES.test(varName) || aiWantsNQHere) && isNQueens2DMatrix(resolved)) {
            const n = resolved.length;
            const boardArr = resolved.map(row => {
              const qIdx = row.indexOf('Q');
              return qIdx >= 0 ? qIdx : -1;
            });
            const cRow = typeof locals['row'] === 'number' ? locals['row'] : null;
            const cCol = typeof locals['col'] === 'number' ? locals['col']
                       : typeof locals['c']   === 'number' ? locals['c']
                       : typeof locals['j']   === 'number' ? locals['j'] : null;
            const placedCount = boardArr.filter(v => v >= 0).length;
            frame.structures.push({
              id: varName, type: 'N_QUEENS', name: varName,
              data: {
                board: boardArr, n,
                checkRow: cRow, checkCol: cCol,
                placedCount,
                statusText: cRow !== null ? `Row ${cRow}: Checking col ${cCol ?? '—'}...` : '',
              }
            });
            stateHistory.set(varName, { matrix: JSON.parse(JSON.stringify(resolved)) });
            emittedNames.add(varName);
            frame._isNQueens = true;
            continue;
          }

          const history = stateHistory.get(varName) || { matrix: [] };
          const changed = [];
          for (let r = 0; r < resolved.length; r++) {
            for (let c = 0; c < (resolved[r] ?? []).length; c++) {
              if (history.matrix[r] !== undefined && JSON.stringify(resolved[r][c]) !== JSON.stringify(history.matrix[r]?.[c])) changed.push(`${r},${c}`);
            }
          }
          if (typeof locals['i'] === 'number' && typeof locals['j'] === 'number') changed.push(`${locals['i']},${locals['j']}`);
          if (typeof locals['r'] === 'number' && typeof locals['c'] === 'number') changed.push(`${locals['r']},${locals['c']}`);
          if (typeof locals['row'] === 'number' && typeof locals['col'] === 'number') changed.push(`${locals['row']},${locals['col']}`);

          // Generic condition logic invoked here
          const condition = parseGridCondition(step.line, codeLines, varName, resolved, locals);
          const [activeR, activeC] = getActiveRowCol(locals);
          const checkRow = condition?.checkRow ?? activeR;
          const checkCol = condition?.checkCol ?? activeC;
          const cursors = computeCursors(vizSpec, locals);

          // ── DP coverage heatmap ──────────────────────────────────────────
          // For multi-cursor grid DP problems, the real state space being
          // explored (r1,c1,r2) is 3-D and can't be shown directly. This
          // tracks how many frames traveler A's (r1,c1) position has been
          // active at, across the whole trace — the closest honest 2-D proxy
          // for "how much of the DP has explored this region". Reset when
          // the grid's dimensions change (a new test case's grid started).
          // Track the REAL computed dp() result for each (r1,c1) — sourced
          // from dpMemoLog, which pairs each call's OWN state (captured at
          // the 'call' event, before the body runs) with its own return
          // value (captured at the matching 'return'). This is reliable
          // regardless of what the current frame's locals look like — unlike
          // reading live cursor position at a 'return' step, which can't
          // distinguish "the callee that just finished" from "the caller
          // it's returning into" when both are dp() frames with their own
          // r1/c1. -Infinity (blocked/out-of-bounds) is stored as null so
          // the UI can render it distinctly from a genuine computed 0.
          let dpValueMatrix = null;
          if (cursors.length >= 1) {
            const gridKey = `${varName}:${resolved.length}`;
            if (lastGridVarForHeatmap !== gridKey) {
              for (const k of Object.keys(stateValueGrid)) delete stateValueGrid[k];
              lastGridVarForHeatmap = gridKey;
              dpMemoLogProcessedIdx = 0;
            }
            // Fold any NEW dpMemoLog entries (added since we last checked)
            // into stateValueGrid — cheap, only processes what's new.
            for (; dpMemoLogProcessedIdx < dpMemoLog.length; dpMemoLogProcessedIdx++) {
              const entry = dpMemoLog[dpMemoLogProcessedIdx];
              if (typeof entry.result === 'number' && isFinite(entry.result)) {
                stateValueGrid[`${entry.state.row},${entry.state.col}`] = entry.result;
              }
            }
            dpValueMatrix = resolved.map((row, r) => row.map((_, c) => stateValueGrid[`${r},${c}`] ?? null));
          }

          // Decision arrows: whenever the current line is a recursive call
          // trying a "+1" offset (the classic "look at the next state" DP
          // pattern), draw down/right arrows from each active cursor toward
          // the cells it's comparing — the same visual idea as dp[i-1][j] /
          // dp[i][j-1] arrows in simpler 2-D DP, generalized to N cursors.
          const isEvaluatingChoice = /\bdp\s*\([^)]*\+\s*1/.test(codeLines[(step.line ?? 1) - 1] ?? '');
          const decisionArrows = isEvaluatingChoice
            ? cursors.flatMap((c) => [
                { fromRow: c.row, fromCol: c.col, dr: 1, dc: 0, color: c.color },
                { fromRow: c.row, fromCol: c.col, dr: 0, dc: 1, color: c.color },
              ])
            : [];

          // Shared-timestep detection: Cherry Pickup-style "two synchronized
          // travelers" problems reduce their state space by observing that
          // both travelers always take the same number of total steps, so
          // r1+c1 == r2+c2 == t at every point. Surfacing this diagonal band
          // is the actual "aha" that makes the 3-D state reduction click —
          // far more useful than just watching two dots move independently.
          // Derived DIRECTLY from resolved cursor positions (row+col of the
          // first cursor) rather than depending on the source code happening
          // to assign a variable literally named `t` — many equally-correct
          // implementations compute c2 inline (c2 = r1+c1-r2) without ever
          // introducing an intermediate `t` at all, which silently broke
          // this under the old name-based check.
          const sharedTimestep = cursors.length >= 2 ? cursors[0].row + cursors[0].col : null;

          frame.structures.push({
            id: varName, type: 'MATRIX', name: varName,
            data: {
              matrix: resolved,
              activeIndices: [...new Set(changed)],
              checkRow, checkCol,
              // Prefer the grid-specific guard condition (bounds/blocked
              // checks parsed straight from source) — it's precise and
              // problem-aware. Fall back to the generic membership condition
              // only when this line isn't a grid guard at all. These used to
              // collide as duplicate object keys (last one silently won),
              // which meant the grid condition was being discarded in favor
              // of membershipCondition (usually null) — degrading the HUD to
              // a generic "Visiting (r,c)" instead of e.g. "Thorn cell".
              condition: condition ?? frame.membershipCondition,
              narration: frame.narration,
              vizSpec,     // ← propagate spec for semantic coloring
              cursors,     // ← multi-cursor positions, e.g. two Cherry Pickup travelers
              sharedTimestep, // ← r+c diagonal band both travelers always share
              decisionArrows, // ← down/right arrows showing the max() choice being evaluated
              // Running count of ALL function calls made so far in this trace
              // (callNodeCounter, declared once per trace, incremented on
              // every 'call' event regardless of function name). For a
              // memoized recursive DP like Cherry Pickup — where the *only*
              // repeatedly-called function is dp() — this is a close, honest
              // proxy for "how many distinct subproblem states have been
              // explored so far", which is otherwise invisible since
              // @lru_cache wraps its internal cache in a C-level object that
              // can't be introspected the way a plain dict can.
              // Recent memo entries — real (state → result) pairs built from
              // watching actual call/return events, most recent last. Capped
              // to keep the panel readable; the full log still grows for the
              // whole trace, this is just what's shown at any given step.
              recentDPCalls: dpMemoLog.slice(-12),
              callsSoFar: callNodeCounter,
            }
          });
          stateHistory.set(varName, { ...history, matrix: JSON.parse(JSON.stringify(resolved)) });
          emittedNames.add(varName);

          // Push the real DP values as their own auxiliary structure — a
          // second, genuinely different grid (actual computed dp() results,
          // not visit counts) that directly shows "what value did this
          // subproblem resolve to", distinct from the original problem grid.
          if (dpValueMatrix) {
            frame.structures.push({
              id: `${varName}__dp_coverage`, type: 'MATRIX', name: `${varName}__dp_coverage`,
              data: { matrix: dpValueMatrix, activeIndices: [], isDPValues: true, heatmapLabel: 'dp value', decisionArrows, sideBySide: true }
            });
          }
          continue;
        }

        if (resolved.length === 0 && !isReservedName && !HEAP_NAMES.test(varName)) continue;

        const history = stateHistory.get(varName) || { array: [], objs: [] };
        const changed = [];

        for (let i = 0; i < Math.max(resolved.length, history.array.length); i++) {
          if (JSON.stringify(resolved[i]) !== JSON.stringify(history.array[i])) changed.push(i);
        }
        // NOTE: pointer-index highlighting (i/j/left/right/etc.) is intentionally
        // NOT applied here. This block feeds HEAP/STACK/DEQUE/QUEUE below — none
        // of which are accessed by arbitrary numeric index (they use push/pop/
        // append/popleft). Highlighting "index i is active" for a stack made no
        // sense and could misfire on every frame whenever ANY unrelated pointer
        // variable happened to share scope (e.g. an outer loop's counter merged
        // in from frame.stack_to_render) — causing constant, unwarranted
        // highlight "refresh" even when the stack's actual content was untouched.
        // The generic ARRAY path further below has its own proper pointer-chip
        // system via detectPointers(), which is index-aware and semantically
        // correct for plain arrays (binary search, sliding window, etc.).

        const stableArr = generateStableArray(resolved, history.objs);
        stateHistory.set(varName, { array: [...resolved], objs: stableArr });

        if (HEAP_NAMES.test(varName)) {
          const isMin = /min/i.test(varName);
          frame.structures.push({ id: varName, type: 'HEAP', name: varName, data: { array: stableArr, activeIndices: [...new Set(changed)], heapType: isMin ? 'MIN' : 'MAX', narration: frame.narration, condition: frame.membershipCondition } });
          emittedNames.add(varName);
          continue;
        }
        if (isDequeName || aiWantsDeque) {
          frame.structures.push({ id: varName, type: 'DEQUE', name: varName, data: { array: stableArr, activeIndices: [...new Set(changed)], narration: frame.narration, condition: frame.membershipCondition } });
          emittedNames.add(varName);
          continue;
        }
        if (isStackName || aiWantsStack) {
          frame.structures.push({ id: varName, type: 'STACK', name: varName, data: { array: stableArr, activeIndices: [...new Set(changed)], topIndex: stableArr.length - 1, narration: frame.narration, condition: frame.membershipCondition } });
          emittedNames.add(varName);
          continue;
        }
        if (isQueueName || aiWantsQueue) {
          frame.structures.push({ id: varName, type: 'QUEUE', name: varName, data: { array: stableArr, activeIndices: [...new Set(changed)], frontIndex: 0, rearIndex: stableArr.length - 1, narration: frame.narration, condition: frame.membershipCondition } });
          emittedNames.add(varName);
          continue;
        }
        if (isDSUName || aiWantsDSU) {
          frame.structures.push({ id: varName, type: 'DSU', name: varName, data: { array: stableArr, activeIndices: [...new Set(changed)] } });
          emittedNames.add(varName);
          continue;
        }
        if (isSegTreeName || aiWantsSegTree) {
          frame.structures.push({ id: varName, type: 'SEGMENT_TREE', name: varName, data: { array: stableArr, activeIndices: [...new Set(changed)] } });
          emittedNames.add(varName);
          continue;
        }
        if (aiWantsSort) {
          frame.structures.push({ id: varName, type: 'SORTING', name: varName, data: { array: stableArr, activeIndices: [...new Set(changed)] } });
          emittedNames.add(varName);
          continue;
        }
        if (SET_NAMES.test(varName) && is1DPrimitive(resolved)) {
          frame.structures.push({ id: varName, type: 'SET', name: varName, data: { array: stableArr, activeIndices: [...new Set(changed)] } });
          emittedNames.add(varName);
          continue;
        }

        // ── Resolve referenceLines from vizSpec against THIS frame's locals ──
        // A reference line can be either:
        //  - a flat scalar (e.g. `leftMax` is a running int) → one horizontal line
        //  - an array (e.g. `maxL[]` precomputed per-index) → a stepped line
        const resolvedReferenceLines = (vizSpec?.referenceLines ?? []).map((ref) => {
          const raw = locals[ref.variable];
          if (typeof raw === 'number') {
            return { label: ref.label ?? ref.variable, color: ref.color, value: raw };
          }
          const resolvedArr = resolveDeep(raw, frame.heap);
          if (Array.isArray(resolvedArr) && resolvedArr.every((n) => typeof n === 'number' || typeof n?.value === 'number')) {
            return { label: ref.label ?? ref.variable, color: ref.color, values: resolvedArr.map((n) => (typeof n === 'number' ? n : n.value)) };
          }
          return null;
        }).filter(Boolean);

        frame.structures.push({
          id: varName, type: 'ARRAY', name: varName,
          data: {
            array: stableArr,
            activeIndices: [...new Set(changed)],
            pointers: detectPointers(locals, stableArr.length),
            regions: detectRegions(locals, stableArr.length),
            narration: frame.narration,
            condition: frame.membershipCondition,
            resolvedReferenceLines,
          }
        });
        emittedNames.add(varName);
      }

      if (frame.structures.some(s => s.type === 'N_QUEENS')) {
        frame.structures = frame.structures.filter(s =>
          s.type === 'N_QUEENS' ||
          (s.type !== 'RECURSION_TREE' && s.type !== 'SET' && s.type !== 'ARRAY' && !NQUEENS_SUPPRESS_NAMES.test(s.name))
        );
      }

      // ── Tag the AI-identified primary variable so PolymorphicRouter's rank
      //    system gives it top priority (rank 10) regardless of structure type ──
      if (aiPrimaryVar || aiAllVars.length) {
        frame.structures = frame.structures.map(s => isAiPrimary(s.name) ? { ...s, aiPrimary: true } : s);
      }

      // ── Carry-forward: never flash to "no structures" once something has
      // been shown. A persistent object doesn't stop existing just because
      // this particular frame's local-variable snapshot didn't happen to
      // re-expose it (e.g. stepping from inside a method back out to the
      // module-level loop). Strip per-step highlighting (activeIndices/
      // narration/condition) from the carried snapshot — those describe
      // "what just changed", and nothing new actually changed at a step that
      // had no fresh detection of its own — but keep the content itself
      // visible so the visualization stays continuous instead of blinking.
      if (frame.structures.length === 0 && lastNonEmptyStructures.length > 0) {
        frame.structures = lastNonEmptyStructures.map((s) => ({
          ...s,
          data: { ...s.data, activeIndices: [], narration: null, condition: null },
        }));
      } else if (frame.structures.length > 0) {
        lastNonEmptyStructures = frame.structures;
      }

      return frame;
    });

    self.postMessage({ type: 'SUCCESS', payload: { trace: normalizedTrace } });
  } catch (err) {
    self.postMessage({ type: 'ERROR', message: err.message });
  }
};