import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ────────────────────────────────────────────────────────────────
//  QUEEN CROWN SVG ICON
// ────────────────────────────────────────────────────────────────
const QueenIcon = ({ size = 28, color = '#e0e7ff', glow = false }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    style={{ filter: glow ? `drop-shadow(0 0 7px ${color})` : 'none', flexShrink: 0 }}
  >
    <path d="M3 17h18l-2-9-4 5-3-8-3 8-4-5-2 9z" fill={color} opacity={0.95} />
    <rect x="3" y="17" width="18" height="2.5" rx="1" fill={color} opacity={0.7} />
    <circle cx="3"  cy="8" r="1.6" fill={color} />
    <circle cx="12" cy="4" r="1.6" fill={color} />
    <circle cx="21" cy="8" r="1.6" fill={color} />
  </svg>
);

// ────────────────────────────────────────────────────────────────
//  CONFLICT DETECTION
//  board[row] = col of placed queen (-1 = empty)
//  Check if placing at (checkRow, checkCol) conflicts with any queen
// ────────────────────────────────────────────────────────────────
const getConflicts = (board, checkRow, checkCol) => {
  const conflicts = [];
  if (checkRow === null || checkCol === null) return conflicts;
  for (let row = 0; row < board.length; row++) {
    const col = board[row];
    if (col < 0 || row === checkRow) continue;
    if (col === checkCol || Math.abs(row - checkRow) === Math.abs(col - checkCol)) {
      conflicts.push({ fromRow: row, fromCol: col });
    }
  }
  return conflicts;
};

// ────────────────────────────────────────────────────────────────
//  PARSE DATA
//  Accepts { board: int[], n, checkRow, checkCol, placedCount, statusText }
//  board[row] = col index of queen, or -1 if empty
// ────────────────────────────────────────────────────────────────
const parseData = (data) => {
  const empty = { board: [], n: 0, checkRow: null, checkCol: null, placedCount: 0, statusText: '' };
  if (!data) return empty;
  const board = data.board ?? [];
  const n = data.n || board.length;
  if (!n) return empty;
  return {
    board,
    n,
    checkRow: data.checkRow ?? null,
    checkCol: data.checkCol ?? null,
    placedCount: data.placedCount ?? board.filter(v => v >= 0).length,
    statusText: data.statusText ?? '',
  };
};

