// import React, { useMemo } from 'react';
// import * as d3 from 'd3-hierarchy';

// export default function SegmentTreeEngine({ data }) {
//   // data: { array: [values], activeIndices: [idx] }
//   const arr = data?.array ?? [];
//   const active = data?.activeIndices ?? [];

//   // Build Binary Tree from Array-based Segment Tree
//   // Note: Root is at index 0, Left = 2*i + 1, Right = 2*i + 2
//   const { nodes, links } = useMemo(() => {
//     if (!arr.length) return { nodes: [], links: [] };

//     const buildTree = (idx) => {
//       if (idx >= arr.length) return null;
//       const node = { id: `st-${idx}`, name: String(arr[idx]?.value ?? arr[idx] ?? "∅") };
//       const left = buildTree(2 * idx + 1);
//       const right = buildTree(2 * idx + 2);
//       if (left || right) node.children = [left, right].filter(Boolean);
//       return node;
//     };

//     const rootData = buildTree(0);
//     const root = d3.hierarchy(rootData);
//     d3.tree().nodeSize([70, 70])(root);

//     return { nodes: root.descendants(), links: root.links() };
//   }, [arr]);

//   const PAD = 50;
//   const minX = nodes.length ? Math.min(...nodes.map(n => n.x)) - PAD : 0;
//   const maxX = nodes.length ? Math.max(...nodes.map(n => n.x)) + PAD : 100;
//   const minY = PAD;
//   const maxY = nodes.length ? Math.max(...nodes.map(n => n.y)) + PAD : 100;

//   return (
//     <div className="flex flex-col w-full h-full bg-slate-900/40 rounded-xl overflow-hidden">
//       <div className="flex-1 p-4">
//         <svg viewBox={`${minX} ${minY} ${maxX - minX} ${maxY - minY}`} width="100%" height="100%">
//           {links.map((lnk, i) => (
//             <path key={i} d={`M${lnk.source.x},${lnk.source.y} L${lnk.target.x},${lnk.target.y}`} stroke="#475569" strokeWidth="2" fill="none" />
//           ))}
//           {nodes.map((n, i) => (
//             <g key={i} transform={`translate(${n.x},${n.y})`}>
//               <circle r="18" fill="#1e293b" stroke={active.includes(i) ? "#fbbf24" : "#64748b"} strokeWidth="2" />
//               <text textAnchor="middle" dy="5" fill="white" fontSize="10" className="font-mono">{n.data.name}</text>
//             </g>
//           ))}
//         </svg>
//       </div>
      
//       {/* Array Base */}
//       <div className="flex justify-center gap-1 p-3 bg-slate-950/50 border-t border-slate-800">
//         {arr.map((val, i) => (
//           <div key={i} className={`w-8 h-8 flex items-center justify-center text-[10px] font-mono border rounded ${active.includes(i) ? 'bg-amber-500 text-black' : 'bg-slate-800 text-white'}`}>
//             {val?.value ?? val}
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import * as d3 from 'd3-hierarchy';

