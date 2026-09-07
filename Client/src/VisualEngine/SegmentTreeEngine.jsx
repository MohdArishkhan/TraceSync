import React from 'react';
import { motion } from 'framer-motion';

// SegmentTreeEngine - Visualizes Segment Trees for range queries
// data shape: {
//   nodes: [{id, value, rangeStart, rangeEnd, leftChild, rightChild, isLeaf}],
//   activeNodes: [...],
//   queryRange: {start, end},
//   narration: "..."
// }

export default function SegmentTreeEngine({ data }) {
  const nodes = data?.nodes ?? [];
  const activeNodes = data?.activeNodes ?? [];
  const queryRange = data?.queryRange ?? null;
  const narration = data?.narration ?? null;

  if (!nodes.length) {
    return (
      <div className="flex items-center justify-center w-full h-full text-slate-500 text-sm font-mono">
        Waiting for segment tree data…
      </div>
    );
  }

  const activeSet = new Set(activeNodes.map(String));

  // Build tree structure for layout
  const nodeMap = {};
  nodes.forEach(node => {
    nodeMap[node.id] = node;
  });

  // Calculate tree layout positions
  const getNodePosition = (nodeId, depth = 0, offset = 0, width = 1200) => {
    const node = nodeMap[nodeId];
    if (!node) return null;

    const y = 60 + depth * 100;
    const x = offset + width / 2;

    return { x, y, depth };
  };

  // Build layout recursively
  const layout = {};
  const buildLayout = (nodeId, depth = 0, left = 0, right = 1200) => {
    const node = nodeMap[nodeId];
    if (!node) return;

    const mid = (left + right) / 2;
    layout[nodeId] = { x: mid, y: 60 + depth * 100, depth };

    if (node.leftChild !== undefined && nodeMap[node.leftChild]) {
      buildLayout(node.leftChild, depth + 1, left, mid);
    }
    if (node.rightChild !== undefined && nodeMap[node.rightChild]) {
      buildLayout(node.rightChild, depth + 1, mid, right);
    }
  };

  // Find root (node with no parent or id=0)
  const root = nodes.find(n => n.id === 0) || nodes[0];
  if (root) buildLayout(root.id);

  const maxDepth = Math.max(...Object.values(layout).map(p => p.depth), 0);
  const svgHeight = 60 + maxDepth * 100 + 120;
  const svgWidth = 1200;

  return (
    <div className="flex flex-col w-full h-full overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 flex items-center justify-between px-4 py-2 border-b border-slate-700/30 bg-slate-950/50">
        <span className="px-2.5 py-0.5 rounded-md bg-blue-500/10 border border-blue-500/25 text-[10px] font-mono text-blue-400 tracking-widest uppercase">
          Segment Tree · {nodes.length} nodes
        </span>
        {queryRange && (
          <span className="text-[10px] font-mono text-cyan-400">
            Query Range: [{queryRange.start}, {queryRange.end}]
          </span>
        )}
        {data?.statusText && (
          <span className="text-[11px] font-mono text-amber-300">{data.statusText}</span>
        )}
      </div>

      {/* Tree Visualization */}
      <div className="flex-1 flex items-start justify-center overflow-auto p-4">
        <svg width={svgWidth} height={svgHeight} viewBox={`0 0 ${svgWidth} ${svgHeight}`}>
          <defs>
            <filter id="segment-glow">
              <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {/* Draw edges */}
          {nodes.map((node) => {
            const pos = layout[node.id];
            if (!pos) return null;

            const leftChild = nodeMap[node.leftChild];
            const rightChild = nodeMap[node.rightChild];

            return (
              <g key={`edges-${node.id}`}>
                {leftChild && layout[leftChild.id] && (
                  <line
                    x1={pos.x}
                    y1={pos.y + 25}
                    x2={layout[leftChild.id].x}
                    y2={layout[leftChild.id].y - 5}
                    stroke={activeSet.has(String(leftChild.id)) ? '#3b82f6' : '#475569'}
                    strokeWidth={activeSet.has(String(leftChild.id)) ? 2.5 : 1.5}
                  />
                )}
                {rightChild && layout[rightChild.id] && (
                  <line
                    x1={pos.x}
                    y1={pos.y + 25}
                    x2={layout[rightChild.id].x}
                    y2={layout[rightChild.id].y - 5}
                    stroke={activeSet.has(String(rightChild.id)) ? '#3b82f6' : '#475569'}
                    strokeWidth={activeSet.has(String(rightChild.id)) ? 2.5 : 1.5}
                  />
                )}
              </g>
            );
          })}

          {/* Draw nodes */}
          {nodes.map((node) => {
            const pos = layout[node.id];
            if (!pos) return null;

            const isActive = activeSet.has(String(node.id));
            const isLeaf = node.isLeaf || (!node.leftChild && !node.rightChild);
            const inQueryRange = queryRange &&
              node.rangeStart !== undefined &&
              node.rangeEnd !== undefined &&
              node.rangeStart >= queryRange.start &&
              node.rangeEnd <= queryRange.end;

            return (
              <g key={node.id}>
                <motion.rect
                  x={pos.x - 40}
                  y={pos.y - 20}
                  width={80}
                  height={40}
                  rx={6}
                  fill={
                    isActive
                      ? '#1e3a8a'
                      : inQueryRange
                      ? '#065f46'
                      : isLeaf
                      ? '#1e293b'
                      : '#0f172a'
                  }
                  stroke={
                    isActive
                      ? '#3b82f6'
                      : inQueryRange
                      ? '#10b981'
                      : isLeaf
                      ? '#475569'
                      : '#334155'
                  }
                  strokeWidth={isActive || inQueryRange ? 2.5 : 1.5}
                  filter={isActive ? 'url(#segment-glow)' : 'none'}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3, delay: pos.depth * 0.1 }}
                />

                {/* Value */}
                <text
                  x={pos.x}
                  y={pos.y}
                  textAnchor="middle"
                  fill={isActive || inQueryRange ? '#e0f2fe' : '#cbd5e1'}
                  fontSize="13"
                  fontWeight="700"
                  fontFamily="'JetBrains Mono', monospace"
                >
                  {node.value !== undefined ? node.value : '?'}
                </text>

                {/* Range label */}
                {node.rangeStart !== undefined && node.rangeEnd !== undefined && (
                  <text
                    x={pos.x}
                    y={pos.y + 13}
                    textAnchor="middle"
                    fill="#64748b"
                    fontSize="9"
                    fontFamily="monospace"
                  >
                    [{node.rangeStart}..{node.rangeEnd}]
                  </text>
                )}

                {/* Leaf indicator */}
                {isLeaf && (
                  <text
                    x={pos.x}
                    y={pos.y + 35}
                    textAnchor="middle"
                    fill="#475569"
                    fontSize="8"
                    fontWeight="600"
                    fontFamily="monospace"
                  >
                    LEAF
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Legend */}
      <div className="flex-shrink-0 flex items-center gap-4 px-4 py-2 border-t border-slate-700/25 bg-slate-950/40">
        <div className="flex items-center gap-1.5">
          <div className="w-6 h-5 rounded border-2 border-blue-500 bg-blue-900/50" />
          <span className="text-[9px] font-mono text-slate-500">Active node</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-6 h-5 rounded border-2 border-emerald-500 bg-emerald-900/50" />
          <span className="text-[9px] font-mono text-slate-500">In query range</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-6 h-5 rounded border border-slate-600 bg-slate-800" />
          <span className="text-[9px] font-mono text-slate-500">Leaf node</span>
        </div>
      </div>

      {/* Narration */}
      {narration && (
        <div className="flex-shrink-0 flex items-start gap-2.5 px-5 py-2 border-t border-amber-500/15 bg-amber-500/5">
          <span className="text-amber-500/60 text-sm mt-0.5 flex-shrink-0">✎</span>
          <span className="text-[12.5px] font-medium text-amber-200/90 leading-snug">{narration}</span>
        </div>
      )}
    </div>
  );
}
