// import React, { useMemo } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import * as d3 from 'd3-hierarchy';

// export default function DSUEngine({ data }) {
//   // Extract data. If the worker sends it as 'array' due to generic parsing, we handle it.
//   const parentArr = data?.parent || data?.array || [];
//   const active = data?.activeIndices || [];

//   // Parse raw array values to handle PythonTutor trace formats
//   const cleanParents = parentArr.map(p => Number(p?.value ?? p));

//   // Build the Forest layout using D3
//   const { nodes, links, rootsCount } = useMemo(() => {
//     if (!cleanParents.length) return { nodes: [], links: [], rootsCount: 0 };
    
//     const children = {};
//     const roots = [];
    
//     // Build adjacency list
//     cleanParents.forEach((p, i) => {
//       if (p === i || isNaN(p)) {
//         roots.push(i);
//       } else {
//         if (!children[p]) children[p] = [];
//         children[p].push(i);
//       }
//     });

//     // Recursive tree builder
//     const buildNode = (id) => ({
//       id: String(id),
//       children: (children[id] || []).map(buildNode)
//     });

//     // Connect all roots to a fake invisible super-root to layout the forest
//     const fakeRoot = {
//       id: 'FAKE_SUPER_ROOT',
//       children: roots.map(buildNode)
//     };

//     try {
//       const root = d3.hierarchy(fakeRoot);
//       const layout = d3.tree().nodeSize([65, 80]); // Spacing [X, Y]
//       layout(root);
      
//       return {
//         // Filter out the fake super-root
//         nodes: root.descendants().filter(n => n.data.id !== 'FAKE_SUPER_ROOT'),
//         links: root.links().filter(l => l.source.data.id !== 'FAKE_SUPER_ROOT'),
//         rootsCount: roots.length
//       };
//     } catch (e) {
//       return { nodes: [], links: [], rootsCount: 0 };
//     }
//   }, [cleanParents]);

//   // Calculate SVG ViewBox
//   const PAD = 50;
//   const minX = nodes.length ? Math.min(...nodes.map(n => n.x)) - PAD : 0;
//   const maxX = nodes.length ? Math.max(...nodes.map(n => n.x)) + PAD : 100;
//   const minY = nodes.length ? Math.min(...nodes.map(n => n.y)) - PAD : 0;
//   const maxY = nodes.length ? Math.max(...nodes.map(n => n.y)) + PAD : 100;

//   if (!cleanParents.length) {
//     return (
//       <div className="flex items-center justify-center w-full h-full text-slate-500 text-sm font-mono uppercase tracking-widest">
//         Waiting for DSU data...
//       </div>
//     );
//   }

//   return (
//     <div className="flex flex-col w-full h-full overflow-hidden bg-transparent">
      
//       {/* ── TOP: SVG FOREST GRAPH ── */}
//       <div className="flex-1 flex items-center justify-center p-4 relative min-h-[250px]">
//         {/* Component HUD */}
//         <div className="absolute top-4 left-4 flex items-center gap-2">
//           <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-[10px] font-mono text-emerald-400 uppercase tracking-widest shadow-sm">
//             Components: <span className="font-bold text-white text-xs ml-1">{rootsCount}</span>
//           </span>
//         </div>

//         <svg 
//           width="100%" 
//           height="100%" 
//           viewBox={`${minX} ${minY} ${maxX - minX} ${maxY - minY}`} 
//           preserveAspectRatio="xMidYMid meet"
//         >
//           <defs>
//             {/* Arrow points UP to the parent in a DSU */}
//             <marker id="dsu-arrow" markerWidth="8" markerHeight="6" refX="24" refY="3" orient="auto">
//               <polygon points="0 0,8 3,0 6" fill="#818cf8" />
//             </marker>
//             <marker id="dsu-arrow-inactive" markerWidth="8" markerHeight="6" refX="24" refY="3" orient="auto">
//               <polygon points="0 0,8 3,0 6" fill="#475569" />
//             </marker>
//           </defs>

