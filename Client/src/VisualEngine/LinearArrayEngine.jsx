import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ─────────────────────────────────────────────────────────────────────────────
//  data shape produced by TracerWorker for type 'ARRAY':
//  {
//    array:    [{ id, value } | primitive, ...],
//    activeIndices: [idx, ...],
//    pointers: [{ variable: 'left', index: 2 }, ...],      // ← from detectPointers()
//    regions:  [{ start, end, label, color }, ...],         // ← from detectRegions()
//    narration: "plain-English sentence" | null,
//    resolvedReferenceLines: [                              // ← live resolved per frame
//      { label: 'leftMax', color: '#f87171', value: 4 },   // scalar → flat line
//      { label: 'maxR', color: '#60a5fa', values: [...] }  // array  → stepped per index
//    ],
//    vizSpec: { primary: { visualStyle: 'bars'|'boxes' }, ... } | null
//  }
// ─────────────────────────────────────────────────────────────────────────────

const POINTER_COLORS = {
  low: '#fb923c', mid: '#fb923c', high: '#60a5fa',
  left: '#fb923c', right: '#60a5fa',
  i: '#a78bfa', j: '#34d399', k: '#f472b6',
  fast: '#f472b6', slow: '#34d399',
  start: '#fb923c', end: '#60a5fa',
  l: '#fb923c', r: '#60a5fa',
};
const pColor = (name) => POINTER_COLORS[name] ?? '#94a3b8';

const REGION_PALETTE = {
  red:   { bg: 'rgba(239,68,68,0.08)',   border: '#ef4444', text: '#fca5a5' },
  blue:  { bg: 'rgba(59,130,246,0.08)',  border: '#3b82f6', text: '#93c5fd' },
  slate: { bg: 'rgba(148,163,184,0.05)', border: '#475569', text: '#94a3b8' },
  green: { bg: 'rgba(34,197,94,0.08)',   border: '#22c55e', text: '#86efac' },
};

const getVal = (v) => (v?.value !== undefined ? v.value : v);

// ─────────────────────────────────────────────────────────────────────────────
//  NARRATION STRIP — the bottom "pencil line" explaining why this step happened
// ─────────────────────────────────────────────────────────────────────────────
function NarrationStrip({ text }) {
  if (!text) return null;
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={text}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -4 }}
        transition={{ duration: 0.2 }}
        className="flex-shrink-0 flex items-start gap-2.5 px-5 py-2.5 border-t border-amber-500/15 bg-amber-500/5"
      >
        <span className="text-amber-500/60 text-sm mt-0.5 flex-shrink-0">✎</span>
        <span className="text-[12.5px] font-medium text-amber-200/90 leading-snug">{text}</span>
      </motion.div>
    </AnimatePresence>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  POINTER CHIP — triangle + label underneath a cell
