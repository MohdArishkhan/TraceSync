import React from 'react';

export default function LinkedListEngine({ data }) {
  const nodes = data?.nodes ?? [];
  const edges = data?.edges ?? [];
  
  if (!nodes.length) {
    return (
      <div className="flex items-center justify-center w-full h-full text-slate-500 text-sm">
        Waiting for linked list data...
      </div>
    );
  }

  // Layout Constants
  const NODE_W = 86;
  const NODE_H = 52;
  const ARROW_W = 52;
  const MARGIN = 20;
  
  // Calculate total required canvas size based on list length
  const totalW = MARGIN + nodes.length * (NODE_W + ARROW_W) + 60;
  const totalH = 140;
  const cy = totalH / 2;

  return (
    <div className="w-full h-full flex items-center justify-center overflow-auto p-4">
      <svg 
        width={totalW} 
        height={totalH} 
        viewBox={`0 0 ${totalW} ${totalH}`} 
        style={{ minWidth: `${totalW}px` }}
      >
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
            <g key={node.id}>
              {/* Node Body */}
              <rect 
                x={x} 
                y={y} 
                width={NODE_W} 
                height={NODE_H} 
                rx="8" 
                fill={active ? "#4f46e5" : "#1e293b"} 
                stroke={active ? "#818cf8" : "#334155"} 
                strokeWidth="2" 
              />
              
              {/* Node Value */}
              <text 
                x={x + NODE_W * 0.35} 
                y={cy + 5} 
                textAnchor="middle" 
                fill={active ? "#e0e7ff" : "#e2e8f0"} 
                fontSize="15" 
                fontWeight="700" 
                fontFamily="'JetBrains Mono', monospace" 
                style={{ userSelect: "none" }}
              >
                {node.val}
              </text>
              
              {/* Internal Divider Line */}
              <line 
                x1={x + NODE_W * 0.67} 
                y1={y + 8} 
                x2={x + NODE_W * 0.67} 
                y2={y + NODE_H - 8} 
                stroke={active ? "#818cf8" : "#334155"} 
                strokeWidth="1.5" 
              />
              
              {/* "next" label */}
              <text 
                x={x + NODE_W * 0.83} 
                y={cy + 5} 
                textAnchor="middle" 
                fill={active ? "#c7d2fe" : "#475569"} 
                fontSize="9" 
                fontFamily="monospace" 
                style={{ userSelect: "none" }}
              >
                next
              </text>
              
              {/* Arrow to next node */}
              {hasNext && (
                <line 
                  x1={x + NODE_W} 
                  y1={cy} 
                  x2={x + NODE_W + ARROW_W - 5} 
                  y2={cy} 
                  stroke={edgeToNext?.isActive ? "#818cf8" : "#475569"} 
                  strokeWidth="2.5" 
                  markerEnd={edgeToNext?.isActive ? "url(#ll-head-active)" : "url(#ll-head)"} 
                />
              )}
              
              {/* NULL terminator */}
              {!hasNext && (
                <text 
                  x={x + NODE_W + 10} 
                  y={cy + 5} 
                  fill="#475569" 
                  fontSize="12" 
                  fontWeight="700" 
                  fontFamily="monospace"
                >
                  NULL
                </text>
              )}
              
              {/* Active pointer label (e.g., 'cur') */}
              {active && (
                <>
                  <line 
                    x1={x + NODE_W * 0.35} 
                    y1={y - 8} 
                    x2={x + NODE_W * 0.35} 
                    y2={y} 
                    stroke="#818cf8" 
                    strokeWidth="1.5" 
                  />
                  <text 
                    x={x + NODE_W * 0.35} 
                    y={y - 14} 
                    textAnchor="middle" 
                    fill="#818cf8" 
                    fontSize="10" 
                    fontWeight="600" 
                    fontFamily="monospace"
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