//           <g>
//             {/* Edges (drawn from child to parent) */}
//             {links.map((lnk, i) => {
//               const isActive = active.includes(lnk.target.data.id) || active.includes(Number(lnk.target.data.id));
//               const strokeCol = isActive ? "#818cf8" : "#475569";
//               const marker = isActive ? "url(#dsu-arrow)" : "url(#dsu-arrow-inactive)";
              
//               return (
//                 <path 
//                   key={`link-${i}`} 
//                   // DSU edges point from TARGET (child) UP to SOURCE (parent)
//                   d={`M${lnk.target.x},${lnk.target.y} L${lnk.source.x},${lnk.source.y}`} 
//                   stroke={strokeCol} 
//                   strokeWidth={isActive ? "2.5" : "1.5"} 
//                   fill="none" 
//                   markerEnd={marker}
//                   style={{ transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)" }}
//                 />
//               );
//             })}

//             {/* Nodes */}
//             {nodes.map((node, i) => {
//               const id = node.data.id;
//               const isRoot = cleanParents[Number(id)] === Number(id);
//               const isActive = active.includes(id) || active.includes(Number(id));

//               return (
//                 <g 
//                   key={`node-${id}`} 
//                   transform={`translate(${node.x},${node.y})`} 
//                   style={{ transition: "transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)" }}
//                 >
//                   {/* Halo for active nodes */}
//                   {isActive && <circle r="22" fill="none" stroke="#6366f1" strokeWidth="4" opacity="0.3" className="animate-ping" />}
                  
//                   {/* Node Body */}
//                   <circle 
//                     r="16" 
//                     fill={isActive ? "#4f46e5" : isRoot ? "#064e3b" : "#1e293b"} 
//                     stroke={isActive ? "#818cf8" : isRoot ? "#10b981" : "#475569"} 
//                     strokeWidth="2.5" 
//                   />
                  
//                   {/* Node ID */}
//                   <text 
//                     dy="4" 
//                     textAnchor="middle" 
//                     fill={isActive ? "#ffffff" : isRoot ? "#a7f3d0" : "#e2e8f0"} 
//                     fontSize="11" 
//                     fontWeight="700" 
//                     fontFamily="'JetBrains Mono', monospace" 
//                     style={{ pointerEvents: "none", userSelect: "none" }}
//                   >
//                     {id}
//                   </text>
                  
//                   {/* Crown for Roots */}
//                   {isRoot && (
//                     <text dy="-20" textAnchor="middle" fontSize="10" fill="#34d399" opacity="0.8">★</text>
//                   )}
//                 </g>
//               );
//             })}
//           </g>
//         </svg>
//       </div>

//       {/* ── BOTTOM: PARENT ARRAY DOCK ── */}
//       <div className="flex-shrink-0 flex flex-col items-center justify-center p-4 border-t border-slate-700/50 bg-slate-900/30">
//         <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-2">parent[] array</span>
        
//         <div className="flex flex-wrap items-center justify-center gap-2">
//           <AnimatePresence mode="popLayout" initial={false}>
//             {cleanParents.map((val, idx) => {
//               const isActive = active.includes(idx) || active.includes(String(idx));
//               const isRoot = val === idx;

//               return (
//                 <motion.div
//                   key={`par-${idx}`}
//                   layout
//                   initial={{ opacity: 0, y: 20 }}
//                   animate={{ opacity: 1, y: 0, scale: isActive ? 1.1 : 1 }}
//                   transition={{ type: 'spring', stiffness: 350, damping: 25 }}
//                   className="flex flex-col items-center"
//                 >
//                   <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-mono font-bold text-sm border-2 transition-all duration-300 ${
//                     isActive 
//                       ? "bg-indigo-500 text-white border-indigo-300 shadow-[0_0_12px_rgba(99,102,241,0.6)] z-10" 
//                       : isRoot
//                         ? "bg-emerald-900/40 text-emerald-400 border-emerald-500/50"
//                         : "bg-slate-800 text-slate-300 border-slate-600"
//                   }`}>
//                     {val}
//                   </div>
//                   <span className="mt-1 text-[9px] font-mono text-slate-500">{idx}</span>
//                 </motion.div>
//               );
//             })}
//           </AnimatePresence>
//         </div>
//       </div>

