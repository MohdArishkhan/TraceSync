import { useMemo } from 'react';

/**
 * Universal Engine Adapter
 * Normalizes and adapts various data structures to work with any engine
 * Makes engines flexible and universal for all DSA problem types
 */

/**
 * Detects the type of data structure from raw data
 */
export const detectDataStructureType = (data) => {
  if (!data) return 'UNKNOWN';

  // Check for explicit type
  if (data.type) return data.type.toUpperCase();

  // Auto-detect based on structure
  if (data.nodes && Array.isArray(data.nodes)) {
    if (data.parent !== undefined || data.rank !== undefined) return 'DSU';
    if (data.tree || data.nodes.some(n => n.children !== undefined)) return 'TREE';
    if (data.edges) return 'GRAPH';
  }

  if (data.tree && typeof data.tree === 'object') return 'TREE';

  if (data.matrix || (Array.isArray(data.array) && Array.isArray(data.array[0]))) {
    return 'MATRIX';
  }

  if (data.board || data.queens) return 'N_QUEENS';

  if (data.array && Array.isArray(data.array)) {
    // Check if it's a special array type
    if (data.topIndex !== undefined) return 'STACK';
    if (data.frontIndex !== undefined || data.rearIndex !== undefined) return 'QUEUE';
    if (data.heapType) return 'HEAP';
    if (data.entries || data.buckets) return 'HASH_MAP';
    return 'ARRAY';
  }

  return 'UNKNOWN';
};

/**
 * Normalizes data to a consistent format for engines
 */
export const normalizeEngineData = (rawData, detectedType) => {
  if (!rawData) return null;

  const normalized = {
    type: detectedType,
    originalData: rawData,
    ...rawData
  };

  // Ensure activeIndices is always an array
  if (!normalized.activeIndices) {
    normalized.activeIndices = [];
  } else if (!Array.isArray(normalized.activeIndices)) {
    normalized.activeIndices = [normalized.activeIndices];
  }

  // Normalize array data
  if (normalized.array && !Array.isArray(normalized.array)) {
    normalized.array = [normalized.array];
  }

  // Ensure nodes have consistent structure
  if (normalized.nodes && Array.isArray(normalized.nodes)) {
    normalized.nodes = normalized.nodes.map((node, idx) => ({
      id: node.id ?? idx,
      value: node.value ?? node.val ?? node,
      ...node
    }));
  }

  return normalized;
};

/**
 * Validates data compatibility with engine type
 */
export const validateDataForEngine = (data, engineType) => {
  if (!data) return { valid: false, error: 'No data provided' };

  const requiredFields = {
    ARRAY: ['array'],
    MATRIX: ['matrix'],
    TREE: ['tree'],
    GRAPH: ['nodes', 'edges'],
    STACK: ['array'],
    QUEUE: ['array'],
    HEAP: ['array'],
    LINKED_LIST: ['nodes'],
    DSU: ['nodes'],
    HASH_MAP: ['entries'],
    N_QUEENS: ['board'],
    SEGMENT_TREE: ['nodes'],
    RECURSION_TREE: ['nodes']
  };

  const required = requiredFields[engineType];
  if (!required) return { valid: true };

  const missing = required.filter(field => !(field in data));
  if (missing.length > 0) {
    return {
      valid: false,
      error: `Missing required fields for ${engineType}: ${missing.join(', ')}`
    };
  }

  return { valid: true };
};

/**
 * Auto-fills missing data with sensible defaults
 */
export const enrichEngineData = (data, engineType) => {
  const enriched = { ...data };

  // Add default narration if missing
  if (!enriched.narration) {
    enriched.narration = generateDefaultNarration(data, engineType);
  }

  // Add default statusText if missing
  if (!enriched.statusText) {
    enriched.statusText = generateStatusText(data, engineType);
  }

  // Add IDs to array elements if missing
  if (enriched.array && Array.isArray(enriched.array)) {
    enriched.array = enriched.array.map((item, idx) => {
      if (typeof item === 'object' && item !== null) {
        return { id: `item-${idx}`, ...item };
      }
      return { id: `item-${idx}`, value: item };
    });
  }

  // Add positions to graph nodes if missing
  if (engineType === 'GRAPH' && enriched.nodes) {
    enriched.nodes = enriched.nodes.map((node, idx) => ({
      position: node.position || {
        x: 100 + (idx % 5) * 150,
        y: 100 + Math.floor(idx / 5) * 150
      },
      ...node
    }));
  }

  return enriched;
};

/**
 * Generates default narration based on active state
 */
