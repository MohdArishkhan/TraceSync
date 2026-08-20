// import React, { useState, useEffect } from 'react';
// // ✅ Local NPM imports 
// import { ReactFlow, Background, Controls, applyNodeChanges, applyEdgeChanges, Panel } from '@xyflow/react';
// import '@xyflow/react/dist/style.css';

// export default function PhysicsEngine({ frameData }) {
//   const [nodes, setNodes] = useState([]);
//   const [edges, setEdges] = useState([]);

//   useEffect(() => {
//     if (frameData && frameData.nodes) {
//       const formattedNodes = frameData.nodes.map(n => ({
//         id: n.id.toString(),
//         position: n.position || { x: Math.random() * 200, y: Math.random() * 200 },
//         data: { label: n.label || n.val },
//         style: { 
//           background: n.isActive ? '#6366f1' : '#1e293b', 
//           color: 'white',
//           border: '1px solid #475569',
//           borderRadius: '8px',
//           padding: '10px'
//         }
//       }));

//       const formattedEdges = frameData.edges?.map(e => ({
//         id: `e${e.source}-${e.target}`,
//         source: e.source.toString(),
//         target: e.target.toString(),
//         animated: e.isActive,
//         style: { stroke: e.isActive ? '#818cf8' : '#475569', strokeWidth: 2 }
//       })) || [];

//       setNodes(formattedNodes);
//       setEdges(formattedEdges);
//     }
//   }, [frameData]);

//   const onNodesChange = (changes) => setNodes((nds) => applyNodeChanges(changes, nds));
//   const onEdgesChange = (changes) => setEdges((eds) => applyEdgeChanges(changes, eds));

//   return (
//     <div className="w-full h-full relative text-slate-900" style={{ minHeight: '500px' }}>
//       <ReactFlow
//         nodes={nodes}
//         edges={edges}
//         onNodesChange={onNodesChange}
//         onEdgesChange={onEdgesChange}
//         fitView
//       >
//         <Background color="#334155" gap={16} />
//         <Controls className="bg-slate-800 border-slate-600 fill-white" />
//       </ReactFlow>
//     </div>
//   );
// }

import React, { useState, useEffect, useMemo } from 'react';
import { ReactFlow, Background, Controls, applyNodeChanges, applyEdgeChanges } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

// data shape:
// {
//   nodes: [{ id, label/val, isActive, isVisited, distance, position }, ...],
//   edges: [{ source, target, weight, isActive, isPath }, ...],
//   statusText
// }
export default function PhysicsEngine({ data }) {
  const [rfNodes, setRfNodes] = useState([]);
  const [rfEdges, setRfEdges] = useState([]);

  useEffect(() => {
    if (!data?.nodes?.length) return;

    setRfNodes(
      data.nodes.map((n, idx) => {
        const isActive  = !!n.isActive;
        const isVisited = !!n.isVisited;
        const hasDist   = n.distance !== undefined && n.distance !== null && n.distance !== Infinity;

        return {
          id: String(n.id),
          position: n.position ?? { x: 90 + (idx % 5) * 150, y: 90 + Math.floor(idx / 5) * 130 },
          data: {
            label: (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                <span>{n.label ?? n.val ?? n.id}</span>
                {hasDist && (
                  <span style={{ fontSize: 9, opacity: 0.75, fontWeight: 500 }}>
                    d={n.distance}
                  </span>
                )}
              </div>
            ),
          },
          style: {
            background:   isActive ? '#4f46e5' : isVisited ? '#064e3b' : '#1e293b',
            color:        isActive ? '#e0e7ff' : isVisited ? '#a7f3d0' : '#e2e8f0',
            border:       isActive ? '2.5px solid #818cf8' : isVisited ? '2px solid #10b981' : '1.5px solid #334155',
            borderRadius: '10px',
            padding:      '8px 14px',
            fontSize:     '14px',
            fontWeight:   700,
            fontFamily:   "'JetBrains Mono', monospace",
            boxShadow:    isActive ? '0 0 18px rgba(99,102,241,0.55)' : isVisited ? '0 0 10px rgba(16,185,129,0.25)' : 'none',
            minWidth:     '54px',
            textAlign:    'center',
            transition:   'all 0.25s ease',
          },
        };
      })
    );

    setRfEdges(
      (data.edges ?? []).map((e) => {
        const isActive = !!e.isActive;
        const isPath   = !!e.isPath;
        const stroke   = isPath ? '#34d399' : isActive ? '#818cf8' : '#475569';
        return {
          id: e.id ?? `e-${e.source}-${e.target}`,
          source: String(e.source),
          target: String(e.target),
          animated: isActive,
          label: e.weight !== undefined ? String(e.weight) : undefined,
          labelStyle: { fill: stroke, fontWeight: 700, fontSize: 11, fontFamily: 'monospace' },
          labelBgStyle: { fill: '#0f172a', fillOpacity: 0.85 },
          style: { stroke, strokeWidth: isPath ? 3 : isActive ? 2.5 : 1.6 },
          markerEnd: { type: 'arrowclosed', color: stroke },
        };
      })
    );
  }, [data]);

  if (!data?.nodes?.length) {
    return (
      <div className="flex items-center justify-center w-full h-full text-slate-500 text-sm font-mono">
        Waiting for graph data…
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col overflow-hidden">
      <div className="flex-shrink-0 flex items-center justify-between px-4 py-2 border-b border-slate-700/30 bg-slate-950/50 z-10 relative">
        <span className="px-2.5 py-0.5 rounded-md bg-indigo-500/10 border border-indigo-500/25 text-[10px] font-mono text-indigo-400 tracking-widest">
          Graph · {data.nodes.length} nodes · {(data.edges ?? []).length} edges
        </span>
        {data.statusText && (
          <span className="text-[11px] font-mono text-amber-300 truncate max-w-[260px]">{data.statusText}</span>
        )}
      </div>

      <div className="flex-1 relative" style={{ minHeight: '160px' }}>
        <ReactFlow
          nodes={rfNodes}
          edges={rfEdges}
          onNodesChange={(c) => setRfNodes((p) => applyNodeChanges(c, p))}
          onEdgesChange={(c) => setRfEdges((p) => applyEdgeChanges(c, p))}
          fitView
          fitViewOptions={{ padding: 0.3 }}
          proOptions={{ hideAttribution: true }}
        >
          <Background color="#1e293b" gap={24} variant="dots" />
          <Controls showInteractive={false} />
        </ReactFlow>
      </div>

      <div className="flex-shrink-0 flex items-center gap-4 px-4 py-2 border-t border-slate-700/25 bg-slate-950/40 z-10 relative">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full" style={{ background: '#4f46e5', border: '1px solid #818cf8' }} />
          <span className="text-[9px] font-mono text-slate-500">Active node</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full" style={{ background: '#064e3b', border: '1px solid #10b981' }} />
          <span className="text-[9px] font-mono text-slate-500">Visited</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-6 h-0.5" style={{ background: '#34d399' }} />
          <span className="text-[9px] font-mono text-slate-500">Shortest path</span>
        </div>
      </div>
    </div>
  );
}