// ─────────────────────────────────────────────────────────────────────────────
function PointerChip({ names }) {
  if (!names?.length) return <div style={{ height: 32 }} />;
  return (
    <div className="flex flex-col items-center mt-1 gap-0.5" style={{ minHeight: 32 }}>
      {names.map((p) => (
        <div key={p} className="flex flex-col items-center">
          <div
            style={{
              width: 0, height: 0,
              borderLeft: '4px solid transparent',
              borderRight: '4px solid transparent',
              borderBottom: `6px solid ${pColor(p)}`,
            }}
          />
          <span className="text-[10px] font-mono font-bold" style={{ color: pColor(p) }}>{p}</span>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  MAIN ENGINE
// ─────────────────────────────────────────────────────────────────────────────
export default function LinearArrayEngine({ data, compact = false }) {
  const rawArr    = data?.array ?? [];
  const actIdxs   = data?.activeIndices ?? [];
  const pointers  = data?.pointers ?? [];
  const regions   = data?.regions ?? [];
  const narration = data?.narration ?? null;
  const refLines  = data?.resolvedReferenceLines ?? [];
  const vizSpec   = data?.vizSpec ?? null;

  const isBars = vizSpec?.primary?.visualStyle === 'bars';

  const modSet = useMemo(() => new Set(actIdxs.map(String)), [actIdxs]);

  // Build index → [pointer names] lookup
  const ptrMap = useMemo(() => {
    const m = {};
    pointers.forEach((p) => { (m[p.index] ??= []).push(p.variable); });
    return m;
  }, [pointers]);

  if (!rawArr.length) {
    return (
      <div className="flex items-center justify-center w-full h-full text-slate-500 text-sm font-mono">
        Waiting for array data…
      </div>
    );
  }

  // ── COMPACT MODE ────────────────────────────────────────────────────────
  // Used inside AuxMiniCard's fixed-size box (220×160). No pointer footers,
  // no narration, no region brackets, no fixed cell width — a wrapping chip
  // cloud that scales to whatever's inside the card instead of clipping.
  // This is the correct rendering for auxiliary lists shown alongside a
  // primary structure (e.g. wordList/wordSet next to a BFS queue).
  if (compact) {
    return (
      <div className="flex flex-wrap items-start content-start gap-1 w-full h-full overflow-y-auto overflow-x-hidden p-1.5">
        {rawArr.map((raw, idx) => {
          const v = getVal(raw);
          const isActive = modSet.has(String(idx));
          const isLong = String(v).length > 4;
          return (
            <div
              key={raw?.id ?? `c-${idx}`}
              className={`flex items-center justify-center font-mono font-semibold rounded-md border transition-colors duration-150 ${isLong ? 'px-1.5 h-6' : 'w-6 h-6'}`}
              style={{
                fontSize: 10,
                background: isActive ? '#7c2d12' : '#1e293b',
                borderColor: isActive ? '#fb923c' : '#334155',
                color: isActive ? '#fed7aa' : '#94a3b8',
                whiteSpace: 'nowrap',
              }}
              title={String(v)}
            >
              {String(v)}
            </div>
          );
        })}
      </div>
    );
  }

  const n = rawArr.length;
  const cellSize = n <= 7 ? 64 : n <= 12 ? 52 : n <= 18 ? 42 : n <= 26 ? 34 : 28;
  const fontSize = cellSize >= 56 ? 20 : cellSize >= 44 ? 16 : cellSize >= 34 ? 13 : 11;

  // ── BAR-CHART MODE ────────────────────────────────────────────────────────
  // Used for height/magnitude arrays (trapping rain water, histogram, etc.)
  if (isBars) {
    const values = rawArr.map((v) => Number(getVal(v)) || 0);
    const maxVal = Math.max(
      1,
      ...values,
      ...refLines.flatMap((r) =>
        r.value !== undefined ? [r.value] : (r.values ?? [])
      )
    );
    const CHART_H = 200;
    const barW = Math.min(64, Math.max(28, Math.floor(560 / n)));

    return (
      <div className="flex flex-col w-full h-full overflow-hidden">
        <div className="flex-1 flex flex-col items-center justify-center overflow-auto">
          <div className="relative" style={{ height: CHART_H + 80, width: n * (barW + 6) }}>

            {/* ── Reference lines: flat scalars (one horizontal dashed line) ── */}
            {refLines.filter((r) => r.value !== undefined).map((ref, i) => {
              const yPct = ref.value / maxVal;
              const y = CHART_H * (1 - yPct);
              return (
                <div
                  key={ref.label ?? i}
                  className="absolute left-0 right-0 border-t-2 border-dashed pointer-events-none"
                  style={{ top: y, borderColor: ref.color ?? '#f87171' }}
                >
                  <span
                    className="absolute -top-4 -left-0 text-[10px] font-mono font-semibold whitespace-nowrap"
                    style={{ color: ref.color ?? '#f87171' }}
                  >
                    {ref.label} = {ref.value}
                  </span>
                </div>
              );
            })}

            {/* ── Reference lines: stepped arrays (one segment per index) ── */}
            {refLines.filter((r) => Array.isArray(r.values)).map((ref, ri) =>
              ref.values.map((v, idx) => {
                if (idx >= n) return null;
                const yPct = v / maxVal;
                const y = CHART_H * (1 - yPct);
                const x = idx * (barW + 6);
                const w = barW + 6;
                const isLast = idx === n - 1;
                const col = ref.color ?? (ri === 0 ? '#f87171' : '#60a5fa');
                return (
                  <div
                    key={`${ref.label}-${idx}`}
                    className="absolute border-t-2 border-dashed pointer-events-none"
                    style={{ top: y, left: x, width: w, borderColor: col }}
                  >
                    {isLast && (
                      <span className="absolute -top-4 right-0 text-[10px] font-mono font-semibold" style={{ color: col }}>
                        {ref.label}[] = {v}
                      </span>
                    )}
                  </div>
                );
              })
            )}

            {/* ── Bars ── */}
            <div
              className="absolute bottom-0 left-0 flex items-end gap-1.5"
              style={{ height: CHART_H + 60 }}
            >
              {values.map((v, idx) => {
                const isActive = modSet.has(String(idx));
                const ptrs = ptrMap[idx] ?? [];
                const barH = Math.max(4, (v / maxVal) * CHART_H);

                // Water trapped above this bar up to the cap line
                // Cap = min of all per-index reference values at this index (or scalar refs)
                const caps = refLines.map((r) =>
                  r.value !== undefined ? r.value : (r.values?.[idx] ?? Infinity)
                );
                const cap = caps.length ? Math.min(...caps) : null;
                const waterH = cap !== null && cap > v ? ((cap - v) / maxVal) * CHART_H : 0;

                return (
                  <div key={rawArr[idx]?.id ?? idx} className="flex flex-col items-center justify-end" style={{ width: barW }}>
                    <div className="relative flex flex-col items-center justify-end" style={{ height: CHART_H }}>
                      {/* Water hatching */}
                      {waterH > 2 && (
                        <div
                          className="absolute w-full"
                          style={{
                            bottom: barH,
                            height: waterH,
                            background:
                              'repeating-linear-gradient(45deg,rgba(96,165,250,0.35) 0,rgba(96,165,250,0.35) 3px,rgba(96,165,250,0.12) 3px,rgba(96,165,250,0.12) 6px)',
                            borderTop: '1.5px solid rgba(96,165,250,0.55)',
                          }}
                        />
                      )}
                      {/* Bar */}
                      <motion.div
                        animate={{
                          height: barH,
                          background: isActive ? '#c2410c' : '#475569',
                          borderColor: isActive ? '#fb923c' : '#334155',
                        }}
                        transition={{ duration: 0.22 }}
                        className="w-full rounded-t-sm flex items-start justify-center pt-1 border-2"
                        style={{ boxShadow: isActive ? '0 0 14px rgba(251,146,60,0.4)' : 'none' }}
                      >
                        <span className="text-[11px] font-mono font-bold text-white/90 leading-none">
                          {v}
                        </span>
                      </motion.div>
                    </div>

                    <span className="text-[9px] font-mono text-slate-600 mt-1">[{idx}]</span>
                    <PointerChip names={ptrs} />
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <NarrationStrip text={narration} />
      </div>
    );
  }

  // ── BOX MODE (default) ────────────────────────────────────────────────────
  return (
    <div className="flex flex-col w-full h-full overflow-hidden">
      <div className="flex-1 flex flex-col items-center justify-center gap-3 px-6 overflow-auto py-4">

        {/* Region brackets, drawn above the cell row */}
        {regions.length > 0 && (
          <div className="flex" style={{ gap: 6 }}>
            {buildRegionBrackets(regions, n, cellSize)}
          </div>
        )}

        {/* Cell row */}
        <div className="flex" style={{ gap: 6 }}>
          <AnimatePresence mode="popLayout" initial={false}>
            {rawArr.map((raw, idx) => {
              const v = getVal(raw);
              const isActive = modSet.has(String(idx));
              const ptrs = ptrMap[idx] ?? [];

              return (
                <motion.div
                  key={raw?.id ?? `cell-${idx}`}
                  layout
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: isActive ? 1.08 : 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ type: 'spring', stiffness: 320, damping: 24 }}
                  className="flex flex-col items-center"
                >
                  <motion.div
                    animate={{
                      background: isActive ? '#7c2d12' : '#1e293b',
                      borderColor: isActive ? '#fb923c' : '#334155',
                    }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center justify-center font-bold font-mono rounded-xl border-2"
                    style={{
                      width: cellSize, height: cellSize, fontSize,
                      color: isActive ? '#fed7aa' : '#cbd5e1',
                      boxShadow: isActive ? '0 0 14px rgba(251,146,60,0.35)' : 'none',
                    }}
                  >
                    {String(v)}
                  </motion.div>
                  <span className="text-[9px] font-mono text-slate-600 mt-1">[{idx}]</span>
                  <PointerChip names={ptrs} />
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      <NarrationStrip text={narration} />
    </div>
  );
}

// Build region bracket divs for the box-mode header row
function buildRegionBrackets(regions, n, cellSize) {
  // Sort regions so they render left-to-right
  const sorted = [...regions].sort((a, b) => a.start - b.start);

  // We may have gaps between regions; fill with invisible spacers
  const result = [];
  let cursor = 0;
  for (const reg of sorted) {
    // gap before region
    if (reg.start > cursor) {
      const gapSpan = reg.start - cursor;
      result.push(
        <div key={`gap-${cursor}`} style={{ width: gapSpan * cellSize + (gapSpan - 1) * 6, height: 30 }} />
      );
    }
    const span = reg.end - reg.start + 1;
    const pal = REGION_PALETTE[reg.color] ?? REGION_PALETTE.slate;
    result.push(
      <div
        key={`reg-${reg.start}`}
        className="flex flex-col items-center justify-end pb-1 border-t-2 border-l-2 border-r-2 rounded-t-md"
        style={{
          width: span * cellSize + (span - 1) * 6,
          height: 30,
          borderColor: pal.border,
          background: pal.bg,
        }}
      >
        <span className="text-[8.5px] font-mono font-bold tracking-wide uppercase" style={{ color: pal.text }}>
          {reg.label}
        </span>
      </div>
    );
    cursor = reg.end + 1;
  }
  // gap after last region
  if (cursor < n) {
    const gapSpan = n - cursor;
    result.push(
      <div key={`gap-${cursor}`} style={{ width: gapSpan * cellSize + (gapSpan - 1) * 6, height: 30 }} />
    );
  }
  return result;
}