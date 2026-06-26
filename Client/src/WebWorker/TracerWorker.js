const getProp = (obj, propName) => {
  if (!obj) return undefined;
  if (!Array.isArray(obj)) return obj[propName];

  // INSTANCE / CLASS encoding: ["INSTANCE", "ClassName", ["propName", val], ...]
  if (typeof obj[0] === 'string' && (obj[0].startsWith('INSTANCE') || obj[0].startsWith('CLASS'))) {
    for (let i = 2; i < obj.length; i++) {
      if (Array.isArray(obj[i]) && obj[i][0] === propName) return obj[i][1];
    }
  }
  // DICT encoding: ["DICT", ["key", val], ...]
  if (obj[0] === 'DICT') {
    for (let i = 1; i < obj.length; i++) {
      if (Array.isArray(obj[i]) && obj[i][0] === propName) return obj[i][1];
    }
  }
  return undefined;
};

// ── HELPER: deeply resolve REFs and strip Python Tutor type tags ─────────────
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
        // Convert DICT pairs to a plain JS object
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

// ── HELPER: stable IDs for array elements (preserves identity across frames) ─
const generateStableArray = (rawArray, prevObjs) =>
  rawArray.map((val, idx) =>
    prevObjs[idx]?.value === val
      ? prevObjs[idx]
      : { id: `v-${Math.random().toString(36).slice(2, 8)}`, value: val }
  );

// ── HELPER: check if a raw python-tutor value is a DICT/HashMap ─────────────
const isPythonDict = (raw) =>
  Array.isArray(raw) &&
  (raw[0] === 'DICT' ||
    (raw[0] === 'REF' /* handled below */));

// ── DS BUILDERS ──────────────────────────────────────────────────────────────

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

// ── STACK detection ───────────────────────────────────────────────────────────
const STACK_NAMES = /^(stack|stk|st|s|path|calls|callstack|dfs_stack)$/i;

// ── QUEUE detection ───────────────────────────────────────────────────────────
const QUEUE_NAMES = /^(queue|q|bfs_queue|bfs|fifo|deque|dq|level|levels|tovisit)$/i;

// ── HEAP detection ────────────────────────────────────────────────────────────
const HEAP_NAMES  = /^(heap|pq|priority_queue|min_heap|max_heap|h|hq)$/i;

// ── HASH_MAP detection ────────────────────────────────────────────────────────
const MAP_NAMES   = /^(map|hashmap|dict|counter|freq|frequency|memo|cache|seen|visited|dp|lookup|table|cnt|count|char_count|window|record)$/i;

// ── SET detection ─────────────────────────────────────────────────────────────
const SET_NAMES   = /^(seen|visited|added|used|s|st|found|instack|onstack)$/i;

// ── Determine if a resolved value is a plain 1-D primitive array ──────────────
const is1DPrimitive = (arr) =>
  Array.isArray(arr) &&
  arr.length > 0 &&
  !Array.isArray(arr[0]) &&
  arr.every(v => typeof v !== 'object' || v === null);

// ── Build HASH_MAP data from a resolved dict/object ──────────────────────────
const buildHashMap = (resolved, bucketCount = 8, activeKey = null) => {
  if (!resolved || typeof resolved !== 'object' || Array.isArray(resolved)) return null;

  const entries = Object.entries(resolved).map(([key, value]) => {
    let h = 0;
    const s = String(key);
    for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % bucketCount;
    return {
      key,
      value: typeof value === 'object' ? JSON.stringify(value) : String(value),
      bucket: h,
      isActive: key === activeKey,
      isNew: false,
    };
  });

  return { entries, bucketCount, activeKey };
};

// ── Build SET data ────────────────────────────────────────────────────────────
const buildSetData = (resolved) => {
  const items = Array.isArray(resolved) ? resolved : Object.keys(resolved ?? {});
  return items.map((val, idx) => ({
    id: `set-${idx}`,
    value: String(val),
  }));
};