// data shape:
// { array: [values], activeIndices: [treeIdx, ...], rangeStart, rangeEnd, opText }
export default function SegmentTreeEngine({ data }) {
  const arr      = data?.array ?? [];
  const active   = new Set((data?.activeIndices ?? []).map(String));
  const opText   = data?.opText ?? data?.statusText ?? null;

  const { nodes, links, n } = useMemo(() => {
    if (!arr.length) return { nodes: [], links: [], n: 0 };

    const build = (idx) => {
      if (idx >= arr.length) return null;
      const raw = arr[idx]?.value ?? arr[idx];
      const node = { id: `st-${idx}`, idx, name: raw === undefined || raw === null ? '∅' : String(raw) };
      const left  = build(2 * idx + 1);
      const right = build(2 * idx + 2);
      if (left || right) node.children = [left, right].filter(Boolean);
      return node;
    };

    const rootData = build(0);
    if (!rootData) return { nodes: [], links: [], n: arr.length };
    const root = d3.hierarchy(rootData);
    d3.tree().nodeSize([66, 76])(root);
    return { nodes: root.descendants(), links: root.links(), n: arr.length };
  }, [arr]);

  if (!arr.length) {
    return (
      <div className="flex items-center justify-center w-full h-full text-slate-500 text-sm font-mono">
        Waiting for segment tree data…
      </div>
    );
  }

  const PAD = 50;
  const minX = nodes.length ? Math.min(...nodes.map((n) => n.x)) - PAD : 0;
  const maxX = nodes.length ? Math.max(...nodes.map((n) => n.x)) + PAD : 100;
  const minY = PAD * 0.6;
  const maxY = nodes.length ? Math.max(...nodes.map((n) => n.y)) + PAD : 100;

  return (
    <div className="flex flex-col w-full h-full overflow-hidden">

      {/* HUD */}
      <div className="flex-shrink-0 flex items-center justify-between px-4 py-2 border-b border-slate-700/30 bg-slate-950/50">
        <span className="px-2.5 py-0.5 rounded-md bg-indigo-500/10 border border-indigo-500/25 text-[10px] font-mono text-indigo-400 tracking-widest">
          Segment Tree · n={n}
        </span>
        {opText && (
          <span className="px-3 py-1 rounded-full border border-amber-500/25 bg-amber-500/8 text-[11px] font-semibold text-amber-300 truncate max-w-[280px]">
            {opText}
          </span>
        )}
      </div>

      {/* TREE */}
      <div className="flex-1 flex items-center justify-center overflow-hidden p-3 min-h-[180px]">
        <svg viewBox={`${minX} ${minY} ${maxX - minX} ${maxY - minY}`} width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
          <defs>
            <marker id="st-arrow" markerWidth="7" markerHeight="5" refX="7" refY="2.5" orient="auto">
              <polygon points="0 0,7 2.5,0 5" fill="#334155" />
            </marker>
          </defs>
          {links.map((lnk, i) => (
            <path
              key={`lnk-${i}`}
              d={`M${lnk.source.x},${lnk.source.y + 18} L${lnk.target.x},${lnk.target.y - 18}`}
              stroke="#334155"
              strokeWidth="1.6"
              fill="none"
              markerEnd="url(#st-arrow)"
            />
          ))}
          {nodes.map((node, i) => {
            const isActive = active.has(String(node.data.idx));
            return (
              <motion.g
                key={`node-${node.data.id}`}
                animate={{ x: node.x, y: node.y }}
                transition={{ type: 'spring', stiffness: 280, damping: 24 }}
              >
                {isActive && <circle r="24" fill="none" stroke="#fbbf24" strokeWidth="3" opacity="0.4" className="animate-ping" />}
                <circle r="18" fill={isActive ? '#78350f' : '#1e293b'} stroke={isActive ? '#fbbf24' : '#475569'} strokeWidth={isActive ? 2.5 : 1.6} />
                <text textAnchor="middle" dy="4" fill={isActive ? '#fde68a' : '#e2e8f0'} fontSize="11" fontWeight="700" fontFamily="'JetBrains Mono', monospace" style={{ pointerEvents: 'none', userSelect: 'none' }}>
                  {node.data.name}
                </text>
                <text textAnchor="middle" dy="28" fill={isActive ? '#fbbf24' : '#475569'} fontSize="8" fontFamily="monospace" style={{ pointerEvents: 'none', userSelect: 'none' }}>
                  [{node.data.idx}]
                </text>
              </motion.g>
            );
          })}
        </svg>
      </div>

      {/* ARRAY BASE */}
      <div className="flex-shrink-0 flex flex-col items-center gap-1.5 p-3 border-t border-slate-700/25 bg-slate-950/40">
        <span className="text-[9px] font-mono text-slate-600 uppercase tracking-widest">underlying tree array</span>
        <div className="flex flex-wrap justify-center gap-1.5">
          {arr.map((val, i) => {
            const isActive = active.has(String(i));
            const dv = val?.value ?? val;
            return (
              <motion.div
                key={i}
                layout
                animate={{ scale: isActive ? 1.1 : 1 }}
                transition={{ type: 'spring', stiffness: 320, damping: 22 }}
                className="flex flex-col items-center"
              >
                <div
                  className="w-9 h-9 flex items-center justify-center text-[11px] font-mono font-bold rounded-md border-2 transition-colors duration-200"
                  style={{
                    background: isActive ? '#78350f' : '#1e293b',
                    borderColor: isActive ? '#fbbf24' : '#334155',
                    color: isActive ? '#fde68a' : '#94a3b8',
                    boxShadow: isActive ? '0 0 10px rgba(251,191,36,0.4)' : 'none',
                  }}
                >
                  {dv === undefined || dv === null ? '∅' : String(dv)}
                </div>
                <span className="text-[8px] font-mono text-slate-600 mt-0.5">{i}</span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}