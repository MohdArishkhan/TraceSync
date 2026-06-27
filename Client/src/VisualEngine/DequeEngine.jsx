import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const formatValue = (v) => {
  if (Array.isArray(v)) return `(${v.join(', ')})`;
  if (typeof v === 'object' && v !== null) return JSON.stringify(v);
  return String(v);
};

export default function DequeEngine({ data }) {
  const items = data?.array ?? [];
  const active = data?.activeIndices ?? [];
  const frontIndex = 0;
  const rearIndex = Math.max(0, items.length - 1);
  
  const prevItems = useRef(items);
  const [lastOp, setLastOp] = useState({ type: null, side: null });

  useEffect(() => {
    const prev = prevItems.current;
    if (items.length > prev.length) {
      if (prev.length > 0 && items[0].value !== prev[0].value) {
        setLastOp({ type: 'insert', side: 'front' });
      } else {
        setLastOp({ type: 'insert', side: 'rear' });
      }
    } else if (items.length < prev.length) {
      if (items.length > 0 && items[0].value === prev[1].value) {
        setLastOp({ type: 'remove', side: 'front' });
      } else {
        setLastOp({ type: 'remove', side: 'rear' });
      }
    } else {
      setLastOp({ type: null, side: null });
    }
    prevItems.current = items;
  }, [items]);

  return (
    <div className="relative flex flex-col items-center justify-center w-full h-full p-8 overflow-hidden bg-transparent">
      
      <div className="absolute top-6 flex items-center justify-center h-8 w-full">
        <AnimatePresence mode="wait">
          {lastOp.type === 'insert' && lastOp.side === 'front' && (
            <motion.div key="if" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="px-3 py-1 bg-fuchsia-500/10 border border-fuchsia-500/30 rounded-full text-[10px] font-mono text-fuchsia-400 tracking-widest uppercase shadow-[0_0_12px_rgba(217,70,239,0.2)]">
              ↓ Push Front
            </motion.div>
          )}
          {lastOp.type === 'remove' && lastOp.side === 'front' && (
            <motion.div key="rf" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="px-3 py-1 bg-orange-500/10 border border-orange-500/30 rounded-full text-[10px] font-mono text-orange-400 tracking-widest uppercase shadow-[0_0_12px_rgba(249,115,22,0.2)]">
              ↑ Pop Front
            </motion.div>
          )}
          {lastOp.type === 'insert' && lastOp.side === 'rear' && (
            <motion.div key="ir" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="px-3 py-1 bg-cyan-500/10 border border-cyan-500/30 rounded-full text-[10px] font-mono text-cyan-400 tracking-widest uppercase shadow-[0_0_12px_rgba(6,182,212,0.2)]">
              Push Rear ↓
            </motion.div>
          )}
          {lastOp.type === 'remove' && lastOp.side === 'rear' && (
            <motion.div key="rr" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="px-3 py-1 bg-rose-500/10 border border-rose-500/30 rounded-full text-[10px] font-mono text-rose-400 tracking-widest uppercase shadow-[0_0_12px_rgba(244,63,94,0.2)]">
              Pop Rear ↑
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="relative flex items-center w-full max-w-4xl min-h-[120px] border-y-2 border-slate-600/50 bg-slate-900/40 backdrop-blur-md shadow-[inset_0_0_30px_rgba(0,0,0,0.4)] mt-6">
        <div className="absolute left-0 w-20 h-full bg-gradient-to-r from-fuchsia-500/15 to-transparent pointer-events-none" />
        <div className="absolute right-0 w-20 h-full bg-gradient-to-l from-cyan-500/15 to-transparent pointer-events-none" />

        {!items.length && (
          <div className="absolute inset-0 flex items-center justify-center gap-4 opacity-40">
            <span className="text-[10px] font-mono text-slate-500 tracking-widest uppercase">Double-Ended Queue Empty</span>
          </div>
        )}

        <div className="flex items-center gap-3 px-16 relative w-full overflow-x-auto custom-scrollbar py-10">
          <AnimatePresence mode="popLayout" initial={false}>
            {items.map((item, idx) => {
              const isFront = idx === frontIndex;
              const isRear = idx === rearIndex;
              const isActive = active.includes(idx) || active.includes(String(idx));

              return (
                <motion.div
                  key={item.id ?? `dq-${idx}`}
                  layout
                  initial={{ opacity: 0, scale: 0.7, x: lastOp.side === 'front' ? -50 : 50 }}
                  animate={{ opacity: 1, scale: isActive ? 1.1 : 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.7, filter: "blur(5px)", x: lastOp.side === 'front' ? -50 : 50 }}
                  transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                  className="relative flex flex-col items-center shrink-0"
                >
                  <div className="absolute -top-10 flex justify-center w-full">
                    {isFront && (
                      <div className="flex flex-col items-center">
                        <span className="px-2 py-0.5 bg-fuchsia-500/20 border border-fuchsia-500/50 text-fuchsia-400 text-[8px] font-bold font-mono tracking-widest rounded-sm mb-1 shadow-[0_0_10px_rgba(217,70,239,0.3)]">FRONT</span>
                        <div className="w-0.5 h-4 bg-fuchsia-500/50" />
                      </div>
                    )}
                    {isRear && !isFront && (
                      <div className="flex flex-col items-center">
                        <span className="px-2 py-0.5 bg-cyan-500/20 border border-cyan-500/50 text-cyan-400 text-[8px] font-bold font-mono tracking-widest rounded-sm mb-1 shadow-[0_0_10px_rgba(6,182,212,0.3)]">REAR</span>
                        <div className="w-0.5 h-4 bg-cyan-500/50" />
                      </div>
                    )}
                    {isFront && isRear && items.length === 1 && (
                      <div className="flex flex-col items-center">
                        <span className="px-2 py-0.5 bg-indigo-500/20 border border-indigo-500/50 text-indigo-400 text-[8px] font-bold font-mono tracking-widest rounded-sm mb-1">F & R</span>
                        <div className="w-0.5 h-4 bg-indigo-500/50" />
                      </div>
                    )}
                  </div>

                  <div className={`min-w-[4rem] w-auto px-4 h-16 rounded-lg font-mono text-base sm:text-lg font-bold flex items-center justify-center border-2 transition-all duration-300 ${
                    isActive
                      ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white border-indigo-300 shadow-[0_0_20px_rgba(99,102,241,0.6)]'
                      : isFront
                        ? 'bg-slate-800 text-fuchsia-200 border-fuchsia-500/50 shadow-[inset_0_0_15px_rgba(217,70,239,0.2)]'
                        : isRear
                          ? 'bg-slate-800 text-cyan-200 border-cyan-500/50 shadow-[inset_0_0_15px_rgba(6,182,212,0.2)]'
                          : 'bg-slate-800/80 text-slate-300 border-slate-600/50'
                  }`}>
                    <span className="whitespace-nowrap drop-shadow-md">{formatValue(item.value ?? item)}</span>
                  </div>

                  <div className="absolute -bottom-7 text-[9px] font-mono text-slate-500 bg-slate-900/80 px-2 rounded-md border border-slate-700/50">
                    {idx}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      <div className="mt-10 flex items-center gap-6 bg-slate-900/60 p-3 rounded-xl border border-slate-700/50 backdrop-blur-md shadow-lg">
        <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400">
          <div className="w-3 h-3 rounded-sm bg-fuchsia-500/30 border border-fuchsia-500/50" />
          Front Access (O(1))
        </div>
        <div className="h-4 w-px bg-slate-700" />
        <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400">
          <div className="w-3 h-3 rounded-sm bg-cyan-500/30 border border-cyan-500/50" />
          Rear Access (O(1))
        </div>
        <div className="h-4 w-px bg-slate-700" />
        <div className="text-[10px] font-mono text-slate-400">
          Size: <span className="text-indigo-400 font-bold ml-1">{items.length}</span>
        </div>
      </div>
    </div>
  );
}