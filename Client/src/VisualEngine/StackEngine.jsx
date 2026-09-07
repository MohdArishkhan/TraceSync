// import React, { useRef, useEffect } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';

// export default function StackEngine({ data }) {
//   const items = data?.array ?? [];
//   const active = data?.activeIndices ?? [];
//   const topIdx = data?.topIndex ?? items.length - 1;
//   const prevLen = useRef(items.length);

//   useEffect(() => { prevLen.current = items.length; }, [items.length]);

//   const pushed = items.length > prevLen.current;
//   const popped = items.length < prevLen.current;

//   // Render top → bottom (reverse order visually)
//   const displayItems = [...items].reverse();

//   return (
//     <div className="relative flex flex-col items-center justify-center w-full h-full p-6 overflow-hidden bg-transparent">
      
//       {/* Dynamic Push/Pop Status Indicator */}
//       <div className="absolute top-6 flex items-center justify-center h-8">
//         <AnimatePresence mode="wait">
//           {pushed && (
//             <motion.div key="push" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }} className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-full text-[10px] font-mono text-emerald-400 tracking-widest uppercase shadow-[0_0_12px_rgba(16,185,129,0.2)]">
//               ↓ Pushed
//             </motion.div>
//           )}
//           {popped && (
//             <motion.div key="pop" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }} className="px-3 py-1 bg-rose-500/10 border border-rose-500/30 rounded-full text-[10px] font-mono text-rose-400 tracking-widest uppercase shadow-[0_0_12px_rgba(244,63,94,0.2)]">
//               ↑ Popped
//             </motion.div>
//           )}
//         </AnimatePresence>
//       </div>

//       <div className="mt-10 relative flex flex-col items-center">
//         {/* The Stack Container (Glass Beaker Metaphor) */}
//         <div className="absolute bottom-0 w-48 border-x-2 border-b-2 border-slate-600/50 rounded-b-xl bg-slate-900/20 backdrop-blur-sm shadow-[inset_0_-20px_30px_rgba(0,0,0,0.2)]" 
//              style={{ height: Math.max(160, items.length * 52 + 40), transition: 'height 0.4s ease' }} />

//         {/* Empty State */}
//         {!items.length && (
//           <div className="absolute bottom-10 flex flex-col items-center gap-3 opacity-50">
//             <div className="w-32 h-10 border-2 border-dashed border-slate-600 rounded-lg" />
//             <div className="w-32 h-10 border-2 border-dashed border-slate-600 rounded-lg" />
//             <span className="text-[10px] font-mono text-slate-500 tracking-widest uppercase">Stack Empty</span>
//           </div>
//         )}

//         {/* Stack Items */}
//         <div className="flex flex-col gap-2 items-center justify-end z-10 pb-2 min-h-[120px]">
//           <AnimatePresence mode="popLayout" initial={false}>
//             {displayItems.map((item, revIdx) => {
//               const realIdx = items.length - 1 - revIdx;
//               const isTop = realIdx === topIdx;
//               const isActive = active.includes(realIdx) || active.includes(String(realIdx));

//               return (
//                 <motion.div
//                   key={item.id ?? `stack-${realIdx}`}
//                   layout
//                   initial={{ opacity: 0, y: -50, scale: 0.9 }}
//                   animate={{ opacity: 1, y: 0, scale: isActive ? 1.05 : 1 }}
//                   exit={{ opacity: 0, y: -40, scale: 0.8, filter: "blur(4px)" }}
//                   transition={{ type: 'spring', stiffness: 400, damping: 25 }}
//                   className="relative flex items-center w-40 group"
//                 >
//                   {/* Pointer Label */}
//                   {isTop && (
//                     <motion.div layoutId="top-badge" className="absolute -left-16 flex items-center">
//                       <div className="px-2 py-0.5 bg-indigo-500 rounded-md text-[9px] font-bold font-mono text-white tracking-wider shadow-[0_0_10px_rgba(99,102,241,0.5)]">
//                         TOP
//                       </div>
//                       <div className="w-3 h-0.5 bg-indigo-500" />
//                     </motion.div>
//                   )}

