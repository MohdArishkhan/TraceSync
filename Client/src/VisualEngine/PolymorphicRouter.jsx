import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as d3 from 'd3-hierarchy';
import { ReactFlow, Background, Controls, applyNodeChanges, applyEdgeChanges } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import StackEngine    from './StackEngine';
import QueueEngine    from './QueueEngine';
import HeapEngine     from './HeapEngine';
import HashMapEngine  from './HashMapEngine';

// ─────────────────────────────────────────────────────────────────────────────
//  ENGINE 1 — GRID  (Array · Matrix · Set)
// ─────────────────────────────────────────────────────────────────────────────
function GridEngine({ data, type }) {
  const rawData      = data?.matrix || data?.array || [];
  const activeIndices = data?.activeIndices || [];
  const isMatrix     = rawData.length > 0 && Array.isArray(rawData[0]);
  const isSet        = type === 'SET';

  const display = (val) => val?.value !== undefined ? val.value : val;

  if (!rawData.length) {
    return (
      <div className="flex items-center justify-center w-full h-full text-slate-500 text-xs font-mono">
        {isSet ? 'Set is empty' : 'Array is empty'}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center w-full h-full p-4 overflow-auto gap-3">
      {isMatrix ? (
        <div className="flex flex-col items-center gap-1">
          {/* Column indices */}
          <div className="flex gap-1 mb-1 ml-5">
            {rawData[0].map((_, cIdx) => (
              <div key={cIdx} className="w-11 text-center text-[10px] font-mono text-slate-600">{cIdx}</div>
            ))}
          </div>
          {rawData.map((row, rIdx) => (
            <div key={rIdx} className="flex items-center gap-1">
              <div className="w-4 text-right text-[10px] font-mono text-slate-600 mr-1">{rIdx}</div>
              {row.map((val, cIdx) => {
                const isActive = activeIndices.includes(`${rIdx},${cIdx}`);
                const dVal = display(val);
                return (
                  <motion.div
                    key={`${rIdx}-${cIdx}`}
                    layout
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                    className={`flex items-center justify-center w-11 h-11 rounded-md text-sm font-bold border transition-all duration-200 overflow-hidden ${
                      isActive
                        ? 'bg-indigo-500 text-white border-indigo-300 shadow-[0_0_12px_rgba(99,102,241,0.6)] scale-110 z-10'
                        : 'bg-slate-800 text-slate-300 border-slate-600'
                    }`}
                  >
                    <span className="truncate px-1 text-center">
                      {dVal === '.' ? <span className="opacity-25">·</span> : String(dVal)}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2">
          {/* Pointer row */}
          <div className="flex gap-2 justify-center h-5">
            {rawData.map((_, idx) => (
              <div key={`ptr-${idx}`} className="w-12 flex items-center justify-center">
                {(activeIndices.includes(idx) || activeIndices.includes(String(idx))) && (
                  <div className={`text-lg leading-none ${isSet ? 'text-emerald-400' : 'text-indigo-400'}`}>▼</div>
                )}
              </div>
            ))}
          </div>

          {/* Cells */}
          <div className="flex flex-wrap gap-1.5 justify-center">
            {rawData.map((val, idx) => {
              const isActive = activeIndices.includes(idx) || activeIndices.includes(String(idx));
              const dVal = display(val);
              return (
                <motion.div
                  key={val?.id || `item-${idx}`}
                  layout
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                  className={`flex items-center justify-center w-12 h-12 rounded-xl text-base font-bold border-2 shadow-md transition-all duration-200 overflow-hidden ${
                    isActive
                      ? isSet
                        ? 'bg-emerald-600 text-white border-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.5)] scale-110 z-10'
                        : 'bg-indigo-500 text-white border-indigo-300 shadow-[0_0_14px_rgba(99,102,241,0.6)] scale-110 z-10'
                      : isSet
                        ? 'bg-emerald-900/40 text-emerald-200 border-emerald-700/60'
                        : 'bg-slate-800 text-slate-200 border-slate-600'
                  }`}
                >
                  <span className="truncate px-1 text-center">{String(dVal)}</span>
                </motion.div>
              );
            })}
          </div>

          {/* Index row */}
          <div className="flex gap-1.5 justify-center">
            {rawData.map((_, idx) => (
              <div key={idx} className="w-12 text-center text-[10px] font-mono text-slate-700">{idx}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  ENGINE 2 — SVG TREE  (Tree · BST · Heap via external HeapEngine)
// ─────────────────────────────────────────────────────────────────────────────
function SVGEngine({ data }) {
  const { nodes, links } = useMemo(() => {
    if (!data?.tree) return { nodes: [], links: [] };
    try {
      const root = d3.hierarchy(data.tree);
      const layout = d3.tree().nodeSize([70, 90]);
      layout(root);
      return { nodes: root.descendants(), links: root.links() };
    } catch {
      return { nodes: [], links: [] };
    }
  }, [data]);

  if (!nodes.length) return (
    <div className="flex items-center justify-center w-full h-full text-slate-500 text-sm font-mono">
      Waiting for tree data...
    </div>
  );

  const PAD = 60;
  const minX = Math.min(...nodes.map(n => n.x)) - PAD;
  const maxX = Math.max(...nodes.map(n => n.x)) + PAD;
  const minY = Math.min(...nodes.map(n => n.y)) - PAD;
  const maxY = Math.max(...nodes.map(n => n.y)) + PAD;

  return (
    <div className="w-full h-full flex items-center justify-center overflow-hidden p-4">
      <svg
        width="100%"
        height="100%"
        viewBox={`${minX} ${minY} ${maxX - minX} ${maxY - minY}`}
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <marker id="tree-arrow" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
            <polygon points="0 0,8 3,0 6" fill="#334155"/>
          </marker>
        </defs>
        <g>
          {links.map((lnk, i) => {
            const mx = (lnk.source.x + lnk.target.x) / 2;
            const my = (lnk.source.y + lnk.target.y) / 2;
            return (
              <path
                key={`lnk-${i}`}
                d={`M${lnk.source.x},${lnk.source.y + 22} C${lnk.source.x},${my} ${lnk.target.x},${my} ${lnk.target.x},${lnk.target.y - 22}`}
                stroke="#334155" strokeWidth="2" fill="none" strokeLinecap="round"
              />
            );
          })}
          {nodes.map((node, i) => {
            const isActive =
              data.activeNodes?.includes(node.data.name ?? node.data.val) ||
              data.activeNodes?.includes(String(node.data.id));
            return (
              <g
                key={`nd-${node.data.id ?? i}`}
                transform={`translate(${node.x},${node.y})`}
                style={{ transition: 'transform 0.35s ease' }}
              >
                {isActive && <circle r="28" fill="none" stroke="#818cf8" strokeWidth="3" opacity="0.45"/>}
                <circle
                  r="22"
                  fill={isActive ? '#4f46e5' : '#1e293b'}
                  stroke={isActive ? '#818cf8' : '#475569'}
                  strokeWidth="2.5"
                />
                <text
                  dy="5" textAnchor="middle"
                  fill={isActive ? '#e0e7ff' : '#e2e8f0'}
                  fontSize="13" fontWeight="700"
                  fontFamily="'JetBrains Mono', monospace"
                  style={{ pointerEvents: 'none', userSelect: 'none' }}
                >
                  {node.data.name ?? node.data.val}
                </text>
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  ENGINE 3 — LINKED LIST
// ─────────────────────────────────────────────────────────────────────────────
function LinkedListEngine({ data }) {
  const nodes = data?.nodes ?? [];
  const edges = data?.edges ?? [];

  if (!nodes.length) return (
    <div className="flex items-center justify-center w-full h-full text-slate-500 text-sm font-mono">
      Waiting for linked list data...
    </div>
  );

  const NODE_W = 86, NODE_H = 52, ARROW_W = 52, MARGIN = 20;
  const totalW = MARGIN + nodes.length * (NODE_W + ARROW_W) + 60;
  const totalH = 140;
  const cy = totalH / 2;

  return (
    <div className="w-full h-full flex items-center justify-center overflow-auto p-4">
      <svg width={totalW} height={totalH} viewBox={`0 0 ${totalW} ${totalH}`} style={{ minWidth: `${totalW}px` }}>
        <defs>
          <marker id="ll-head"        markerWidth="9" markerHeight="6" refX="9" refY="3" orient="auto">
            <polygon points="0 0,9 3,0 6" fill="#475569"/>
          </marker>
          <marker id="ll-head-active" markerWidth="9" markerHeight="6" refX="9" refY="3" orient="auto">
            <polygon points="0 0,9 3,0 6" fill="#818cf8"/>
          </marker>
        </defs>

        {nodes.map((node, idx) => {
          const x = MARGIN + idx * (NODE_W + ARROW_W);
          const y = cy - NODE_H / 2;
          const active    = node.isActive;
          const edgeToNext = edges[idx];
          const hasNext   = idx < nodes.length - 1;

          return (
            <g key={node.id}>
              <rect x={x} y={y} width={NODE_W} height={NODE_H} rx="8"
                fill={active ? '#4f46e5' : '#1e293b'}
                stroke={active ? '#818cf8' : '#334155'} strokeWidth="2"
              />
              <text x={x + NODE_W * 0.35} y={cy + 5} textAnchor="middle"
                fill={active ? '#e0e7ff' : '#e2e8f0'}
                fontSize="15" fontWeight="700" fontFamily="'JetBrains Mono', monospace"
                style={{ userSelect: 'none' }}
              >
                {node.val}
              </text>
              <line
                x1={x + NODE_W * 0.67} y1={y + 8}
                x2={x + NODE_W * 0.67} y2={y + NODE_H - 8}
                stroke={active ? '#818cf8' : '#334155'} strokeWidth="1.5"
              />
              <text x={x + NODE_W * 0.83} y={cy + 5} textAnchor="middle"
                fill={active ? '#c7d2fe' : '#475569'}
                fontSize="9" fontFamily="monospace" style={{ userSelect: 'none' }}
              >
                next
              </text>
              {hasNext && (
                <line
                  x1={x + NODE_W} y1={cy}
                  x2={x + NODE_W + ARROW_W - 5} y2={cy}
                  stroke={edgeToNext?.isActive ? '#818cf8' : '#475569'}
                  strokeWidth="2.5"
                  markerEnd={edgeToNext?.isActive ? 'url(#ll-head-active)' : 'url(#ll-head)'}
                />
              )}
              {!hasNext && (
                <text x={x + NODE_W + 10} y={cy + 5} fill="#475569" fontSize="12" fontWeight="700" fontFamily="monospace">
                  NULL
                </text>
              )}
              {active && (
                <>
                  <line
                    x1={x + NODE_W * 0.35} y1={y - 8}
                    x2={x + NODE_W * 0.35} y2={y}
                    stroke="#818cf8" strokeWidth="1.5"
                  />
                  <text
                    x={x + NODE_W * 0.35} y={y - 14}
                    textAnchor="middle" fill="#818cf8"
                    fontSize="10" fontWeight="600" fontFamily="monospace"
                  >
                    cur
                  </text>
                </>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  ENGINE 4 — GRAPH  (ReactFlow)
// ─────────────────────────────────────────────────────────────────────────────
function PhysicsEngine({ data }) {
  const [rfNodes, setRfNodes] = useState([]);
  const [rfEdges, setRfEdges] = useState([]);

  useEffect(() => {
    if (!data?.nodes?.length) return;
    setRfNodes(data.nodes.map((n, idx) => ({
      id:       n.id,
      position: n.position ?? { x: 80 + (idx % 5) * 140, y: 80 + Math.floor(idx / 5) * 120 },
      data:     { label: n.label ?? n.val },
      style: {
        background:   n.isActive ? '#4f46e5' : '#1e293b',
        color:        n.isActive ? '#e0e7ff' : '#e2e8f0',
        border:       n.isActive ? '2px solid #818cf8' : '1px solid #334155',
        borderRadius: '10px',
        padding:      '8px 14px',
        fontSize:     '14px',
        fontWeight:   '700',
        fontFamily:   "'JetBrains Mono', monospace",
        boxShadow:    n.isActive ? '0 0 16px rgba(99,102,241,0.6)' : 'none',
        minWidth:     '48px',
        textAlign:    'center',
      },
    })));
    setRfEdges((data.edges ?? []).map(e => ({
      id:        e.id ?? `e-${e.source}-${e.target}`,
      source:    e.source,
      target:    e.target,
      animated:  e.isActive,
      style:     { stroke: e.isActive ? '#818cf8' : '#475569', strokeWidth: 2 },
      markerEnd: { type: 'arrowclosed', color: e.isActive ? '#818cf8' : '#475569' },
    })));
  }, [data]);

  return (
    <div className="w-full h-full relative" style={{ minHeight: '300px' }}>
      <ReactFlow
        nodes={rfNodes} edges={rfEdges}
        onNodesChange={c => setRfNodes(p => applyNodeChanges(c, p))}
        onEdgesChange={c => setRfEdges(p => applyEdgeChanges(c, p))}
        fitView fitViewOptions={{ padding: 0.3 }}
      >
        <Background color="#1e293b" gap={24} variant="dots"/>
        <Controls/>
      </ReactFlow>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  FLOATING VARIABLES OVERLAY
// ─────────────────────────────────────────────────────────────────────────────
function FloatingVariables({ variables }) {
  if (!variables?.length) return null;

  const scalar = variables.filter(v =>
    !v.value.startsWith('[') &&
    !v.value.startsWith('{') &&
    !v.value.startsWith('ref(')
  );

  if (!scalar.length) return null;

  return (
    <div className="absolute top-3 left-3 z-30 flex flex-wrap gap-1.5 max-w-[220px]">
      {scalar.map(v => (
        <div
          key={v.name}
          className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-900/80 border border-slate-700/70 backdrop-blur-sm"
        >
          <span className="text-pink-400 text-[10px] font-mono">{v.name}</span>
          <span className="text-slate-500 text-[10px]">=</span>
          <span className="text-yellow-300 text-[10px] font-mono">{v.value}</span>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  TYPE → COLOR badge map
// ─────────────────────────────────────────────────────────────────────────────
const TYPE_BADGE = {
  ARRAY:       'text-indigo-400 border-indigo-500/40 bg-indigo-500/10',
  MATRIX:      'text-violet-400 border-violet-500/40 bg-violet-500/10',
  STACK:       'text-orange-400 border-orange-500/40 bg-orange-500/10',
  QUEUE:       'text-cyan-400   border-cyan-500/40   bg-cyan-500/10',
  HEAP:        'text-amber-400  border-amber-500/40  bg-amber-500/10',
  HASH_MAP:    'text-rose-400   border-rose-500/40   bg-rose-500/10',
  SET:         'text-emerald-400 border-emerald-500/40 bg-emerald-500/10',
  TREE:        'text-teal-400   border-teal-500/40   bg-teal-500/10',
  LINKED_LIST: 'text-sky-400    border-sky-500/40    bg-sky-500/10',
  GRAPH:       'text-fuchsia-400 border-fuchsia-500/40 bg-fuchsia-500/10',
};

// ─────────────────────────────────────────────────────────────────────────────
//  ENGINE DISPATCHER
// ─────────────────────────────────────────────────────────────────────────────
const EngineRenderer = ({ structure }) => {
  switch (structure.type) {
    case 'TREE':
      return <SVGEngine data={structure.data}/>;
    case 'LINKED_LIST':
      return <LinkedListEngine data={structure.data}/>;
    case 'GRAPH':
      return <PhysicsEngine data={structure.data}/>;
    case 'STACK':
      return <StackEngine data={structure.data}/>;
    case 'QUEUE':
      return <QueueEngine data={structure.data}/>;
    case 'HEAP':
      return <HeapEngine data={structure.data}/>;
    case 'HASH_MAP':
      return <HashMapEngine data={structure.data}/>;
    case 'SET':
      return <GridEngine data={structure.data} type="SET"/>;
    case 'MATRIX':
    case 'ARRAY':
    default:
      return <GridEngine data={structure.data} type={structure.type}/>;
  }
};

// ─────────────────────────────────────────────────────────────────────────────
//  POLYMORPHIC ROUTER — main export
// ─────────────────────────────────────────────────────────────────────────────
export default function PolymorphicRouter({ currentFrame }) {
  if (!currentFrame || !currentFrame.structures) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-full text-slate-500">
        <div className="w-8 h-8 border-4 border-[#ffa116] border-t-transparent rounded-full animate-spin mb-4"/>
        <p className="text-sm font-mono">Tracing execution...</p>
      </div>
    );
  }

  const structures = currentFrame.structures;
  const count = structures.length;

  if (count === 0) {
    return (
      <div className="relative w-full h-full flex items-center justify-center bg-[#0f172a]">
        <FloatingVariables variables={currentFrame.variables}/>
        <span className="text-slate-600 font-mono text-sm">
          No complex data structures active in scope.
        </span>
      </div>
    );
  }

  // Layout: 1 → full, 2 → side by side, 3-4 → 2x2 grid
  const gridCols =
    count === 1 ? 'grid-cols-1' :
    count === 2 ? 'grid-cols-2' :
                  'grid-cols-2';
  const gridRows = count > 2 ? 'grid-rows-2' : 'grid-rows-1';

  return (
    <div className="relative w-full h-full bg-[#0f172a] p-3 flex flex-col gap-3 overflow-hidden">
      <FloatingVariables variables={currentFrame.variables}/>

      <div className={`w-full h-full grid ${gridCols} ${gridRows} gap-3`}>
        <AnimatePresence mode="popLayout">
          {structures.map(struct => (
            <motion.div
              key={struct.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{    opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="relative bg-[#1e293b]/50 border border-slate-700/50 rounded-2xl overflow-hidden backdrop-blur-sm shadow-xl flex flex-col"
            >
              {/* Type + name badges */}
              <div className="absolute top-2.5 right-2.5 z-20 flex items-center gap-1.5">
                <span className={`px-2 py-0.5 rounded-md border text-[9px] font-mono uppercase tracking-widest shadow-sm ${TYPE_BADGE[struct.type] ?? TYPE_BADGE['ARRAY']}`}>
                  {struct.type.replace('_', ' ')}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-slate-800 border border-slate-600 text-[9px] font-mono text-slate-300 shadow-sm">
                  {struct.name}
                </span>
              </div>

              <div className="flex-1 relative min-h-[220px]">
                <EngineRenderer structure={struct}/>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}


// 0-----old route--------------------





// import React, { useMemo, useState, useEffect } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import * as d3 from 'd3-hierarchy';
// import { ReactFlow, Background, Controls, applyNodeChanges, applyEdgeChanges } from '@xyflow/react';
// import '@xyflow/react/dist/style.css';

// const FloatingVariables = ({ variables }) => {
//   if (!variables || variables.length === 0) return null;
//   return (
//     <div className="absolute top-4 left-4 z-30 flex flex-wrap gap-3 max-w-[80%] pointer-events-none">
//       <AnimatePresence>
//         {variables.map((v) => (
//           <motion.div
//             key={v.name}
//             layout
//             initial={{ opacity: 0, y: -10 }}
//             animate={{ opacity: 1, y: 0 }}
//             exit={{ opacity: 0, scale: 0.9 }}
//             className="flex items-center gap-2 bg-slate-900/60 backdrop-blur-md border border-slate-700/50 px-3 py-1.5 rounded-lg shadow-xl"
//           >
//             <span className="text-pink-400 font-mono text-xs font-semibold">{v.name}</span>
//             <span className="text-slate-500 text-[10px]">=</span>
//             <motion.span 
//               key={v.value} 
//               initial={{ opacity: 0, y: -5 }}
//               animate={{ opacity: 1, y: 0 }}
//               className="text-[#00b8a3] font-mono text-xs font-bold"
//             >
//               {v.value}
//             </motion.span>
//           </motion.div>
//         ))}
//       </AnimatePresence>
//     </div>
//   );
// };

// function GridEngine({ data }) {
//   const rawData = data?.matrix || data?.array || [];
//   const activeIndices = data?.activeIndices || [];
//   const isMatrix = rawData.length > 0 && Array.isArray(rawData[0]);
//   const display = (val) => val?.value !== undefined ? val.value : val;

//   return (
//     <div className="flex flex-col items-center justify-center w-full h-full p-6 overflow-auto gap-6 mt-8">
//       {isMatrix ? (
//         <div className="flex flex-col items-center gap-1">
//           <div className="flex gap-1 mb-1 ml-6">
//             {rawData[0].map((_, cIdx) => (
//               <div key={cIdx} className="w-12 text-center text-[10px] font-mono text-slate-500">{cIdx}</div>
//             ))}
//           </div>
//           {rawData.map((row, rIdx) => (
//             <div key={rIdx} className="flex items-center gap-1">
//               <div className="w-5 text-right text-[10px] font-mono text-slate-500 mr-1">{rIdx}</div>
//               {row.map((val, cIdx) => {
//                 const isActive = activeIndices.includes(`${rIdx},${cIdx}`);
//                 const dVal = display(val);
//                 return (
//                   <div
//                     key={`${rIdx}-${cIdx}`}
//                     className={`flex items-center justify-center w-12 h-12 rounded-md text-sm font-bold border-2 transition-all duration-300 ${
//                       isActive ? "bg-indigo-500 text-white border-indigo-300 shadow-[0_0_12px_rgba(99,102,241,0.6)] scale-110 z-10" : "bg-slate-800 text-slate-300 border-slate-600"
//                     }`}
//                   >
//                     {dVal === "." ? <span className="opacity-25">.</span> : String(dVal)}
//                   </div>
//                 );
//               })}
//             </div>
//           ))}
//         </div>
//       ) : (
//         <div className="flex flex-col items-center gap-2">
//           <div className="flex gap-2 justify-center h-5">
//             {rawData.map((val, idx) => (
//               <div key={`ptr-${idx}`} className="w-14 flex items-center justify-center">
//                 {activeIndices.includes(idx) && <div className="text-indigo-400 text-lg leading-none">▼</div>}
//               </div>
//             ))}
//           </div>
//           <div className="flex flex-wrap gap-2 justify-center">
//             {rawData.map((val, idx) => {
//               const isActive = activeIndices.includes(idx) || activeIndices.includes(String(idx));
//               const dVal = display(val);
//               return (
//                 <div
//                   key={val?.id || `item-${idx}`}
//                   className={`relative flex items-center justify-center w-14 h-14 rounded-xl text-xl font-bold border-2 shadow-md transition-all duration-300 ${
//                     isActive ? "bg-indigo-500 text-white border-indigo-300 shadow-[0_0_16px_rgba(99,102,241,0.7)] scale-110 z-10" : "bg-slate-800 text-slate-200 border-slate-600"
//                   }`}
//                 >
//                   {dVal}
//                 </div>
//               );
//             })}
//           </div>
//           <div className="flex gap-2 justify-center">
//             {rawData.map((_, idx) => (
//               <div key={idx} className="w-14 text-center text-[10px] font-mono text-slate-600">{idx}</div>
//             ))}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// function SVGEngine({ data }) {
//   const { nodes, links } = useMemo(() => {
//     if (!data?.tree) return { nodes: [], links: [] };
//     try {
//       const root = d3.hierarchy(data.tree);
//       const layout = d3.tree().nodeSize([70, 90]);
//       layout(root);
//       return { nodes: root.descendants(), links: root.links() };
//     } catch {
//       return { nodes: [], links: [] };
//     }
//   }, [data]);

//   if (!nodes.length) return <div className="flex items-center justify-center w-full h-full text-slate-500 text-sm">Waiting for tree data...</div>;

//   const PAD = 60;
//   const minX = Math.min(...nodes.map((n) => n.x)) - PAD;
//   const maxX = Math.max(...nodes.map((n) => n.x)) + PAD;
//   const minY = Math.min(...nodes.map((n) => n.y)) - PAD;
//   const maxY = Math.max(...nodes.map((n) => n.y)) + PAD;

//   return (
//     <div className="w-full h-full flex items-center justify-center overflow-hidden p-4">
//       <svg width="100%" height="100%" viewBox={`${minX} ${minY} ${maxX - minX} ${maxY - minY}`} preserveAspectRatio="xMidYMid meet">
//         <defs>
//           <marker id="tree-arrow" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
//             <polygon points="0 0,8 3,0 6" fill="#475569" />
//           </marker>
//         </defs>
//         <g>
//           {links.map((lnk, i) => {
//             const mx = (lnk.source.x + lnk.target.x) / 2, my = (lnk.source.y + lnk.target.y) / 2;
//             return <path key={`lnk-${i}`} d={`M${lnk.source.x},${lnk.source.y + 22} C${lnk.source.x},${my} ${lnk.target.x},${my} ${lnk.target.x},${lnk.target.y - 22}`} stroke="#475569" strokeWidth="2" fill="none" strokeLinecap="round" />;
//           })}
//           {nodes.map((node, i) => {
//             const isActive = data.activeNodes?.includes(node.data.name ?? node.data.val) || data.activeNodes?.includes(String(node.data.id));
//             return (
//               <g key={`nd-${node.data.id ?? i}`} transform={`translate(${node.x},${node.y})`} style={{ transition: "transform 0.35s ease" }}>
//                 {isActive && <circle r="28" fill="none" stroke="#818cf8" strokeWidth="3" opacity="0.45" />}
//                 <circle r="22" fill={isActive ? "#4f46e5" : "#1e293b"} stroke={isActive ? "#818cf8" : "#475569"} strokeWidth="2.5" />
//                 <text dy="5" textAnchor="middle" fill={isActive ? "#e0e7ff" : "#e2e8f0"} fontSize="13" fontWeight="700" fontFamily="'JetBrains Mono', monospace" style={{ pointerEvents: "none", userSelect: "none" }}>
//                   {node.data.name ?? node.data.val}
//                 </text>
//               </g>
//             );
//           })}
//         </g>
//       </svg>
//     </div>
//   );
// }

// function LinkedListEngine({ data }) {
//   const nodes = data?.nodes ?? [], edges = data?.edges ?? [];
//   if (!nodes.length) return <div className="flex items-center justify-center w-full h-full text-slate-500 text-sm">Waiting for linked list data...</div>;
//   const NODE_W = 86, NODE_H = 52, ARROW_W = 52, MARGIN = 20;
//   const totalW = MARGIN + nodes.length * (NODE_W + ARROW_W) + 60, totalH = 140, cy = totalH / 2;

//   return (
//     <div className="w-full h-full flex items-center justify-center overflow-auto p-4">
//       <svg width={totalW} height={totalH} viewBox={`0 0 ${totalW} ${totalH}`} style={{ minWidth: `${totalW}px` }}>
//         <defs>
//           <marker id="ll-head" markerWidth="9" markerHeight="6" refX="9" refY="3" orient="auto"><polygon points="0 0,9 3,0 6" fill="#475569" /></marker>
//           <marker id="ll-head-active" markerWidth="9" markerHeight="6" refX="9" refY="3" orient="auto"><polygon points="0 0,9 3,0 6" fill="#818cf8" /></marker>
//         </defs>
//         {nodes.map((node, idx) => {
//           const x = MARGIN + idx * (NODE_W + ARROW_W), y = cy - NODE_H / 2;
//           const active = node.isActive, edgeToNext = edges[idx], hasNext = idx < nodes.length - 1;
//           return (
//             <g key={node.id}>
//               <rect x={x} y={y} width={NODE_W} height={NODE_H} rx="8" fill={active ? "#4f46e5" : "#1e293b"} stroke={active ? "#818cf8" : "#334155"} strokeWidth="2" />
//               <text x={x + NODE_W * 0.35} y={cy + 5} textAnchor="middle" fill={active ? "#e0e7ff" : "#e2e8f0"} fontSize="15" fontWeight="700" fontFamily="'JetBrains Mono', monospace" style={{ userSelect: "none" }}>{node.val}</text>
//               <line x1={x + NODE_W * 0.67} y1={y + 8} x2={x + NODE_W * 0.67} y2={y + NODE_H - 8} stroke={active ? "#818cf8" : "#334155"} strokeWidth="1.5" />
//               <text x={x + NODE_W * 0.83} y={cy + 5} textAnchor="middle" fill={active ? "#c7d2fe" : "#475569"} fontSize="9" fontFamily="monospace" style={{ userSelect: "none" }}>next</text>
//               {hasNext && <line x1={x + NODE_W} y1={cy} x2={x + NODE_W + ARROW_W - 5} y2={cy} stroke={edgeToNext?.isActive ? "#818cf8" : "#475569"} strokeWidth="2.5" markerEnd={edgeToNext?.isActive ? "url(#ll-head-active)" : "url(#ll-head)"} />}
//               {!hasNext && <text x={x + NODE_W + 10} y={cy + 5} fill="#475569" fontSize="12" fontWeight="700" fontFamily="monospace">NULL</text>}
//               {active && <><line x1={x + NODE_W * 0.35} y1={y - 8} x2={x + NODE_W * 0.35} y2={y} stroke="#818cf8" strokeWidth="1.5" /><text x={x + NODE_W * 0.35} y={y - 14} textAnchor="middle" fill="#818cf8" fontSize="10" fontWeight="600" fontFamily="monospace">cur</text></>}
//             </g>
//           );
//         })}
//       </svg>
//     </div>
//   );
// }

// function PhysicsEngine({ data }) {
//   const [rfNodes, setRfNodes] = useState([]);
//   const [rfEdges, setRfEdges] = useState([]);
  
//   useEffect(() => {
//     if (!data?.nodes?.length) return;
//     setRfNodes(data.nodes.map((n, idx) => ({
//       id: n.id,
//       position: n.position ?? { x: 80 + (idx % 5) * 140, y: 80 + Math.floor(idx / 5) * 120 },
//       data: { label: n.label ?? n.val },
//       style: { background: n.isActive ? "#4f46e5" : "#1e293b", color: n.isActive ? "#e0e7ff" : "#e2e8f0", border: n.isActive ? "2px solid #818cf8" : "1px solid #334155", borderRadius: "10px", padding: "8px 14px", fontSize: "14px", fontWeight: "700", fontFamily: "'JetBrains Mono', monospace", boxShadow: n.isActive ? "0 0 16px rgba(99,102,241,0.6)" : "none", minWidth: "48px", textAlign: "center" }
//     })));
//     setRfEdges((data.edges ?? []).map((e) => ({
//       id: e.id ?? `e-${e.source}-${e.target}`, source: e.source, target: e.target, animated: e.isActive, style: { stroke: e.isActive ? "#818cf8" : "#475569", strokeWidth: 2 }, markerEnd: { type: "arrowclosed", color: e.isActive ? "#818cf8" : "#475569" }
//     })));
//   }, [data]);

//   return (
//     <div className="w-full h-full relative" style={{ minHeight: "400px" }}>
//       <ReactFlow nodes={rfNodes} edges={rfEdges} onNodesChange={(c) => setRfNodes((p) => applyNodeChanges(c, p))} onEdgesChange={(c) => setRfEdges((p) => applyEdgeChanges(c, p))} fitView fitViewOptions={{ padding: 0.3 }}>
//         <Background color="#1e293b" gap={24} variant="dots" />
//         <Controls />
//       </ReactFlow>
//     </div>
//   );
// }

// const EngineRenderer = ({ structure }) => {
//   switch (structure.type) {
//     case "TREE":
//       return <SVGEngine data={structure.data} />;
//     case "LINKED_LIST":
//       return <LinkedListEngine data={structure.data} />;
//     case "GRAPH":
//       return <PhysicsEngine data={structure.data} />;
//     case "MATRIX":
//     case "ARRAY":
//     default:
//       return <GridEngine data={structure.data} />;
//   }
// };

// export default function PolymorphicRouter({ currentFrame }) {
//   if (!currentFrame || !currentFrame.structures) {
//     return (
//       <div className="flex flex-col items-center justify-center w-full h-full text-slate-500">
//         <div className="w-8 h-8 border-4 border-[#ffa116] border-t-transparent rounded-full animate-spin mb-4" />
//         <p className="text-sm font-mono">Tracing execution...</p>
//       </div>
//     );
//   }

//   const structures = currentFrame.structures;
//   const count = structures.length;

//   if (count === 0) {
//     return (
//       <div className="relative w-full h-full flex items-center justify-center bg-[#0f172a]">
//         <FloatingVariables variables={currentFrame.variables} />
//         <span className="text-slate-600 font-mono text-sm">No complex data structures active in scope.</span>
//       </div>
//     );
//   }

//   const gridCols = count === 1 ? 'grid-cols-1' : count === 2 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-2';
//   const gridRows = count > 2 ? 'grid-rows-2' : 'grid-rows-1';

//   return (
//     <div className="relative w-full h-full bg-[#0f172a] p-4 flex flex-col gap-4 overflow-hidden">
//       <FloatingVariables variables={currentFrame.variables} />
      
//       <div className={`w-full h-full grid ${gridCols} ${gridRows} gap-4`}>
//         {structures.map((struct) => (
//           <div key={struct.id} className="relative bg-[#1e293b]/50 border border-slate-700/50 rounded-2xl overflow-hidden backdrop-blur-sm shadow-xl flex flex-col">
//             <div className="absolute top-3 right-3 z-20 flex items-center gap-2">
//               <span className="px-2.5 py-1 rounded-md bg-slate-800 border border-slate-600 text-[10px] font-mono text-indigo-400 uppercase tracking-widest shadow-sm">
//                 {struct.type}
//               </span>
//               <span className="px-2.5 py-1 rounded-md bg-indigo-500/10 border border-indigo-500/30 text-[10px] font-mono text-indigo-300 shadow-sm">
//                 {struct.name}
//               </span>
//             </div>
            
//             <div className="flex-1 relative min-h-[250px]">
//               <EngineRenderer structure={struct} />
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }