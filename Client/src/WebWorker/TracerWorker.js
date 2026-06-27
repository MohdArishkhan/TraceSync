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

const generateStableArray = (rawArray, prevObjs) =>
  rawArray.map((val, idx) =>
    prevObjs[idx]?.value === val
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

    nodes.push({ id: String(id), val: String(val), label: String(val), position: { x, y: 200 }, isActive: false });
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
      neighbors.forEach(target => {
        const key = `${id}-${target}`;
        if (!edgeSet.has(key)) {
          edgeSet.add(key);
          edges.push({ id: `e-${id}-${target}`, source: String(id), target: String(target), isActive: false });
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
    ['r', 'c'], ['row', 'col'], ['i', 'j']
  ];
  for (const [rName, cName] of pairs) {
    if (typeof locals[rName] === 'number' && typeof locals[cName] === 'number') {
      return [locals[rName], locals[cName]];
    }
  }
  return [null, null];
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

    const normalizedTrace = rawTrace.map((step) => {
      if (step.event === 'call' && step.func_name !== '<module>') {
        const topFrame = step.stack_to_render[step.stack_to_render.length - 1];
        const args = Object.entries(topFrame?.encoded_locals || {})
          .filter(([k, v]) => typeof v === 'number' || typeof v === 'string')
          .map(([k, v]) => `${v}`).join(',');

        const newNode = { id: `call-${callNodeCounter++}`, name: `${step.func_name}(${args})`, children: [], status: 'active' };
        callStackTracker[callStackTracker.length - 1].children.push(newNode);
        callStackTracker.push(newNode);
      } else if (step.event === 'return' && step.func_name !== '<module>') {
        if (callStackTracker.length > 1) {
          const returnedNode = callStackTracker.pop();
          returnedNode.status = 'completed';
          returnedNode.returnValue = String(step.return_value ?? '');
        }
      }

      const currentTreeSnapshot = JSON.parse(JSON.stringify(recursionTree));

      const frame = {
        line: step.line ?? null, stdout: step.stdout ?? '', stack_to_render: step.stack_to_render ?? [],
        heap: step.heap ?? {}, event: step.event ?? '', variables: [], structures: [],
      };

      const rootNodes = currentTreeSnapshot.children;
      if (rootNodes.length > 0 && (rootNodes.some(n => n.children?.length > 0) || rootNodes.length > 1)) {
        frame.structures.push({
          id: 'recursion_trace', type: 'RECURSION_TREE', name: 'Call Stack Tree',
          data: { tree: rootNodes.length === 1 ? rootNodes[0] : currentTreeSnapshot }
        });
      }

      const locals = {};
      for (const f of frame.stack_to_render) {
        if (f.encoded_locals) Object.assign(locals, f.encoded_locals);
      }

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
              return directElements;
            };

            if (isDequeName || aiWantsDeque) {
              const innerItems = extractInternalArray();
              const history = stateHistory.get(varName) || { array: [], objs: [] };
              const stableArr = generateStableArray(innerItems, history.objs);
              stateHistory.set(varName, { array: [...innerItems], objs: stableArr });
              frame.structures.push({ id: varName, type: 'DEQUE', name: varName, data: { array: stableArr, activeIndices: [] } });
              emittedNames.add(varName);
              continue;
            }

            if (isQueueName || aiWantsQueue) {
              const innerItems = extractInternalArray();
              const history = stateHistory.get(varName) || { array: [], objs: [] };
              const stableArr = generateStableArray(innerItems, history.objs);
              stateHistory.set(varName, { array: [...innerItems], objs: stableArr });
              frame.structures.push({ id: varName, type: 'QUEUE', name: varName, data: { array: stableArr, activeIndices: [], frontIndex: 0, rearIndex: stableArr.length - 1 } });
              emittedNames.add(varName);
              continue;
            }

            if (isStackName || aiWantsStack) {
              const innerItems = extractInternalArray();
              const history = stateHistory.get(varName) || { array: [], objs: [] };
              const stableArr = generateStableArray(innerItems, history.objs);
              stateHistory.set(varName, { array: [...innerItems], objs: stableArr });
              frame.structures.push({ id: varName, type: 'STACK', name: varName, data: { array: stableArr, activeIndices: [], topIndex: stableArr.length - 1 } });
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

          frame.structures.push({
            id: varName, type: 'MATRIX', name: varName,
            data: { matrix: resolved, activeIndices: [...new Set(changed)], checkRow, checkCol, condition }
          });
          stateHistory.set(varName, { ...history, matrix: JSON.parse(JSON.stringify(resolved)) });
          emittedNames.add(varName);
          continue;
        }

        if (resolved.length === 0 && !isReservedName && !HEAP_NAMES.test(varName)) continue;

        const history = stateHistory.get(varName) || { array: [], objs: [] };
        const changed = [];

        for (let i = 0; i < Math.max(resolved.length, history.array.length); i++) {
          if (JSON.stringify(resolved[i]) !== JSON.stringify(history.array[i])) changed.push(i);
        }
        pointers.forEach(ptr => { if (ptr >= 0 && ptr < resolved.length) changed.push(ptr); });

        const stableArr = generateStableArray(resolved, history.objs);
        stateHistory.set(varName, { array: [...resolved], objs: stableArr });

        if (HEAP_NAMES.test(varName)) {
          const isMin = /min/i.test(varName);
          frame.structures.push({ id: varName, type: 'HEAP', name: varName, data: { array: stableArr, activeIndices: [...new Set(changed)], heapType: isMin ? 'MIN' : 'MAX' } });
          emittedNames.add(varName);
          continue;
        }
        if (isDequeName || aiWantsDeque) {
          frame.structures.push({ id: varName, type: 'DEQUE', name: varName, data: { array: stableArr, activeIndices: [...new Set(changed)] } });
          emittedNames.add(varName);
          continue;
        }
        if (isStackName || aiWantsStack) {
          frame.structures.push({ id: varName, type: 'STACK', name: varName, data: { array: stableArr, activeIndices: [...new Set(changed)], topIndex: stableArr.length - 1 } });
          emittedNames.add(varName);
          continue;
        }
        if (isQueueName || aiWantsQueue) {
          frame.structures.push({ id: varName, type: 'QUEUE', name: varName, data: { array: stableArr, activeIndices: [...new Set(changed)], frontIndex: 0, rearIndex: stableArr.length - 1 } });
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

        frame.structures.push({ id: varName, type: 'ARRAY', name: varName, data: { array: stableArr, activeIndices: [...new Set(changed)] } });
        emittedNames.add(varName);
      }

      if (frame.structures.some(s => s.type === 'N_QUEENS')) {
        frame.structures = frame.structures.filter(s =>
          s.type === 'N_QUEENS' ||
          (s.type !== 'RECURSION_TREE' && s.type !== 'SET' && s.type !== 'ARRAY' && !NQUEENS_SUPPRESS_NAMES.test(s.name))
        );
      }

      return frame;
    });

    self.postMessage({ type: 'SUCCESS', payload: { trace: normalizedTrace } });
  } catch (err) {
    self.postMessage({ type: 'ERROR', message: err.message });
  }
};