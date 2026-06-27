import React, { useMemo } from 'react';
import * as d3 from 'd3-hierarchy';

export default function SegmentTreeEngine({ data }) {
  // data: { array: [values], activeIndices: [idx] }
  const arr = data?.array ?? [];
  const active = data?.activeIndices ?? [];

  // Build Binary Tree from Array-based Segment Tree
  // Note: Root is at index 0, Left = 2*i + 1, Right = 2*i + 2
  const { nodes, links } = useMemo(() => {
    if (!arr.length) return { nodes: [], links: [] };

    const buildTree = (idx) => {
      if (idx >= arr.length) return null;
      const node = { id: `st-${idx}`, name: String(arr[idx]?.value ?? arr[idx] ?? "∅") };
      const left = buildTree(2 * idx + 1);
      const right = buildTree(2 * idx + 2);
      if (left || right) node.children = [left, right].filter(Boolean);
      return node;
    };

    const rootData = buildTree(0);
    const root = d3.hierarchy(rootData);
    d3.tree().nodeSize([70, 70])(root);

    return { nodes: root.descendants(), links: root.links() };
  }, [arr]);

  const PAD = 50;
  const minX = nodes.length ? Math.min(...nodes.map(n => n.x)) - PAD : 0;
  const maxX = nodes.length ? Math.max(...nodes.map(n => n.x)) + PAD : 100;
  const minY = PAD;
  const maxY = nodes.length ? Math.max(...nodes.map(n => n.y)) + PAD : 100;

  return (
    <div className="flex flex-col w-full h-full bg-slate-900/40 rounded-xl overflow-hidden">
      <div className="flex-1 p-4">
        <svg viewBox={`${minX} ${minY} ${maxX - minX} ${maxY - minY}`} width="100%" height="100%">
          {links.map((lnk, i) => (
            <path key={i} d={`M${lnk.source.x},${lnk.source.y} L${lnk.target.x},${lnk.target.y}`} stroke="#475569" strokeWidth="2" fill="none" />
          ))}
          {nodes.map((n, i) => (
            <g key={i} transform={`translate(${n.x},${n.y})`}>
              <circle r="18" fill="#1e293b" stroke={active.includes(i) ? "#fbbf24" : "#64748b"} strokeWidth="2" />
              <text textAnchor="middle" dy="5" fill="white" fontSize="10" className="font-mono">{n.data.name}</text>
            </g>
          ))}
        </svg>
      </div>
      
      {/* Array Base */}
      <div className="flex justify-center gap-1 p-3 bg-slate-950/50 border-t border-slate-800">
        {arr.map((val, i) => (
          <div key={i} className={`w-8 h-8 flex items-center justify-center text-[10px] font-mono border rounded ${active.includes(i) ? 'bg-amber-500 text-black' : 'bg-slate-800 text-white'}`}>
            {val?.value ?? val}
          </div>
        ))}
      </div>
    </div>
  );
}