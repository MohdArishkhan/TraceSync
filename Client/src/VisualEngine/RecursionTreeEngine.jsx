import React, { useMemo } from 'react';
import * as d3 from 'd3-hierarchy';

export default function RecursionTreeEngine({ data }) {
  const { nodes, links } = useMemo(() => {
    if (!data?.tree) return { nodes: [], links: [] };
    try {
      const root = d3.hierarchy(data.tree);
      // Ultra-compact spacing to fit deeper recursion trees
      const layout = d3.tree().nodeSize([85, 200]); 
      layout(root);
      return { nodes: root.descendants(), links: root.links() };
    } catch {
      return { nodes: [], links: [] };
    }
  }, [data]);

  if (!nodes.length) {
    return (
      <div className="flex items-center justify-center w-full h-full text-slate-500 text-xs font-mono tracking-widest uppercase">
        <span className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mr-2" />
        Tracing Recursion...
      </div>
    );
  }

  // Padding to ensure nodes/badges don't get cut off at the edges
  const PAD = 60;
  const minX = Math.min(...nodes.map((n) => n.x)) - PAD;
  const maxX = Math.max(...nodes.map((n) => n.x)) + PAD;
  const minY = Math.min(...nodes.map((n) => n.y)) - PAD;
  const maxY = Math.max(...nodes.map((n) => n.y)) + PAD;

  return (
    <div className="w-full h-full flex items-center justify-center overflow-hidden p-2 relative">
      
      {/* Optional: Minimal Legend */}
      <div className="absolute top-2 left-2 flex flex-col gap-1 pointer-events-none bg-slate-900/50 p-2 rounded border border-slate-700/50 backdrop-blur-sm z-10">
        <div className="flex items-center gap-2 text-[9px] font-mono text-slate-300">
          <div className="w-2 h-2 rounded-full bg-rose-500" /> Left Call
        </div>
        <div className="flex items-center gap-2 text-[9px] font-mono text-slate-300">
          <div className="w-2 h-2 rounded-full bg-blue-500" /> Right Call
        </div>
      </div>

      <svg width="100%" height="100%" viewBox={`${minX} ${minY} ${maxX - minX} ${maxY - minY}`} preserveAspectRatio="xMidYMid meet">
        <defs>
          {/* Arrowheads mapped to branch colors */}
          <marker id="arrow-left" markerWidth="6" markerHeight="6" refX="16" refY="3" orient="auto">
            <polygon points="0 0,6 3,0 6" fill="#f43f5e" /> {/* Rose-500 */}
          </marker>
          <marker id="arrow-right" markerWidth="6" markerHeight="6" refX="16" refY="3" orient="auto">
            <polygon points="0 0,6 3,0 6" fill="#3b82f6" /> {/* Blue-500 */}
          </marker>
          <marker id="arrow-default" markerWidth="6" markerHeight="6" refX="16" refY="3" orient="auto">
            <polygon points="0 0,6 3,0 6" fill="#64748b" /> {/* Slate-500 */}
          </marker>
          
          {/* Subtle glow filter for the active node */}
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        <g>
          {/* --- LINKS (EDGES) --- */}
          {links.map((lnk, i) => {
            const childIndex = lnk.source.children ? lnk.source.children.indexOf(lnk.target) : -1;
            const isLeft = childIndex === 0;
            const isRight = childIndex === 1;

            const strokeColor = isLeft ? "#f43f5e" : isRight ? "#3b82f6" : "#64748b";
            const markerId = isLeft ? "arrow-left" : isRight ? "arrow-right" : "arrow-default";
            
            // Cubic Bezier curve for smooth, organic branches
            const pathData = `M${lnk.source.x},${lnk.source.y} C${lnk.source.x},${(lnk.source.y + lnk.target.y) / 2} ${lnk.target.x},${(lnk.source.y + lnk.target.y) / 2} ${lnk.target.x},${lnk.target.y}`;
            
            // Midpoint for tiny edge labels (L / R)
            const midX = (lnk.source.x + lnk.target.x) / 2;
            const midY = (lnk.source.y + lnk.target.y) / 2;

            return (
              <g key={`edge-${i}`}>
                <path 
                  d={pathData} 
                  stroke={strokeColor} 
                  strokeWidth="1.5" 
                  fill="none" 
                  markerEnd={`url(#${markerId})`}
                  style={{ transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)" }}
                />
                {/* Tiny branch labels (L/R) */}
                <text 
                  x={midX + (isLeft ? -8 : 8)} 
                  y={midY} 
                  fill={strokeColor} 
                  fontSize="7" 
                  fontWeight="bold" 
                  fontFamily="'JetBrains Mono', monospace"
                  textAnchor="middle"
                  opacity="0.8"
                >
                  {isLeft ? "L" : isRight ? "R" : ""}
                </text>
              </g>
            );
          })}

          {/* --- NODES --- */}
          {nodes.map((node, i) => {
            const isCompleted = node.data.status === 'completed';
            const isActive = node.data.status === 'active';
            
            // Dynamic styling based on execution state
            const bgFill = isActive ? "#1e1b4b" : isCompleted ? "#064e3b" : "#1e293b"; // Indigo-950, Emerald-950, Slate-800
            const strokeColor = isActive ? "#818cf8" : isCompleted ? "#34d399" : "#475569"; // Indigo-400, Emerald-400, Slate-600
            const strokeW = isActive ? "2.5" : "1.5";

            return (
              <g 
                key={`nd-${node.data.id ?? i}`} 
                transform={`translate(${node.x},${node.y})`} 
                style={{ transition: "transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)" }}
              >
                {/* Optional subtle active halo */}
                {isActive && (
                  <circle r="19" fill="none" stroke="#6366f1" strokeWidth="4" opacity="0.3" className="animate-ping" />
                )}

                {/* Main Node Circle */}
                <circle 
                  r="14" 
                  fill={bgFill} 
                  stroke={strokeColor} 
                  strokeWidth={strokeW} 
                  filter={isActive ? "url(#glow)" : ""}
                />
                
                {/* Function Call Text (e.g., f(5)) */}
                <text 
                  dy="3" 
                  textAnchor="middle" 
                  fill={isActive ? "#e0e7ff" : "#f8fafc"} 
                  fontSize="6" 
                  fontWeight="700" 
                  fontFamily="'JetBrains Mono', monospace" 
                  style={{ pointerEvents: "none", userSelect: "none" }}
                >
                  {node.data.name}
                </text>

                {/* Return Value Pill Badge */}
                {isCompleted && node.data.returnValue && (
                  <g transform="translate(0, 22)">
                    <rect 
                      x="-14" 
                      y="-7" 
                      width="28" 
                      height="14" 
                      rx="4" 
                      fill="#064e3b" 
                      stroke="#10b981" 
                      strokeWidth="1" 
                    />
                    <text 
                      dy="3.5" 
                      textAnchor="middle" 
                      fill="#a7f3d0" 
                      fontSize="7" 
                      fontWeight="bold" 
                      fontFamily="'JetBrains Mono', monospace"
                    >
                      {node.data.returnValue}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
}