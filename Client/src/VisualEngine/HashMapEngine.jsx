// import React, { useMemo } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';

// // data shape:
// // {
// //   entries: [{ key, value, bucket, isActive, isNew }, ...],
// //   bucketCount: number,          // how many buckets to show (default 8)
// //   activeKey: string | null,     // key being looked up / inserted right now
// // }

// const DEFAULT_BUCKETS = 8;

// // Simple visual hash — just for display (real hash is done by Python/JS)
// function displayHash(key, n) {
//   let h = 0;
//   const s = String(key);
//   for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % n;
//   return h;
// }

// export default function HashMapEngine({ data }) {
//   const entries     = data?.entries     ?? [];
//   const bucketCount = data?.bucketCount ?? DEFAULT_BUCKETS;
//   const activeKey   = data?.activeKey   ?? null;

//   // Group entries by bucket
//   const buckets = useMemo(() => {
//     const b = Array.from({ length: bucketCount }, () => []);
//     for (const entry of entries) {
//       const bi = entry.bucket ?? displayHash(entry.key, bucketCount);
//       if (bi >= 0 && bi < bucketCount) b[bi].push(entry);
//     }
//     return b;
//   }, [entries, bucketCount]);

//   // Active bucket index
//   const activeBucket = activeKey != null
//     ? (entries.find(e => e.key === activeKey)?.bucket ?? displayHash(activeKey, bucketCount))
//     : null;

//   if (!entries.length) {
//     return (
//       <div className="flex flex-col items-center justify-center w-full h-full text-slate-500 gap-2">
//         <div className="flex gap-1">
//           {[0,1,2,3].map(i => (
//             <div key={i} className="w-8 h-14 rounded border border-slate-700 bg-slate-800/50"/>
//           ))}
//         </div>
//         <span className="text-xs font-mono">HashMap is empty</span>
//       </div>
//     );
//   }

//   return (
//     <div className="flex flex-col w-full h-full overflow-auto p-4 gap-3">

//       {/* Header */}
//       <div className="flex items-center gap-3 flex-shrink-0">
//         <span className="text-[10px] font-mono text-slate-500">
//           buckets:&nbsp;<span className="text-indigo-300">{bucketCount}</span>
//         </span>
//         <span className="text-[10px] font-mono text-slate-500">
//           entries:&nbsp;<span className="text-indigo-300">{entries.length}</span>
//         </span>
//         {activeKey != null && (
//           <motion.span
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             className="text-[10px] font-mono text-yellow-400 flex items-center gap-1"
//           >
//             <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse"/>
//             lookup: <span className="text-white ml-1">"{activeKey}"</span>
//             &nbsp;→ bucket [{activeBucket}]
//           </motion.span>
//         )}
//       </div>

//       {/* Active key → bucket arrow (top level) */}
//       {activeKey != null && (
//         <motion.div
//           initial={{ opacity: 0, y: -6 }}
//           animate={{ opacity: 1, y: 0 }}
//           className="flex items-center gap-2 text-[10px] font-mono px-3 py-1.5 rounded-lg bg-yellow-400/5 border border-yellow-400/20 flex-shrink-0"
//         >
//           <span className="text-slate-400">hash(</span>
//           <span className="text-yellow-300">"{activeKey}"</span>
//           <span className="text-slate-400">)</span>
//           <span className="text-slate-500">%{bucketCount}</span>
//           <span className="text-slate-400">=</span>
//           <span className="text-indigo-300 font-bold">{activeBucket}</span>
//         </motion.div>
//       )}

//       {/* Buckets grid */}
//       <div
//         className="flex-1 grid gap-2 overflow-auto"
//         style={{
//           gridTemplateColumns: `repeat(${Math.min(bucketCount, 4)}, minmax(0, 1fr))`,
//         }}
//       >
//         {buckets.map((bucketEntries, bi) => {
//           const isActiveBucket = bi === activeBucket;
//           return (
//             <div
//               key={`bucket-${bi}`}
//               className={`flex flex-col rounded-xl border transition-all duration-300 overflow-hidden ${
//                 isActiveBucket
//                   ? 'border-yellow-400/50 shadow-[0_0_12px_rgba(250,204,21,0.15)]'
//                   : 'border-slate-700/60'
//               }`}
//             >
//               {/* Bucket header */}
//               <div
//                 className={`flex items-center justify-between px-2.5 py-1.5 border-b text-[10px] font-mono ${
//                   isActiveBucket
//                     ? 'bg-yellow-400/10 border-yellow-400/30 text-yellow-400'
//                     : 'bg-slate-800/80 border-slate-700/50 text-slate-500'
//                 }`}
//               >
//                 <span>[{bi}]</span>
//                 {bucketEntries.length > 0 && (
//                   <span className={isActiveBucket ? 'text-yellow-300' : 'text-slate-600'}>
//                     {bucketEntries.length}
//                   </span>
//                 )}
//               </div>