//                   {/* Cell Body */}
//                   <div className={`w-full h-11 rounded-lg font-mono text-sm font-bold flex items-center justify-center border transition-all duration-300 ${
//                     isActive 
//                       ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white border-indigo-300 shadow-[0_0_20px_rgba(99,102,241,0.6)]' 
//                       : isTop 
//                         ? 'bg-slate-800 text-indigo-100 border-indigo-500/60 shadow-lg' 
//                         : 'bg-slate-800/80 text-slate-300 border-slate-600/50 backdrop-blur-md'
//                   }`}>
//                     <span className="truncate px-4 drop-shadow-md">{item.value ?? item}</span>
//                   </div>

//                   {/* Index Number */}
//                   <div className="absolute -right-8 text-[9px] font-mono text-slate-500 group-hover:text-slate-300 transition-colors">
//                     {realIdx}
//                   </div>
//                 </motion.div>
//               );
//             })}
//           </AnimatePresence>
//         </div>
//       </div>

//       {/* Metadata Bottom */}
//       <div className="mt-6 flex items-center gap-4">
//         <div className="px-3 py-1 rounded-md bg-slate-800/50 border border-slate-700/50 text-[10px] font-mono text-slate-400 backdrop-blur-sm">
//           Capacity: Dynamic
//         </div>
//         <div className="px-3 py-1 rounded-md bg-slate-800/50 border border-slate-700/50 text-[10px] font-mono text-slate-400 backdrop-blur-sm">
//           Size: <span className="text-indigo-400 font-bold">{items.length}</span>
//         </div>
//       </div>
//     </div>
//   );
// }


