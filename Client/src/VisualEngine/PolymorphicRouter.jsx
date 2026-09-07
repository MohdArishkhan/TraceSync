import React from 'react';

// ─────────────────────────────────────────────────────────────────────────────
//  IMPORT EVERY REAL ENGINE — no inline duplicates, single source of truth
// ─────────────────────────────────────────────────────────────────────────────
import GridEngine          from './GridEngine';
import LinearArrayEngine   from './LinearArrayEngine';
import SvgTreeEngine       from './SvgTreeEngine';
import PhysicsGraphEngine  from './PhysicsGraphEngine';
import LinkedListEngine    from './LinkedListEngine';
import StackEngine         from './StackEngine';
import QueueEngine         from './QueueEngine';
import DequeEngine         from './DequeEngine';
import DSUEngine           from './DSUEngine';
import SegmentTreeEngine   from './SegmentTreeEngine';
import RecursionTreeEngine from './RecursionTreeEngine';
import NQueensEngine       from './NQueensEngine';
import HashMapEngine       from './HashMapEngine';
import HeapEngine          from './HeapEngine';

// Optional/assumed imports based on usage in the component
import { motion } from 'framer-motion'; 

// ─────────────────────────────────────────────────────────────────────────────
//  RANK SYSTEM — fallback only, used when no vizSpec is present
// ─────────────────────────────────────────────────────────────────────────────
const getRank = (type, struct) => {
  if (struct?.aiPrimary) return 10;
  if (type === 'N_QUEENS')       return 6;
  if (type === 'MATRIX')         return 5.5;
  if (type === 'GRAPH')          return 5.2;
  if (type === 'TREE')           return 5.1;  // ← real tree beats call-stack tree
  if (type === 'LINKED_LIST')    return 5.1;  // ← real list beats call-stack tree
  if (type === 'RECURSION_TREE') return 5;    // ← only wins when no real DS exists
  if (type === 'HEAP')           return 4.8;
  if (type === 'DSU')            return 4.5;
  if (type === 'SEGMENT_TREE')   return 4.5;
  if (type === 'DEQUE')          return 3.7;
  if (type === 'STACK' || type === 'QUEUE') return 3.5;
  if (type === 'HASH_MAP')       return 2.5;
  if (type === 'SET')            return 2;
  return 1;
};

// ─────────────────────────────────────────────────────────────────────────────
//  ENGINE DISPATCH — strictly by type, every case routes to a real engine
// ─────────────────────────────────────────────────────────────────────────────
const EngineRenderer = ({ structure, compact = false }) => {
  const type = (structure.type ?? '').toUpperCase().trim();
  const dataWithSpec = structure.vizSpec ? { ...structure.data, vizSpec: structure.vizSpec } : structure.data;

  switch (type) {
    case 'N_QUEENS':       return <NQueensEngine data={dataWithSpec} />;
    case 'SEGMENT_TREE':   return <SegmentTreeEngine data={dataWithSpec} />;
    case 'DSU':            return <DSUEngine data={dataWithSpec} />;
    case 'RECURSION_TREE': return <RecursionTreeEngine data={dataWithSpec} />;
    case 'TREE':           return <SvgTreeEngine data={dataWithSpec} />;
    case 'LINKED_LIST':    return <LinkedListEngine data={dataWithSpec} />;
    case 'GRAPH':          return <PhysicsGraphEngine data={dataWithSpec} />;
    case 'STACK':          return <StackEngine data={dataWithSpec} />;
    case 'QUEUE':          return <QueueEngine data={dataWithSpec} />;
    case 'DEQUE':          return <DequeEngine data={dataWithSpec} />;
    case 'HEAP':           return <HeapEngine data={dataWithSpec} />;
    case 'HASH_MAP':
    case 'SET':            return <HashMapEngine data={dataWithSpec} />;
    case 'MATRIX':         return <GridEngine data={dataWithSpec} compact={compact} />;
    case 'ARRAY':          return <LinearArrayEngine data={dataWithSpec} compact={compact} />;
    default:
      return (
        <div className="flex items-center justify-center w-full h-full text-slate-500 text-sm font-mono">
          Unknown structure type: {type || '(none)'}
        </div>
      );
  }
};