//               {/* Entries (chain) */}
//               <div className="flex flex-col bg-slate-900/40 flex-1 min-h-[56px] p-1.5 gap-1">
//                 <AnimatePresence mode="popLayout" initial={false}>
//                   {bucketEntries.map((entry, ei) => {
//                     const isActive = entry.isActive || entry.key === activeKey;
//                     const isNew    = entry.isNew;
//                     return (
//                       <motion.div
//                         key={entry.key ?? `entry-${bi}-${ei}`}
//                         layout
//                         initial={{ opacity: 0, scale: 0.85, y: -8 }}
//                         animate={{ opacity: 1,  scale: isActive ? 1.04 : 1, y: 0 }}
//                         exit={{    opacity: 0,  scale: 0.85, y: 8 }}
//                         transition={{ type: 'spring', stiffness: 300, damping: 24 }}
//                         className={`
//                           flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-mono
//                           border transition-colors duration-200
//                           ${isActive
//                             ? 'bg-indigo-500/20 border-indigo-400/50 text-indigo-200'
//                             : isNew
//                               ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
//                               : 'bg-slate-800/60 border-slate-700/40 text-slate-300'}
//                         `}
//                       >
//                         {/* Collision chain indicator */}
//                         {ei > 0 && (
//                           <span className="text-slate-600 flex-shrink-0">↳</span>
//                         )}
//                         <span className={`flex-shrink-0 ${isActive ? 'text-indigo-300' : 'text-slate-400'}`}>
//                           {String(entry.key)}
//                         </span>
//                         <span className="text-slate-600 flex-shrink-0">:</span>
//                         <span className={`truncate ${isActive ? 'text-white' : 'text-slate-200'}`}>
//                           {String(entry.value)}
//                         </span>
//                         {isActive && (
//                           <span className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-400 flex-shrink-0"/>
//                         )}
//                         {isNew && !isActive && (
//                           <span className="ml-auto text-[8px] text-emerald-400 flex-shrink-0">new</span>
//                         )}
//                       </motion.div>
//                     );
//                   })}
//                 </AnimatePresence>

//                 {/* Empty slot */}
//                 {bucketEntries.length === 0 && (
//                   <div className="flex-1 flex items-center justify-center text-slate-700 text-[10px] font-mono">
//                     ∅
//                   </div>
//                 )}
//               </div>
//             </div>
//           );
//         })}
//       </div>

//       {/* Collision legend */}
//       {buckets.some(b => b.length > 1) && (
//         <div className="flex-shrink-0 text-[9px] font-mono text-slate-600 flex items-center gap-1.5">
//           <span className="text-slate-500">↳</span>
//           collision chain (separate chaining)
//         </div>
//       )}
//     </div>
//   );
// }




import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// data shape:
// {
//   entries: [{ key, value, bucket, isActive, isNew }, ...],
//   bucketCount: number,          // how many buckets to show (default 8)
//   activeKey: string | null,     // key being looked up / inserted right now
// }

const DEFAULT_BUCKETS = 8;

// Simple visual hash — just for display (real hash is done by Python/JS)
function displayHash(key, n) {
  let h = 0;
  const s = String(key);
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % n;
  return h;
}

