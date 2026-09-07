import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ─────────────────────────────────────────────────────────────────────────────
//  COLOR SYSTEM — semantic, vizSpec-aware
// ─────────────────────────────────────────────────────────────────────────────
const PALETTE = {
  green:   { bg: '#14532d', border: '#16a34a', text: '#86efac', glow: 'rgba(34,197,94,0.35)'  },
  blue:    { bg: '#172554', border: '#2563eb', text: '#93c5fd', glow: 'rgba(59,130,246,0.3)'  },
  emerald: { bg: '#022c22', border: '#059669', text: '#6ee7b7', glow: 'rgba(16,185,129,0.35)' },
  amber:   { bg: '#451a03', border: '#d97706', text: '#fde68a', glow: 'rgba(245,158,11,0.45)' },
  red:     { bg: '#450a0a', border: '#dc2626', text: '#fca5a5', glow: 'rgba(239,68,68,0.45)'  },
  indigo:  { bg: '#1e1b4b', border: '#4f46e5', text: '#c7d2fe', glow: 'rgba(99,102,241,0.4)'  },
  purple:  { bg: '#2e1065', border: '#9333ea', text: '#e9d5ff', glow: 'rgba(168,85,247,0.35)' },
  slate:   { bg: '#1e293b', border: '#475569', text: '#94a3b8', glow: 'none'                   },
  cyan:    { bg: '#083344', border: '#0891b2', text: '#67e8f9', glow: 'rgba(6,182,212,0.35)'  },
  rose:    { bg: '#4c0519', border: '#e11d48', text: '#fda4af', glow: 'rgba(244,63,94,0.4)'   },
  orange:  { bg: '#431407', border: '#ea580c', text: '#fdba74', glow: 'rgba(249,115,22,0.35)' },
};
const DEFAULT_C = { bg: '#1e293b', border: '#334155', text: '#64748b', glow: 'none' };
const byName = (n) => PALETTE[String(n).toLowerCase()] ?? DEFAULT_C;

const stripMeta = (arr) => {
  if (!Array.isArray(arr)) return arr;
  const s = typeof arr[0] === 'string' && ['LIST', 'TUPLE', 'SET', 'DICT'].includes(arr[0]) ? 1 : 0;
  return arr.slice(s).map((v) => (Array.isArray(v) ? stripMeta(v) : v));
};
const getVal = (v) => (v?.value !== undefined ? v.value : v);

// Resolve a cell's color using: 1) blocked/checking state, 2) vizSpec cellRules,
// 3) smart fallback for common encodings ("1"=land, "0"=water, "Q"=queen, etc.)
const resolveCellColor = ({ val, wasModified, isCheck, isBlocked, isPassing, vizSpec }) => {
  if (isCheck && isBlocked) return PALETTE.red;
  if (isCheck && isPassing) return PALETTE.emerald;
  if (isCheck)              return PALETTE.amber;

  const rules = vizSpec?.cellRules ?? [];
  const v = String(val);

  if (wasModified) {
    const r = rules.find((r) => r.match?.wasModified === true);
    return r ? byName(r.color) : PALETTE.emerald;
  }

  const vr = rules.find((r) => r.match?.value !== undefined && String(r.match.value) === v);
  if (vr) return byName(vr.color);

  if (v === '1') return PALETTE.green;
  if (v === '0') return PALETTE.blue;
  if (v === 'Q') return PALETTE.indigo;
  if (v === '2') return PALETTE.red;
  if (v === '#' || v === 'W' || v === 'X') return { bg: '#0f172a', border: '#1e293b', text: '#334155', glow: 'none' };
  if (v === '.' || v === '_') return { ...DEFAULT_C, text: '#334155' };

  return DEFAULT_C;
};