// ─────────────────────────────────────────────────────────────────────────────
//  FLOATING VARIABLES — a real row in the layout (NOT absolute), so it always
//  reserves its own space and can never overlap anything below it.
//  Filters out any variable already shown as its own structure (primary or
//  auxiliary) — no point showing "queue = ref(@67)" as a chip when the queue
//  is already fully visualized as an engine right below it.
// ─────────────────────────────────────────────────────────────────────────────
function FloatingVariables({ variables = [], hiddenNames = new Set(), priorityNames = new Set() }) {
  const visible = (variables ?? []).filter((v) => !hiddenNames.has(v.name));
  // Algorithm-relevant variables (e.g. a vizSpec's pointer names: r1/c1/r2/c2)
  // win the limited chip slots over incidental ones (test_cases/i/expected)
  // that simply happened to appear earlier in iteration order — otherwise the
  // exact variables worth watching can get silently crowded out by the outer
  // test-harness bookkeeping that surrounds every problem in this app.
  const prioritized = [...visible].sort((a, b) => (priorityNames.has(b.name) ? 1 : 0) - (priorityNames.has(a.name) ? 1 : 0));
  const shown = prioritized.slice(0, 6);

  if (!shown.length) return null;

  return (
    <div className="flex-shrink-0 flex flex-wrap gap-1.5 px-3 pt-2.5 pb-1.5">
      {shown.map(({ name, value }) => (
        <div
          key={name}
          className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-900/85 border border-slate-700/60 backdrop-blur-sm shadow-sm"
        >
          <span className="text-pink-400 font-mono text-[10px] font-semibold">{name}</span>
          <span className="text-slate-500 text-[10px]">=</span>
          <span className="text-[#ffb800] font-mono text-[10px] max-w-[90px] truncate">{String(value)}</span>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  AUXILIARY STAT CARD — for simple values (counters, results) from vizSpec.auxiliary
//  Renders as a small floating chip inside the SAME frame — never a separate panel
// ─────────────────────────────────────────────────────────────────────────────
function AuxStatCard({ label, value }) {
  return (
    <div className="flex flex-col items-end gap-0.5 px-3 py-1.5 rounded-lg bg-slate-900/85 border border-indigo-500/25 backdrop-blur-sm shadow-lg">
      <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">{label}</span>
      <span className="text-sm font-mono font-bold text-indigo-300">{String(value)}</span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  AUXILIARY MINI ENGINE CARD — for structural data that genuinely needs its
//  own visual (e.g. wordSet alongside a BFS queue). Lives in its own
//  dedicated strip below the primary canvas — never floats over it.
// ─────────────────────────────────────────────────────────────────────────────
function AuxMiniCard({ struct }) {
  return (
    <div className="w-[260px] h-[130px] flex-shrink-0 rounded-xl bg-slate-900/90 border border-slate-700/50 backdrop-blur-md shadow-lg overflow-hidden flex flex-col">
      <div className="flex items-center justify-between px-2.5 py-1 bg-slate-800/70 border-b border-slate-700/40 flex-shrink-0">
        <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">{struct.type}</span>
        <span className="text-[10px] font-mono font-semibold text-indigo-300 truncate max-w-[130px] lowercase">{struct.auxLabel ?? struct.name}</span>
      </div>
      <div className="flex-1 relative overflow-hidden">
        <EngineRenderer structure={struct} compact={true} />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  MAIN ROUTER — single-frame layout. No tabs, no split dock.
//  Primary engine owns the full canvas. Auxiliary data (when truly needed)
//  appears as small floating cards docked to a corner of the SAME frame.
// ─────────────────────────────────────────────────────────────────────────────
export default function PolymorphicRouter({ currentFrame, aiFallbackEngine, aiVariables, vizSpec: vizSpecProp, T, GlobalStyles }) {
  if (!currentFrame || !currentFrame.structures) {
    return (
      <>
        {GlobalStyles && <GlobalStyles />}
        <div
          className="flex flex-col items-center justify-center w-full h-full relative overflow-hidden"
          style={{ background: T?.bg || '#0f172a' }}
        >
          {/* Ambient radial */}
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: `radial-gradient(ellipse at center, ${T?.active?.dim || 'rgba(99,102,241,0.1)'}, transparent 65%)` }}
          />
          {/* Scanline */}
          <motion.div
            animate={{ y: ['0vh','100vh'] }}
            transition={{ repeat: Infinity, duration: 3, ease: 'linear' }}
            className="absolute inset-x-0 h-12 pointer-events-none"
            style={{ background: 'linear-gradient(transparent,rgba(191,90,242,0.06),transparent)' }}
          />
          {/* Spinner */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
            className="w-14 h-14 rounded-full mb-6"
            style={{
              border: `3px solid ${T?.border || '#334155'}`,
              borderTopColor: T?.active?.core || '#6366f1',
              boxShadow: `0 0 20px ${T?.active?.glow || 'rgba(99,102,241,0.5)'}`,
            }}
          />
          <motion.p
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ repeat: Infinity, duration: 1.8 }}
            className="mono text-sm font-extrabold uppercase tracking-[0.25em]"
            style={{ color: T?.active?.core || '#6366f1', textShadow: `0 0 16px ${T?.active?.glow || 'rgba(99,102,241,0.5)'}` }}
          >
            Tracing Execution…
          </motion.p>
        </div>
      </>
    );
  }

  const structures = currentFrame.structures;

  // ── AI fallback view (no trace structures yet, but AI primed an engine) ──
  if (structures.length === 0 && aiFallbackEngine) {
    const mock = { id: 'ai-primed-view', type: aiFallbackEngine, name: 'AI Extracted Layout', array: [], activeIndices: [], variables: aiVariables || [] };
    return (
      <div className="relative w-full h-full flex flex-col bg-[#0f172a] overflow-hidden">
        <FloatingVariables variables={aiVariables} />
        <div className="flex-shrink-0 flex justify-center px-3 pb-2">
          <span className="px-2.5 py-1 rounded-md bg-indigo-500/10 border border-indigo-500/30 text-[10px] font-mono text-indigo-400 uppercase tracking-widest">
            AI Primed Layout: {aiFallbackEngine}
          </span>
        </div>
        <div className="flex-1 relative">
          <EngineRenderer structure={{ type: aiFallbackEngine, data: mock }} compact={false} />
        </div>
      </div>
    );
  }

  // ── EMPTY FRAME ────────────────────────────────────────────
  if (structures.length === 0) {
    return (
      <>
        {GlobalStyles && <GlobalStyles />}
        <div className="relative w-full h-full flex items-center justify-center" style={{ background: T?.bg || '#0f172a' }}>
          <FloatingVariables variables={currentFrame.variables} />
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            className="px-6 py-3.5 rounded-2xl mono text-sm tracking-wide"
            style={{
              background: T?.panel || '#1e293b',
              border: `1px solid ${T?.border || '#334155'}`,
              backdropFilter: 'blur(20px)',
              color: T?.textSec || '#94a3b8',
              boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
            }}
          >
            No complex data structures active in scope.
          </motion.div>
        </div>
      </>
    );
  }

  // ── SPEC-DRIVEN ROUTING (highest priority) ──────────────────────────────
  const activeSpec  = vizSpecProp ?? currentFrame.vizSpec ?? null;
  const specEngine  = activeSpec?.primary?.engine?.toUpperCase() ?? null;
  const specVarName = activeSpec?.primary?.variable ?? null;

  let primary, auxiliary;

  if (activeSpec && specEngine && structures.length > 0) {
    const specPrimary = structures.find((s) => s.name === specVarName || s.id === specVarName);
    if (specPrimary) {
      primary = { ...specPrimary, type: specEngine, vizSpec: activeSpec };
      const specAuxStructs = (activeSpec.auxiliary ?? [])
        .map((a) => {
          const s = structures.find((st) => st.name === a.variable);
          return s ? { ...s, auxLabel: a.label, auxEngine: a.engine } : null;
        })
        .filter(Boolean);
      // A vizSpec's `auxiliary` list is an authored decision — the spec
      // author explicitly chose what's worth showing alongside the primary
      // (including choosing to show nothing else at all via an empty array,
      // as most library entries do). Previously this fell back to ALSO
      // showing every other incidentally-detected structure regardless —
      // meaning a test-harness variable like `test_cases` (a list of
      // (grid, expected) tuples, coincidentally array-of-arrays shaped) or a
      // stray `row` from an unrelated print loop would clutter the canvas
      // even though the spec never asked for them. Once a spec is driving
      // the primary structure, ONLY its named auxiliary list is shown —
      // never an unfiltered "everything else detected" fallback.
      auxiliary = specAuxStructs;
    } else {
      const sorted = [...structures].sort((a, b) => getRank(b.type, b) - getRank(a.type, a));
      primary = sorted[0];
      auxiliary = sorted.slice(1).filter((s) => s.type !== 'RECURSION_TREE');
    }
  } else {
    const sorted = [...structures].sort((a, b) => getRank(b.type, b) - getRank(a.type, a));
    primary = sorted[0];
    const FULL_CANVAS_TYPES = new Set(['N_QUEENS', 'MATRIX', 'GRAPH', 'TREE', 'LINKED_LIST']);
    auxiliary = FULL_CANVAS_TYPES.has(primary.type) ? sorted.slice(1).filter((s) => s.type !== 'RECURSION_TREE') : sorted.slice(1);
  }

  // Split auxiliary into "simple scalar" (counters/results → stat chip)
  // vs "structural" (needs its own mini engine render)
  const SCALAR_AUX_ENGINES = new Set(['COUNTER']);
  const scalarAux = auxiliary.filter((s) => SCALAR_AUX_ENGINES.has(s.auxEngine) || (s.data?.array?.length ?? 1) <= 1 && typeof s.data === 'object' && Object.keys(s.data ?? {}).length <= 2);
  // Structures flagged sideBySide (e.g. the Cherry Pickup DP-values grid) are
  // important enough to sit directly beside the primary grid at real size —
  // not squeezed into the small bottom-strip mini-cards, which is where the
  // "unnecessary tiny states-explored box" complaint came from. Everything
  // else keeps the normal small-card treatment.
  const remainingAux  = auxiliary.filter((s) => !scalarAux.includes(s));
  const companionAux  = remainingAux.filter((s) => s.data?.sideBySide === true).slice(0, 1);
  const structuralAux = remainingAux.filter((s) => !companionAux.includes(s)).slice(0, 2);

  // Names already visualized as their own structure (primary or auxiliary) —
  // hide these from the FloatingVariables chip row, they'd be pure noise.
  const hiddenVarNames = new Set([primary.name, ...auxiliary.map((s) => s.name)]);
  // Names the active spec explicitly cares about (e.g. r1/c1/r2/c2 for
  // Cherry Pickup's two travelers) — these win the limited chip slots over
  // incidental test-harness variables that just happen to iterate first.
  const priorityVarNames = new Set((activeSpec?.pointers ?? []).map((p) => p.variable));

  return (
    <div className="relative w-full h-full flex flex-col bg-[#0f172a] overflow-hidden">

      {/* ── ROW 1: loose scalar variables only (real flex row, reserves its own space) ── */}
      <FloatingVariables variables={currentFrame.variables} hiddenNames={hiddenVarNames} priorityNames={priorityVarNames} />

      {/* ── ROW 2: PRIMARY ENGINE, plus a side-by-side companion grid when one exists ──
          Both live inside ONE unified bordered surface (not two separate boxes) —
          a single rounded container with an internal divider, so it reads as one
          panel with two halves, matching how the arrows visually connect them. */}
      <div className="flex-1 flex min-h-0 mx-2 mb-2 rounded-xl border border-slate-800/70 overflow-hidden bg-[#0f172a]">
        <div className="relative flex-1 min-w-0">

          {/* Type/name badge — hidden for engines with their own internal HUD */}
          {!['N_QUEENS', 'MATRIX', 'GRAPH', 'TREE', 'SEGMENT_TREE', 'LINKED_LIST', 'ARRAY', 'QUEUE', 'STACK', 'DEQUE', 'HEAP'].includes(primary.type) && (
            <div className="absolute top-2 right-2 z-20 flex items-center gap-2 pointer-events-none">
              {activeSpec && (
                <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-[9px] font-mono text-emerald-400 uppercase tracking-widest">
                  ✦ spec
                </span>
              )}
              <span className="px-3 py-1 rounded-md bg-slate-800/80 border border-slate-600/80 text-xs font-mono text-indigo-400 uppercase tracking-widest shadow-sm">{primary.type}</span>
              <span className="px-3 py-1 rounded-md bg-indigo-500/20 border border-indigo-500/40 text-xs font-mono text-indigo-200 shadow-sm lowercase italic">{primary.name}</span>
            </div>
          )}

          <EngineRenderer structure={primary} compact={false} />

          {/* Scalar stat chips (counters/results) — tiny, corner overlay is fine, they never obscure content */}
          {scalarAux.length > 0 && (
            <div className="absolute bottom-3 right-3 z-20 flex flex-col gap-2 pointer-events-none">
              {scalarAux.slice(0, 4).map((s) => (
                <AuxStatCard
                  key={s.id}
                  label={s.auxLabel ?? s.name}
                  value={
                    Array.isArray(s.data?.array)
                      ? s.data.array[s.data.array.length - 1]?.value ?? s.data.array[s.data.array.length - 1] ?? '—'
                      : s.data?.value ?? JSON.stringify(s.data).slice(0, 12)
                  }
                />
              ))}
            </div>
          )}
        </div>

        {/* Companion grid — same real size as the primary, sitting directly
            beside it (not a tiny bottom-strip card), so the two-travelers
            movement and the resulting dp value comparison are readable
            side by side, matching how the arrows connect them. */}
        {companionAux.length > 0 && (
          <div className="relative flex-1 min-w-0 border-l border-slate-800/60">
            <div className="absolute top-2 left-2 z-20 px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-[10px] font-mono text-emerald-300 uppercase tracking-widest pointer-events-none">
              {companionAux[0].auxLabel ?? companionAux[0].name}
            </div>
            <EngineRenderer structure={companionAux[0]} compact={false} />
          </div>
        )}
      </div>

      {/* ── ROW 3: structural auxiliary — its own dedicated strip, never overlaps the primary ── */}
      {structuralAux.length > 0 && (
        <div className="flex-shrink-0 flex items-center gap-2.5 px-3 py-2.5 border-t border-slate-800/60 overflow-x-auto">
          {structuralAux.map((s) => (
            <AuxMiniCard key={s.id} struct={s} />
          ))}
        </div>
      )}
    </div>
  );
}