// ── MAIN WORKER ───────────────────────────────────────────────────────────────
self.onmessage = async (e) => {
  const { url, payload } = e.data;

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
          .map(([k, v]) => `${v}`)
          .join(',');

        const newNode = {
          id: `call-${callNodeCounter++}`,
          name: `${step.func_name}(${args})`,
          children: [],
          status: 'active'
        };
        
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
        line:            step.line ?? null,
        stdout:          step.stdout ?? '',
        stack_to_render: step.stack_to_render ?? [],
        heap:            step.heap ?? {},
        event:           step.event ?? '',
        variables:       [],
        structures:      [],
      };

      const rootNodes = currentTreeSnapshot.children;
      const hasNestedCalls = rootNodes.some(node => node.children && node.children.length > 0);
      const hasMultipleTopCalls = rootNodes.length > 1;

      if (rootNodes.length > 0 && (hasNestedCalls || hasMultipleTopCalls)) {
        frame.structures.push({
          id: 'recursion_trace',
          type: 'RECURSION_TREE',
          name: 'Call Stack Tree',
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

        if (
          typeof val === 'number' &&
          /^(i|j|k|l|r|left|right|low|high|mid|idx|index|ptr|curr|pos|row|col|x|y|n|m|start|end|fast|slow|top|bot|head|tail)$/i.test(key)
        ) {
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

      // ── 2. Detect & classify each variable ─────────────────────────────────
      const seenRefs = new Set();
      const emittedNames = new Set();

      for (const [varName, rawVal] of Object.entries(locals)) {
        if (/^(dir|dirs|directions|moves|dx|dy|delta)$/i.test(varName)) continue;

        // 👇 NEW: Guard to prevent named Queues/Stacks from being parsed as Trees
        const isNamedQueueOrStack = QUEUE_NAMES.test(varName) || STACK_NAMES.test(varName);

        // ── REF-based structures: Tree, LinkedList ────────────────────────────
        // We now check !isNamedQueueOrStack before allowing it into the Tree/LinkedList blocks
        if (!isNamedQueueOrStack && Array.isArray(rawVal) && rawVal[0] === 'REF') {
          const refId = rawVal[1];
          if (seenRefs.has(refId)) continue;

          const obj = frame.heap[refId];
          if (!obj) continue;

          // Tree?
          if (
            getProp(obj, 'left') !== undefined ||
            getProp(obj, 'right') !== undefined ||
            getProp(obj, 'children') !== undefined
          ) {
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

          // Linked List?
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

        // ── GRAPH (adjacency list variable name check) ────────────────────────
        if (/^(graph|adj|adjacency|g|edges|neighbors)$/i.test(varName) && !emittedNames.has(varName)) {
          const graphData = buildGraph(varName, rawVal, frame.heap);
          if (graphData) {
            frame.structures.push({ id: varName, type: 'GRAPH', name: varName, data: graphData });
            emittedNames.add(varName);
            continue;
          }
        }

        // ── Resolve to JS value for remaining checks ──────────────────────────
        const resolved = resolveDeep(rawVal, frame.heap);
        if (emittedNames.has(varName)) continue;

        // ── HASH_MAP ──────────────────────────────────────────────────────────
        const isDict =
          (Array.isArray(rawVal) && rawVal[0] === 'DICT') ||
          (Array.isArray(rawVal) && rawVal[0] === 'REF' &&
            Array.isArray(frame.heap[rawVal[1]]) && frame.heap[rawVal[1]][0] === 'DICT') ||
          (typeof resolved === 'object' && !Array.isArray(resolved) && resolved !== null);

        if (isDict && MAP_NAMES.test(varName)) {
          const mapData = buildHashMap(resolved, 8, null);
          if (mapData && mapData.entries.length > 0) {
            frame.structures.push({ id: varName, type: 'HASH_MAP', name: varName, data: mapData });
            emittedNames.add(varName);
            continue;
          }
        }

        // ── Remaining array-based structures ──────────────────────────────────
        if (!Array.isArray(resolved)) continue;

        // ── MATRIX ────────────────────────────────────────────────────────────
        if (resolved.length > 0 && Array.isArray(resolved[0])) {
          const history = stateHistory.get(varName) || { matrix: [] };
          const changed = [];

          for (let r = 0; r < resolved.length; r++) {
            for (let c = 0; c < (resolved[r] ?? []).length; c++) {
              if (
                history.matrix[r] !== undefined &&
                JSON.stringify(resolved[r][c]) !== JSON.stringify(history.matrix[r]?.[c])
              ) {
                changed.push(`${r},${c}`);
              }
            }
          }

          if (typeof locals['i'] === 'number' && typeof locals['j'] === 'number') changed.push(`${locals['i']},${locals['j']}`);
          if (typeof locals['r'] === 'number' && typeof locals['c'] === 'number') changed.push(`${locals['r']},${locals['c']}`);
          if (typeof locals['row'] === 'number' && typeof locals['col'] === 'number') changed.push(`${locals['row']},${locals['col']}`);

          frame.structures.push({
            id: varName, type: 'MATRIX', name: varName,
            data: { matrix: resolved, activeIndices: [...new Set(changed)] },
          });
          stateHistory.set(varName, { ...history, matrix: JSON.parse(JSON.stringify(resolved)) });
          emittedNames.add(varName);
          continue;
        }

        // ── 1-D arrays: STACK / QUEUE / HEAP / SET / ARRAY ──────────────────
        if (resolved.length === 0 && !STACK_NAMES.test(varName) && !QUEUE_NAMES.test(varName) && !HEAP_NAMES.test(varName)) continue;

        const history = stateHistory.get(varName) || { array: [], objs: [] };
        const changed = [];

        for (let i = 0; i < Math.max(resolved.length, history.array.length); i++) {
          if (JSON.stringify(resolved[i]) !== JSON.stringify(history.array[i])) changed.push(i);
        }
        pointers.forEach(ptr => { if (ptr >= 0 && ptr < resolved.length) changed.push(ptr); });

        const stableArr = generateStableArray(resolved, history.objs);
        stateHistory.set(varName, { array: [...resolved], objs: stableArr });

        // ── HEAP ──────────────────────────────────────────────────────────────
        if (HEAP_NAMES.test(varName)) {
          const isMin = /min/i.test(varName);
          frame.structures.push({
            id: varName, type: 'HEAP', name: varName,
            data: {
              array: stableArr,
              activeIndices: [...new Set(changed)],
              heapType: isMin ? 'MIN' : 'MAX',
            },
          });
          emittedNames.add(varName);
          continue;
        }

        // ── STACK ─────────────────────────────────────────────────────────────
        if (STACK_NAMES.test(varName)) {
          frame.structures.push({
            id: varName, type: 'STACK', name: varName,
            data: {
              array: stableArr,
              activeIndices: [...new Set(changed)],
              topIndex: stableArr.length - 1,
            },
          });
          emittedNames.add(varName);
          continue;
        }

        // ── QUEUE ─────────────────────────────────────────────────────────────
        if (QUEUE_NAMES.test(varName)) {
          frame.structures.push({
            id: varName, type: 'QUEUE', name: varName,
            data: {
              array: stableArr,
              activeIndices: [...new Set(changed)],
              frontIndex: 0,
              rearIndex:  stableArr.length - 1,
            },
          });
          emittedNames.add(varName);
          continue;
        }

        // ── SET ───────────────────────────────────────────────────────────────
        if (SET_NAMES.test(varName) && is1DPrimitive(resolved)) {
          frame.structures.push({
            id: varName, type: 'SET', name: varName,
            data: {
              array: stableArr,
              activeIndices: [...new Set(changed)],
            },
          });
          emittedNames.add(varName);
          continue;
        }

        // ── ARRAY (fallback) ──────────────────────────────────────────────────
        frame.structures.push({
          id: varName, type: 'ARRAY', name: varName,
          data: {
            array: stableArr,
            activeIndices: [...new Set(changed)],
          },
        });
        emittedNames.add(varName);
      }

      return frame;
    });

    self.postMessage({ type: 'SUCCESS', payload: { trace: normalizedTrace } });
  } catch (err) {
    self.postMessage({ type: 'ERROR', message: err.message });
  }
};