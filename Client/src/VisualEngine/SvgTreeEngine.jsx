import React, { useMemo } from 'react';
import * as d3 from 'd3-hierarchy';
import { motion } from 'framer-motion';

export default function SVGEngine({ frameData }) {
  // Expected: { name: "10", children: [{ name: "5" }, { name: "15" }] }
  
  const { nodes, links } = useMemo(() => {
    if (!frameData || !frameData.tree) return { nodes: [], links: [] };

    try {
      const hierarchyData = d3.hierarchy(frameData.tree);
      const treeLayout = d3.tree().nodeSize([60, 80]); // Width, Height spacing
      const rootNode = treeLayout(hierarchyData);

      return {
        nodes: rootNode.descendants(),
        links: rootNode.links()
      };
    } catch (e) {
      console.error("Tree layout failed", e);
      return { nodes: [], links: [] };
    }
  }, [frameData]);

  if (!nodes.length) return <div className="p-4 text-slate-400">Waiting for tree data...</div>;

  // Center the tree dynamically based on the root node
  const minX = Math.min(...nodes.map(n => n.x));
  const maxX = Math.max(...nodes.map(n => n.x));
  const minY = Math.min(...nodes.map(n => n.y));
  const maxY = Math.max(...nodes.map(n => n.y));
  
  const viewBox = `${minX - 50} ${minY - 50} ${maxX - minX + 100} ${maxY - minY + 100}`;

  return (
    <div className="w-full h-full flex items-center justify-center overflow-hidden">
      <svg width="100%" height="100%" viewBox={viewBox} preserveAspectRatio="xMidYMid meet">
        <g>
          {links.map((link, i) => (
            <path
              key={`link-${i}`}
              d={`M ${link.source.x},${link.source.y} L ${link.target.x},${link.target.y}`}
              stroke="#475569" // slate-600
              strokeWidth="2"
              fill="none"
            />
          ))}

          {nodes.map((node, i) => {
            const isActive = frameData.activeNodes?.includes(node.data.name || node.data.val);
            return (
              <motion.g
                key={`node-${node.data.id || i}`}
                animate={{ x: node.x, y: node.y }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
              >
                <circle 
                  r="20" 
                  fill={isActive ? "#6366f1" : "#1e293b"} // indigo-500 or slate-800
                  stroke={isActive ? "#818cf8" : "#475569"} 
                  strokeWidth="3" 
                />
                <text
                  dy="5"
                  textAnchor="middle"
                  fill="white"
                  className="text-sm font-bold pointer-events-none"
                >
                  {node.data.name || node.data.val}
                </text>
              </motion.g>
            );
          })}
        </g>
      </svg>
    </div>
  );
}