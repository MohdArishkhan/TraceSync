import React from 'react';
import { motion } from 'framer-motion';

// NQueensEngine - Visualizes N-Queens problem on a chessboard
// data shape: {
//   board: [[0,1,0,0], [0,0,0,1], ...], // 2D array where 1 = queen placed
//   n: 4,
//   queens: [{row, col}],
//   activeCell: {row, col},
//   conflicts: [{row, col}],
//   narration: "..."
// }

export default function NQueensEngine({ data }) {
  const board = data?.board ?? [];
  const n = data?.n ?? board.length;
  const queens = data?.queens ?? [];
  const activeCell = data?.activeCell ?? null;
  const conflicts = data?.conflicts ?? [];
  const narration = data?.narration ?? null;

  if (!n || n === 0) {
    return (
      <div className="flex items-center justify-center w-full h-full text-slate-500 text-sm font-mono">
        Waiting for N-Queens data…
      </div>
    );
  }

  const conflictSet = new Set(conflicts.map(c => `${c.row}-${c.col}`));
  // The tracer stores each row as the queen's column (`-1` means empty),
  // while standalone callers may provide a conventional 2D board.
  const boardQueens = board.flatMap((row, rowIndex) => {
    if (typeof row === 'number') {
      return row >= 0 ? [{ row: rowIndex, col: row }] : [];
    }

    if (!Array.isArray(row)) return [];

    return row.flatMap((cell, colIndex) => (
      cell === 1 || cell === 'Q' ? [{ row: rowIndex, col: colIndex }] : []
    ));
  });
  const actualQueens = queens.length > 0 ? queens : boardQueens;
  const queenSet = new Set(actualQueens.map(q => `${q.row}-${q.col}`));

  const cellSize = Math.max(50, Math.min(80, 600 / n));
  const boardSize = cellSize * n;

  return (
    <div className="flex flex-col w-full h-full overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 flex items-center justify-between px-4 py-2 border-b border-slate-700/30 bg-slate-950/50">
        <span className="px-2.5 py-0.5 rounded-md bg-yellow-500/10 border border-yellow-500/25 text-[10px] font-mono text-yellow-400 tracking-widest uppercase">
          {n}-Queens · {actualQueens.length} placed
        </span>
        {data?.statusText && (
          <span className="text-[11px] font-mono text-amber-300">{data.statusText}</span>
        )}
      </div>

      {/* Chessboard */}
      <div className="flex-1 flex items-center justify-center overflow-auto p-4">
        <div className="flex flex-col gap-0.5">
          {/* Column labels */}
          <div className="flex gap-0.5 ml-8 mb-1">
            {Array.from({ length: n }).map((_, col) => (
              <div
                key={col}
                style={{ width: `${cellSize}px` }}
                className="flex items-center justify-center text-[9px] font-mono text-slate-500"
              >
                {col}
              </div>
            ))}
          </div>

          {/* Board rows */}
          {Array.from({ length: n }).map((_, row) => (
            <div key={row} className="flex gap-0.5">
              {/* Row label */}
              <div
                style={{ width: '28px' }}
                className="flex items-center justify-center text-[9px] font-mono text-slate-500 mr-1"
              >
                {row}
              </div>

              {/* Cells */}
              {Array.from({ length: n }).map((_, col) => {
                const cellKey = `${row}-${col}`;
                const hasQueen = queenSet.has(cellKey);
                const isActive = activeCell && activeCell.row === row && activeCell.col === col;
                const hasConflict = conflictSet.has(cellKey);
                const isLight = (row + col) % 2 === 0;

                return (
                  <motion.div
                    key={col}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: (row * n + col) * 0.01, duration: 0.2 }}
                    style={{
                      width: `${cellSize}px`,
                      height: `${cellSize}px`,
                    }}
                    className={`relative flex items-center justify-center border transition-all ${
                      hasConflict
                        ? 'bg-red-900/40 border-red-500/50'
                        : isActive
                        ? 'bg-yellow-900/50 border-yellow-500'
                        : isLight
                        ? 'bg-slate-700/30 border-slate-700/40'
                        : 'bg-slate-800/50 border-slate-800/60'
                    }`}
                  >
                    {hasQueen && (
                      <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                        className="relative"
                      >
                        {/* Queen Symbol */}
                        <svg
                          width={cellSize * 0.6}
                          height={cellSize * 0.6}
                          viewBox="0 0 24 24"
                          fill="none"
                          className={hasConflict ? 'text-red-400' : 'text-yellow-300'}
                        >
                          <path
                            d="M12 2L14 8L18 6L16 12L21 12L17 16L19 22H5L7 16L3 12L8 12L6 6L10 8L12 2Z"
                            fill="currentColor"
                            stroke="currentColor"
                            strokeWidth="1"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>

                        {/* Active pulse */}
                        {isActive && (
                          <motion.div
                            animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                            className="absolute inset-0 rounded-full bg-yellow-400/30"
                          />
                        )}
                      </motion.div>
                    )}

                    {/* Conflict indicator */}
                    {hasConflict && !hasQueen && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Stats Footer */}
      <div className="flex-shrink-0 flex items-center gap-4 px-4 py-2 border-t border-slate-700/25 bg-slate-950/40">
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded bg-yellow-900/50 border border-yellow-500 flex items-center justify-center">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" className="text-yellow-300">
              <path
                d="M12 2L14 8L18 6L16 12L21 12L17 16L19 22H5L7 16L3 12L8 12L6 6L10 8L12 2Z"
                fill="currentColor"
              />
            </svg>
          </div>
          <span className="text-[9px] font-mono text-slate-500">Queen placed</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded bg-red-900/40 border border-red-500/50" />
          <span className="text-[9px] font-mono text-slate-500">Conflict</span>
        </div>
        <div className="text-[9px] font-mono text-slate-600">
          Solutions found: {data?.solutionCount ?? '?'}
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
