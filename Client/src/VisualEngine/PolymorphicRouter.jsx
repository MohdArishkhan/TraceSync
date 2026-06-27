import React, { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as d3 from 'd3-hierarchy';
import { ReactFlow, Background, Controls, applyNodeChanges, applyEdgeChanges } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import RecursionTreeEngine from './RecursionTreeEngine';
import StackEngine from './StackEngine';
import QueueEngine from './QueueEngine';
import DequeEngine from './DequeEngine';
import DSUEngine from './DSUEngine';
import SegmentTreeEngine from './SegmentTreeEngine';

const FloatingVariables = ({ variables }) => {
  if (!variables || variables.length === 0) return null;
  return (
    <div className="absolute top-4 left-4 z-30 flex flex-wrap gap-3 max-w-[80%] pointer-events-none">
      <AnimatePresence>
        {variables.map((v) => (
          <motion.div
            key={v.name}
            layout
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex items-center gap-2 bg-slate-900/80 backdrop-blur-md border border-slate-600/50 px-3 py-1.5 rounded-lg shadow-xl"
          >
            <span className="text-pink-400 font-mono text-xs font-semibold">{v.name}</span>
            <span className="text-slate-500 text-[10px]">=</span>
            <motion.span 
              key={v.value || v.role} // value ni hai to AI wala role hi dikha de
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-[#00b8a3] font-mono text-xs font-bold"
            >
              {v.value || v.role} 
            </motion.span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

function GridEngine({ data, compact = false }) {
  const rawData = data?.matrix || data?.array || [];
  const activeIndices = data?.activeIndices || [];
  const isMatrix = rawData.length > 0 && Array.isArray(rawData[0]);
  const display = (val) => val?.value !== undefined ? val.value : val;

  const boxClasses = compact 
    ? "w-8 h-8 rounded text-xs border" 
    : "w-12 h-12 rounded-md text-sm border-2";
    
  const pointerWidth = compact ? "w-8" : "w-14";

  return (
    <div className={`flex flex-col items-center justify-center w-full h-full overflow-auto ${compact ? 'p-2 gap-2' : 'p-6 gap-6 mt-8'}`}>
      {isMatrix ? (
        <div className="flex flex-col items-center gap-1">
          <div className="flex gap-1 mb-1 ml-6">
            {rawData[0].map((_, cIdx) => (
              <div key={cIdx} className={`${compact ? 'w-8 text-[8px]' : 'w-12 text-[10px]'} text-center font-mono text-slate-500`}>{cIdx}</div>
            ))}
          </div>
          {rawData.map((row, rIdx) => (
            <div key={rIdx} className="flex items-center gap-1">
              <div className={`${compact ? 'w-4 text-[8px]' : 'w-5 text-[10px]'} text-right font-mono text-slate-500 mr-1`}>{rIdx}</div>
              {row.map((val, cIdx) => {
                const isActive = activeIndices.includes(`${rIdx},${cIdx}`);
                const dVal = display(val);
                return (
                  <div
                    key={`${rIdx}-${cIdx}`}
                    className={`flex items-center justify-center font-bold transition-all duration-300 ${boxClasses} ${
                      isActive ? "bg-indigo-500 text-white border-indigo-300 shadow-[0_0_12px_rgba(99,102,241,0.6)] scale-110 z-10" : "bg-slate-800 text-slate-300 border-slate-600"
                    }`}
                  >
                    {dVal === "." ? <span className="opacity-25">.</span> : String(dVal)}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-1">
          <div className="flex gap-2 justify-center h-4">
            {rawData.map((val, idx) => (
              <div key={`ptr-${idx}`} className={`${pointerWidth} flex items-center justify-center`}>
                {activeIndices.includes(idx) && <div className="text-indigo-400 text-sm leading-none">▼</div>}
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-2 justify-center">
            {rawData.map((val, idx) => {
              const isActive = activeIndices.includes(idx) || activeIndices.includes(String(idx));
              const dVal = display(val);
              return (
                <div
                  key={val?.id || `item-${idx}`}
                  className={`relative flex items-center justify-center font-bold shadow-md transition-all duration-300 ${
                    compact ? "w-10 h-10 rounded-lg text-sm border" : "w-14 h-14 rounded-xl text-xl border-2"
                  } ${
                    isActive ? "bg-indigo-500 text-white border-indigo-300 shadow-[0_0_16px_rgba(99,102,241,0.7)] scale-110 z-10" : "bg-slate-800 text-slate-200 border-slate-600"
                  }`}
                >
                  {dVal}
                </div>
              );
            })}
          </div>
          <div className="flex gap-2 justify-center">
            {rawData.map((_, idx) => (
              <div key={idx} className={`${compact ? 'w-10 text-[8px]' : 'w-14 text-[10px]'} text-center font-mono text-slate-600`}>{idx}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

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

  if (!nodes.length) return <div className="flex items-center justify-center w-full h-full text-slate-500 text-sm">Waiting for tree data...</div>;

  const PAD = 60;
  const minX = Math.min(...nodes.map((n) => n.x)) - PAD;
  const maxX = Math.max(...nodes.map((n) => n.x)) + PAD;
  const minY = Math.min(...nodes.map((n) => n.y)) - PAD;
  const maxY = Math.max(...nodes.map((n) => n.y)) + PAD;

  return (
    <div className="w-full h-full flex items-center justify-center overflow-hidden p-4">
      <svg width="100%" height="100%" viewBox={`${minX} ${minY} ${maxX - minX} ${maxY - minY}`} preserveAspectRatio="xMidYMid meet">
        <defs>
          <marker id="tree-arrow" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
            <polygon points="0 0,8 3,0 6" fill="#475569" />
          </marker>
        </defs>
        <g>
          {links.map((lnk, i) => {
            const mx = (lnk.source.x + lnk.target.x) / 2, my = (lnk.source.y + lnk.target.y) / 2;
            return <path key={`lnk-${i}`} d={`M${lnk.source.x},${lnk.source.y + 22} C${lnk.source.x},${my} ${lnk.target.x},${my} ${lnk.target.x},${lnk.target.y - 22}`} stroke="#475569" strokeWidth="2" fill="none" strokeLinecap="round" />;
          })}
          {nodes.map((node, i) => {
            const isActive = data.activeNodes?.includes(node.data.name ?? node.data.val) || data.activeNodes?.includes(String(node.data.id));
            return (
              <g key={`nd-${node.data.id ?? i}`} transform={`translate(${node.x},${node.y})`} style={{ transition: "transform 0.35s ease" }}>
                {isActive && <circle r="28" fill="none" stroke="#818cf8" strokeWidth="3" opacity="0.45" />}
                <circle r="22" fill={isActive ? "#4f46e5" : "#1e293b"} stroke={isActive ? "#818cf8" : "#475569"} strokeWidth="2.5" />
                <text dy="5" textAnchor="middle" fill={isActive ? "#e0e7ff" : "#e2e8f0"} fontSize="13" fontWeight="700" fontFamily="'JetBrains Mono', monospace" style={{ pointerEvents: "none", userSelect: "none" }}>
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

function LinkedListEngine({ data }) {
  const nodes = data?.nodes ?? [], edges = data?.edges ?? [];
  if (!nodes.length) return <div className="flex items-center justify-center w-full h-full text-slate-500 text-sm">Waiting for linked list data...</div>;
  const NODE_W = 86, NODE_H = 52, ARROW_W = 52, MARGIN = 20;
  const totalW = MARGIN + nodes.length * (NODE_W + ARROW_W) + 60, totalH = 140, cy = totalH / 2;

  return (
    <div className="w-full h-full flex items-center justify-center overflow-auto p-4">
      <svg width={totalW} height={totalH} viewBox={`0 0 ${totalW} ${totalH}`} style={{ minWidth: `${totalW}px` }}>
        <defs>
          <marker id="ll-head" markerWidth="9" markerHeight="6" refX="9" refY="3" orient="auto"><polygon points="0 0,9 3,0 6" fill="#475569" /></marker>
          <marker id="ll-head-active" markerWidth="9" markerHeight="6" refX="9" refY="3" orient="auto"><polygon points="0 0,9 3,0 6" fill="#818cf8" /></marker>
        </defs>
        {nodes.map((node, idx) => {
          const x = MARGIN + idx * (NODE_W + ARROW_W), y = cy - NODE_H / 2;
          const active = node.isActive, edgeToNext = edges[idx], hasNext = idx < nodes.length - 1;
          return (
            <g key={node.id}>
              <rect x={x} y={y} width={NODE_W} height={NODE_H} rx="8" fill={active ? "#4f46e5" : "#1e293b"} stroke={active ? "#818cf8" : "#334155"} strokeWidth="2" />
              <text x={x + NODE_W * 0.35} y={cy + 5} textAnchor="middle" fill={active ? "#e0e7ff" : "#e2e8f0"} fontSize="15" fontWeight="700" fontFamily="'JetBrains Mono', monospace" style={{ userSelect: "none" }}>{node.val}</text>
              <line x1={x + NODE_W * 0.67} y1={y + 8} x2={x + NODE_W * 0.67} y2={y + NODE_H - 8} stroke={active ? "#818cf8" : "#334155"} strokeWidth="1.5" />
              <text x={x + NODE_W * 0.83} y={cy + 5} textAnchor="middle" fill={active ? "#c7d2fe" : "#475569"} fontSize="9" fontFamily="monospace" style={{ userSelect: "none" }}>next</text>
              {hasNext && <line x1={x + NODE_W} y1={cy} x2={x + NODE_W + ARROW_W - 5} y2={cy} stroke={edgeToNext?.isActive ? "#818cf8" : "#475569"} strokeWidth="2.5" markerEnd={edgeToNext?.isActive ? "url(#ll-head-active)" : "url(#ll-head)"} />}
              {!hasNext && <text x={x + NODE_W + 10} y={cy + 5} fill="#475569" fontSize="12" fontWeight="700" fontFamily="monospace">NULL</text>}
              {active && <><line x1={x + NODE_W * 0.35} y1={y - 8} x2={x + NODE_W * 0.35} y2={y} stroke="#818cf8" strokeWidth="1.5" /><text x={x + NODE_W * 0.35} y={y - 14} textAnchor="middle" fill="#818cf8" fontSize="10" fontWeight="600" fontFamily="monospace">cur</text></>}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function PhysicsEngine({ data }) {
  const [rfNodes, setRfNodes] = useState([]);
  const [rfEdges, setRfEdges] = useState([]);
  
  useEffect(() => {
    if (!data?.nodes?.length) return;
    setRfNodes(data.nodes.map((n, idx) => ({
      id: n.id,
      position: n.position ?? { x: 80 + (idx % 5) * 140, y: 80 + Math.floor(idx / 5) * 120 },
      data: { label: n.label ?? n.val },
      style: { background: n.isActive ? "#4f46e5" : "#1e293b", color: n.isActive ? "#e0e7ff" : "#e2e8f0", border: n.isActive ? "2px solid #818cf8" : "1px solid #334155", borderRadius: "10px", padding: "8px 14px", fontSize: "14px", fontWeight: "700", fontFamily: "'JetBrains Mono', monospace", boxShadow: n.isActive ? "0 0 16px rgba(99,102,241,0.6)" : "none", minWidth: "48px", textAlign: "center" }
    })));
    setRfEdges((data.edges ?? []).map((e) => ({
      id: e.id ?? `e-${e.source}-${e.target}`, source: e.source, target: e.target, animated: e.isActive, style: { stroke: e.isActive ? "#818cf8" : "#475569", strokeWidth: 2 }, markerEnd: { type: "arrowclosed", color: e.isActive ? "#818cf8" : "#475569" }
    })));
  }, [data]);

  return (
    <div className="w-full h-full relative" style={{ minHeight: "150px" }}>
      <ReactFlow nodes={rfNodes} edges={rfEdges} onNodesChange={(c) => setRfNodes((p) => applyNodeChanges(c, p))} onEdgesChange={(c) => setRfEdges((p) => applyEdgeChanges(c, p))} fitView fitViewOptions={{ padding: 0.3 }}>
        <Background color="#1e293b" gap={24} variant="dots" />
        <Controls showInteractive={false} />
      </ReactFlow>
    </div>
  );
}

const EngineRenderer = ({ structure, compact = false }) => {
  const type = (structure.type ?? '').toUpperCase().trim();
  switch (type) {
    case "SEGMENT_TREE": return <SegmentTreeEngine data={structure.data} />;
    case "DSU": return <DSUEngine data={structure.data} />;
    case "RECURSION_TREE": return <RecursionTreeEngine data={structure.data} />;
    case "TREE": return <SVGEngine data={structure.data} />;
    case "LINKED_LIST": return <LinkedListEngine data={structure.data} />;
    case "GRAPH": return <PhysicsEngine data={structure.data} />;
    case "STACK": return <StackEngine data={structure.data} />;
    case "QUEUE": return <QueueEngine data={structure.data} />;
    case "DEQUE": return <DequeEngine data={structure.data} />;
    case "HEAP": return <GridEngine data={structure.data} compact={compact} />;
    case "HASH_MAP":
    case "SET": return <GridEngine data={structure.data} compact={compact} />;
    case "MATRIX":
    case "ARRAY": return <GridEngine data={structure.data} compact={compact} />;
    default:
      return (
        <div className="flex flex-col items-center justify-center w-full h-full gap-2 text-slate-500">
          <span className="font-mono text-xs bg-slate-800 px-3 py-1 rounded border border-slate-600">
            Unknown engine type: <span className="text-rose-400">{structure.type}</span>
          </span>
          <span className="text-[10px] text-slate-600">Add a case for this type in EngineRenderer</span>
        </div>
      );
  }
};

const getRank = (type) => {
  if (type === 'RECURSION_TREE') return 5;
  if (type === 'DSU') return 4.5;
  if (type === 'SEGMENT_TREE') return 4.5;
  if (type === 'GRAPH') return 4;
  if (type === 'DEQUE') return 3.7;
  if (type === 'STACK' || type === 'QUEUE') return 3.5;
  if (type === 'TREE') return 3;
  if (type === 'LINKED_LIST') return 3;
  if (type === 'MATRIX') return 2;
  return 1;
};

export default function PolymorphicRouter({ currentFrame, aiFallbackEngine, aiVariables }) {
  if (!currentFrame || !currentFrame.structures) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-full text-slate-500 bg-[#0f172a]">
        <div className="w-8 h-8 border-4 border-[#ffa116] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-mono">Tracing execution...</p>
      </div>
    );
  }

  const structures = currentFrame.structures;

  // 👇 ADDED: AI FALLBACK VIEW block
  // Agar runtime frame aane wala hai lekin trace khali hai (structures=0), aur AI ka data hai to seedha us layout pe fallback karo.
  if (structures.length === 0 && aiFallbackEngine) {
    const synchronizedMockData = {
      id: "ai-primed-view",
      type: aiFallbackEngine,
      name: "AI Extracted Layout",
      array: [], activeIndices: [], frontIndex: 0, rearIndex: 0,
      variables: aiVariables || []
    };

    return (
      <div className="relative w-full h-full flex flex-col bg-[#0f172a] p-4 overflow-hidden gap-4">
        <FloatingVariables variables={aiVariables} />
        <div className="w-full h-full flex flex-col items-center justify-center">
          <div className="mb-4 text-center">
            <span className="px-2.5 py-1 rounded-md bg-indigo-500/10 border border-indigo-500/30 text-[10px] font-mono text-indigo-400 uppercase tracking-widest shadow-sm">
              AI Primed Layout: {aiFallbackEngine}
            </span>
          </div>
          <div className="relative bg-[#1e293b]/50 border border-slate-700/50 rounded-2xl overflow-hidden backdrop-blur-sm shadow-xl flex-1 w-full min-h-0">
             {/* Purana EngineRenderer reuse kar liya bina structure chhode */}
            <EngineRenderer structure={{ type: aiFallbackEngine, data: synchronizedMockData }} compact={false} />
          </div>
        </div>
      </div>
    );
  }

  if (structures.length === 0) {
    return (
      <div className="relative w-full h-full flex items-center justify-center bg-[#0f172a]">
        <FloatingVariables variables={currentFrame.variables} />
        <span className="text-slate-600 font-mono text-sm">No complex data structures active in scope.</span>
      </div>
    );
  }

  const sortedStructs = [...structures].sort((a, b) => getRank(b.type) - getRank(a.type));
  const primary = sortedStructs[0];
  const auxiliary = sortedStructs.slice(1);

  return (
    <div className="relative w-full h-full flex flex-col bg-[#0f172a] overflow-hidden">
      <FloatingVariables variables={currentFrame.variables} />
      
      <div className="flex-1 relative min-h-[300px]">
        <div className="absolute top-4 right-4 z-20 flex flex-col items-end gap-2 pointer-events-none">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-md bg-slate-800/80 border border-slate-600/80 text-xs font-mono text-indigo-400 uppercase tracking-widest shadow-sm">{primary.type}</span>
            <span className="px-3 py-1 rounded-md bg-indigo-500/20 border border-indigo-500/40 text-xs font-mono text-indigo-200 shadow-sm">{primary.name}</span>
          </div>
        </div>
        <EngineRenderer structure={primary} compact={false} />
      </div>

      {auxiliary.length > 0 && (
        <div className="h-1/3 min-h-[220px] max-h-[300px] border-t border-slate-700/50 bg-[#1e293b]/30 p-4 flex gap-4 overflow-x-auto custom-scrollbar flex-shrink-0 relative z-10 shadow-[0_-10px_30px_rgba(0,0,0,0.2)]">
          {auxiliary.map((struct) => (
            <div key={struct.id} className="min-w-[280px] max-w-[400px] flex-1 bg-slate-800/40 rounded-xl border border-slate-600/30 overflow-hidden flex flex-col shadow-inner">
              <div className="px-3 py-1.5 bg-slate-800/60 border-b border-slate-600/30 flex justify-between items-center">
                 <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">{struct.type}</span>
                 <span className="text-[11px] font-mono font-semibold text-indigo-300">{struct.name}</span>
              </div>
              <div className="flex-1 relative overflow-hidden">
                <EngineRenderer structure={struct} compact={true} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


