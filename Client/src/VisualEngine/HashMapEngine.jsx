import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// HashMapEngine - Visualizes Hash Maps / Hash Tables / Dictionaries
// data shape: { entries: [{key, value, hash}], activeKeys: [...], narration: "..." }

export default function HashMapEngine({ data }) {
  const entries = data?.entries ?? data?.array ?? [];
  const activeKeys = data?.activeKeys ?? data?.activeIndices ?? [];
  const narration = data?.narration ?? null;

  if (!entries.length) {
    return (
      <div className="flex items-center justify-center w-full h-full text-slate-500 text-sm font-mono">
        Waiting for hash map data…
      </div>
    );
  }

  const activeSet = new Set(activeKeys.map(String));

  // Convert array format to key-value pairs if needed
  const normalizedEntries = entries.map((item, idx) => {
    if (typeof item === 'object' && item !== null && 'key' in item) {
      return item;
    }
    // If it's a simple array, treat index as key
    return { key: idx, value: item?.value ?? item, hash: idx % 7 };
  });

  // Group by hash buckets for visual organization
  const maxBuckets = Math.min(8, Math.max(4, Math.ceil(normalizedEntries.length / 3)));
  const buckets = Array.from({ length: maxBuckets }, () => []);

  normalizedEntries.forEach((entry, idx) => {
    const bucketIdx = entry.hash !== undefined ? entry.hash % maxBuckets : idx % maxBuckets;
    buckets[bucketIdx].push({ ...entry, originalIndex: idx });
  });

  return (
    <div className="flex flex-col w-full h-full overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 flex items-center justify-between px-4 py-2 border-b border-slate-700/30 bg-slate-950/50">
        <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/25 text-[10px] font-mono text-emerald-400 tracking-widest uppercase">
          Hash Map · {normalizedEntries.length} entries
        </span>
        {data?.statusText && (
          <span className="text-[11px] font-mono text-amber-300">{data.statusText}</span>
        )}
      </div>

      {/* Bucket Visualization */}
      <div className="flex-1 overflow-auto p-4">
        <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
          {buckets.map((bucket, bucketIdx) => (
            <motion.div
              key={bucketIdx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: bucketIdx * 0.05 }}
              className="flex flex-col"
            >
              {/* Bucket Header */}
              <div className="flex items-center justify-between px-3 py-1.5 bg-slate-800/50 border border-slate-700/50 rounded-t-lg">
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
                  Bucket {bucketIdx}
                </span>
                <span className="text-[9px] font-mono text-slate-600">
                  {bucket.length} item{bucket.length !== 1 ? 's' : ''}
                </span>
              </div>

              {/* Bucket Entries */}
              <div className="flex flex-col gap-1.5 p-2 bg-slate-900/30 border-x border-b border-slate-700/50 rounded-b-lg min-h-[80px]">
                <AnimatePresence mode="popLayout">
                  {bucket.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-[9px] font-mono text-slate-600 italic">
                      empty
                    </div>
                  ) : (
                    bucket.map((entry) => {
                      const isActive = activeSet.has(String(entry.key)) || activeSet.has(String(entry.originalIndex));
                      return (
                        <motion.div
                          key={entry.key}
                          layout
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{
                            opacity: 1,
                            scale: isActive ? 1.02 : 1,
                            background: isActive ? '#065f46' : '#1e293b',
                            borderColor: isActive ? '#10b981' : '#334155'
                          }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          transition={{ duration: 0.2 }}
                          className="flex items-center justify-between px-2.5 py-2 rounded-md border"
                          style={{
                            boxShadow: isActive ? '0 0 12px rgba(16, 185, 129, 0.3)' : 'none'
                          }}
                        >
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <span className="text-[11px] font-mono font-bold text-cyan-400 truncate">
                              {String(entry.key)}
                            </span>
                            <span className="text-[10px] text-slate-600">→</span>
                            <span className="text-[11px] font-mono font-semibold text-emerald-300 truncate">
                              {String(entry.value)}
                            </span>
                          </div>
                          {entry.hash !== undefined && (
                            <span className="text-[8px] font-mono text-slate-600 ml-2 flex-shrink-0">
                              #{entry.hash}
                            </span>
                          )}
                        </motion.div>
                      );
                    })
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Stats Footer */}
      <div className="flex-shrink-0 flex items-center gap-4 px-4 py-2 border-t border-slate-700/25 bg-slate-950/40">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-emerald-900/50 border border-emerald-500" />
          <span className="text-[9px] font-mono text-slate-500">Active entry</span>
        </div>
        <div className="text-[9px] font-mono text-slate-600">
          Load factor: {(normalizedEntries.length / maxBuckets).toFixed(2)}
        </div>
      </div>

      {/* Narration */}
      {narration && (
        <div className="flex-shrink-0 flex items-start gap-2.5 px-5 py-2 border-t border-amber-500/15 bg-amber-500/5">
          <span className="text-amber-500/60 text-sm mt-0.5 flex-shrink-0">✎</span>
          <span className="text-[12.5px] font-medium text-amber-200/90 leading-snug">{narration}</span>
        </div>
      )}
    </div>
  );
}
