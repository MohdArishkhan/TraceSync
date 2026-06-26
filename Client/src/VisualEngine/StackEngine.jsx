import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// data shape: { array: [{id, value}, ...], activeIndices: [idx, ...], topIndex: number }
// array[0] = bottom of stack, array[last] = top

export default function StackEngine({ data }) {
  const items   = data?.array   ?? [];
  const active  = data?.activeIndices ?? [];
  const topIdx  = data?.topIndex ?? items.length - 1;
  const prevLen = useRef(items.length);

  useEffect(() => { prevLen.current = items.length; }, [items.length]);

  const pushed = items.length > prevLen.current;
  const popped = items.length < prevLen.current;

  if (!items.length) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-full text-slate-500 gap-2">
        <svg width="40" height="50" viewBox="0 0 40 50">
          <rect x="4" y="4"  width="32" height="10" rx="3" fill="#1e293b" stroke="#334155" strokeWidth="1.5"/>
          <rect x="4" y="20" width="32" height="10" rx="3" fill="#1e293b" stroke="#334155" strokeWidth="1.5"/>
          <rect x="4" y="36" width="32" height="10" rx="3" fill="#1e293b" stroke="#334155" strokeWidth="1.5"/>
        </svg>
        <span className="text-xs font-mono">Stack is empty</span>
      </div>
    );
  }

  // Render top → bottom (reverse order visually)
  const displayItems = [...items].reverse();

  return (
    <div className="flex flex-col items-center justify-center w-full h-full p-6 gap-0 overflow-auto">

      {/* TOP label + push arrow */}
      <div className="flex items-center gap-2 mb-1 h-6">
        {pushed && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-[10px] font-mono text-emerald-400 tracking-widest uppercase"
          >
            push ↓
          </motion.div>
        )}
        {popped && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-[10px] font-mono text-rose-400 tracking-widest uppercase"
          >
            pop ↑
          </motion.div>
        )}
      </div>

      {/* Stack items — top first */}
      <div className="flex flex-col gap-1.5 items-center">
        <AnimatePresence mode="popLayout" initial={false}>
          {displayItems.map((item, revIdx) => {
            const realIdx  = items.length - 1 - revIdx;
            const isTop    = realIdx === topIdx;
            const isActive = active.includes(realIdx) || active.includes(String(realIdx));

            return (
              <motion.div
                key={item.id ?? `stack-${realIdx}`}
                layout
                initial={{ opacity: 0, y: -32, scale: 0.85 }}
                animate={{ opacity: 1, y: 0,   scale: isActive ? 1.06 : 1 }}
                exit={{    opacity: 0, y: -32, scale: 0.85 }}
                transition={{ type: 'spring', stiffness: 340, damping: 28 }}
                className="relative flex items-center"
              >
                {/* TOP pointer */}
                {isTop && (
                  <motion.div
                    layoutId="top-pointer"
                    className="absolute -left-16 flex items-center gap-1"
                  >
                    <span className="text-[10px] font-mono text-indigo-400 tracking-widest">TOP</span>
                    <svg width="20" height="10" viewBox="0 0 20 10">
                      <line x1="0" y1="5" x2="14" y2="5" stroke="#818cf8" strokeWidth="1.5"/>
                      <polygon points="14,2 20,5 14,8" fill="#818cf8"/>
                    </svg>
                  </motion.div>
                )}

                {/* Cell */}
                <div
                  className={`
                    flex items-center justify-center
                    w-36 h-11 rounded-lg
                    font-mono text-base font-bold
                    border-2 transition-colors duration-200
                    ${isActive
                      ? 'bg-indigo-500 text-white border-indigo-300 shadow-[0_0_14px_rgba(99,102,241,0.6)]'
                      : isTop
                        ? 'bg-slate-700 text-indigo-200 border-indigo-500/60'
                        : 'bg-slate-800 text-slate-200 border-slate-600'}
                  `}
                >
                  <span className="truncate px-2 text-center">
                    {item.value ?? item}
                  </span>
                </div>

                {/* Index label */}
                <span className="absolute -right-10 text-[10px] font-mono text-slate-600">
                  [{realIdx}]
                </span>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Stack floor */}
      <div className="mt-1.5 w-44 h-0.5 rounded-full bg-slate-600" />
      <span className="mt-1 text-[10px] font-mono text-slate-600">bottom</span>

      {/* Size indicator */}
      <div className="mt-4 px-3 py-1.5 rounded-lg bg-slate-800/60 border border-slate-700 text-[10px] font-mono text-slate-400">
        size&nbsp;=&nbsp;<span className="text-indigo-300">{items.length}</span>
      </div>
    </div>
  );
}
