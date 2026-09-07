import { memo, useMemo, Suspense, lazy } from 'react';
import { motion } from 'framer-motion';
import { EngineTransition } from '../components/PageTransition';

// Lazy load engines for better performance
const GridEngine = lazy(() => import('./GridEngine'));
const LinearArrayEngine = lazy(() => import('./LinearArrayEngine'));
const SvgTreeEngine = lazy(() => import('./SvgTreeEngine'));
const PhysicsGraphEngine = lazy(() => import('./PhysicsGraphEngine'));
const LinkedListEngine = lazy(() => import('./LinkedListEngine'));
const StackEngine = lazy(() => import('./StackEngine'));
const QueueEngine = lazy(() => import('./QueueEngine'));
const DequeEngine = lazy(() => import('./DequeEngine'));
const DSUEngine = lazy(() => import('./DSUEngine'));
const SegmentTreeEngine = lazy(() => import('./SegmentTreeEngine'));
const RecursionTreeEngine = lazy(() => import('./RecursionTreeEngine'));
const NQueensEngine = lazy(() => import('./NQueensEngine'));
const HashMapEngine = lazy(() => import('./HashMapEngine'));
const HeapEngine = lazy(() => import('./HeapEngine'));

// Loading fallback component
const EngineLoadingFallback = memo(() => (
  <div className="flex items-center justify-center w-full h-full bg-slate-950">
    <div className="flex flex-col items-center gap-4">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
        className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full"
      />
      <p className="text-slate-400 text-sm font-mono">Loading visualization...</p>
    </div>
  </div>
));

EngineLoadingFallback.displayName = 'EngineLoadingFallback';

/**
 * Optimized Engine Renderer with memoization and lazy loading
 */
const EngineRenderer = memo(({ structure, compact = false }) => {
  const type = (structure.type ?? '').toUpperCase().trim();
  const dataWithSpec = structure.vizSpec
    ? { ...structure.data, vizSpec: structure.vizSpec }
    : structure.data;

  // Map engine types to components
  const engineMap = {
    N_QUEENS: NQueensEngine,
    SEGMENT_TREE: SegmentTreeEngine,
    DSU: DSUEngine,
    RECURSION_TREE: RecursionTreeEngine,
    TREE: SvgTreeEngine,
    LINKED_LIST: LinkedListEngine,
    GRAPH: PhysicsGraphEngine,
    STACK: StackEngine,
    QUEUE: QueueEngine,
    DEQUE: DequeEngine,
    HEAP: HeapEngine,
    HASH_MAP: HashMapEngine,
    SET: HashMapEngine,
    MATRIX: GridEngine,
    ARRAY: LinearArrayEngine
  };

  const EngineComponent = engineMap[type];

  if (!EngineComponent) {
    return (
      <div className="flex items-center justify-center w-full h-full text-slate-500 text-sm font-mono">
        Unknown structure type: {type || '(none)'}
      </div>
    );
  }

  return (
    <Suspense fallback={<EngineLoadingFallback />}>
      <EngineComponent data={dataWithSpec} compact={compact} />
    </Suspense>
  );
}, (prevProps, nextProps) => {
  // Custom comparison for better performance
  return (
    prevProps.structure?.type === nextProps.structure?.type &&
    JSON.stringify(prevProps.structure?.data) === JSON.stringify(nextProps.structure?.data) &&
    prevProps.compact === nextProps.compact
  );
});

EngineRenderer.displayName = 'EngineRenderer';

/**
 * Floating Variables Component (Memoized)
 */
const FloatingVariables = memo(({ variables = [], hiddenNames = new Set(), priorityNames = new Set() }) => {
  const visibleVariables = useMemo(() => {
    const visible = variables.filter((v) => !hiddenNames.has(v.name));
    const prioritized = [...visible].sort(
      (a, b) => (priorityNames.has(b.name) ? 1 : 0) - (priorityNames.has(a.name) ? 1 : 0)
    );
    return prioritized.slice(0, 6);
  }, [variables, hiddenNames, priorityNames]);

  if (!visibleVariables.length) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex-shrink-0 flex flex-wrap gap-1.5 px-3 pt-2.5 pb-1.5"
    >
      {visibleVariables.map(({ name, value }, idx) => (
        <motion.div
          key={name}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: idx * 0.05 }}
          className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-900/85 border border-slate-700/60 backdrop-blur-sm shadow-sm"
        >
          <span className="text-pink-400 font-mono text-[10px] font-semibold">{name}</span>
          <span className="text-slate-500 text-[10px]">=</span>
          <span className="text-[#ffb800] font-mono text-[10px] max-w-[90px] truncate">
            {String(value)}
          </span>
        </motion.div>
      ))}
    </motion.div>
  );
});