const LegendDot = ({ bg, border, label }) => (
  <div className="flex items-center gap-1.5">
    <div className="w-3 h-3 rounded-sm" style={{ background: bg, border: `1px solid ${border}` }} />
    <span className="text-[9px] font-mono text-slate-500">{label}</span>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
//  MAIN COMPONENT
//
//  Expects `data` shaped exactly as TracerWorker's MATRIX emit produces:
//    { matrix, activeIndices, checkRow, checkCol, condition: { result, isGuard, text } }
//  condition.isGuard = true  → the code does return/continue/break in this branch
//  condition.result          → true/false/null (evaluated outcome, null = unknown)
//
//  "Blocked"  = the cell check failed and the algorithm bails out here
//  "Passing"  = the cell check succeeded and the algorithm proceeds
// ─────────────────────────────────────────────────────────────────────────────
export default function GridEngine({ data, compact = false }) {
  const rawData  = data?.matrix ?? data?.array ?? [];
  const actIdxs  = data?.activeIndices ?? [];
  const vizSpec  = data?.vizSpec ?? null;
  const checkRow = data?.checkRow ?? null;
  const checkCol = data?.checkCol ?? null;
  const condition = data?.condition ?? null;
  const narration = data?.narration ?? null;
  const cursors  = data?.cursors ?? [];   // multi-cursor: [{ pairId, row, col, color, label }]
  const sharedTimestep = data?.sharedTimestep ?? null;
  // callsSoFar removed from display per user feedback — was cluttering the
  // HUD without adding learning value; kept out of the render entirely now.
  const isHeatmap = (data?.isHeatmap ?? false) || (data?.isDPValues ?? false);
  const isDPValues = data?.isDPValues ?? false;
  const heatmapLabel = data?.heatmapLabel ?? 'Value';
  const decisionArrows = data?.decisionArrows ?? [];
  const recentDPCalls = data?.recentDPCalls ?? [];

  const isGuard   = condition?.isGuard ?? false;
  const isBlocked = !!condition && condition.result !== null && ((isGuard && condition.result === true) || (!isGuard && condition.result === false));
  const isPassing = !!condition && condition.result !== null && ((isGuard && condition.result === false) || (!isGuard && condition.result === true));
  const hasCheck  = checkRow !== null && checkCol !== null;

  const cleanData = useMemo(() => stripMeta(rawData), [rawData]);
  const isMatrix  = cleanData.length > 0 && Array.isArray(cleanData[0]);
  const rows      = isMatrix ? cleanData.length : 0;
  const cols      = isMatrix ? (cleanData[0]?.length ?? 0) : 0;
  const modSet    = useMemo(() => new Set(actIdxs.map(String)), [actIdxs]);

  // Group cursors by cell key so cells with 2+ simultaneous cursors (two
  // travelers landing on the same square) render a merged multi-color ring
  // instead of one cursor silently overwriting the other.
  const cursorsByCell = useMemo(() => {
    const m = new Map();
    for (const c of cursors) {
      const key = `${c.row},${c.col}`;
      if (!m.has(key)) m.set(key, []);
      m.get(key).push(c);
    }
    return m;
  }, [cursors]);

  const maxHeatVal = useMemo(() => {
    if (!isHeatmap) return 1;
    let max = 1;
    for (const row of cleanData) for (const v of row) {
      const n = Number(getVal(v));
      if (getVal(v) !== null && !isNaN(n)) max = Math.max(max, n);
    }
    return max;
  }, [isHeatmap, cleanData]);

  const maxDim = Math.max(rows, cols, 1);
  const cellPx = compact ? 28
    : maxDim <= 4  ? 74
    : maxDim <= 6  ? 62
    : maxDim <= 8  ? 52
    : maxDim <= 12 ? 42
    : maxDim <= 16 ? 34
    : 28;
  const fontSize = compact ? 9 : cellPx >= 60 ? 16 : cellPx >= 48 ? 14 : cellPx >= 36 ? 12 : 10;

  const legend = useMemo(() => {
    const base = vizSpec?.cellRules?.length
      ? vizSpec.cellRules.map((r) => ({
          ...byName(r.color),
          label: r.label ?? (r.match?.value !== undefined ? `"${r.match.value}"` : 'Modified'),
        }))
      : [
          { ...PALETTE.green, label: 'Traversable' },
          { ...PALETTE.blue, label: 'Blocked / wall' },
          { ...PALETTE.emerald, label: 'Visited / passes' },
          { ...PALETTE.amber, label: 'Checking' },
          { ...PALETTE.red, label: 'Guard failed' },
        ];
    // Append one legend swatch per distinct cursor (e.g. Traveler A / Traveler B)
    const seen = new Set();
    const cursorEntries = cursors
      .filter((c) => { if (seen.has(c.pairId)) return false; seen.add(c.pairId); return true; })
      .map((c) => ({ bg: 'transparent', border: c.color, text: c.color, glow: 'none', label: c.label ?? c.pairId }));
    const diagonalEntry = sharedTimestep !== null
      ? [{ bg: 'transparent', border: 'rgba(167,139,250,0.8)', text: '#a78bfa', glow: 'none', label: 'Shared diagonal (t)' }]
      : [];
    return [...base, ...cursorEntries, ...diagonalEntry];
  }, [vizSpec, cursors, sharedTimestep]);

  // Condition badge — top right, shows the actual source-code condition text
  const conditionBadge = isBlocked
    ? { cls: 'bg-red-500/15 border-red-500/40 text-red-400', label: `✗ ${condition?.text ?? 'blocked'}` }
    : isPassing
    ? { cls: 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400', label: `✓ ${condition?.text ?? 'passes'}` }
    : condition
    ? { cls: 'bg-amber-500/10 border-amber-500/30 text-amber-400', label: `Checking: ${condition?.text}` }
    : hasCheck
    ? { cls: 'bg-amber-500/10 border-amber-500/30 text-amber-400', label: `Visiting (${checkRow}, ${checkCol})` }
    : null;

  const statusText = isBlocked
    ? `${condition.text} — blocked`
    : isPassing
    ? `${condition.text} — passes`
    : condition
    ? `Evaluating: ${condition.text}`
    : hasCheck
    ? `Visiting (${checkRow}, ${checkCol})…`
    : '';
  const statusColor = isBlocked ? '#fca5a5' : isPassing ? '#6ee7b7' : '#94a3b8';

  if (!isMatrix && cleanData.length === 0) {
    return (
      <div className="flex items-center justify-center w-full h-full text-slate-500 text-sm font-mono">
        Waiting for grid data…
      </div>
    );
  }

  // ── 1-D ARRAY MODE ──────────────────────────────────────────────────────
  if (!isMatrix) {
    return (
      <div className="flex flex-col w-full h-full items-center justify-center gap-4 p-6">
        <div className="flex flex-wrap gap-3 justify-center">
          {cleanData.map((raw, idx) => {
            const v      = getVal(raw);
            const isActive = modSet.has(String(idx));
            const col = isActive
              ? PALETTE.indigo
              : DEFAULT_C;
            return (
              <div key={raw?.id ?? idx} className="flex flex-col items-center gap-1">
                <motion.div
                  animate={{ background: col.bg, borderColor: col.border, scale: isActive ? 1.1 : 1 }}
                  transition={{ duration: 0.2 }}
                  style={{ color: col.text, border: `2px solid ${col.border}`, boxShadow: isActive ? `0 0 16px ${col.glow}` : 'none' }}
                  className="w-14 h-14 rounded-xl flex items-center justify-center text-lg font-bold font-mono"
                >
                  {String(v)}
                </motion.div>
                <span className="text-[9px] font-mono text-slate-600">{idx}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ── 2-D MATRIX MODE ─────────────────────────────────────────────────────
  return (
    <div className="flex flex-col w-full h-full overflow-hidden select-none">

      {!compact && (
        <div className="flex flex-col gap-1.5 px-4 pt-3 pb-2 flex-shrink-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-md bg-indigo-500/10 border border-indigo-500/30 text-[10px] font-mono text-indigo-400 uppercase tracking-widest">
              {vizSpec?.problemName ?? `${rows}×${cols}`}
            </span>
            {sharedTimestep !== null && (
              <span className="px-2.5 py-0.5 rounded-md bg-violet-500/10 border border-violet-500/30 text-[10px] font-mono text-violet-300">
                t = {sharedTimestep} · both travelers on this diagonal
              </span>
            )}
          </div>
          {/* Condition badge gets its own full-width row — never truncated.
              Long guard expressions (e.g. "r1 >= n or c1 >= n or r2 >= n or
              c2 >= n") need to be fully readable to actually explain what's
              being checked, not cut off with an ellipsis. */}
          <AnimatePresence mode="wait">
            {conditionBadge && (
              <motion.div
                key={conditionBadge.label}
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`px-3 py-1.5 rounded-lg border text-[11px] font-bold tracking-wide leading-snug ${conditionBadge.cls}`}
              >
                {conditionBadge.label}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      <div className={`flex-1 flex overflow-hidden ${compact ? 'p-1' : 'p-4'}`}>
        <div className="flex-1 flex items-center justify-center overflow-auto">
        <div className="flex flex-col items-start">
          {!compact && (
            <div className="flex" style={{ marginLeft: Math.ceil(cellPx * 0.55) + 'px' }}>
              {cleanData[0].map((_, c) => (
                <div key={c} style={{ width: cellPx }} className="text-center text-[10px] font-mono text-slate-500 leading-none mb-1">{c}</div>
              ))}
            </div>
          )}
          <div className="flex">
            {!compact && (
              <div style={{ width: Math.ceil(cellPx * 0.5) + 'px' }}>
                {cleanData.map((_, r) => (
                  <div key={r} style={{ height: cellPx }} className="flex items-center justify-end pr-1 text-[10px] font-mono text-slate-500">{r}</div>
                ))}
              </div>
            )}
            <div className="relative" style={{ width: cellPx * cols, height: cellPx * rows }}>
              {cleanData.map((row, rIdx) =>
                row.map((val, cIdx) => {
                  const dVal    = getVal(val);
                  // When multi-cursor data is present, it fully replaces the
                  // single checkRow/checkCol highlight for THIS cell — using
                  // both would double-highlight the same square (e.g. traveler
                  // A's cursor ring stacked on top of the old amber "current
                  // cell" glow). Cursors are the richer signal when available.
                  const cellCursors = isHeatmap ? [] : (cursorsByCell.get(`${rIdx},${cIdx}`) ?? []);
                  const hasCursorHere = cellCursors.length > 0;
                  const isCheck = (isHeatmap || cursors.length > 0) ? false : (rIdx === checkRow && cIdx === checkCol);
                  const wasMod  = modSet.has(`${rIdx},${cIdx}`) && !isCheck && !hasCursorHere;
                  // Heatmap mode: numeric intensity gradient (blue, darker =
                  // more visits) instead of the categorical thorn/cherry/empty
                  // coloring — this is a fundamentally different kind of grid
                  // (visit frequency, not problem input), so it gets its own
                  // color logic entirely rather than reusing resolveCellColor.
                  const isUncomputed = isHeatmap && dVal === null;
                  const heatT = (isHeatmap && !isUncomputed) ? Math.min(1, Number(dVal) / maxHeatVal) : 0;
                  const col = isUncomputed
                    ? { bg: 'rgba(30,41,59,0.5)', border: '#334155', text: '#475569', glow: 'none' }
                    : isHeatmap
                    ? { bg: `rgba(16,185,129,${0.10 + heatT * 0.55})`, border: '#10b981', text: heatT > 0.5 ? '#d1fae5' : '#6ee7b7', glow: 'none' }
                    : resolveCellColor({ val: dVal, wasModified: wasMod, isCheck, isBlocked, isPassing, vizSpec });
                  const dimmed  = !isHeatmap && !isCheck && !wasMod && !hasCursorHere && (String(dVal) === '0' || String(dVal) === '.');
                  // Both travelers always sit on the SAME anti-diagonal
                  // (row+col === t) — this is the core insight that makes the
                  // 3-D state reduction work. A dashed violet outline traces
                  // that whole diagonal band, not just the two cursor cells,
                  // so the "why" behind the state space is visible, not just
                  // the "what" of where the travelers currently are.
                  const onSharedDiagonal = !isHeatmap && sharedTimestep !== null && (rIdx + cIdx === sharedTimestep);

                  return (
                    <motion.div
                      key={val?.id ?? `${rIdx}-${cIdx}`}
                      className="absolute flex items-center justify-center font-bold font-mono"
                      style={{ left: cIdx * cellPx, top: rIdx * cellPx, width: cellPx, height: cellPx, outline: '1px solid rgba(15,23,42,0.7)', zIndex: (isCheck || hasCursorHere) ? 5 : 1 }}
                      animate={{ background: col.bg }}
                      transition={{ duration: 0.22 }}
                    >
                      {isCheck && (
                        <motion.div
                          className="absolute inset-0"
                          animate={{ opacity: isBlocked ? 0 : [0.12, 0.42, 0.12] }}
                          transition={{ repeat: isBlocked ? 0 : Infinity, duration: 1.3 }}
                          style={{ background: col.border }}
                        />
                      )}
                      {isCheck && (
                        <div className="absolute inset-0 z-10 pointer-events-none" style={{ border: `2.5px solid ${col.border}`, boxShadow: `0 0 12px ${col.glow}` }} />
                      )}
                      {/* Multi-cursor markers — softened from a heavy glowing
                          border (which made the cell's own number hard to
                          read) to a thin low-opacity outline plus a small
                          corner dot per traveler. Legible value, still clear
                          which traveler(s) are here. */}
                      {cellCursors.map((cur, ci) => (
                        <React.Fragment key={cur.pairId}>
                          <div
                            className="absolute pointer-events-none z-10"
                            style={{
                              inset: `${ci * 3}px`,
                              border: `1.5px solid ${cur.color}70`,
                              borderRadius: '3px',
                            }}
                          />
                          <div
                            className="absolute pointer-events-none z-20 rounded-full"
                            style={{
                              width: 7, height: 7,
                              top: 3 + ci * 9, left: 3,
                              background: cur.color,
                              boxShadow: `0 0 4px ${cur.color}`,
                            }}
                          />
                        </React.Fragment>
                      ))}
                      {onSharedDiagonal && !hasCursorHere && (
                        <div
                          className="absolute inset-[2px] pointer-events-none z-[6]"
                          style={{ border: '1.5px dashed rgba(167,139,250,0.55)' }}
                        />
                      )}
                      {wasMod && (
                        <div className="absolute inset-0 pointer-events-none" style={{ boxShadow: `inset 0 0 6px ${PALETTE.emerald.glow}` }} />
                      )}
                      <span
                        className="relative z-5"
                        style={{
                          fontSize,
                          color: isCheck ? '#fff' : col.text,
                          fontWeight: isCheck ? 800 : 600,
                          opacity: dimmed ? 0.3 : 1,
                          textShadow: isCheck ? `0 0 10px ${col.glow}` : 'none',
                          transition: 'color 0.2s, opacity 0.3s',
                        }}
                      >
                        {dVal === null ? '—' : dVal === '.' ? '.' : String(dVal)}
                      </span>
                    </motion.div>
                  );
                })
              )}
              {/* Decision arrows — the actual "arrows" visualization: when a
                  recursive call is trying a next state (any "dp(...+1...)"
                  line), draw down/right arrows from each traveler's current
                  cell toward the two cells its max() choice is comparing —
                  the same idea as classic dp[i-1][j]/dp[i][j-1] arrows,
                  generalized to N simultaneous cursors. An SVG overlay sized
                  to match the grid exactly, sitting above the cells. */}
              {decisionArrows.length > 0 && (
                <svg
                  className="absolute inset-0 pointer-events-none z-30"
                  width={cellPx * cols} height={cellPx * rows}
                  viewBox={`0 0 ${cellPx * cols} ${cellPx * rows}`}
                >
                  <defs>
                    {decisionArrows.map((a, i) => (
                      <marker key={`m-${i}`} id={`dp-arrow-${i}`} markerWidth="7" markerHeight="6" refX="6" refY="3" orient="auto">
                        <polygon points="0 0,7 3,0 6" fill={a.color} />
                      </marker>
                    ))}
                  </defs>
                  {decisionArrows.map((a, i) => {
                    const toRow = a.fromRow + a.dr, toCol = a.fromCol + a.dc;
                    if (toRow >= rows || toCol >= cols) return null; // off-grid, nothing to point at
                    const x1 = a.fromCol * cellPx + cellPx / 2;
                    const y1 = a.fromRow * cellPx + cellPx / 2;
                    const x2 = toCol * cellPx + cellPx / 2;
                    const y2 = toRow * cellPx + cellPx / 2;
                    // Pull the line endpoints in slightly so the arrowhead
                    // lands just outside the cell border, not under the text.
                    const pad = cellPx * 0.28;
                    const dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy) || 1;
                    const sx = x1 + (dx / len) * pad, sy = y1 + (dy / len) * pad;
                    const ex = x2 - (dx / len) * pad, ey = y2 - (dy / len) * pad;
                    return (
                      <line
                        key={i}
                        x1={sx} y1={sy} x2={ex} y2={ey}
                        stroke={a.color} strokeWidth="2" strokeDasharray="5 3"
                        strokeLinecap="round" opacity="0.85"
                        markerEnd={`url(#dp-arrow-${i})`}
                      />
                    );
                  })}
                </svg>
              )}
            </div>
          </div>
        </div>
        </div>

        {/* ── DP memoization log — real (state → result) pairs built from   ──
            watching actual call/return events. Answers "what has this DP    
            actually computed so far", not just "where is it right now".    */}
        {!compact && recentDPCalls.length > 0 && (
          <div className="w-[220px] flex-shrink-0 ml-3 flex flex-col rounded-xl border border-slate-700/50 bg-slate-900/60 overflow-hidden">
            <div className="flex-shrink-0 px-3 py-2 border-b border-slate-700/40 bg-slate-800/50">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">
                dp() memo log
              </span>
            </div>
            <div className="flex-1 overflow-y-auto px-2 py-2 flex flex-col-reverse gap-1.5">
              {/* flex-col-reverse + already-reversed list = newest entry visually on top */}
              {[...recentDPCalls].reverse().map((entry) => {
                const stateStr = Object.entries(entry.state).map(([k, v]) => `${k}=${v}`).join(', ');
                const resultStr = entry.result === Number.NEGATIVE_INFINITY || entry.result === '-Infinity'
                  ? '−∞'
                  : String(entry.result);
                const isBlocked = resultStr === '−∞';
                return (
                  <div
                    key={entry.callOrder}
                    className={`px-2 py-1.5 rounded-md border text-[10px] font-mono leading-snug ${
                      isBlocked
                        ? 'bg-red-950/30 border-red-900/40 text-red-300/80'
                        : 'bg-emerald-950/20 border-emerald-800/30 text-emerald-200/90'
                    }`}
                  >
                    <div className="text-slate-500">dp({stateStr})</div>
                    <div className="mt-0.5">→ <span className="font-semibold">{resultStr}</span></div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {!compact && (
        <div className="flex-shrink-0 flex items-center justify-between px-4 py-2 border-t border-slate-700/40 bg-slate-900/20">
          <div className="flex items-center gap-4 flex-wrap">
            {legend.slice(0, 6).map(({ bg, border, label }) => (
              <LegendDot key={label} bg={bg} border={border} label={label} />
            ))}
          </div>
          {statusText && (
            <span className="font-mono text-[11px] italic max-w-[50%] truncate" style={{ color: statusColor }}>
              {statusText}
            </span>
          )}
        </div>
      )}

      {/* Narration strip — plain-English explanation of why this step happened */}
      {!compact && narration && <NarrationStrip text={narration} />}
    </div>
  );
}

function NarrationStrip({ text }) {
  return (
    <div className="flex-shrink-0 flex items-start gap-2.5 px-5 py-2 border-t border-amber-500/15 bg-amber-500/5">
      <span className="text-amber-500/60 text-sm mt-0.5 flex-shrink-0">✎</span>
      <span className="text-[12.5px] font-medium text-amber-200/90 leading-snug">{text}</span>
    </div>
  );
}