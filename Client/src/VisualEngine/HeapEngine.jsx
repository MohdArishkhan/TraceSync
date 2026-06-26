import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// data shape:
// {
//   array: [{id, value}, ...],   // heap array (index 0 = root)
//   activeIndices: [i, j, ...],  // nodes being compared / swapped
//   heapType: 'MIN' | 'MAX'      // optional, defaults MAX
// }

function buildTree(arr) {
  if (!arr.length) return null;
  const nodes = arr.map((item, i) => ({
    id:    item.id ?? `h-${i}`,
    value: item.value ?? item,
    idx:   i,
  }));
  return nodes;
}

// Compute (x, y) positions for a binary tree laid out by index
function treePositions(n) {
  const pos = [];
  const NODE_W = 52, LEVEL_H = 72;
  const levels = Math.ceil(Math.log2(n + 1));

  for (let i = 0; i < n; i++) {
    const level   = Math.floor(Math.log2(i + 1));
    const posInLv = i - (Math.pow(2, level) - 1);
    const nodesInLv = Math.pow(2, level);
    const totalW = Math.pow(2, levels - 1) * NODE_W;
    const spacing = totalW / nodesInLv;
    pos.push({
      x: spacing * posInLv + spacing / 2,
      y: level * LEVEL_H + 32,
    });
  }
  return pos;
}