const generateDefaultNarration = (data, type) => {
  const activeCount = data.activeIndices?.length || 0;

  if (activeCount === 0) return null;

  const narrations = {
    ARRAY: `Examining ${activeCount} element${activeCount > 1 ? 's' : ''}`,
    MATRIX: `Visiting cell at position (${data.checkRow ?? '?'}, ${data.checkCol ?? '?'})`,
    TREE: `Traversing ${activeCount} node${activeCount > 1 ? 's' : ''}`,
    GRAPH: `Exploring ${activeCount} node${activeCount > 1 ? 's' : ''}`,
    STACK: activeCount > 0 ? 'Accessing top element' : null,
    QUEUE: activeCount > 0 ? 'Processing front element' : null,
    HEAP: `Examining heap element${activeCount > 1 ? 's' : ''}`,
    LINKED_LIST: 'Traversing linked list',
    DSU: 'Performing union-find operation',
    HASH_MAP: 'Accessing hash table entries',
    N_QUEENS: `Placing queen at row ${data.activeCell?.row ?? '?'}`,
    SEGMENT_TREE: 'Querying segment tree',
    RECURSION_TREE: 'Processing recursive call'
  };

  return narrations[type] || 'Processing data structure';
};

/**
 * Generates status text based on data state
 */
const generateStatusText = (data, type) => {
  const statusGenerators = {
    ARRAY: () => `Array of ${data.array?.length || 0} elements`,
    MATRIX: () => {
      const rows = data.matrix?.length || 0;
      const cols = data.matrix?.[0]?.length || 0;
      return `${rows}×${cols} matrix`;
    },
    TREE: () => {
      const nodeCount = data.nodes?.length || 0;
      return `Binary tree with ${nodeCount} nodes`;
    },
    GRAPH: () => {
      const nodeCount = data.nodes?.length || 0;
      const edgeCount = data.edges?.length || 0;
      return `Graph: ${nodeCount} nodes, ${edgeCount} edges`;
    },
    STACK: () => `Stack size: ${data.array?.length || 0}`,
    QUEUE: () => `Queue size: ${data.array?.length || 0}`,
    HEAP: () => `${data.heapType || 'Min'} heap with ${data.array?.length || 0} elements`,
    LINKED_LIST: () => `List with ${data.nodes?.length || 0} nodes`,
    DSU: () => `${data.nodes?.length || 0} elements in union-find`,
    HASH_MAP: () => `Hash map with ${data.entries?.length || 0} entries`,
    N_QUEENS: () => `${data.n || 0}-Queens problem`,
    SEGMENT_TREE: () => `Segment tree with ${data.nodes?.length || 0} nodes`,
    RECURSION_TREE: () => `Recursion depth: ${Math.max(...(data.nodes?.map(n => n.depth) || [0]))}`
  };

  const generator = statusGenerators[type];
  return generator ? generator() : '';
};

/**
 * React Hook - Universal data adapter
 */
export const useUniversalEngine = (rawData) => {
  const processedData = useMemo(() => {
    const detectedType = detectDataStructureType(rawData);
    const normalized = normalizeEngineData(rawData, detectedType);
    const validation = validateDataForEngine(normalized, detectedType);

    if (!validation.valid) {
      console.warn('Data validation failed:', validation.error);
      return { type: detectedType, data: normalized, error: validation.error };
    }

    const enriched = enrichEngineData(normalized, detectedType);

    return {
      type: detectedType,
      data: enriched,
      valid: true
    };
  }, [rawData]);

  return processedData;
};

/**
 * Transforms data from one format to another (cross-engine compatibility)
 */
export const transformData = (data, fromType, toType) => {
  if (fromType === toType) return data;

  const transformers = {
    'ARRAY_TO_STACK': (d) => ({
      ...d,
      topIndex: d.array.length - 1
    }),
    'ARRAY_TO_QUEUE': (d) => ({
      ...d,
      frontIndex: 0,
      rearIndex: d.array.length - 1
    }),
    'TREE_TO_ARRAY': (d) => ({
      array: flattenTree(d.tree),
      activeIndices: d.activeNodes || []
    }),
    'MATRIX_TO_ARRAY': (d) => ({
      array: d.matrix.flat(),
      activeIndices: d.activeIndices || []
    })
  };

  const key = `${fromType}_TO_${toType}`;
  const transformer = transformers[key];

  return transformer ? transformer(data) : data;
};

/**
 * Helper: Flatten tree to array (BFS order)
 */
const flattenTree = (tree) => {
  if (!tree) return [];
  const result = [];
  const queue = [tree];

  while (queue.length > 0) {
    const node = queue.shift();
    result.push(node.value ?? node.val ?? node.name);

    if (node.children) {
      queue.push(...node.children);
    }
  }

  return result;
};

export default {
  detectDataStructureType,
  normalizeEngineData,
  validateDataForEngine,
  enrichEngineData,
  useUniversalEngine,
  transformData
};