import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function StackEngine({ data }) {
  const items = data?.array ?? [];
  const narration = data?.narration ?? null;
  const condition = data?.condition ?? null;
  const active = data?.activeIndices ?? [];
  const topIdx = data?.topIndex ?? items.length - 1;
  const prevLen = useRef(items.length);

  useEffect(() => { prevLen.current = items.length; }, [items.length]);

  const pushed = items.length > prevLen.current;
  const popped = items.length < prevLen.current;

  // Render top → bottom (reverse order visually)
  const displayItems = [...items].reverse();

  const conditionBadge = condition
    ? condition.conditionTrue
      ? { cls: 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400', label: `✓ ${condition.text}` }
      : { cls: 'bg-slate-700/40 border-slate-600/40 text-slate-400', label: `${condition.text} — no` }
    : null;

  return (
    <div className="relative flex flex-col items-center justify-center w-full h-full p-6 overflow-hidden bg-transparent">

      {conditionBadge && (
        <div className="absolute top-3 right-3 z-20">
          <span className={`px-3 py-1 rounded-full border text-[11px] font-bold tracking-wide whitespace-nowrap max-w-[280px] truncate inline-block ${conditionBadge.cls}`}>
            {conditionBadge.label}
          </span>
        </div>
      )}
      
      {/* Dynamic Push/Pop Status Indicator */}
      <div className="absolute top-6 flex items-center justify-center h-8">
        <AnimatePresence mode="wait">
          {pushed && (
            <motion.div key="push" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }} className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-full text-[10px] font-mono text-emerald-400 tracking-widest uppercase shadow-[0_0_12px_rgba(16,185,129,0.2)]">
              ↓ Pushed
            </motion.div>
          )}
          {popped && (
            <motion.div key="pop" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }} className="px-3 py-1 bg-rose-500/10 border border-rose-500/30 rounded-full text-[10px] font-mono text-rose-400 tracking-widest uppercase shadow-[0_0_12px_rgba(244,63,94,0.2)]">
              ↑ Popped
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-10 relative flex flex-col items-center">
        {/* The Stack Container (Glass Beaker Metaphor) */}
        <div className="absolute bottom-0 w-48 border-x-2 border-b-2 border-slate-600/50 rounded-b-xl bg-slate-900/20 backdrop-blur-sm shadow-[inset_0_-20px_30px_rgba(0,0,0,0.2)]" 
             style={{ height: Math.max(160, items.length * 52 + 40), transition: 'height 0.4s ease' }} />

        {/* Empty State */}
        {!items.length && (
          <div className="absolute bottom-10 flex flex-col items-center gap-3 opacity-50">
            <div className="w-32 h-10 border-2 border-dashed border-slate-600 rounded-lg" />
            <div className="w-32 h-10 border-2 border-dashed border-slate-600 rounded-lg" />
            <span className="text-[10px] font-mono text-slate-500 tracking-widest uppercase">Stack Empty</span>
          </div>
        )}

        {/* Stack Items */}
        <div className="flex flex-col gap-2 items-center justify-end z-10 pb-2 min-h-[120px]">
          <AnimatePresence mode="popLayout" initial={false}>
            {displayItems.map((item, revIdx) => {
              const realIdx = items.length - 1 - revIdx;
              const isTop = realIdx === topIdx;
              const isActive = active.includes(realIdx) || active.includes(String(realIdx));

              return (
                <motion.div
                  key={item.id ?? `stack-${realIdx}`}
                  layout
                  initial={{ opacity: 0, y: -50, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: isActive ? 1.05 : 1 }}
                  exit={{ opacity: 0, y: -40, scale: 0.8, filter: "blur(4px)" }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  className="relative flex items-center w-40 group"
                >
                  {/* Pointer Label */}
                  {isTop && (
                    <motion.div layoutId="top-badge" className="absolute -left-16 flex items-center">
                      <div className="px-2 py-0.5 bg-indigo-500 rounded-md text-[9px] font-bold font-mono text-white tracking-wider shadow-[0_0_10px_rgba(99,102,241,0.5)]">
                        TOP
                      </div>
                      <div className="w-3 h-0.5 bg-indigo-500" />
                    </motion.div>
                  )}

                  {/* Cell Body */}
                  <div className={`w-full h-11 rounded-lg font-mono text-sm font-bold flex items-center justify-center border transition-all duration-300 ${
                    isActive 
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white border-indigo-300 shadow-[0_0_20px_rgba(99,102,241,0.6)]' 
                      : isTop 
                        ? 'bg-slate-800 text-indigo-100 border-indigo-500/60 shadow-lg' 
                        : 'bg-slate-800/80 text-slate-300 border-slate-600/50 backdrop-blur-md'
                  }`}>
                    <span className="truncate px-4 drop-shadow-md">{item.value ?? item}</span>
                  </div>

                  {/* Index Number */}
                  <div className="absolute -right-8 text-[9px] font-mono text-slate-500 group-hover:text-slate-300 transition-colors">
                    {realIdx}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* Metadata Bottom */}
      <div className="mt-6 flex items-center gap-4">
        <div className="px-3 py-1 rounded-md bg-slate-800/50 border border-slate-700/50 text-[10px] font-mono text-slate-400 backdrop-blur-sm">
          Capacity: Dynamic
        </div>
        <div className="px-3 py-1 rounded-md bg-slate-800/50 border border-slate-700/50 text-[10px] font-mono text-slate-400 backdrop-blur-sm">
          Size: <span className="text-indigo-400 font-bold">{items.length}</span>
        </div>
      </div>

      {narration && (
        <div className="w-full max-w-3xl mt-4 flex items-start gap-2.5 px-4 py-2 rounded-lg border border-amber-500/15 bg-amber-500/5">
          <span className="text-amber-500/60 text-sm mt-0.5 flex-shrink-0">✎</span>
          <span className="text-[12.5px] font-medium text-amber-200/90 leading-snug">{narration}</span>
        </div>
      )}
    </div>
  );
}