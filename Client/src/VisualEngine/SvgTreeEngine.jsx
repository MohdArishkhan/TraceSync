// import React, { useMemo } from 'react';
// import * as d3 from 'd3-hierarchy';
// import { motion } from 'framer-motion';

// export default function SVGEngine({ frameData }) {
//   // Expected: { name: "10", children: [{ name: "5" }, { name: "15" }] }
  
//   const { nodes, links } = useMemo(() => {
//     if (!frameData || !frameData.tree) return { nodes: [], links: [] };

//     try {
//       const hierarchyData = d3.hierarchy(frameData.tree);
//       const treeLayout = d3.tree().nodeSize([60, 80]); // Width, Height spacing
//       const rootNode = treeLayout(hierarchyData);

//       return {
//         nodes: rootNode.descendants(),
//         links: rootNode.links()
//       };
//     } catch (e) {
//       console.error("Tree layout failed", e);
//       return { nodes: [], links: [] };
//     }
//   }, [frameData]);

//   if (!nodes.length) return <div className="p-4 text-slate-400">Waiting for tree data...</div>;

//   // Center the tree dynamically based on the root node
//   const minX = Math.min(...nodes.map(n => n.x));
//   const maxX = Math.max(...nodes.map(n => n.x));
//   const minY = Math.min(...nodes.map(n => n.y));
//   const maxY = Math.max(...nodes.map(n => n.y));
  
//   const viewBox = `${minX - 50} ${minY - 50} ${maxX - minX + 100} ${maxY - minY + 100}`;

//   return (
//     <div className="w-full h-full flex items-center justify-center overflow-hidden">
//       <svg width="100%" height="100%" viewBox={viewBox} preserveAspectRatio="xMidYMid meet">
//         <g>
//           {links.map((link, i) => (
//             <path
//               key={`link-${i}`}
//               d={`M ${link.source.x},${link.source.y} L ${link.target.x},${link.target.y}`}
//               stroke="#475569" // slate-600
//               strokeWidth="2"
//               fill="none"
//             />
//           ))}

//           {nodes.map((node, i) => {
//             const isActive = frameData.activeNodes?.includes(node.data.name || node.data.val);
//             return (
//               <motion.g
//                 key={`node-${node.data.id || i}`}
//                 animate={{ x: node.x, y: node.y }}
//                 transition={{ type: "spring", stiffness: 200, damping: 20 }}
//               >
//                 <circle 
//                   r="20" 
//                   fill={isActive ? "#6366f1" : "#1e293b"} // indigo-500 or slate-800
//                   stroke={isActive ? "#818cf8" : "#475569"} 
//                   strokeWidth="3" 
//                 />
//                 <text
//                   dy="5"
//                   textAnchor="middle"
//                   fill="white"
//                   className="text-sm font-bold pointer-events-none"
//                 >
//                   {node.data.name || node.data.val}
//                 </text>
//               </motion.g>
//             );
//           })}
//         </g>
//       </svg>
//     </div>
//   );
// }



import React, { useMemo } from 'react';
import * as d3 from 'd3-hierarchy';
import { motion } from 'framer-motion';