export default function HashMapEngine({ data }) {
  const entries     = data?.entries     ?? [];
  const bucketCount = data?.bucketCount ?? DEFAULT_BUCKETS;
  const activeKey   = data?.activeKey   ?? null;

  // Group entries by bucket
  const buckets = useMemo(() => {
    const b = Array.from({ length: bucketCount }, () => []);
    for (const entry of entries) {
      const bi = entry.bucket ?? displayHash(entry.key, bucketCount);
      if (bi >= 0 && bi < bucketCount) b[bi].push(entry);
    }
    return b;
  }, [entries, bucketCount]);

  // Active bucket index
  const activeBucket = activeKey != null
    ? (entries.find(e => e.key === activeKey)?.bucket ?? displayHash(activeKey, bucketCount))
    : null;

  if (!entries.length) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-full text-slate-500 gap-2">
        <div className="flex gap-1">
          {[0,1,2,3].map(i => (
            <div key={i} className="w-8 h-14 rounded border border-slate-700 bg-slate-800/50"/>
          ))}
        </div>
        <span className="text-xs font-mono">HashMap is empty</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full h-full overflow-auto p-4 gap-3">

      {/* Header */}
      <div className="flex items-center gap-3 flex-shrink-0">
        <span className="text-[10px] font-mono text-slate-500">
          buckets:&nbsp;<span className="text-indigo-300">{bucketCount}</span>
        </span>
        <span className="text-[10px] font-mono text-slate-500">
          entries:&nbsp;<span className="text-indigo-300">{entries.length}</span>
        </span>
        {activeKey != null && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-[10px] font-mono text-yellow-400 flex items-center gap-1"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse"/>
            lookup: <span className="text-white ml-1">"{activeKey}"</span>
            &nbsp;→ bucket [{activeBucket}]
          </motion.span>
        )}
      </div>

      {/* Active key → bucket arrow (top level) */}
      {activeKey != null && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 text-[10px] font-mono px-3 py-1.5 rounded-lg bg-yellow-400/5 border border-yellow-400/20 flex-shrink-0"
        >
          <span className="text-slate-400">hash(</span>
          <span className="text-yellow-300">"{activeKey}"</span>
          <span className="text-slate-400">)</span>
          <span className="text-slate-500">%{bucketCount}</span>
          <span className="text-slate-400">=</span>
          <span className="text-indigo-300 font-bold">{activeBucket}</span>
        </motion.div>
      )}

      {/* Buckets grid */}
      <div
        className="flex-1 grid gap-2 overflow-auto"
        style={{
          gridTemplateColumns: `repeat(${Math.min(bucketCount, 4)}, minmax(0, 1fr))`,
        }}
      >
        {buckets.map((bucketEntries, bi) => {
          const isActiveBucket = bi === activeBucket;
          return (
            <div
              key={`bucket-${bi}`}
              className={`flex flex-col rounded-xl border transition-all duration-300 overflow-hidden ${
                isActiveBucket
                  ? 'border-yellow-400/50 shadow-[0_0_12px_rgba(250,204,21,0.15)]'
                  : 'border-slate-700/60'
              }`}
            >
              {/* Bucket header */}
              <div
                className={`flex items-center justify-between px-2.5 py-1.5 border-b text-[10px] font-mono ${
                  isActiveBucket
                    ? 'bg-yellow-400/10 border-yellow-400/30 text-yellow-400'
                    : 'bg-slate-800/80 border-slate-700/50 text-slate-500'
                }`}
              >
                <span>[{bi}]</span>
                {bucketEntries.length > 0 && (
                  <span className={isActiveBucket ? 'text-yellow-300' : 'text-slate-600'}>
                    {bucketEntries.length}
                  </span>
                )}
              </div>

              {/* Entries (chain) */}
              <div className="flex flex-col bg-slate-900/40 flex-1 min-h-[56px] p-1.5 gap-1">
                <AnimatePresence mode="popLayout" initial={false}>
                  {bucketEntries.map((entry, ei) => {
                    const isActive = entry.isActive || entry.key === activeKey;
                    const isNew    = entry.isNew;
                    return (
                      <motion.div
                        key={entry.key ?? `entry-${bi}-${ei}`}
                        layout
                        initial={{ opacity: 0, scale: 0.85, y: -8 }}
                        animate={{ opacity: 1,  scale: isActive ? 1.04 : 1, y: 0 }}
                        exit={{    opacity: 0,  scale: 0.85, y: 8 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 24 }}
                        className={`
                          flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-mono
                          border transition-colors duration-200
                          ${isActive
                            ? 'bg-indigo-500/20 border-indigo-400/50 text-indigo-200'
                            : isNew
                              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
                              : 'bg-slate-800/60 border-slate-700/40 text-slate-300'}
                        `}
                      >
                        {/* Collision chain indicator */}
                        {ei > 0 && (
                          <span className="text-slate-600 flex-shrink-0">↳</span>
                        )}
                        <span className={`flex-shrink-0 ${isActive ? 'text-indigo-300' : 'text-slate-400'}`}>
                          {String(entry.key)}
                        </span>
                        <span className="text-slate-600 flex-shrink-0">:</span>
                        <span className={`truncate ${isActive ? 'text-white' : 'text-slate-200'}`}>
                          {String(entry.value)}
                        </span>
                        {isActive && (
                          <span className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-400 flex-shrink-0"/>
                        )}
                        {isNew && !isActive && (
                          <span className="ml-auto text-[8px] text-emerald-400 flex-shrink-0">new</span>
                        )}
                      </motion.div>
                    );
                  })}
                </AnimatePresence>

                {/* Empty slot */}
                {bucketEntries.length === 0 && (
                  <div className="flex-1 flex items-center justify-center text-slate-700 text-[10px] font-mono">
                    ∅
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Collision legend */}
      {buckets.some(b => b.length > 1) && (
        <div className="flex-shrink-0 text-[9px] font-mono text-slate-600 flex items-center gap-1.5">
          <span className="text-slate-500">↳</span>
          collision chain (separate chaining)
        </div>
      )}
    </div>
  );
}