FloatingVariables.displayName = 'FloatingVariables';

/**
 * Auxiliary Stat Card (Memoized)
 */
const AuxStatCard = memo(({ label, value }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    className="flex flex-col items-end gap-0.5 px-3 py-1.5 rounded-lg bg-slate-900/85 border border-indigo-500/25 backdrop-blur-sm shadow-lg"
  >
    <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">{label}</span>
    <span className="text-sm font-mono font-bold text-indigo-300">{String(value)}</span>
  </motion.div>
));

AuxStatCard.displayName = 'AuxStatCard';

/**
 * Auxiliary Mini Engine Card (Memoized)
 */
const AuxMiniCard = memo(({ struct }) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    className="w-[260px] h-[130px] flex-shrink-0 rounded-xl bg-slate-900/90 border border-slate-700/50 backdrop-blur-md shadow-lg overflow-hidden flex flex-col"
  >
    <div className="flex items-center justify-between px-2.5 py-1 bg-slate-800/70 border-b border-slate-700/40 flex-shrink-0">
      <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">
        {struct.type}
      </span>
      <span className="text-[10px] font-mono font-semibold text-indigo-300 truncate max-w-[130px] lowercase">
        {struct.auxLabel ?? struct.name}
      </span>
    </div>
    <div className="flex-1 relative overflow-hidden">
      <EngineRenderer structure={struct} compact={true} />
    </div>
  </motion.div>
));

AuxMiniCard.displayName = 'AuxMiniCard';

/**
 * Main Optimized Polymorphic Router
 */
