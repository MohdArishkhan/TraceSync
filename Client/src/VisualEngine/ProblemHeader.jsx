import React, { useState } from 'react';

// ─────────────────────────────────────────────────────────────────────────────
//  PROBLEM CONTEXT HEADER
//  Orients the learner BEFORE they press play: title, difficulty, pattern,
//  one-line description, companies. Pulled from vizSpec — the AI analysis
//  prompt should be extended to return these fields (see integration note
//  at the bottom of this file).
//
//  vizSpec shape this expects:
//  {
//    problemName: "Sort Colors",
//    leetcodeNumber: 75,            // optional
//    difficulty: "MEDIUM",          // EASY | MEDIUM | HARD
//    pattern: "Dutch National Flag · in-place · three pointers",
//    description: "Given an array of objects colored 0, 1, or 2, sort them
//                   in place so equal colors are grouped in that order...",
//    companies: ["Microsoft", "Amazon", "Meta"],
//    complexity: { time: "O(n)", space: "O(1)" },
//  }
// ─────────────────────────────────────────────────────────────────────────────

const DIFFICULTY_STYLE = {
  EASY:   { bg: 'rgba(34,197,94,0.12)',  border: '#22c55e', text: '#86efac' },
  MEDIUM: { bg: 'rgba(245,158,11,0.12)', border: '#f59e0b', text: '#fde68a' },
  HARD:   { bg: 'rgba(239,68,68,0.12)',  border: '#ef4444', text: '#fca5a5' },
};

export default function ProblemHeader({ vizSpec }) {
  const [expanded, setExpanded] = useState(false);
  if (!vizSpec?.problemName) return null;

  const diff = DIFFICULTY_STYLE[vizSpec.difficulty?.toUpperCase()] ?? DIFFICULTY_STYLE.MEDIUM;

  return (
    <div className="flex-shrink-0 border-b border-slate-700/40 bg-slate-900/40 px-5 py-3">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-2 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-base font-bold text-slate-100">{vizSpec.problemName}</h2>
            {vizSpec.leetcodeNumber && (
              <span className="px-2 py-0.5 rounded-md bg-slate-800/80 border border-slate-600/60 text-[10px] font-mono text-slate-400">
                LeetCode #{vizSpec.leetcodeNumber}
              </span>
            )}
            {vizSpec.difficulty && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border" style={{ background: diff.bg, borderColor: diff.border, color: diff.text }}>
                {vizSpec.difficulty}
              </span>
            )}
            {vizSpec.pattern && (
              <button
                onClick={() => setExpanded((e) => !e)}
                className="px-2 py-0.5 rounded-md bg-indigo-500/10 border border-indigo-500/30 text-[10px] font-mono text-indigo-300 hover:bg-indigo-500/20 transition-colors"
              >
                {vizSpec.pattern} {expanded ? '▲' : '▼'}
              </button>
            )}
          </div>

          {expanded && vizSpec.description && (
            <p className="text-[12.5px] text-slate-400 leading-relaxed max-w-2xl">{vizSpec.description}</p>
          )}

          {expanded && vizSpec.companies?.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[9px] font-mono text-slate-600 uppercase tracking-widest">Asked at</span>
              {vizSpec.companies.map((c) => (
                <span key={c} className="px-2 py-0.5 rounded-md bg-slate-800/60 border border-slate-700/50 text-[10px] text-slate-400">{c}</span>
              ))}
            </div>
          )}
        </div>

        {vizSpec.complexity && (
          <div className="flex-shrink-0 text-right">
            <div className="px-3 py-1.5 rounded-lg bg-slate-800/60 border border-slate-700/50">
              <div className="text-[9px] font-mono text-slate-500 uppercase tracking-widest mb-0.5">{vizSpec.approachLabel ?? 'approach'}</div>
              <div className="text-[11px] font-mono text-indigo-300">
                time {vizSpec.complexity.time} · space {vizSpec.complexity.space}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  INTEGRATION NOTE
//  Render this directly above <PolymorphicRouter /> in VisualPanel.jsx:
//
//    <ProblemHeader vizSpec={vizSpec} />
//    <PolymorphicRouter currentFrame={currentStep} vizSpec={vizSpec} ... />
//
//  To populate vizSpec.problemName/difficulty/pattern/description/companies,
//  extend the ArtificialRoutes.js system prompt's vizSpec schema with these
//  five fields. The AI already reads the problem from the user's code +
//  function signature, so asking it to also classify difficulty/pattern/
//  companies is a small prompt addition, not a new pipeline.
// ─────────────────────────────────────────────────────────────────────────────
