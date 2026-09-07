import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// HeapEngine - Visualizes Min/Max Heaps with tree structure
// data shape: { array: [...], heapType: 'min'|'max', activeIndices: [...], narration: "..." }

export default function HeapEngine({ data }) {
  const arr = data?.array ?? [];
  const heapType = data?.heapType ?? 'min';
  const activeIndices = data?.activeIndices ?? [];
  const narration = data?.narration ?? null;

  if (!arr.length) {
    return (
      <div className="flex items-center justify-center w-full h-full text-slate-500 text-sm font-mono">
        Waiting for heap data…
      </div>
    );
  }

  const getVal = (item) => item?.value !== undefined ? item.value : item;
  const activeSet = new Set(activeIndices.map(String));

  // Calculate tree layout positions
  const getNodePosition = (index, totalNodes) => {
    const level = Math.floor(Math.log2(index + 1));
    const maxNodesInLevel = Math.pow(2, level);
    const posInLevel = index - (Math.pow(2, level) - 1);

    const y = 60 + level * 90;
    const levelWidth = 800;
    const spacing = levelWidth / (maxNodesInLevel + 1);
    const x = spacing * (posInLevel + 1);

    return { x, y, level };
  };

  const maxLevel = Math.floor(Math.log2(arr.length));
  const svgHeight = 60 + maxLevel * 90 + 100;
  const svgWidth = 900;

  return (
    <div className="flex flex-col w-full h-full overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 flex items-center justify-between px-4 py-2 border-b border-slate-700/30 bg-slate-950/50">
        <span className="px-2.5 py-0.5 rounded-md bg-purple-500/10 border border-purple-500/25 text-[10px] font-mono text-purple-400 tracking-widest uppercase">
          {heapType === 'min' ? 'Min' : 'Max'} Heap · {arr.length} nodes
        </span>
        {data?.statusText && (
          <span className="text-[11px] font-mono text-amber-300">{data.statusText}</span>
        )}
      </div>

      {/* Tree Visualization */}
      <div className="flex-1 flex items-center justify-center overflow-auto p-4">
        <svg width={svgWidth} height={svgHeight} viewBox={`0 0 ${svgWidth} ${svgHeight}`}>
          <defs>
            <filter id="heap-glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {/* Draw edges first (parent to children) */}
          {arr.map((_, idx) => {
            const leftChild = 2 * idx + 1;
            const rightChild = 2 * idx + 2;
            const parent = getNodePosition(idx, arr.length);

            return (
              <g key={`edges-${idx}`}>
                {leftChild < arr.length && (
                  <line
                    x1={parent.x}
                    y1={parent.y}
                    x2={getNodePosition(leftChild, arr.length).x}
                    y2={getNodePosition(leftChild, arr.length).y}
                    stroke={activeSet.has(String(leftChild)) ? '#a78bfa' : '#475569'}
                    strokeWidth={activeSet.has(String(leftChild)) ? 2.5 : 1.5}
                  />
                )}
                {rightChild < arr.length && (
                  <line
                    x1={parent.x}
                    y1={parent.y}
                    x2={getNodePosition(rightChild, arr.length).x}
                    y2={getNodePosition(rightChild, arr.length).y}
                    stroke={activeSet.has(String(rightChild)) ? '#a78bfa' : '#475569'}
                    strokeWidth={activeSet.has(String(rightChild)) ? 2.5 : 1.5}
                  />
                )}
              </g>
            );
          })}

          {/* Draw nodes */}
          {arr.map((item, idx) => {
            const pos = getNodePosition(idx, arr.length);
            const isActive = activeSet.has(String(idx));
            const val = getVal(item);
            const isRoot = idx === 0;

            return (
              <g key={idx}>
                <motion.circle
                  cx={pos.x}
                  cy={pos.y}
                  r={24}
                  fill={isActive ? '#7c3aed' : isRoot ? '#581c87' : '#1e293b'}
                  stroke={isActive ? '#a78bfa' : isRoot ? '#a78bfa' : '#334155'}
                  strokeWidth={isActive ? 2.5 : 1.5}
                  filter={isActive ? 'url(#heap-glow)' : 'none'}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.3, delay: idx * 0.05 }}
                />
                <text
                  x={pos.x}
                  y={pos.y + 5}
                  textAnchor="middle"
                  fill={isActive || isRoot ? '#e0e7ff' : '#cbd5e1'}
                  fontSize="14"
                  fontWeight="700"
                  fontFamily="'JetBrains Mono', monospace"
                >
                  {val}
                </text>
                <text
                  x={pos.x}
                  y={pos.y + 40}
                  textAnchor="middle"
                  fill="#64748b"
                  fontSize="9"
                  fontFamily="monospace"
                >
                  [{idx}]
                </text>
                {isRoot && (
                  <text
                    x={pos.x}
                    y={pos.y - 35}
                    textAnchor="middle"
                    fill="#a78bfa"
                    fontSize="10"
                    fontWeight="700"
                    fontFamily="monospace"
                  >
                    ROOT
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Array representation */}
      <div className="flex-shrink-0 px-4 py-2 border-t border-slate-700/30 bg-slate-950/40">
        <div className="flex items-center gap-1 overflow-x-auto hide-scrollbar">
          <span className="text-[9px] font-mono text-slate-500 mr-2">Array:</span>
          {arr.map((item, idx) => {
            const isActive = activeSet.has(String(idx));
            return (
              <div
                key={idx}
                className={`flex-shrink-0 w-10 h-8 flex items-center justify-center text-[11px] font-mono font-bold rounded border transition-all ${
                  isActive
                    ? 'bg-purple-900/50 border-purple-500 text-purple-200'
                    : 'bg-slate-800 border-slate-600 text-slate-400'
                }`}
              >
                {getVal(item)}
              </div>
            );
          })}
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
