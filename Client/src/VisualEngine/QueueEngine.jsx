import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function QueueEngine({ data }) {
  const items = data?.array ?? [];
  const active = data?.activeIndices ?? [];
  const frontIndex = data?.frontIndex ?? 0;
  const rearIndex = data?.rearIndex ?? items.length - 1;
  const prevLen = useRef(items.length);

  useEffect(() => { prevLen.current = items.length; }, [items.length]);

  return (
    <div className="relative flex flex-col items-center justify-center w-full h-full p-8 overflow-hidden bg-transparent">
      
      {/* Queue Track / Rails */}
      <div className="relative flex items-center w-full max-w-3xl min-h-[100px] border-y-2 border-slate-700/50 bg-slate-900/30 backdrop-blur-md shadow-[inset_0_0_20px_rgba(0,0,0,0.3)]">
        
        {/* Entry / Exit glow effects on the track */}
        <div className="absolute left-0 w-16 h-full bg-gradient-to-r from-rose-500/10 to-transparent pointer-events-none" />
        <div className="absolute right-0 w-16 h-full bg-gradient-to-l from-emerald-500/10 to-transparent pointer-events-none" />

        {/* Empty State */}
        {!items.length && (
          <div className="absolute inset-0 flex items-center justify-center gap-4 opacity-40">
            {[1, 2, 3].map(i => (
              <div key={i} className="w-16 h-16 border-2 border-dashed border-slate-600 rounded-xl" />
            ))}
            <span className="absolute -bottom-8 text-[10px] font-mono text-slate-500 tracking-widest uppercase">Queue Empty</span>
          </div>
        )}

        {/* Data Cells */}
        <div className="flex items-center gap-3 px-12 relative w-full overflow-x-auto overflow-y-visible custom-scrollbar py-8">
          <AnimatePresence mode="popLayout" initial={false}>
            {items.map((item, idx) => {
              const isFront = idx === frontIndex;
              const isRear = idx === rearIndex;
              const isActive = active.includes(idx) || active.includes(String(idx));

              return (
                <motion.div
                  key={item.id ?? `q-${idx}`}
                  layout
                  initial={{ opacity: 0, x: 60, scale: 0.8 }}
                  animate={{ opacity: 1, x: 0, scale: isActive ? 1.05 : 1 }}
                  exit={{ opacity: 0, x: -60, scale: 0.8, filter: "blur(4px)" }}
                  transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                  className="relative flex flex-col items-center shrink-0"
                >
                  {/* HUD Pointers (FRONT / REAR) */}
                  <div className="absolute -top-8 flex justify-center w-full">
                    {isFront && (
                      <div className="flex flex-col items-center">
                        <span className="px-2 py-0.5 bg-rose-500/20 border border-rose-500/50 text-rose-400 text-[8px] font-bold font-mono tracking-widest rounded-sm mb-1 shadow-[0_0_8px_rgba(244,63,94,0.3)]">FRONT</span>
                        <div className="w-0.5 h-3 bg-rose-500/50" />
                      </div>
                    )}
                    {isRear && !isFront && (
                      <div className="flex flex-col items-center">
                        <span className="px-2 py-0.5 bg-emerald-500/20 border border-emerald-500/50 text-emerald-400 text-[8px] font-bold font-mono tracking-widest rounded-sm mb-1 shadow-[0_0_8px_rgba(16,185,129,0.3)]">REAR</span>
                        <div className="w-0.5 h-3 bg-emerald-500/50" />
                      </div>
                    )}
                    {isFront && isRear && (
                      <div className="flex flex-col items-center">
                        <span className="px-2 py-0.5 bg-amber-500/20 border border-amber-500/50 text-amber-400 text-[8px] font-bold font-mono tracking-widest rounded-sm mb-1">F & R</span>
                        <div className="w-0.5 h-3 bg-amber-500/50" />
                      </div>
                    )}
                  </div>

                  {/* Cell Body */}
                  <div className={`w-16 h-16 rounded-xl font-mono text-lg font-bold flex items-center justify-center border-2 transition-all duration-300 ${
                    isActive
                      ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white border-indigo-300 shadow-[0_0_20px_rgba(99,102,241,0.6)]'
                      : isFront
                        ? 'bg-slate-800 text-rose-200 border-rose-500/50 shadow-[inset_0_0_15px_rgba(244,63,94,0.2)]'
                        : isRear
                          ? 'bg-slate-800 text-emerald-200 border-emerald-500/50 shadow-[inset_0_0_15px_rgba(16,185,129,0.2)]'
                          : 'bg-slate-800/80 text-slate-300 border-slate-600/50'
                  }`}>
                    <span className="truncate px-2 drop-shadow-md">{item.value ?? item}</span>
                  </div>

                  {/* Index Below */}
                  <div className="absolute -bottom-6 text-[10px] font-mono text-slate-500 bg-slate-900/80 px-2 rounded-full border border-slate-700/50">
                    {idx}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* Control Panel / Legend */}
      <div className="mt-10 flex items-center gap-6 bg-slate-900/60 p-2.5 rounded-xl border border-slate-700/50 backdrop-blur-md shadow-lg">
        <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400">
          <div className="flex items-center justify-center w-5 h-5 rounded bg-rose-500/20 border border-rose-500/50">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fb7185" strokeWidth="3"><path d="M19 12H5M5 12L12 19M5 12L12 5"/></svg>
          </div>
          Dequeue (Front)
        </div>
        
        <div className="h-4 w-px bg-slate-700" />
        
        <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400">
          <div className="flex items-center justify-center w-5 h-5 rounded bg-emerald-500/20 border border-emerald-500/50">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="3"><path d="M5 12h14M19 12l-7 7M19 12l-7-7"/></svg>
          </div>
          Enqueue (Rear)
        </div>

        <div className="h-4 w-px bg-slate-700" />

        <div className="text-[10px] font-mono text-slate-400">
          Size: <span className="text-indigo-400 font-bold ml-1">{items.length}</span>
        </div>
      </div>

    </div>
  );
}