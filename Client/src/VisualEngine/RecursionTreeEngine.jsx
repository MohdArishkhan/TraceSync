import React from 'react';
import { motion } from 'framer-motion';

// RecursionTreeEngine - Visualizes function call stack as a tree
// data shape: {
//   nodes: [{ id, label, args, returnValue, depth, isActive, isReturning }],
//   edges: [{ from, to }],
//   narration: "..."
// }

export default function RecursionTreeEngine({ data }) {
  const nodes = data?.nodes ?? [];
  const edges = data?.edges ?? [];
  const narration = data?.narration ?? null;

  if (!nodes.length) {
    return (
      <div className="flex items-center justify-center w-full h-full text-slate-500 text-sm font-mono">
        Waiting for recursion tree data…
      </div>
    );
  }

  // Calculate tree layout
  const maxDepth = Math.max(...nodes.map(n => n.depth ?? 0), 0);
  const depthGroups = Array.from({ length: maxDepth + 1 }, () => []);
  nodes.forEach(node => {
    const depth = node.depth ?? 0;
    depthGroups[depth].push(node);
  });

  const NODE_W = 120;
  const NODE_H = 60;
  const LEVEL_H = 100;
  const LEVEL_W_MIN = 1200;

  const maxNodesInLevel = Math.max(...depthGroups.map(g => g.length), 1);
  const svgWidth = Math.max(LEVEL_W_MIN, maxNodesInLevel * (NODE_W + 40));
  const svgHeight = (maxDepth + 1) * LEVEL_H + 100;

  // Assign positions
  const positions = {};
  depthGroups.forEach((group, depth) => {
    const spacing = svgWidth / (group.length + 1);
    group.forEach((node, idx) => {
      positions[node.id] = {
        x: spacing * (idx + 1),
        y: 50 + depth * LEVEL_H
      };
    });
  });

  return (
    <div className="flex flex-col w-full h-full overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 flex items-center justify-between px-4 py-2 border-b border-slate-700/30 bg-slate-950/50">
        <span className="px-2.5 py-0.5 rounded-md bg-pink-500/10 border border-pink-500/25 text-[10px] font-mono text-pink-400 tracking-widest uppercase">
          Recursion Tree · {nodes.length} calls · depth {maxDepth}
        </span>
        {data?.statusText && (
          <span className="text-[11px] font-mono text-amber-300">{data.statusText}</span>
        )}
      </div>

      {/* Tree Visualization */}
      <div className="flex-1 flex items-start justify-center overflow-auto p-4">
        <svg
          width={svgWidth}
          height={svgHeight}
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          style={{ minWidth: `${svgWidth}px` }}
        >
          <defs>
            <marker id="arrow-recursion" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
              <polygon points="0 0, 8 3, 0 6" fill="#64748b" />
            </marker>
            <marker id="arrow-active" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
              <polygon points="0 0, 8 3, 0 6" fill="#ec4899" />
            </marker>
          </defs>

          {/* Draw edges */}
          {edges.map((edge, idx) => {
            const from = positions[edge.from];
            const to = positions[edge.to];
            if (!from || !to) return null;

            const isActiveEdge = nodes.find(n => n.id === edge.to)?.isActive;

            return (
              <line
                key={idx}
                x1={from.x}
                y1={from.y + NODE_H / 2}
                x2={to.x}
                y2={to.y - 5}
                stroke={isActiveEdge ? '#ec4899' : '#475569'}
                strokeWidth={isActiveEdge ? 2 : 1.5}
                markerEnd={isActiveEdge ? 'url(#arrow-active)' : 'url(#arrow-recursion)'}
              />
            );
          })}

          {/* Draw nodes */}
          {nodes.map((node) => {
            const pos = positions[node.id];
            if (!pos) return null;

            const isActive = node.isActive;
            const isReturning = node.isReturning;

            return (
              <g key={node.id}>
                <motion.rect
                  x={pos.x - NODE_W / 2}
                  y={pos.y}
                  width={NODE_W}
                  height={NODE_H}
                  rx={8}
                  fill={isActive ? '#831843' : isReturning ? '#064e3b' : '#1e293b'}
                  stroke={isActive ? '#ec4899' : isReturning ? '#10b981' : '#334155'}
                  strokeWidth={isActive || isReturning ? 2 : 1.5}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  style={{
                    filter: isActive ? 'drop-shadow(0 0 8px rgba(236, 72, 153, 0.4))' :
                            isReturning ? 'drop-shadow(0 0 8px rgba(16, 185, 129, 0.3))' : 'none'
                  }}
                />

                {/* Function name */}
                <text
                  x={pos.x}
                  y={pos.y + 20}
                  textAnchor="middle"
                  fill={isActive ? '#fce7f3' : isReturning ? '#d1fae5' : '#e2e8f0'}
                  fontSize="12"
                  fontWeight="700"
                  fontFamily="'JetBrains Mono', monospace"
                >
                  {node.label ?? `call-${node.id}`}
                </text>

                {/* Arguments */}
                {node.args && (
                  <text
                    x={pos.x}
                    y={pos.y + 36}
                    textAnchor="middle"
                    fill="#94a3b8"
                    fontSize="10"
                    fontFamily="monospace"
                  >
                    ({String(node.args)})
                  </text>
                )}

                {/* Return value */}
                {node.returnValue !== undefined && (
                  <text
                    x={pos.x}
                    y={pos.y + 52}
                    textAnchor="middle"
                    fill="#34d399"
                    fontSize="9"
                    fontWeight="600"
                    fontFamily="monospace"
                  >
                    → {String(node.returnValue)}
                  </text>
                )}

                {/* Active indicator */}
                {isActive && (
                  <text
                    x={pos.x}
                    y={pos.y - 5}
                    textAnchor="middle"
                    fill="#ec4899"
                    fontSize="9"
                    fontWeight="700"
                    fontFamily="monospace"
                  >
                    ACTIVE
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
          <div className="w-4 h-4 rounded border-2 border-pink-500 bg-pink-900/50" />
          <span className="text-[9px] font-mono text-slate-500">Currently executing</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded border-2 border-emerald-500 bg-emerald-900/50" />
          <span className="text-[9px] font-mono text-slate-500">Returning</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded border border-slate-600 bg-slate-800" />
          <span className="text-[9px] font-mono text-slate-500">Completed</span>
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