export default function HeapEngine({ data }) {
  const rawItems   = data?.array        ?? [];
  const active     = new Set((data?.activeIndices ?? []).map(String));
  const heapType   = data?.heapType     ?? 'MAX';

  const nodes = useMemo(() => buildTree(rawItems), [rawItems]);
  const pos   = useMemo(() => treePositions(rawItems.length), [rawItems.length]);

  if (!rawItems.length) {
    return (
      <div className="flex items-center justify-center w-full h-full text-slate-500 text-sm font-mono">
        Heap is empty
      </div>
    );
  }

  const n      = rawItems.length;
  const levels = Math.ceil(Math.log2(n + 1));
  const totalW = Math.pow(2, levels - 1) * 52 + 60;
  const totalH = levels * 72 + 60;

  // Max value for bar heights
  const numericVals = rawItems.map(it => Number(it.value ?? it)).filter(v => !isNaN(v));
  const maxVal = numericVals.length ? Math.max(...numericVals, 1) : 1;

  return (
    <div className="flex flex-col w-full h-full overflow-auto">

      {/* ── Header badge ── */}
      <div className="flex items-center gap-2 px-4 pt-3 pb-1 flex-shrink-0">
        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
          heapType === 'MIN'
            ? 'text-cyan-400 border-cyan-500/40 bg-cyan-500/10'
            : 'text-orange-400 border-orange-500/40 bg-orange-500/10'
        }`}>
          {heapType}-HEAP
        </span>
        <span className="text-[10px] font-mono text-slate-500">
          root&nbsp;=&nbsp;
          <span className="text-indigo-300">{rawItems[0]?.value ?? rawItems[0]}</span>
        </span>
      </div>

      <div className="flex flex-1 min-h-0 gap-0">

        {/* ── LEFT: SVG tree ── */}
        <div className="flex-1 flex items-center justify-center overflow-hidden p-3">
          <svg
            width="100%"
            height="100%"
            viewBox={`-10 0 ${totalW} ${totalH}`}
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              <marker id="heap-arrow" markerWidth="7" markerHeight="5" refX="7" refY="2.5" orient="auto">
                <polygon points="0 0,7 2.5,0 5" fill="#334155"/>
              </marker>
            </defs>

            {/* Edges */}
            {nodes.map((node, i) => {
              const leftChild  = 2 * i + 1;
              const rightChild = 2 * i + 2;
              return (
                <g key={`edges-${i}`}>
                  {leftChild < n && (
                    <line
                      x1={pos[i].x} y1={pos[i].y + 20}
                      x2={pos[leftChild].x} y2={pos[leftChild].y - 20}
                      stroke="#334155" strokeWidth="1.5"
                      markerEnd="url(#heap-arrow)"
                    />
                  )}
                  {rightChild < n && (
                    <line
                      x1={pos[i].x} y1={pos[i].y + 20}
                      x2={pos[rightChild].x} y2={pos[rightChild].y - 20}
                      stroke="#334155" strokeWidth="1.5"
                      markerEnd="url(#heap-arrow)"
                    />
                  )}
                </g>
              );
            })}

            {/* Nodes */}
            {nodes.map((node, i) => {
              const isActive = active.has(String(i));
              const isRoot   = i === 0;
              return (
                <g
                  key={node.id}
                  transform={`translate(${pos[i].x},${pos[i].y})`}
                  style={{ transition: 'transform 0.3s ease' }}
                >
                  {isActive && (
                    <circle r="26" fill="none" stroke="#818cf8" strokeWidth="2.5" opacity="0.5"/>
                  )}
                  <circle
                    r="20"
                    fill={isActive ? '#4f46e5' : isRoot ? '#1e3a5f' : '#1e293b'}
                    stroke={isActive ? '#818cf8' : isRoot ? '#3b82f6' : '#334155'}
                    strokeWidth={isRoot ? '2' : '1.5'}
                  />
                  {/* Index label inside node */}
                  <text
                    dy="-6"
                    textAnchor="middle"
                    fill={isActive ? '#e0e7ff' : '#e2e8f0'}
                    fontSize="12"
                    fontWeight="700"
                    fontFamily="'JetBrains Mono', monospace"
                    style={{ pointerEvents: 'none', userSelect: 'none' }}
                  >
                    {node.value}
                  </text>
                  <text
                    dy="9"
                    textAnchor="middle"
                    fill={isActive ? '#c7d2fe' : '#475569'}
                    fontSize="8"
                    fontFamily="monospace"
                    style={{ pointerEvents: 'none', userSelect: 'none' }}
                  >
                    [{i}]
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* ── RIGHT: underlying array as bars ── */}
        <div className="w-20 flex flex-col items-center justify-end p-3 gap-1 border-l border-slate-700/50 flex-shrink-0">
          <span className="text-[9px] font-mono text-slate-600 mb-1 self-start">array</span>
          <AnimatePresence mode="popLayout" initial={false}>
            {[...rawItems].reverse().map((item, revIdx) => {
              const realIdx  = rawItems.length - 1 - revIdx;
              const isActive = active.has(String(realIdx));
              const val      = Number(item.value ?? item);
              const pct      = isNaN(val) ? 30 : Math.max(12, (val / maxVal) * 100);

              return (
                <motion.div
                  key={item.id ?? `bar-${realIdx}`}
                  layout
                  initial={{ opacity: 0, scaleY: 0 }}
                  animate={{ opacity: 1, scaleY: 1 }}
                  exit={{ opacity: 0, scaleY: 0 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                  className="w-full flex items-center gap-1"
                  style={{ originY: 1 }}
                >
                  <span className="text-[8px] font-mono text-slate-600 w-4 text-right flex-shrink-0">
                    {realIdx}
                  </span>
                  <div
                    className={`h-5 rounded-sm flex items-center justify-end pr-1 transition-all duration-300 ${
                      isActive
                        ? 'bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)]'
                        : realIdx === 0
                          ? 'bg-blue-700/70'
                          : 'bg-slate-700'
                    }`}
                    style={{ width: `${pct}%`, minWidth: '14px' }}
                  >
                    <span className="text-[8px] font-mono text-white/80 truncate">
                      {item.value ?? item}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* Swap indicator */}
      {active.size >= 2 && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-shrink-0 flex items-center justify-center gap-2 py-1.5 text-[10px] font-mono text-yellow-400 bg-yellow-400/5 border-t border-yellow-400/20"
        >
          <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse"/>
          swapping indices [{[...active].join('] ↔ [')}]
        </motion.div>
      )}
    </div>
  );
}
