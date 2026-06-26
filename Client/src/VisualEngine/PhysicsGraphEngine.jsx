import React, { useState, useEffect } from 'react';
// ✅ Local NPM imports 
import { ReactFlow, Background, Controls, applyNodeChanges, applyEdgeChanges, Panel } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

export default function PhysicsEngine({ frameData }) {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);

  useEffect(() => {
    if (frameData && frameData.nodes) {
      const formattedNodes = frameData.nodes.map(n => ({
        id: n.id.toString(),
        position: n.position || { x: Math.random() * 200, y: Math.random() * 200 },
        data: { label: n.label || n.val },
        style: { 
          background: n.isActive ? '#6366f1' : '#1e293b', 
          color: 'white',
          border: '1px solid #475569',
          borderRadius: '8px',
          padding: '10px'
        }
      }));

      const formattedEdges = frameData.edges?.map(e => ({
        id: `e${e.source}-${e.target}`,
        source: e.source.toString(),
        target: e.target.toString(),
        animated: e.isActive,
        style: { stroke: e.isActive ? '#818cf8' : '#475569', strokeWidth: 2 }
      })) || [];

      setNodes(formattedNodes);
      setEdges(formattedEdges);
    }
  }, [frameData]);

  const onNodesChange = (changes) => setNodes((nds) => applyNodeChanges(changes, nds));
  const onEdgesChange = (changes) => setEdges((eds) => applyEdgeChanges(changes, eds));

  return (
    <div className="w-full h-full relative text-slate-900" style={{ minHeight: '500px' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
      >
        <Background color="#334155" gap={16} />
        <Controls className="bg-slate-800 border-slate-600 fill-white" />
      </ReactFlow>
    </div>
  );
}