// ────────────────────────────────────────────────────────────────
//  MAIN ENGINE
// ────────────────────────────────────────────────────────────────
export default function NQueensEngine({ data }) {
  const { board, n, checkRow, checkCol, placedCount, statusText } = useMemo(() => parseData(data), [data]);

  const conflicts = useMemo(() => getConflicts(board, checkRow, checkCol), [board, checkRow, checkCol]);
  const hasConflict = conflicts.length > 0;
  const isSolved = n > 0 && placedCount === n;

  // Responsive cell size
  const cellSize = n <= 4 ? 74 : n <= 6 ? 60 : n <= 8 ? 50 : 42;
  const boardPx = cellSize * n;

  // Build set of cells on attack paths (for shading between queen and conflict cell)
  const attackPathCells = useMemo(() => {
    const set = new Set();
    if (!hasConflict || checkRow === null || checkCol === null) return set;
    conflicts.forEach(({ fromRow, fromCol }) => {
      const dr = Math.sign(checkRow - fromRow);
      const dc = Math.sign(checkCol - fromCol);
      let r = fromRow + dr, c = fromCol + dc;
      while (!(r === checkRow && c === checkCol)) {
        set.add(`${r},${c}`);
        r += dr; c += dc;
      }
    });
    return set;
  }, [conflicts, checkRow, checkCol, hasConflict]);

  if (!n) {
    return (
      <div className="flex items-center justify-center w-full h-full text-slate-500 text-sm font-mono tracking-widest uppercase">
        Waiting for N-Queens data…
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full h-full overflow-hidden select-none bg-transparent">

      {/* ── TOP HUD ── */}
      <div className="flex items-center justify-between px-5 pt-4 pb-2 flex-shrink-0 gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="px-2.5 py-1 rounded-md bg-indigo-500/10 border border-indigo-500/30 text-[10px] font-mono text-indigo-400 uppercase tracking-widest shadow-sm">
            {n}-Queens
          </span>
          <span className="px-2.5 py-1 rounded-md bg-slate-800/60 border border-slate-700/60 text-[10px] font-mono text-slate-400 uppercase tracking-widest">
            Placed&nbsp;<span className="text-white font-bold">{placedCount}</span>&nbsp;/&nbsp;{n}
          </span>
        </div>

        <AnimatePresence mode="wait">
          {isSolved ? (
            <motion.span key="solved"
              initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
              className="px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-[11px] font-bold text-emerald-400 tracking-wide whitespace-nowrap">
              ✓ Solution Found!
            </motion.span>
          ) : hasConflict ? (
            <motion.span key="conflict"
              initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
              className="px-3 py-1 rounded-full bg-red-500/15 border border-red-500/40 text-[11px] font-bold text-red-400 tracking-wide whitespace-nowrap">
              ✗ Conflict — Backtracking
            </motion.span>
          ) : checkRow !== null && checkCol !== null ? (
            <motion.span key="checking"
              initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
              className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-[11px] font-semibold text-amber-400 tracking-wide whitespace-nowrap">
              Checking ({checkRow}, {checkCol})
            </motion.span>
          ) : null}
        </AnimatePresence>
      </div>

      {/* ── BOARD + LABELS ── */}
      <div className="flex-1 flex items-center justify-center p-3 overflow-hidden relative">
        <div className="flex flex-col items-start">

          {/* Column headers */}
          <div className="flex" style={{ marginLeft: cellSize * 0.65 + 'px' }}>
            {Array.from({ length: n }, (_, c) => (
              <div key={c} style={{ width: cellSize }}
                className="text-center text-[10px] font-mono text-slate-500 leading-none mb-1">
                {c}
              </div>
            ))}
          </div>

          <div className="flex">
            {/* Row labels */}
            <div className="flex flex-col" style={{ width: cellSize * 0.6 + 'px' }}>
              {Array.from({ length: n }, (_, r) => (
                <div key={r} style={{ height: cellSize }}
                  className="flex items-center justify-center text-[10px] font-mono text-slate-500">
                  {r}
                </div>
              ))}
            </div>

            {/* ── THE BOARD ── */}
            <div
              className="relative rounded-xl overflow-hidden shadow-2xl"
              style={{
                width: boardPx,
                height: boardPx,
                border: isSolved
                  ? '2px solid rgba(52,211,153,0.5)'
                  : hasConflict
                  ? '2px solid rgba(239,68,68,0.4)'
                  : '2px solid rgba(71,85,105,0.5)',
                boxShadow: isSolved
                  ? '0 0 30px rgba(52,211,153,0.2)'
                  : hasConflict
                  ? '0 0 30px rgba(239,68,68,0.15)'
                  : undefined,
                transition: 'border-color 0.3s, box-shadow 0.3s',
              }}
            >
              {/* SVG conflict lines overlay */}
              {hasConflict && checkRow !== null && checkCol !== null && (
                <svg
                  className="absolute inset-0 pointer-events-none z-30"
                  width={boardPx} height={boardPx}
                  viewBox={`0 0 ${boardPx} ${boardPx}`}
                >
                  <defs>
                    <filter id="glow-red">
                      <feGaussianBlur stdDeviation="2" result="blur" />
                      <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                  </defs>
                  {conflicts.map(({ fromRow, fromCol }, i) => (
                    <line
                      key={i}
                      x1={fromCol  * cellSize + cellSize / 2}
                      y1={fromRow  * cellSize + cellSize / 2}
                      x2={checkCol * cellSize + cellSize / 2}
                      y2={checkRow * cellSize + cellSize / 2}
                      stroke="#ef4444"
                      strokeWidth="2.5"
                      strokeDasharray="7 4"
                      strokeLinecap="round"
                      opacity="0.9"
                      filter="url(#glow-red)"
                    />
                  ))}
                </svg>
              )}

              {/* CELLS */}
              {Array.from({ length: n }, (_, row) =>
                Array.from({ length: n }, (_, col) => {
                  const isLight = (row + col) % 2 === 0;
                  const queenHere = board[row] === col;
                  const isCheckCell = row === checkRow && col === checkCol;
                  const isConflictSrc = conflicts.some(c => c.fromRow === row && c.fromCol === col);
                  const isOnPath = attackPathCells.has(`${row},${col}`);
                  const isCheckRow = row === checkRow;

                  // --- Background color logic ---
                  let bg;
                  if (isCheckCell && hasConflict) {
                    bg = '#7f1d1d'; // deep red — blocked cell
                  } else if (isConflictSrc) {
                    bg = isLight ? '#7f1d1d' : '#991b1b';
                  } else if (isOnPath && hasConflict) {
                    bg = isLight ? 'rgba(127,29,29,0.25)' : 'rgba(127,29,29,0.4)';
                  } else if (isCheckCell && !hasConflict) {
                    bg = 'rgba(251,191,36,0.35)'; // amber highlight
                  } else if (isCheckRow && !hasConflict) {
                    bg = isLight ? 'rgba(79,70,229,0.18)' : 'rgba(79,70,229,0.28)';
                  } else if (queenHere && isSolved) {
                    bg = isLight ? 'rgba(6,95,70,0.5)' : 'rgba(6,78,59,0.65)';
                  } else {
                    bg = isLight ? '#334155' : '#1e293b';
                  }

                  return (
                    <div
                      key={`${row}-${col}`}
                      className="absolute flex items-center justify-center"
                      style={{
                        left: col * cellSize,
                        top: row * cellSize,
                        width: cellSize,
                        height: cellSize,
                        background: bg,
                        transition: 'background 0.22s ease',
                        outline: '1px solid rgba(51,65,85,0.5)',
                      }}
                    >
                      {/* Conflict source border ring */}
                      {isConflictSrc && (
                        <div className="absolute inset-0 border-2 border-red-400/70 pointer-events-none z-20" />
                      )}
                      {/* Checked cell border ring */}
                      {isCheckCell && (
                        <div className={`absolute inset-0 border-2 pointer-events-none z-20 ${hasConflict ? 'border-red-300' : 'border-amber-400'}`} />
                      )}

                      {/* Queen piece */}
                      <AnimatePresence>
                        {queenHere && (
                          <motion.div
                            key={`q-${row}-${col}`}
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0, transition: { duration: 0.15 } }}
                            transition={{ type: 'spring', stiffness: 380, damping: 22 }}
                            className="relative z-10"
                          >
                            <QueenIcon
                              size={Math.round(cellSize * 0.62)}
                              color={
                                isConflictSrc ? '#fca5a5'
                                : isSolved     ? '#6ee7b7'
                                :                '#c7d2fe'
                              }
                              glow={isConflictSrc || isSolved}
                            />
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Pulsing dot for "being tested" empty cell */}
                      {isCheckCell && !queenHere && !hasConflict && (
                        <motion.div
                          animate={{ scale: [0.5, 1.1, 0.5], opacity: [0.5, 1, 0.5] }}
                          transition={{ repeat: Infinity, duration: 1.4 }}
                          className="w-2.5 h-2.5 rounded-full bg-amber-400"
                        />
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── BOTTOM STATUS BAR ── */}
      <div className="flex-shrink-0 flex items-center justify-between px-5 py-2.5 border-t border-slate-700/40 bg-slate-900/20">
        {/* Legend */}
        <div className="flex items-center gap-4 flex-wrap">
          <LegendItem color="#c7d2fe" label="Queen" isIcon />
          <LegendItem color="rgba(127,29,29,0.8)" label="Conflict" />
          <LegendItem dashed label="Attack line" />
          {checkRow !== null && !hasConflict && (
            <LegendItem color="rgba(79,70,229,0.4)" label="Active row" />
          )}
        </div>
        {/* Status text */}
        <div className="font-mono text-[11px] italic max-w-[200px] truncate"
          style={{ color: hasConflict ? '#fca5a5' : isSolved ? '#6ee7b7' : '#94a3b8' }}>
          {statusText
            ? statusText
            : isSolved
            ? `All ${n} queens placed ✓`
            : hasConflict
            ? `Row ${checkRow}, Col ${checkCol} — blocked`
            : checkRow !== null
            ? `Checking (${checkRow}, ${checkCol ?? '—'})…`
            : 'Initializing…'}
        </div>
      </div>
    </div>
  );
}

const LegendItem = ({ color, label, isIcon, dashed }) => (
  <div className="flex items-center gap-1.5">
    {dashed ? (
      <div className="w-7 h-px" style={{ borderTop: '2px dashed rgba(239,68,68,0.75)' }} />
    ) : isIcon ? (
      <QueenIcon size={13} color={color} />
    ) : (
      <div className="w-3 h-3 rounded-sm border border-slate-600/40" style={{ background: color }} />
    )}
    <span className="text-[10px] font-mono text-slate-500">{label}</span>
  </div>
);