export default function OptimizedPolymorphicRouter({
  currentFrame,
  vizSpec: vizSpecProp,
  T,
  GlobalStyles
}) {

  // Loading state
  if (!currentFrame || !currentFrame.structures) {
    return (
      <>
        {GlobalStyles && <GlobalStyles />}
        <div
          className="flex flex-col items-center justify-center w-full h-full relative overflow-hidden"
          style={{ background: T?.bg || '#0f172a' }}
        >
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `radial-gradient(ellipse at center, ${
                T?.active?.dim || 'rgba(99,102,241,0.1)'
              }, transparent 65%)`
            }}
          />
          <motion.div
            animate={{ y: ['0vh', '100vh'] }}
            transition={{ repeat: Infinity, duration: 3, ease: 'linear' }}
            className="absolute inset-x-0 h-12 pointer-events-none"
            style={{
              background: 'linear-gradient(transparent,rgba(191,90,242,0.06),transparent)'
            }}
          />
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
            className="w-14 h-14 rounded-full mb-6"
            style={{
              border: `3px solid ${T?.border || '#334155'}`,
              borderTopColor: T?.active?.core || '#6366f1',
              boxShadow: `0 0 20px ${T?.active?.glow || 'rgba(99,102,241,0.5)'}`
            }}
          />
          <motion.p
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ repeat: Infinity, duration: 1.8 }}
            className="mono text-sm font-extrabold uppercase tracking-[0.25em]"
            style={{
              color: T?.active?.core || '#6366f1',
              textShadow: `0 0 16px ${T?.active?.glow || 'rgba(99,102,241,0.5)'}`
            }}
          >
            Tracing Execution…
          </motion.p>
        </div>
      </>
    );
  }

  const structures = currentFrame.structures;

  // Memoize rank calculation function
  const getRank = useMemo(() => (type, struct) => {
    if (struct?.aiPrimary) return 10;
    const ranks = {
      N_QUEENS: 6,
      MATRIX: 5.5,
      GRAPH: 5.2,
      TREE: 5.1,
      LINKED_LIST: 5.1,
      RECURSION_TREE: 5,
      HEAP: 4.8,
      DSU: 4.5,
      SEGMENT_TREE: 4.5,
      DEQUE: 3.7,
      STACK: 3.5,
      QUEUE: 3.5,
      HASH_MAP: 2.5,
      SET: 2
    };
    return ranks[type] || 1;
  }, []);

  // Calculate primary and auxiliary structures
  const layoutData = useMemo(() => {
    const activeSpec = vizSpecProp ?? currentFrame.vizSpec ?? null;
    const specEngine = activeSpec?.primary?.engine?.toUpperCase() ?? null;
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
      auxiliary = FULL_CANVAS_TYPES.has(primary.type)
        ? sorted.slice(1).filter((s) => s.type !== 'RECURSION_TREE')
        : sorted.slice(1);
    }

    const SCALAR_AUX_ENGINES = new Set(['COUNTER']);
    const scalarAux = auxiliary.filter(
      (s) =>
        SCALAR_AUX_ENGINES.has(s.auxEngine) ||
        ((s.data?.array?.length ?? 1) <= 1 &&
          typeof s.data === 'object' &&
          Object.keys(s.data ?? {}).length <= 2)
    );

    const remainingAux = auxiliary.filter((s) => !scalarAux.includes(s));
    const companionAux = remainingAux.filter((s) => s.data?.sideBySide === true).slice(0, 1);
    const structuralAux = remainingAux.filter((s) => !companionAux.includes(s)).slice(0, 2);

    const hiddenVarNames = new Set([primary?.name, ...auxiliary.map((s) => s.name)]);
    const priorityVarNames = new Set((activeSpec?.pointers ?? []).map((p) => p.variable));

    return { primary, activeSpec, scalarAux, companionAux, structuralAux, hiddenVarNames, priorityVarNames };
  }, [structures, vizSpecProp, currentFrame.vizSpec, getRank]);

  const { primary, activeSpec, scalarAux, companionAux, structuralAux, hiddenVarNames, priorityVarNames } = layoutData;

  return (
    <EngineTransition engineType={primary?.type}>
      <div className="relative w-full h-full flex flex-col bg-[#0f172a] overflow-hidden">
        <FloatingVariables
          variables={currentFrame.variables}
          hiddenNames={hiddenVarNames}
          priorityNames={priorityVarNames}
        />

        <div className="flex-1 flex min-h-0 mx-2 mb-2 rounded-xl border border-slate-800/70 overflow-hidden bg-[#0f172a]">
          <div className="relative flex-1 min-w-0">
            {primary && !['N_QUEENS', 'MATRIX', 'GRAPH', 'TREE', 'SEGMENT_TREE', 'LINKED_LIST', 'ARRAY', 'QUEUE', 'STACK', 'DEQUE', 'HEAP'].includes(
              primary.type
            ) && (
              <div className="absolute top-2 right-2 z-20 flex items-center gap-2 pointer-events-none">
                {activeSpec && (
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-[9px] font-mono text-emerald-400 uppercase tracking-widest">
                    ✦ spec
                  </span>
                )}
                <span className="px-3 py-1 rounded-md bg-slate-800/80 border border-slate-600/80 text-xs font-mono text-indigo-400 uppercase tracking-widest shadow-sm">
                  {primary.type}
                </span>
                <span className="px-3 py-1 rounded-md bg-indigo-500/20 border border-indigo-500/40 text-xs font-mono text-indigo-200 shadow-sm lowercase italic">
                  {primary.name}
                </span>
              </div>
            )}

            <EngineRenderer structure={primary} compact={false} />

            {scalarAux.length > 0 && (
              <div className="absolute bottom-3 right-3 z-20 flex flex-col gap-2 pointer-events-none">
                {scalarAux.slice(0, 4).map((s) => (
                  <AuxStatCard
                    key={s.id}
                    label={s.auxLabel ?? s.name}
                    value={
                      Array.isArray(s.data?.array)
                        ? s.data.array[s.data.array.length - 1]?.value ??
                          s.data.array[s.data.array.length - 1] ??
                          '—'
                        : s.data?.value ?? JSON.stringify(s.data).slice(0, 12)
                    }
                  />
                ))}
              </div>
            )}
          </div>

          {companionAux.length > 0 && (
            <div className="relative flex-1 min-w-0 border-l border-slate-800/60">
              <div className="absolute top-2 left-2 z-20 px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-[10px] font-mono text-emerald-300 uppercase tracking-widest pointer-events-none">
                {companionAux[0].auxLabel ?? companionAux[0].name}
              </div>
              <EngineRenderer structure={companionAux[0]} compact={false} />
            </div>
          )}
        </div>

        {structuralAux.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-shrink-0 flex items-center gap-2.5 px-3 py-2.5 border-t border-slate-800/60 overflow-x-auto"
          >
            {structuralAux.map((s) => (
              <AuxMiniCard key={s.id} struct={s} />
            ))}
          </motion.div>
        )}
      </div>
    </EngineTransition>
  );
}
