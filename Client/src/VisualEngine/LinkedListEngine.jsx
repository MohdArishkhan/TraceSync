import React from 'react';
import { motion } from 'framer-motion';

// data shape:
// { nodes: [{ id, val, isActive, isHead, isTail }, ...], edges: [{ isActive }, ...], statusText }
export default function LinkedListEngine({ data }) {
  const nodes     = data?.nodes ?? [];
  const edges     = data?.edges ?? [];
  const narration = data?.narration ?? null;

  if (!nodes.length) {
    return (
      <div className="flex items-center justify-center w-full h-full text-slate-500 text-sm font-mono">
        Waiting for linked list data…
      </div>
    );
  }

  const NODE_W = 86, NODE_H = 52, ARROW_W = 56, MARGIN = 24;
  const totalW = MARGIN * 2 + nodes.length * (NODE_W + ARROW_W) + 60;
  const totalH = 150;
  const cy = totalH / 2;

  return (
    <div className="flex flex-col w-full h-full overflow-hidden">
      <div className="flex-shrink-0 flex items-center justify-between px-4 py-2 border-b border-slate-700/30 bg-slate-950/50">
        <span className="px-2.5 py-0.5 rounded-md bg-indigo-500/10 border border-indigo-500/25 text-[10px] font-mono text-indigo-400 tracking-widest">
          Linked List · {nodes.length} nodes
        </span>
        {data?.statusText && (
          <span className="text-[11px] font-mono text-amber-300 truncate max-w-[260px]">{data.statusText}</span>
        )}
      </div>

      <div className="flex-1 flex items-center justify-center overflow-auto p-4">
        <svg width={totalW} height={totalH} viewBox={`0 0 ${totalW} ${totalH}`} style={{ minWidth: `${totalW}px` }}>
          <defs>
            <marker id="ll-head" markerWidth="9" markerHeight="6" refX="9" refY="3" orient="auto">
              <polygon points="0 0,9 3,0 6" fill="#475569" />
            </marker>
            <marker id="ll-head-active" markerWidth="9" markerHeight="6" refX="9" refY="3" orient="auto">
              <polygon points="0 0,9 3,0 6" fill="#818cf8" />
            </marker>
          </defs>

          {nodes.map((node, idx) => {
            const x = MARGIN + idx * (NODE_W + ARROW_W);
            const y = cy - NODE_H / 2;
            const active = node.isActive;
            const edgeToNext = edges[idx];
            const hasNext = idx < nodes.length - 1;

            return (
              <motion.g
                key={node.id ?? idx}
                animate={{ opacity: 1 }}
                initial={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
              >
                <rect
                  x={x} y={y} width={NODE_W} height={NODE_H} rx="9"
                  fill={active ? '#4f46e5' : node.isHead ? '#064e3b' : '#1e293b'}
                  stroke={active ? '#818cf8' : node.isHead ? '#10b981' : '#334155'}
                  strokeWidth={active ? 2.5 : 1.6}
                  style={{ filter: active ? 'drop-shadow(0 0 10px rgba(99,102,241,0.5))' : 'none', transition: 'all 0.25s' }}
                />
                <text x={x + NODE_W * 0.35} y={cy + 5} textAnchor="middle" fill={active ? '#e0e7ff' : '#e2e8f0'} fontSize="15" fontWeight="700" fontFamily="'JetBrains Mono', monospace" style={{ userSelect: 'none' }}>
                  {node.val}
                </text>
                <line x1={x + NODE_W * 0.67} y1={y + 8} x2={x + NODE_W * 0.67} y2={y + NODE_H - 8} stroke={active ? '#818cf8' : '#334155'} strokeWidth="1.5" />
                <text x={x + NODE_W * 0.83} y={cy + 5} textAnchor="middle" fill={active ? '#c7d2fe' : '#475569'} fontSize="9" fontFamily="monospace" style={{ userSelect: 'none' }}>
                  next
                </text>
                {hasNext && (
                  <line
                    x1={x + NODE_W} y1={cy} x2={x + NODE_W + ARROW_W - 6} y2={cy}
                    stroke={edgeToNext?.isActive ? '#818cf8' : '#475569'}
                    strokeWidth="2.5"
                    markerEnd={edgeToNext?.isActive ? 'url(#ll-head-active)' : 'url(#ll-head)'}
                  />
                )}
                {!hasNext && (
                  <text x={x + NODE_W + 12} y={cy + 5} fill="#475569" fontSize="12" fontWeight="700" fontFamily="monospace">NULL</text>
                )}
                {node.isHead && (
                  <text x={x + NODE_W / 2} y={y - 12} textAnchor="middle" fill="#34d399" fontSize="10" fontWeight="700" fontFamily="monospace">HEAD</text>
                )}
                {active && (
                  <>
                    <line x1={x + NODE_W * 0.35} y1={y - 8} x2={x + NODE_W * 0.35} y2={y} stroke="#818cf8" strokeWidth="1.5" />
                    <text x={x + NODE_W * 0.35} y={y - 14} textAnchor="middle" fill="#818cf8" fontSize="10" fontWeight="600" fontFamily="monospace">cur</text>
                  </>
                )}
              </motion.g>
            );
          })}
        </svg>
      </div>

      <div className="flex-shrink-0 flex items-center gap-4 px-4 py-2 border-t border-slate-700/25 bg-slate-950/40">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm" style={{ background: '#4f46e5', border: '1px solid #818cf8' }} />
          <span className="text-[9px] font-mono text-slate-500">Current pointer</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm" style={{ background: '#064e3b', border: '1px solid #10b981' }} />
          <span className="text-[9px] font-mono text-slate-500">Head</span>
        </div>
      </div>

      {narration && (
        <div className="flex-shrink-0 flex items-start gap-2.5 px-5 py-2 border-t border-amber-500/15 bg-amber-500/5">
          <span className="text-amber-500/60 text-sm mt-0.5 flex-shrink-0">✎</span>
          <span className="text-[12.5px] font-medium text-amber-200/90 leading-snug">{narration}</span>
        </div>
      )}
    </div>
  );
}