//     </div>
//   );
// }


import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as d3 from 'd3-hierarchy';

export default function DSUEngine({ data }) {
  // Extract data. If the worker sends it as 'array' due to generic parsing, we handle it.
  const parentArr = data?.parent || data?.array || [];
  const active = data?.activeIndices || [];

  // Parse raw array values to handle PythonTutor trace formats
  const cleanParents = parentArr.map(p => Number(p?.value ?? p));

  // Build the Forest layout using D3
  const { nodes, links, rootsCount } = useMemo(() => {
    if (!cleanParents.length) return { nodes: [], links: [], rootsCount: 0 };
    
    const children = {};
    const roots = [];
    
    // Build adjacency list
    cleanParents.forEach((p, i) => {
      if (p === i || isNaN(p)) {
        roots.push(i);
      } else {
        if (!children[p]) children[p] = [];
        children[p].push(i);
      }
    });

    // Recursive tree builder
    const buildNode = (id) => ({
      id: String(id),
      children: (children[id] || []).map(buildNode)
    });

    // Connect all roots to a fake invisible super-root to layout the forest
    const fakeRoot = {
      id: 'FAKE_SUPER_ROOT',
      children: roots.map(buildNode)
    };

    try {
      const root = d3.hierarchy(fakeRoot);
      const layout = d3.tree().nodeSize([65, 80]); // Spacing [X, Y]
      layout(root);
      
      return {
        // Filter out the fake super-root
        nodes: root.descendants().filter(n => n.data.id !== 'FAKE_SUPER_ROOT'),
        links: root.links().filter(l => l.source.data.id !== 'FAKE_SUPER_ROOT'),
        rootsCount: roots.length
      };
    } catch (e) {
      return { nodes: [], links: [], rootsCount: 0 };
    }
  }, [cleanParents]);

  // Calculate SVG ViewBox
  const PAD = 50;
  const minX = nodes.length ? Math.min(...nodes.map(n => n.x)) - PAD : 0;
  const maxX = nodes.length ? Math.max(...nodes.map(n => n.x)) + PAD : 100;
  const minY = nodes.length ? Math.min(...nodes.map(n => n.y)) - PAD : 0;
  const maxY = nodes.length ? Math.max(...nodes.map(n => n.y)) + PAD : 100;

  if (!cleanParents.length) {
    return (
      <div className="flex items-center justify-center w-full h-full text-slate-500 text-sm font-mono uppercase tracking-widest">
        Waiting for DSU data...
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full h-full overflow-hidden bg-transparent">
      
      {/* ── TOP: SVG FOREST GRAPH ── */}
      <div className="flex-1 flex items-center justify-center p-4 relative min-h-[250px]">
        {/* Component HUD */}
        <div className="absolute top-4 left-4 flex items-center gap-2">
          <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-[10px] font-mono text-emerald-400 uppercase tracking-widest shadow-sm">
            Components: <span className="font-bold text-white text-xs ml-1">{rootsCount}</span>
          </span>
        </div>

        <svg 
          width="100%" 
          height="100%" 
          viewBox={`${minX} ${minY} ${maxX - minX} ${maxY - minY}`} 
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            {/* Arrow points UP to the parent in a DSU */}
            <marker id="dsu-arrow" markerWidth="8" markerHeight="6" refX="24" refY="3" orient="auto">
              <polygon points="0 0,8 3,0 6" fill="#818cf8" />
            </marker>
            <marker id="dsu-arrow-inactive" markerWidth="8" markerHeight="6" refX="24" refY="3" orient="auto">
              <polygon points="0 0,8 3,0 6" fill="#475569" />
            </marker>
          </defs>

          <g>
            {/* Edges (drawn from child to parent) */}
            {links.map((lnk, i) => {
              const isActive = active.includes(lnk.target.data.id) || active.includes(Number(lnk.target.data.id));
              const strokeCol = isActive ? "#818cf8" : "#475569";
              const marker = isActive ? "url(#dsu-arrow)" : "url(#dsu-arrow-inactive)";
              
              return (
                <path 
                  key={`link-${i}`} 
                  // DSU edges point from TARGET (child) UP to SOURCE (parent)
                  d={`M${lnk.target.x},${lnk.target.y} L${lnk.source.x},${lnk.source.y}`} 
                  stroke={strokeCol} 
                  strokeWidth={isActive ? "2.5" : "1.5"} 
                  fill="none" 
                  markerEnd={marker}
                  style={{ transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)" }}
                />
              );
            })}

            {/* Nodes */}
            {nodes.map((node, i) => {
              const id = node.data.id;
              const isRoot = cleanParents[Number(id)] === Number(id);
              const isActive = active.includes(id) || active.includes(Number(id));

              return (
                <g 
                  key={`node-${id}`} 
                  transform={`translate(${node.x},${node.y})`} 
                  style={{ transition: "transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)" }}
                >
                  {/* Halo for active nodes */}
                  {isActive && <circle r="22" fill="none" stroke="#6366f1" strokeWidth="4" opacity="0.3" className="animate-ping" />}
                  
                  {/* Node Body */}
                  <circle 
                    r="16" 
                    fill={isActive ? "#4f46e5" : isRoot ? "#064e3b" : "#1e293b"} 
                    stroke={isActive ? "#818cf8" : isRoot ? "#10b981" : "#475569"} 
                    strokeWidth="2.5" 
                  />
                  
                  {/* Node ID */}
                  <text 
                    dy="4" 
                    textAnchor="middle" 
                    fill={isActive ? "#ffffff" : isRoot ? "#a7f3d0" : "#e2e8f0"} 
                    fontSize="11" 
                    fontWeight="700" 
                    fontFamily="'JetBrains Mono', monospace" 
                    style={{ pointerEvents: "none", userSelect: "none" }}
                  >
                    {id}
                  </text>
                  
                  {/* Crown for Roots */}
                  {isRoot && (
                    <text dy="-20" textAnchor="middle" fontSize="10" fill="#34d399" opacity="0.8">★</text>
                  )}
                </g>
              );
            })}
          </g>
        </svg>
      </div>

      {/* ── BOTTOM: PARENT ARRAY DOCK ── */}
      <div className="flex-shrink-0 flex flex-col items-center justify-center p-4 border-t border-slate-700/50 bg-slate-900/30">
        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-2">parent[] array</span>
        
        <div className="flex flex-wrap items-center justify-center gap-2">
          <AnimatePresence mode="popLayout" initial={false}>
            {cleanParents.map((val, idx) => {
              const isActive = active.includes(idx) || active.includes(String(idx));
              const isRoot = val === idx;

              return (
                <motion.div
                  key={`par-${idx}`}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0, scale: isActive ? 1.1 : 1 }}
                  transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                  className="flex flex-col items-center"
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-mono font-bold text-sm border-2 transition-all duration-300 ${
                    isActive 
                      ? "bg-indigo-500 text-white border-indigo-300 shadow-[0_0_12px_rgba(99,102,241,0.6)] z-10" 
                      : isRoot
                        ? "bg-emerald-900/40 text-emerald-400 border-emerald-500/50"
                        : "bg-slate-800 text-slate-300 border-slate-600"
                  }`}>
                    {val}
                  </div>
                  <span className="mt-1 text-[9px] font-mono text-slate-500">{idx}</span>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

    </div>
  );
}