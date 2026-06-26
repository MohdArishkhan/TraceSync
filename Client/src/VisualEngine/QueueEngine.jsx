import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// data shape: { array: [{id, value}, ...], activeIndices: [], frontIndex: 0, rearIndex: n-1 }
// array[0] = front (dequeue side), array[last] = rear (enqueue side)

export default function QueueEngine({ data }) {
  const items      = data?.array      ?? [];
  const active     = data?.activeIndices ?? [];
  const frontIndex = data?.frontIndex ?? 0;
  const rearIndex  = data?.rearIndex  ?? items.length - 1;
  const prevLen    = useRef(items.length);

  useEffect(() => { prevLen.current = items.length; }, [items.length]);

  const enqueued = items.length > prevLen.current;
  const dequeued = items.length < prevLen.current;

  if (!items.length) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-full text-slate-500 gap-2">
        <svg width="80" height="32" viewBox="0 0 80 32">
          <rect x="4"  y="8" width="20" height="16" rx="3" fill="#1e293b" stroke="#334155" strokeWidth="1.5"/>
          <rect x="30" y="8" width="20" height="16" rx="3" fill="#1e293b" stroke="#334155" strokeWidth="1.5"/>
          <rect x="56" y="8" width="20" height="16" rx="3" fill="#1e293b" stroke="#334155" strokeWidth="1.5"/>
        </svg>
        <span className="text-xs font-mono">Queue is empty</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center w-full h-full p-6 overflow-auto gap-4">

      {/* Operation indicator */}
      <div className="h-5 flex items-center">
        {enqueued && (
          <motion.span
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="text-[10px] font-mono text-emerald-400 tracking-widest uppercase"
          >
            enqueue →
          </motion.span>
        )}
        {dequeued && (
          <motion.span
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="text-[10px] font-mono text-rose-400 tracking-widest uppercase"
          >
            ← dequeue
          </motion.span>
        )}
      </div>

      {/* Main queue row */}
      <div className="flex items-center gap-0 relative">

        {/* DEQUEUE side arrow */}
        <div className="flex flex-col items-center mr-2">
          <svg width="28" height="24" viewBox="0 0 28 24">
            <line x1="28" y1="12" x2="6" y2="12" stroke="#f87171" strokeWidth="2"/>
            <polygon points="0,12 8,8 8,16" fill="#f87171"/>
          </svg>
          <span className="text-[9px] font-mono text-rose-400 mt-1">out</span>
        </div>

        {/* Queue cells */}
        <div className="flex items-center border-t-2 border-b-2 border-slate-600 relative overflow-hidden rounded-sm">
          <AnimatePresence mode="popLayout" initial={false}>
            {items.map((item, idx) => {
              const isFront  = idx === frontIndex;
              const isRear   = idx === rearIndex;
              const isActive = active.includes(idx) || active.includes(String(idx));

              return (
                <motion.div
                  key={item.id ?? `q-${idx}`}
                  layout
                  initial={{ opacity: 0, x: 40, scaleX: 0.7 }}
                  animate={{ opacity: 1, x: 0,  scaleX: 1,   scale: isActive ? 1.08 : 1 }}
                  exit={{    opacity: 0, x: -40, scaleX: 0.7 }}
                  transition={{ type: 'spring', stiffness: 320, damping: 26 }}
                  className="relative flex flex-col items-center"
                >
                  {/* Top label */}
                  <div className="h-5 flex items-end justify-center mb-0.5">
                    {isFront && (
                      <span className="text-[9px] font-mono text-rose-400 tracking-widest">FRONT</span>
                    )}
                    {isRear && !isFront && (
                      <span className="text-[9px] font-mono text-emerald-400 tracking-widest">REAR</span>
                    )}
                    {isFront && isRear && (
                      <span className="text-[9px] font-mono text-yellow-400 tracking-widest">F=R</span>
                    )}
                  </div>

                  {/* Cell */}
                  <div
                    className={`
                      flex items-center justify-center
                      w-14 h-14
                      border-l-2 border-r
                      font-mono text-base font-bold
                      transition-colors duration-200
                      ${isActive
                        ? 'bg-indigo-500 text-white border-l-indigo-300 shadow-[inset_0_0_12px_rgba(99,102,241,0.4)]'
                        : isFront
                          ? 'bg-rose-500/20 text-rose-200 border-l-rose-500/60 border-r-slate-600'
                          : isRear
                            ? 'bg-emerald-500/20 text-emerald-200 border-l-emerald-500/60 border-r-slate-600'
                            : 'bg-slate-800 text-slate-200 border-l-slate-600 border-r-slate-700'}
                    `}
                  >
                    <span className="truncate px-1 text-center text-sm">
                      {item.value ?? item}
                    </span>
                  </div>

                  {/* Index */}
                  <span className="mt-1 text-[9px] font-mono text-slate-600">[{idx}]</span>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* ENQUEUE side arrow */}
        <div className="flex flex-col items-center ml-2">
          <svg width="28" height="24" viewBox="0 0 28 24">
            <line x1="0" y1="12" x2="22" y2="12" stroke="#34d399" strokeWidth="2"/>
            <polygon points="28,12 20,8 20,16" fill="#34d399"/>
          </svg>
          <span className="text-[9px] font-mono text-emerald-400 mt-1">in</span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-4 text-[10px] font-mono">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-rose-400"/>
          <span className="text-slate-500">front (dequeue)</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400"/>
          <span className="text-slate-500">rear (enqueue)</span>
        </span>
        <span className="text-slate-600">
          size&nbsp;=&nbsp;<span className="text-indigo-300">{items.length}</span>
        </span>
      </div>
    </div>
  );
}