// data shape:
// { tree: { name/val, children: [...] }, activeNodes: [name|id, ...], pathNodes: [name|id, ...] }
export default function SVGEngine({ data }) {
  const { nodes, links } = useMemo(() => {
    if (!data?.tree) return { nodes: [], links: [] };
    try {
      const root = d3.hierarchy(data.tree);
      const layout = d3.tree().nodeSize([62, 84]);
      layout(root);
      return { nodes: root.descendants(), links: root.links() };
    } catch {
      return { nodes: [], links: [] };
    }
  }, [data]);

  if (!nodes.length) {
    return (
      <div className="flex items-center justify-center w-full h-full text-slate-500 text-sm font-mono gap-2">
        <span className="w-3.5 h-3.5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        Waiting for tree data…
      </div>
    );
  }

  const PAD = 56;
  const minX = Math.min(...nodes.map((n) => n.x)) - PAD;
  const maxX = Math.max(...nodes.map((n) => n.x)) + PAD;
  const minY = Math.min(...nodes.map((n) => n.y)) - PAD;
  const maxY = Math.max(...nodes.map((n) => n.y)) + PAD;

  const activeSet = new Set((data.activeNodes ?? []).map(String));
  const pathSet   = new Set((data.pathNodes ?? []).map(String));
  const labelOf   = (d) => d.name ?? d.val ?? '';

  return (
    <div className="w-full h-full flex flex-col overflow-hidden">
      <div className="flex-shrink-0 flex items-center justify-between px-4 py-2 border-b border-slate-700/30 bg-slate-950/50">
        <span className="px-2.5 py-0.5 rounded-md bg-indigo-500/10 border border-indigo-500/25 text-[10px] font-mono text-indigo-400 tracking-widest">
          Binary Tree · {nodes.length} nodes
        </span>
        {data.statusText && (
          <span className="text-[11px] font-mono text-amber-300 truncate max-w-[260px]">{data.statusText}</span>
        )}
      </div>

      <div className="flex-1 flex items-center justify-center overflow-hidden p-4">
        <svg width="100%" height="100%" viewBox={`${minX} ${minY} ${maxX - minX} ${maxY - minY}`} preserveAspectRatio="xMidYMid meet">
          <defs>
            <marker id="tree-arrow" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
              <polygon points="0 0,8 3,0 6" fill="#475569" />
            </marker>
            <marker id="tree-arrow-active" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
              <polygon points="0 0,8 3,0 6" fill="#818cf8" />
            </marker>
          </defs>
          <g>
            {links.map((lnk, i) => {
              const srcKey = String(labelOf(lnk.source.data) ?? lnk.source.data.id);
              const tgtKey = String(labelOf(lnk.target.data) ?? lnk.target.data.id);
              const isPathEdge = pathSet.has(srcKey) && pathSet.has(tgtKey);
              const my = (lnk.source.y + lnk.target.y) / 2;
              return (
                <path
                  key={`lnk-${i}`}
                  d={`M${lnk.source.x},${lnk.source.y + 20} C${lnk.source.x},${my} ${lnk.target.x},${my} ${lnk.target.x},${lnk.target.y - 20}`}
                  stroke={isPathEdge ? '#818cf8' : '#475569'}
                  strokeWidth={isPathEdge ? 2.5 : 1.6}
                  fill="none"
                  strokeLinecap="round"
                  markerEnd={isPathEdge ? 'url(#tree-arrow-active)' : 'url(#tree-arrow)'}
                  style={{ transition: 'stroke 0.25s, stroke-width 0.25s' }}
                />
              );
            })}

            {nodes.map((node, i) => {
              const key = String(labelOf(node.data) ?? node.data.id ?? i);
              const isActive = activeSet.has(key);
              const onPath   = pathSet.has(key);
              const fill   = isActive ? '#4f46e5' : onPath ? '#312e81' : '#1e293b';
              const stroke = isActive ? '#818cf8' : onPath ? '#6366f1' : '#475569';

              return (
                <motion.g
                  key={`nd-${node.data.id ?? key}-${i}`}
                  animate={{ x: node.x, y: node.y }}
                  transition={{ type: 'spring', stiffness: 260, damping: 24 }}
                >
                  {isActive && <circle r="28" fill="none" stroke="#818cf8" strokeWidth="3" opacity="0.4" className="animate-ping" />}
                  <circle r="20" fill={fill} stroke={stroke} strokeWidth={isActive ? 2.5 : 1.8} />
                  <text
                    dy="5"
                    textAnchor="middle"
                    fill={isActive ? '#e0e7ff' : onPath ? '#c7d2fe' : '#e2e8f0'}
                    fontSize="13"
                    fontWeight="700"
                    fontFamily="'JetBrains Mono', monospace"
                    style={{ pointerEvents: 'none', userSelect: 'none' }}
                  >
                    {labelOf(node.data)}
                  </text>
                </motion.g>
              );
            })}
          </g>
        </svg>
      </div>

      <div className="flex-shrink-0 flex items-center gap-4 px-4 py-2 border-t border-slate-700/25 bg-slate-950/40">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full" style={{ background: '#4f46e5', border: '1px solid #818cf8' }} />
          <span className="text-[9px] font-mono text-slate-500">Current node</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full" style={{ background: '#312e81', border: '1px solid #6366f1' }} />
          <span className="text-[9px] font-mono text-slate-500">On traversal path</span>
        </div>
      </div>
    </div>
  );
}