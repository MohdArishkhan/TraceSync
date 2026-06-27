import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const stripMetadata = (arr) => {
  if (!Array.isArray(arr)) return arr;
  const startIdx =
    typeof arr[0] === 'string' &&
    ['LIST', 'TUPLE', 'SET', 'DICT'].includes(arr[0])
      ? 1
      : 0;
  return arr.slice(startIdx).map(item =>
    Array.isArray(item) ? stripMetadata(item) : item
  );
};

const display = (val) => (val?.value !== undefined ? val.value : val);

const LDot = ({ color, label }) => (
  <div className="flex items-center gap-1.5">
    <div className="w-2.5 h-2.5 rounded-sm border" style={{ background: color, borderColor: color }} />
    <span className="text-[9px] font-mono text-slate-500">{label}</span>
  </div>
);

export default function GridEngine({ frameData, compact = false }) {
  const rawData      = frameData?.matrix || frameData?.array || [];
  const activeIndices = frameData?.activeIndices || [];
  const cleanData    = stripMetadata(rawData);
  const isMatrix     = cleanData.length > 0 && Array.isArray(cleanData[0]);

  const checkRow  = frameData?.checkRow  ?? null;
  const checkCol  = frameData?.checkCol  ?? null;
  const condition = frameData?.condition ?? null;

  const isGuard = condition?.isGuard ?? false;
  const isBlocked = !!condition && condition.result !== null && ((isGuard && condition.result === true) || (!isGuard && condition.result === false));
  const isPassing = !!condition && condition.result !== null && ((isGuard && condition.result === false) || (!isGuard && condition.result === true));
  const hasCheck  = checkRow !== null && checkCol !== null;

  const rows = isMatrix ? cleanData.length : 0;
  const cols = isMatrix && rows > 0 ? cleanData[0].length : 0;
  const cellPx = compact
    ? 28
    : cols <= 5  ? 52
    : cols <= 8  ? 44
    : cols <= 12 ? 36
    : cols <= 16 ? 28
    : 22;

  const labelW  = compact ? 14 : 20;
  const fontSize = compact ? 10 : cellPx <= 28 ? 10 : cellPx <= 36 ? 11 : 13;

  const getCellBg = (rIdx, cIdx, dVal) => {
    const isCheck   = rIdx === checkRow && cIdx === checkCol;
    const isChanged = activeIndices.includes(`${rIdx},${cIdx}`);
    const isLight   = (rIdx + cIdx) % 2 === 0;

    if (isCheck && isBlocked)  return '#7f1d1d';
    if (isCheck && isPassing)  return 'rgba(16,185,129,0.38)';
    if (isCheck)               return 'rgba(251,191,36,0.32)';
    if (isChanged)             return isLight ? 'rgba(99,102,241,0.40)' : 'rgba(99,102,241,0.55)';
    return isLight ? '#334155' : '#1e293b';
  };

  const checkBorder = isBlocked
    ? 'border-red-300'
    : isPassing
    ? 'border-emerald-300'
    : 'border-amber-400';

  const conditionBadge = isBlocked
    ? { cls: 'bg-red-500/15 border-red-500/40 text-red-400',      label: `✗ ${condition?.text}` }
    : isPassing
    ? { cls: 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400', label: `✓ ${condition?.text}` }
    : condition
    ? { cls: 'bg-amber-500/10 border-amber-500/30 text-amber-400', label: `Checking: ${condition?.text}` }
    : hasCheck
    ? { cls: 'bg-amber-500/10 border-amber-500/30 text-amber-400', label: `Visiting (${checkRow}, ${checkCol})` }
    : null;

  const statusText = isBlocked
    ? `${condition.text} — blocked`
    : isPassing
    ? `${condition.text} — passes`
    : condition
    ? `Evaluating: ${condition.text}`
    : hasCheck
    ? `Visiting (${checkRow}, ${checkCol})…`
    : '';

  const statusColor = isBlocked
    ? '#fca5a5'
    : isPassing
    ? '#6ee7b7'
    : '#94a3b8';

  return (
    <div className="flex flex-col w-full h-full overflow-hidden select-none bg-transparent">
      {!compact && (
        <div className="flex items-center justify-between px-4 pt-3 pb-2 flex-shrink-0 gap-3">
          <div className="flex items-center gap-2">
            {isMatrix && (
              <span className="px-2.5 py-0.5 rounded-md bg-indigo-500/10 border border-indigo-500/30 text-[10px] font-mono text-indigo-400 uppercase tracking-widest">
                {rows}×{cols}
              </span>
            )}
          </div>

          <AnimatePresence mode="wait">
            {conditionBadge && (
              <motion.span
                key={conditionBadge.label}
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className={`px-3 py-1 rounded-full border text-[11px] font-bold tracking-wide whitespace-nowrap max-w-[60%] truncate ${conditionBadge.cls}`}
              >
                {conditionBadge.label}
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      )}

      <div className={`flex-1 flex items-center justify-center overflow-auto ${compact ? 'p-1' : 'p-4'}`}>
        {isMatrix ? (
          <div className="flex flex-col items-start">
            {!compact && (
              <div className="flex" style={{ marginLeft: labelW + 'px' }}>
                {cleanData[0].map((_, c) => (
                  <div key={c} style={{ width: cellPx, fontSize: 10 }} className="text-center font-mono text-slate-500 leading-none mb-1">
                    {c}
                  </div>
                ))}
              </div>
            )}
            <div className="flex">
              {!compact && (
                <div className="flex flex-col" style={{ width: labelW }}>
                  {cleanData.map((_, r) => (
                    <div key={r} style={{ height: cellPx, fontSize: 10 }} className="flex items-center justify-center font-mono text-slate-500">
                      {r}
                    </div>
                  ))}
                </div>
              )}
              <div className="relative" style={{ width: cellPx * cols, height: cellPx * rows }}>
                {cleanData.map((row, rIdx) =>
                  row.map((val, cIdx) => {
                    const dVal       = display(val);
                    const isCheck    = rIdx === checkRow && cIdx === checkCol;
                    const isChanged  = activeIndices.includes(`${rIdx},${cIdx}`);
                    const isWall     = dVal === 0 || dVal === '0' || dVal === '.';

                    return (
                      <motion.div
                        key={val?.id || `${rIdx}-${cIdx}`}
                        className="absolute flex items-center justify-center font-bold"
                        style={{
                          left:       cIdx * cellPx,
                          top:        rIdx * cellPx,
                          width:      cellPx,
                          height:     cellPx,
                          background: getCellBg(rIdx, cIdx, dVal),
                          outline:    '1px solid rgba(51,65,85,0.5)',
                          fontSize,
                          color:      isCheck ? '#fff' : '#cbd5e1',
                        }}
                        animate={{ background: getCellBg(rIdx, cIdx, dVal) }}
                        transition={{ duration: 0.22 }}
                      >
                        {isCheck && (
                          <div className={`absolute inset-0 border-2 pointer-events-none z-20 ${checkBorder}`} />
                        )}
                        <span className={isWall && !isCheck && !isChanged ? 'opacity-25' : ''}>
                          {dVal === '.' ? '.' : String(dVal)}
                        </span>
                        {isCheck && !isBlocked && (
                          <motion.div
                            animate={{ scale: [0.5, 1.1, 0.5], opacity: [0.4, 0.9, 0.4] }}
                            transition={{ repeat: Infinity, duration: 1.3 }}
                            className="absolute bottom-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-amber-300"
                          />
                        )}
                      </motion.div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2 justify-center">
            {cleanData.map((val, idx) => {
              const isActive  = activeIndices.includes(idx);
              const dVal      = display(val);
              return (
                <motion.div
                  key={val?.id || idx}
                  layout
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                  className={`flex items-center justify-center w-14 h-14 rounded-lg text-xl font-bold border-2 shadow-md overflow-hidden ${
                    isActive
                      ? 'bg-indigo-500 text-white border-indigo-300 shadow-[0_0_12px_rgba(99,102,241,0.6)] scale-110 z-10'
                      : 'bg-slate-800 text-slate-200 border-slate-600'
                  }`}
                >
                  <span className="truncate w-full text-center px-1">{dVal}</span>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {isMatrix && !compact && (
        <div className="flex-shrink-0 flex items-center justify-between px-4 py-2 border-t border-slate-700/40 bg-slate-900/20">
          <div className="flex items-center gap-4 flex-wrap">
            <LDot color="rgba(251,191,36,0.6)"  label="Checking" />
            <LDot color="rgba(127,29,29,0.85)"  label="Blocked" />
            <LDot color="rgba(16,185,129,0.5)"  label="Passes" />
            <LDot color="rgba(99,102,241,0.5)"  label="Changed" />
          </div>
          {statusText && (
            <span className="font-mono text-[11px] italic max-w-[50%] truncate" style={{ color: statusColor }}>
              {statusText}
            </span>
          )}
        </div>
      )}
    </div>
  );
}