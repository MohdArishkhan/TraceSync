import React from 'react';
import { motion } from 'framer-motion';

// DSUEngine - Visualizes Disjoint Set Union (Union-Find) data structure
// data shape: {
//   nodes: [{id, parent, rank, isRoot}],
//   activeNodes: [...],
//   narration: "..."
// }

export default function DSUEngine({ data }) {
  const nodes = data?.nodes ?? [];
  const activeNodes = data?.activeNodes ?? data?.activeIndices ?? [];
  const narration = data?.narration ?? null;

  if (!nodes.length) {
    return (
      <div className="flex items-center justify-center w-full h-full text-slate-500 text-sm font-mono">
        Waiting for DSU data…
      </div>
    );
  }

  const activeSet = new Set(activeNodes.map(String));

  // Group nodes by their root to visualize sets
  const roots = nodes.filter(n => n.isRoot || n.parent === n.id);
  const sets = {};

  roots.forEach(root => {
    sets[root.id] = { root, children: [] };
  });

  nodes.forEach(node => {
    if (!node.isRoot && node.parent !== node.id) {
      const rootId = node.parent;
      if (sets[rootId]) {
        sets[rootId].children.push(node);
      }
    }
  });

  const setArray = Object.values(sets);
  const NODE_SIZE = 40;
  const SPACING_X = 180;
  const SPACING_Y = 100;

  return (
    <div className="flex flex-col w-full h-full overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 flex items-center justify-between px-4 py-2 border-b border-slate-700/30 bg-slate-950/50">
        <span className="px-2.5 py-0.5 rounded-md bg-orange-500/10 border border-orange-500/25 text-[10px] font-mono text-orange-400 tracking-widest uppercase">
          Disjoint Set Union · {nodes.length} nodes · {setArray.length} sets
        </span>
        {data?.statusText && (
          <span className="text-[11px] font-mono text-amber-300">{data.statusText}</span>
        )}
      </div>

      {/* Forest Visualization */}
      <div className="flex-1 flex items-start justify-center overflow-auto p-6">
        <div className="flex gap-12 flex-wrap justify-center">
          {setArray.map((set, setIdx) => {
            const rootIsActive = activeSet.has(String(set.root.id));
            const totalInSet = 1 + set.children.length;

            return (
              <motion.div
                key={set.root.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: setIdx * 0.1 }}
                className="flex flex-col items-center gap-4"
              >
                {/* Set Label */}
                <div className="px-3 py-1 rounded-full bg-slate-800/50 border border-slate-700/50">
                  <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">
                    Set {setIdx + 1} · {totalInSet} node{totalInSet > 1 ? 's' : ''}
                  </span>
                </div>

                {/* Root Node */}
                <div className="relative flex flex-col items-center">
                  <motion.div
                    animate={{
                      scale: rootIsActive ? 1.1 : 1,
                      boxShadow: rootIsActive
                        ? '0 0 20px rgba(251, 146, 60, 0.5)'
                        : '0 0 8px rgba(251, 146, 60, 0.2)',
                    }}
                    transition={{ duration: 0.3 }}
                    style={{
                      width: `${NODE_SIZE}px`,
                      height: `${NODE_SIZE}px`,
                    }}
                    className="flex flex-col items-center justify-center rounded-lg bg-orange-900/50 border-2 border-orange-500"
                  >
                    <span className="text-xs font-mono font-bold text-orange-200">
                      {set.root.id}
                    </span>
                    {set.root.rank !== undefined && (
                      <span className="text-[8px] font-mono text-orange-400/60">
                        r:{set.root.rank}
                      </span>
                    )}
                  </motion.div>

                  <div className="mt-1 px-2 py-0.5 rounded bg-orange-500/10 border border-orange-500/30">
                    <span className="text-[8px] font-mono text-orange-400 uppercase tracking-wide">
                      Root
                    </span>
                  </div>

                  {/* Children */}
                  {set.children.length > 0 && (
                    <div className="relative mt-8 flex gap-3">
                      {/* Parent lines */}
                      <svg
                        className="absolute"
                        style={{
                          top: `-${SPACING_Y * 0.6}px`,
                          left: '50%',
                          transform: 'translateX(-50%)',
                          width: `${set.children.length * (NODE_SIZE + 12)}px`,
                          height: `${SPACING_Y * 0.6}px`,
                          pointerEvents: 'none',
                        }}
                      >
                        {set.children.map((child, childIdx) => {
                          const childX =
                            childIdx * (NODE_SIZE + 12) + NODE_SIZE / 2;
                          const parentX = (set.children.length * (NODE_SIZE + 12)) / 2;
                          const isActive = activeSet.has(String(child.id));

                          return (
                            <line
                              key={child.id}
                              x1={parentX}
                              y1={0}
                              x2={childX}
                              y2={SPACING_Y * 0.6}
                              stroke={isActive ? '#fb923c' : '#64748b'}
                              strokeWidth={isActive ? 2.5 : 1.5}
                            />
                          );
                        })}
                      </svg>

                      {set.children.map((child) => {
                        const childIsActive = activeSet.has(String(child.id));

                        return (
                          <motion.div
                            key={child.id}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            style={{
                              width: `${NODE_SIZE}px`,
                              height: `${NODE_SIZE}px`,
                            }}
                            className={`flex flex-col items-center justify-center rounded-lg border-2 transition-all ${
                              childIsActive
                                ? 'bg-orange-800/60 border-orange-400 shadow-lg shadow-orange-500/40'
                                : 'bg-slate-800 border-slate-600'
                            }`}
                          >
                            <span
                              className={`text-xs font-mono font-bold ${
                                childIsActive ? 'text-orange-200' : 'text-slate-400'
                              }`}
                            >
                              {child.id}
                            </span>
                            {child.rank !== undefined && (
                              <span className="text-[8px] font-mono text-slate-500">
                                r:{child.rank}
                              </span>
                            )}
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex-shrink-0 flex items-center gap-4 px-4 py-2 border-t border-slate-700/25 bg-slate-950/40">
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded border-2 border-orange-500 bg-orange-900/50" />
          <span className="text-[9px] font-mono text-slate-500">Root (parent)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded border-2 border-slate-600 bg-slate-800" />
          <span className="text-[9px] font-mono text-slate-500">Child node</span>
        </div>
        <div className="text-[9px] font-mono text-slate-600">
          r: rank value
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
