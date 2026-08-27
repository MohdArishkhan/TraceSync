import React, { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useSpring, useTransform, animate } from 'framer-motion';
import * as d3 from 'd3-hierarchy';
import { ReactFlow, Background, Controls, applyNodeChanges, applyEdgeChanges } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import RecursionTreeEngine from './RecursionTreeEngine';
import StackEngine from './StackEngine';
import QueueEngine from './QueueEngine';
import DequeEngine from './DequeEngine';
import DSUEngine from './DSUEngine';
import SegmentTreeEngine from './SegmentTreeEngine';
import NQueensEngine from './NQueensEngine';
import LinkedListEngine from './LinkedListEngine';

// ─────────────────────────────────────────────────────────────
//  DESIGN TOKENS  — everything derives from here
// ─────────────────────────────────────────────────────────────
const T = {
  // Acceptance / rejection palette
  accept: {
    core:   '#00ff9d',
    glow:   'rgba(0,255,157,0.55)',
    dim:    'rgba(0,255,157,0.12)',
    border: 'rgba(0,255,157,0.45)',
    text:   '#00ff9d',
    shadow: '0 0 40px rgba(0,255,157,0.7), 0 0 80px rgba(0,255,157,0.3)',
  },
  reject: {
    core:   '#ff2d55',
    glow:   'rgba(255,45,85,0.55)',
    dim:    'rgba(255,45,85,0.12)',
    border: 'rgba(255,45,85,0.45)',
    text:   '#ff2d55',
    shadow: '0 0 40px rgba(255,45,85,0.7), 0 0 80px rgba(255,45,85,0.3)',
  },
  check: {
    core:   '#ffd60a',
    glow:   'rgba(255,214,10,0.55)',
    dim:    'rgba(255,214,10,0.12)',
    border: 'rgba(255,214,10,0.45)',
    text:   '#ffd60a',
    shadow: '0 0 40px rgba(255,214,10,0.6)',
  },
  active: {
    core:   '#bf5af2',
    glow:   'rgba(191,90,242,0.55)',
    dim:    'rgba(191,90,242,0.12)',
    border: 'rgba(191,90,242,0.45)',
    shadow: '0 0 35px rgba(191,90,242,0.6)',
  },
  // Surface colours
  bg:      '#05060f',
  surface: 'rgba(10,12,28,0.85)',
  panel:   'rgba(14,16,36,0.9)',
  border:  'rgba(255,255,255,0.07)',
  // Text
  textPri: '#e8e8f0',
  textSec: '#6b7280',
  textMut: '#3d4354',
};

// ─────────────────────────────────────────────────────────────
//  GLOBAL CSS — injected once
// ─────────────────────────────────────────────────────────────
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700;800&family=Space+Grotesk:wght@400;700&display=swap');

    :root {
      --accept: ${T.accept.core};
      --reject: ${T.reject.core};
      --check:  ${T.check.core};
      --active: ${T.active.core};
    }

    * { box-sizing: border-box; }

    /* ── Scrollbar ── */
    .poly-scroll::-webkit-scrollbar { width: 4px; height: 4px; }
    .poly-scroll::-webkit-scrollbar-track { background: transparent; }
    .poly-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 99px; }

    /* ── Glitch text keyframes ── */
    @keyframes glitch-accept {
      0%,100% { text-shadow: 0 0 8px var(--accept), 0 0 30px var(--accept); transform: none; }
      10%      { transform: translate(-1px, 1px); text-shadow: -2px 0 var(--active), 2px 0 var(--accept); }
      20%      { transform: translate(1px,-1px);  text-shadow:  2px 0 var(--active),-2px 0 var(--accept); }
      30%,90%  { transform: none; }
    }
    @keyframes glitch-reject {
      0%,100% { text-shadow: 0 0 8px var(--reject), 0 0 30px var(--reject); transform: none; }
      10%      { transform: translate(-1px, 1px); text-shadow: -2px 0 #ff9f0a, 2px 0 var(--reject); }
      20%      { transform: translate(1px,-1px);  text-shadow:  2px 0 #ff9f0a,-2px 0 var(--reject); }
      30%,90%  { transform: none; }
    }
    @keyframes pulse-accept {
      0%,100% { box-shadow: 0 0 20px var(--accept), 0 0 50px rgba(0,255,157,0.3); }
      50%     { box-shadow: 0 0 40px var(--accept), 0 0 100px rgba(0,255,157,0.5), inset 0 0 20px rgba(0,255,157,0.1); }
    }
    @keyframes pulse-reject {
      0%,100% { box-shadow: 0 0 20px var(--reject), 0 0 50px rgba(255,45,85,0.3); }
      50%     { box-shadow: 0 0 40px var(--reject), 0 0 100px rgba(255,45,85,0.5), inset 0 0 20px rgba(255,45,85,0.1); }
    }
    @keyframes shake {
      0%,100%{ transform: translateX(0); }
      10%    { transform: translateX(-6px) rotate(-0.5deg); }
      20%    { transform: translateX(6px)  rotate(0.5deg); }
      30%    { transform: translateX(-4px); }
      40%    { transform: translateX(4px); }
      50%    { transform: translateX(-2px); }
      60%    { transform: translateX(2px); }
    }
    @keyframes accept-flash {
      0%  { opacity:0; transform: scale(0.9); }
      15% { opacity:1; transform: scale(1.04); }
      85% { opacity:1; transform: scale(1); }
      100%{ opacity:0; transform: scale(1.1); }
    }
    @keyframes scanline {
      0%   { transform: translateY(-100%); }
      100% { transform: translateY(100vh); }
    }
    @keyframes grid-appear {
      from { opacity:0; transform: scale(0) rotate(-8deg); }
      to   { opacity:1; transform: scale(1) rotate(0); }
    }
    @keyframes ripple-out {
      0%   { transform: scale(1); opacity: 0.8; }
      100% { transform: scale(3.5); opacity: 0; }
    }
    @keyframes neon-flicker {
      0%,19%,21%,23%,25%,54%,56%,100% { opacity:1; }
      20%,22%,24%,55% { opacity: 0.4; }
    }
    @keyframes float-var {
      0%,100% { transform: translateY(0px); }
      50%     { transform: translateY(-6px); }
    }
    @keyframes particle-drift {
      0%   { transform: translate(0,0) scale(1); opacity:0.8; }
      100% { transform: translate(var(--dx), var(--dy)) scale(0); opacity:0; }
    }

    .glitch-accept { animation: glitch-accept 2s infinite; }
    .glitch-reject { animation: glitch-reject 2s infinite; }
    .pulse-accept  { animation: pulse-accept 1.8s ease-in-out infinite; }
    .pulse-reject  { animation: pulse-reject 1.8s ease-in-out infinite; }
    .shake         { animation: shake 0.5s ease-in-out; }
    .float-var     { animation: float-var 3s ease-in-out infinite; }
    .neon-flicker  { animation: neon-flicker 3s infinite; }

    .mono { font-family: 'JetBrains Mono', monospace; }
    .grotesk { font-family: 'Space Grotesk', sans-serif; }

    /* ── cell transitions ── */
    .cell-base {
      transition: background 0.25s cubic-bezier(.4,0,.2,1),
                  box-shadow 0.25s cubic-bezier(.4,0,.2,1),
                  transform 0.2s cubic-bezier(.4,0,.2,1);
    }
  `}</style>
);

// ─────────────────────────────────────────────────────────────
//  FLOATING PARTICLES — burst on state change
// ─────────────────────────────────────────────────────────────
function ParticleBurst({ color, count = 12, x, y }) {
  const particles = useMemo(() => Array.from({ length: count }, (_, i) => ({
    id: i,
    angle: (i / count) * 360,
    dist: 40 + Math.random() * 60,
    size: 3 + Math.random() * 5,
    delay: Math.random() * 0.1,
  })), [count]);

  return (
    <div className="absolute pointer-events-none" style={{ left: x, top: y, zIndex: 100 }}>
      {particles.map(p => {
        const rad = (p.angle * Math.PI) / 180;
        const dx = Math.cos(rad) * p.dist;
        const dy = Math.sin(rad) * p.dist;
        return (
          <motion.div
            key={p.id}
            initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
            animate={{ x: dx, y: dy, scale: 0, opacity: 0 }}
            transition={{ duration: 0.7 + Math.random() * 0.4, delay: p.delay, ease: 'easeOut' }}
            className="absolute rounded-full"
            style={{ width: p.size, height: p.size, background: color, boxShadow: `0 0 6px ${color}` }}
          />
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  STATUS BADGE — accept / reject / check / visiting
// ─────────────────────────────────────────────────────────────
function StatusBadge({ isBlocked, isPassing, condition, checkRow, checkCol, compact = false }) {
  const [burst, setBurst] = useState(null);
  const prevState = useRef(null);

  useEffect(() => {
    const next = isBlocked ? 'blocked' : isPassing ? 'passing' : condition ? 'checking' : 'idle';
    if (prevState.current !== next && (next === 'blocked' || next === 'passing')) {
      setBurst({ color: next === 'passing' ? T.accept.core : T.reject.core, id: Date.now() });
      setTimeout(() => setBurst(null), 900);
    }
    prevState.current = next;
  }, [isBlocked, isPassing, condition]);

  const size = compact ? 'px-2.5 py-1 text-[10px]' : 'px-5 py-2 text-sm';

  return (
    <AnimatePresence mode="wait">
      {isBlocked && (
        <motion.div
          key="blocked"
          initial={{ scale: 0.7, opacity: 0, x: 20 }}
          animate={{ scale: 1, opacity: 1, x: 0 }}
          exit={{ scale: 0.7, opacity: 0, x: 20 }}
          transition={{ type: 'spring', stiffness: 500, damping: 28 }}
          className={`relative flex items-center gap-2.5 ${size} rounded-2xl mono font-extrabold overflow-hidden select-none`}
          style={{
            background: T.reject.dim,
            border: `1.5px solid ${T.reject.border}`,
            color: T.reject.text,
            boxShadow: T.reject.shadow,
          }}
        >
          {/* Animated scanline */}
          <motion.div
            animate={{ y: ['-100%','100%'] }}
            transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
            className="absolute inset-x-0 h-6 pointer-events-none"
            style={{ background: 'linear-gradient(transparent,rgba(255,45,85,0.15),transparent)' }}
          />
          <motion.span
            animate={{ rotate: [0, 90, 180, 270, 360] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
            className="text-xl leading-none"
          >✖</motion.span>
          <span className="glitch-reject relative z-10 tracking-widest uppercase">{condition?.text || 'REJECTED'}</span>
          {burst && <ParticleBurst color={T.reject.core} x="50%" y="50%" />}
        </motion.div>
      )}
      {isPassing && (
        <motion.div
          key="passing"
          initial={{ scale: 0.7, opacity: 0, x: 20 }}
          animate={{ scale: 1, opacity: 1, x: 0 }}
          exit={{ scale: 0.7, opacity: 0, x: 20 }}
          transition={{ type: 'spring', stiffness: 500, damping: 28 }}
          className={`relative flex items-center gap-2.5 ${size} rounded-2xl mono font-extrabold overflow-hidden select-none`}
          style={{
            background: T.accept.dim,
            border: `1.5px solid ${T.accept.border}`,
            color: T.accept.text,
            boxShadow: T.accept.shadow,
          }}
        >
          <motion.div
            animate={{ y: ['-100%','100%'] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
            className="absolute inset-x-0 h-6 pointer-events-none"
            style={{ background: 'linear-gradient(transparent,rgba(0,255,157,0.12),transparent)' }}
          />
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.4, 1] }}
            transition={{ duration: 0.4, type: 'spring' }}
            className="text-xl leading-none"
          >✔</motion.span>
          <span className="glitch-accept relative z-10 tracking-widest uppercase">{condition?.text || 'ACCEPTED'}</span>
          {burst && <ParticleBurst color={T.accept.core} x="50%" y="50%" />}
        </motion.div>
      )}
      {!isBlocked && !isPassing && condition && (
        <motion.div
          key="checking"
          initial={{ scale: 0.7, opacity: 0, x: 20 }}
          animate={{ scale: 1, opacity: 1, x: 0 }}
          exit={{ scale: 0.7, opacity: 0, x: 20 }}
          transition={{ type: 'spring', stiffness: 500, damping: 28 }}
          className={`flex items-center gap-2.5 ${size} rounded-2xl mono font-extrabold select-none`}
          style={{
            background: T.check.dim,
            border: `1.5px solid ${T.check.border}`,
            color: T.check.text,
            boxShadow: T.check.shadow,
          }}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
            className="w-4 h-4 rounded-full border-2"
            style={{ borderColor: `${T.check.core} transparent transparent` }}
          />
          <span className="tracking-widest uppercase">{condition.text}</span>
        </motion.div>
      )}
      {!isBlocked && !isPassing && !condition && checkRow !== null && checkCol !== null && (
        <motion.div
          key="visiting"
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 10 }}
          className={`flex items-center gap-2 ${size} rounded-2xl mono font-bold select-none`}
          style={{
            background: T.active.dim,
            border: `1.5px solid ${T.active.border}`,
            color: T.active.core,
            boxShadow: T.active.shadow,
          }}
        >
          <motion.span
            animate={{ opacity: [1, 0, 1] }}
            transition={{ repeat: Infinity, duration: 1 }}
          >◉</motion.span>
          <span className="uppercase tracking-widest">Visiting ({checkRow},{checkCol})</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─────────────────────────────────────────────────────────────
//  FLOATING VARIABLES HUD
// ─────────────────────────────────────────────────────────────
const FloatingVariables = ({ variables }) => {
  if (!variables || variables.length === 0) return null;
  return (
    <div className="absolute top-4 left-4 z-40 flex flex-wrap gap-3 max-w-[78%] pointer-events-none">
      <AnimatePresence>
        {variables.map((v, i) => (
          <motion.div
            key={v.name}
            layout
            initial={{ opacity: 0, y: -16, scale: 0.75 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.75, filter: 'blur(6px)' }}
            transition={{ type: 'spring', stiffness: 420, damping: 28, delay: i * 0.04 }}
            className="float-var relative flex items-center gap-2 px-3 py-1.5 rounded-xl overflow-hidden"
            style={{
              background: T.panel,
              border: `1px solid ${T.border}`,
              backdropFilter: 'blur(20px)',
              boxShadow: '0 4px 24px rgba(0,0,0,0.5)',
            }}
          >
            {/* shimmer strip */}
            <motion.div
              animate={{ x: ['-100%','200%'] }}
              transition={{ repeat: Infinity, duration: 2.8, delay: i * 0.3, ease: 'easeInOut' }}
              className="absolute inset-0 w-1/3 skew-x-12"
              style={{ background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.04),transparent)' }}
            />
            <span className="mono text-[11px] font-bold tracking-wide relative z-10" style={{ color: '#bf5af2' }}>
              {v.name}
            </span>
            <span className="text-[10px] relative z-10" style={{ color: T.textMut }}>=</span>
            <motion.span
              key={String(v.value ?? v.role)}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 25 }}
              className="mono text-[12px] font-black relative z-10"
              style={{ color: '#00d4ff', textShadow: '0 0 10px rgba(0,212,255,0.6)' }}
            >
              {String(v.value ?? v.role)}
            </motion.span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
//  LEGEND DOT
// ─────────────────────────────────────────────────────────────
const LegendDot = ({ color, label, glow }) => (
  <div className="flex items-center gap-2">
    <div className="w-2.5 h-2.5 rounded-full" style={{ background: color, boxShadow: `0 0 8px ${glow}` }} />
    <span className="mono text-[10px] font-bold uppercase tracking-widest" style={{ color: T.textSec }}>{label}</span>
  </div>
);

// ─────────────────────────────────────────────────────────────
//  GRID ENGINE — arrays, heaps, hash maps, sets
// ─────────────────────────────────────────────────────────────
function GridEngine({ data, compact = false }) {
  const rawData = data?.matrix || data?.array || [];
  const activeIndices = data?.activeIndices || [];
  const isMatrix = rawData.length > 0 && Array.isArray(rawData[0]);
  const display = (val) => val?.value !== undefined ? val.value : val;

  const cellSize = compact ? 36 : 60;
  const fontSize = compact ? 12 : 18;

  return (
    <div className={`flex flex-col items-center justify-center w-full h-full overflow-auto poly-scroll ${compact ? 'p-2 gap-2' : 'p-6 gap-6'}`}>
      {isMatrix ? (
        <div
          className="flex flex-col items-center gap-1 p-5 rounded-3xl"
          style={{ background: T.panel, border: `1px solid ${T.border}`, backdropFilter: 'blur(24px)', boxShadow: '0 20px 60px rgba(0,0,0,0.6)' }}
        >
          {/* col headers */}
          <div className="flex gap-1 mb-1" style={{ marginLeft: cellSize * 0.65 }}>
            {rawData[0].map((_, cIdx) => (
              <div key={cIdx} style={{ width: cellSize, fontSize: 10, color: T.textMut }} className="text-center mono font-bold">
                {cIdx}
              </div>
            ))}
          </div>
          {rawData.map((row, rIdx) => (
            <div key={rIdx} className="flex items-center gap-1">
              <div style={{ width: cellSize * 0.55, fontSize: 10, color: T.textMut }} className="text-right mono font-bold mr-1">{rIdx}</div>
              <AnimatePresence>
                {row.map((val, cIdx) => {
                  const isActive = activeIndices.includes(`${rIdx},${cIdx}`);
                  const dVal = display(val);
                  return (
                    <motion.div
                      layout key={`${rIdx}-${cIdx}`}
                      initial={{ scale: 0.7, opacity: 0 }}
                      animate={{ scale: isActive ? 1.18 : 1, opacity: 1, y: isActive ? -6 : 0 }}
                      transition={{ type: 'spring', stiffness: 380, damping: 22 }}
                      className="relative flex items-center justify-center font-black mono rounded-xl cell-base"
                      style={{
                        width: cellSize, height: cellSize, fontSize,
                        background: isActive ? `radial-gradient(circle, ${T.active.core}, #5e3a9e)` : 'rgba(20,24,48,0.9)',
                        border: `1.5px solid ${isActive ? T.active.border : T.border}`,
                        boxShadow: isActive ? T.active.shadow : 'none',
                        color: isActive ? '#fff' : T.textSec,
                      }}
                    >
                      {isActive && (
                        <motion.div
                          animate={{ scale: [1, 2.2], opacity: [0.6, 0] }}
                          transition={{ repeat: Infinity, duration: 1.2 }}
                          className="absolute inset-0 rounded-xl"
                          style={{ border: `2px solid ${T.active.core}` }}
                        />
                      )}
                      {dVal === '.' ? <span style={{ opacity: 0.18 }}>·</span> : String(dVal)}
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          ))}
        </div>
      ) : (
        <div
          className="flex flex-col items-center gap-3 p-6 rounded-3xl"
          style={{ background: T.panel, border: `1px solid ${T.border}`, backdropFilter: 'blur(24px)', boxShadow: '0 20px 60px rgba(0,0,0,0.6)' }}
        >
          {/* pointer row */}
          <div className="flex gap-3 justify-center" style={{ height: 28 }}>
            {rawData.map((_, idx) => (
              <div key={`ptr-${idx}`} style={{ width: cellSize }} className="flex items-end justify-center">
                {(activeIndices.includes(idx) || activeIndices.includes(String(idx))) && (
                  <motion.div
                    animate={{ y: [0, -9, 0] }}
                    transition={{ repeat: Infinity, duration: 1.4 }}
                    style={{ color: T.active.core, fontSize: 18, filter: `drop-shadow(0 0 8px ${T.active.core})` }}
                  >▼</motion.div>
                )}
              </div>
            ))}
          </div>
          {/* cells */}
          <div className="flex flex-wrap gap-2.5 justify-center">
            <AnimatePresence>
              {rawData.map((val, idx) => {
                const isActive = activeIndices.includes(idx) || activeIndices.includes(String(idx));
                const dVal = display(val);
                return (
                  <motion.div
                    layout
                    key={val?.id || `item-${idx}`}
                    initial={{ scale: 0.4, opacity: 0, rotateX: -90 }}
                    animate={{ scale: isActive ? 1.18 : 1, opacity: 1, rotateX: 0, y: isActive ? -8 : 0 }}
                    transition={{ type: 'spring', stiffness: 380, damping: 24 }}
                    className="relative flex items-center justify-center font-black mono rounded-xl cell-base"
                    style={{
                      width: cellSize, height: cellSize, fontSize,
                      background: isActive
                        ? `radial-gradient(circle at 40% 40%, ${T.accept.core}, #007a4d)`
                        : 'rgba(20,24,48,0.9)',
                      border: `1.5px solid ${isActive ? T.accept.border : T.border}`,
                      boxShadow: isActive ? T.accept.shadow : 'none',
                      color: isActive ? '#fff' : T.textSec,
                    }}
                  >
                    {isActive && (
                      <motion.div
                        animate={{ scale: [1, 2.4], opacity: [0.5, 0] }}
                        transition={{ repeat: Infinity, duration: 1.1 }}
                        className="absolute inset-0 rounded-xl"
                        style={{ border: `2px solid ${T.accept.core}` }}
                      />
                    )}
                    {String(dVal)}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
          {/* index row */}
          <div className="flex gap-2.5 justify-center">
            {rawData.map((_, idx) => (
              <div key={idx} style={{ width: cellSize, fontSize: 10, color: T.textMut }} className="text-center mono font-bold">{idx}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  SMART GRID ENGINE — matrix with condition state
// ─────────────────────────────────────────────────────────────
function SmartGridEngine({ data, compact = false }) {
  const matrix = data?.matrix || [];
  const activeIndices = data?.activeIndices || [];
  const checkRow = data?.checkRow ?? null;
  const checkCol = data?.checkCol ?? null;
  const condition = data?.condition ?? null;
  const display = (val) => (val?.value !== undefined ? val.value : val);

  const rows = matrix.length;
  const cols = rows > 0 ? matrix[0].length : 0;

  const isGuard   = condition?.isGuard ?? false;
  const isBlocked = !!condition && condition.result !== null && ((isGuard && condition.result === true) || (!isGuard && condition.result === false));
  const isPassing = !!condition && condition.result !== null && ((isGuard && condition.result === false) || (!isGuard && condition.result === true));
  const hasCheckCell = checkRow !== null && checkCol !== null && checkRow < rows && checkCol < cols;

  const cellSize = compact ? 32 : (cols <= 6 ? 62 : cols <= 10 ? 50 : cols <= 16 ? 38 : 30);

  if (rows === 0) {
    return (
      <div className="flex items-center justify-center w-full h-full mono text-sm uppercase tracking-widest" style={{ color: T.textSec }}>
        Waiting for grid data…
      </div>
    );
  }

  const getCellStyle = (rIdx, cIdx) => {
    const isChanged   = activeIndices.includes(`${rIdx},${cIdx}`);
    const isCheckCell = rIdx === checkRow && cIdx === checkCol;
    const isLight     = (rIdx + cIdx) % 2 === 0;

    if (isCheckCell && isBlocked)  return { bg: `radial-gradient(circle at 40% 30%,#ff2d55,#8b001e)`, text: '#fff', shadow: `inset 0 0 20px rgba(255,45,85,0.8), ${T.reject.shadow}`, state: 'blocked' };
    if (isCheckCell && isPassing)  return { bg: `radial-gradient(circle at 40% 30%,#00ff9d,#006b3f)`, text: '#001a0b', shadow: `inset 0 0 20px rgba(0,255,157,0.8), ${T.accept.shadow}`, state: 'passing' };
    if (isCheckCell)               return { bg: `radial-gradient(circle at 40% 30%,#ffd60a,#7a5e00)`, text: '#1a1200', shadow: T.check.shadow, state: 'checking' };
    if (isChanged)                 return { bg: `radial-gradient(circle at 40% 30%,${T.active.core},#4a1a7a)`, text: '#fff', shadow: T.active.shadow, state: 'active' };
    return { bg: isLight ? 'rgba(28,32,60,0.9)' : 'rgba(16,18,38,0.9)', text: T.textSec, shadow: 'none', state: 'idle' };
  };

  return (
    <div className="flex flex-col w-full h-full overflow-hidden select-none" style={{ background: 'transparent' }}>
      {/* ── TOP HUD ── */}
      {!compact && (
        <div className="flex items-center justify-between px-5 pt-4 pb-3 flex-shrink-0 gap-4">
          <div className="flex items-center gap-2.5">
            <span
              className="px-3 py-1.5 rounded-lg mono text-[11px] font-bold uppercase tracking-widest"
              style={{ background: T.active.dim, border: `1px solid ${T.active.border}`, color: T.active.core }}
            >
              Grid {rows}×{cols}
            </span>
            <span
              className="px-3 py-1.5 rounded-lg mono text-[11px] font-bold uppercase tracking-widest"
              style={{ background: T.surface, border: `1px solid ${T.border}`, color: T.textSec }}
            >
              {data?.name ?? ''}
            </span>
          </div>
          <StatusBadge isBlocked={isBlocked} isPassing={isPassing} condition={condition} checkRow={checkRow} checkCol={checkCol} />
        </div>
      )}

      {/* ── GRID CANVAS ── */}
      <div className={`flex-1 flex items-center justify-center overflow-auto poly-scroll ${compact ? 'p-2' : 'p-5'}`}>
        <div
          className="flex flex-col items-start p-5 rounded-3xl"
          style={{
            background: T.panel,
            border: `1px solid ${isBlocked ? T.reject.border : isPassing ? T.accept.border : T.border}`,
            backdropFilter: 'blur(28px)',
            boxShadow: isBlocked ? T.reject.shadow : isPassing ? T.accept.shadow : '0 20px 60px rgba(0,0,0,0.6)',
            transition: 'border-color 0.35s, box-shadow 0.35s',
          }}
        >
          {/* col headers */}
          {!compact && (
            <div className="flex mb-1.5" style={{ marginLeft: cellSize * 0.65 }}>
              {Array.from({ length: cols }, (_, c) => (
                <div key={c} style={{ width: cellSize, fontSize: 10, color: T.textMut }} className="text-center mono font-black">{c}</div>
              ))}
            </div>
          )}

          <div className="flex">
            {/* row headers */}
            {!compact && (
              <div className="flex flex-col mr-1.5" style={{ width: cellSize * 0.55 }}>
                {Array.from({ length: rows }, (_, r) => (
                  <div key={r} style={{ height: cellSize, fontSize: 10, color: T.textMut }} className="flex items-center justify-center mono font-black">{r}</div>
                ))}
              </div>
            )}

            {/* the cells */}
            <div
              className="relative rounded-xl overflow-hidden"
              style={{
                width: cellSize * cols,
                height: cellSize * rows,
                border: `1px solid ${T.border}`,
              }}
            >
              {matrix.map((row, rIdx) =>
                row.map((val, cIdx) => {
                  const { bg, text, shadow, state } = getCellStyle(rIdx, cIdx);
                  const dVal = display(val);
                  const isCheckCell = rIdx === checkRow && cIdx === checkCol;

                  return (
                    <div
                      key={`${rIdx}-${cIdx}`}
                      className="absolute flex items-center justify-center font-black mono cell-base"
                      style={{
                        left: cIdx * cellSize, top: rIdx * cellSize,
                        width: cellSize, height: cellSize,
                        background: bg, color: text,
                        boxShadow: shadow,
                        outline: `1px solid ${T.border}`,
                        fontSize: compact ? 11 : 15,
                        zIndex: isCheckCell ? 10 : 1,
                      }}
                    >
                      {/* Cell-specific animated overlays */}
                      {isCheckCell && state === 'checking' && (
                        <motion.div
                          animate={{ scale: [1, 1.8], opacity: [0.8, 0] }}
                          transition={{ repeat: Infinity, duration: 0.9 }}
                          className="absolute inset-0"
                          style={{ border: `2px solid ${T.check.core}`, borderRadius: 2 }}
                        />
                      )}
                      {isCheckCell && state === 'passing' && (
                        <motion.div
                          initial={{ scale: 0.6, opacity: 0.9 }}
                          animate={{ scale: 1.6, opacity: 0 }}
                          transition={{ duration: 0.55, ease: 'easeOut' }}
                          className="absolute inset-0"
                          style={{ background: T.accept.core, borderRadius: 2 }}
                        />
                      )}
                      {isCheckCell && state === 'blocked' && (
                        <motion.div
                          animate={{ x: [-3, 3, -3, 3, 0] }}
                          transition={{ duration: 0.35, ease: 'easeInOut' }}
                          className="absolute inset-0"
                          style={{ background: 'rgba(255,45,85,0.18)', borderRadius: 2 }}
                        />
                      )}
                      <span className="relative z-10" style={{ opacity: (dVal === '.' || dVal === 0 || dVal === '0') ? 0.15 : 1 }}>
                        {String(dVal)}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── BOTTOM STATUS BAR ── */}
      {!compact && (
        <div
          className="flex-shrink-0 flex items-center justify-between px-5 py-3"
          style={{
            borderTop: `1px solid ${T.border}`,
            background: T.panel,
            backdropFilter: 'blur(20px)',
          }}
        >
          <div className="flex items-center gap-5">
            <LegendDot color={T.check.core}  label="Checking" glow={T.check.glow}  />
            <LegendDot color={T.reject.core} label="Blocked"  glow={T.reject.glow} />
            <LegendDot color={T.accept.core} label="Passes"   glow={T.accept.glow} />
            <LegendDot color={T.active.core} label="Updated"  glow={T.active.glow} />
          </div>
          <motion.div
            key={isBlocked ? 'b' : isPassing ? 'p' : condition ? 'c' : 'v'}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mono text-xs font-extrabold uppercase tracking-widest"
            style={{
              color: isBlocked ? T.reject.text : isPassing ? T.accept.text : condition ? T.check.text : T.textSec,
              textShadow: isBlocked ? `0 0 12px ${T.reject.core}` : isPassing ? `0 0 12px ${T.accept.core}` : 'none',
            }}
          >
            {isBlocked ? `${condition.text} ➔ BLOCKED (Backtracking)`
             : isPassing ? `${condition.text} ➔ PASSED (Continuing)`
             : condition ? `Evaluating: ${condition.text}`
             : hasCheckCell ? `Visiting (${checkRow}, ${checkCol})`
             : 'Scanning matrix…'}
          </motion.div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  SVG TREE ENGINE
// ─────────────────────────────────────────────────────────────
function SVGEngine({ data }) {
  const { nodes, links } = useMemo(() => {
    if (!data?.tree) return { nodes: [], links: [] };
    try {
      const root = d3.hierarchy(data.tree);
      const layout = d3.tree().nodeSize([88, 110]);
      layout(root);
      return { nodes: root.descendants(), links: root.links() };
    } catch {
      return { nodes: [], links: [] };
    }
  }, [data]);

  if (!nodes.length) {
    return (
      <div className="flex items-center justify-center w-full h-full mono text-sm uppercase tracking-widest" style={{ color: T.textSec }}>
        Waiting for tree data…
      </div>
    );
  }

  const PAD = 90;
  const minX = Math.min(...nodes.map((n) => n.x)) - PAD;
  const maxX = Math.max(...nodes.map((n) => n.x)) + PAD;
  const minY = Math.min(...nodes.map((n) => n.y)) - PAD;
  const maxY = Math.max(...nodes.map((n) => n.y)) + PAD;

  return (
    <div className="w-full h-full flex items-center justify-center overflow-hidden p-4 relative">
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: `radial-gradient(circle, ${T.active.dim}, transparent 70%)` }}
      />
      <svg
        width="100%" height="100%"
        viewBox={`${minX} ${minY} ${maxX - minX} ${maxY - minY}`}
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <filter id="tree-glow" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <linearGradient id="link-grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={T.active.core} stopOpacity="0.5" />
            <stop offset="100%" stopColor={T.textMut} stopOpacity="0.2" />
          </linearGradient>
        </defs>
        <g>
          {links.map((lnk, i) => {
            const mx = (lnk.source.x + lnk.target.x) / 2;
            const my = (lnk.source.y + lnk.target.y) / 2;
            return (
              <motion.path
                key={`lnk-${i}`}
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 0.6, ease: 'easeInOut' }}
                d={`M${lnk.source.x},${lnk.source.y + 28} C${lnk.source.x},${my} ${lnk.target.x},${my} ${lnk.target.x},${lnk.target.y - 28}`}
                stroke="url(#link-grad)"
                strokeWidth="2.5"
                fill="none"
                strokeLinecap="round"
              />
            );
          })}
          {nodes.map((node, i) => {
            const isActive = data.activeNodes?.includes(node.data.name ?? node.data.val) || data.activeNodes?.includes(String(node.data.id));
            return (
              <motion.g
                key={`nd-${node.data.id ?? i}`}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1, x: node.x, y: node.y }}
                transition={{ type: 'spring', stiffness: 220, damping: 22, delay: i * 0.03 }}
              >
                {isActive && (
                  <>
                    <motion.circle
                      r="38" fill="none" stroke={T.accept.core} strokeWidth="2"
                      animate={{ r: [38, 55], opacity: [0.7, 0] }}
                      transition={{ repeat: Infinity, duration: 1.3 }}
                    />
                    <circle r="30" fill={T.accept.dim} stroke={T.accept.core} strokeWidth="3" filter="url(#tree-glow)" />
                  </>
                )}
                {!isActive && (
                  <circle r="28" fill="rgba(20,24,48,0.95)" stroke={T.border} strokeWidth="2" />
                )}
                <text
                  dy="5" textAnchor="middle"
                  fill={isActive ? T.accept.core : T.textPri}
                  fontSize="14" fontWeight="900"
                  fontFamily="'JetBrains Mono', monospace"
                  style={{ pointerEvents: 'none', userSelect: 'none', textShadow: isActive ? `0 0 10px ${T.accept.core}` : 'none' }}
                >
                  {node.data.name ?? node.data.val}
                </text>
              </motion.g>
            );
          })}
        </g>
      </svg>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  PHYSICS / GRAPH ENGINE
// ─────────────────────────────────────────────────────────────
function PhysicsEngine({ data }) {
  const [rfNodes, setRfNodes] = useState([]);
  const [rfEdges, setRfEdges] = useState([]);

  useEffect(() => {
    if (!data?.nodes?.length) return;
    setRfNodes(data.nodes.map((n, idx) => ({
      id: n.id,
      position: n.position ?? { x: 100 + (idx % 5) * 170, y: 100 + Math.floor(idx / 5) * 150 },
      data: { label: n.label ?? n.val },
      style: {
        background: n.isActive
          ? `radial-gradient(circle, ${T.accept.core}, #006040)`
          : T.surface,
        color: n.isActive ? '#001a0b' : T.textPri,
        border: `2px solid ${n.isActive ? T.accept.core : T.border}`,
        borderRadius: '14px',
        padding: '12px 22px',
        fontSize: '15px',
        fontWeight: '900',
        fontFamily: "'JetBrains Mono', monospace",
        boxShadow: n.isActive ? T.accept.shadow : '0 8px 32px rgba(0,0,0,0.4)',
        backdropFilter: 'blur(12px)',
        minWidth: '60px',
        textAlign: 'center',
      },
    })));
    setRfEdges((data.edges ?? []).map((e) => ({
      id: e.id ?? `e-${e.source}-${e.target}`,
      source: e.source, target: e.target,
      animated: e.isActive,
      style: {
        stroke: e.isActive ? T.accept.core : 'rgba(255,255,255,0.15)',
        strokeWidth: e.isActive ? 3.5 : 1.5,
        filter: e.isActive ? `drop-shadow(0 0 8px ${T.accept.core})` : 'none',
      },
      markerEnd: { type: 'arrowclosed', color: e.isActive ? T.accept.core : 'rgba(255,255,255,0.15)' },
    })));
  }, [data]);

  return (
    <div className="w-full h-full relative" style={{ background: `radial-gradient(ellipse at center, rgba(0,255,157,0.03), ${T.bg})`, minHeight: 150 }}>
      <ReactFlow
        nodes={rfNodes} edges={rfEdges}
        onNodesChange={(c) => setRfNodes((p) => applyNodeChanges(c, p))}
        onEdgesChange={(c) => setRfEdges((p) => applyEdgeChanges(c, p))}
        fitView fitViewOptions={{ padding: 0.4 }}
      >
        <Background color="rgba(255,255,255,0.04)" gap={30} size={1.5} variant="dots" />
        <Controls
          showInteractive={false}
          className="rounded-lg overflow-hidden"
          style={{ background: T.panel, border: `1px solid ${T.border}` }}
        />
      </ReactFlow>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  ENGINE RENDERER — routes by type
// ─────────────────────────────────────────────────────────────
const EngineRenderer = ({ structure, compact = false }) => {
  const type = (structure.type ?? '').toUpperCase().trim();
  switch (type) {
    case 'N_QUEENS':      return <NQueensEngine data={structure.data} />;
    case 'SEGMENT_TREE':  return <SegmentTreeEngine data={structure.data} />;
    case 'DSU':           return <DSUEngine data={structure.data} />;
    case 'RECURSION_TREE':return <RecursionTreeEngine data={structure.data} />;
    case 'TREE':          return <SVGEngine data={structure.data} />;
    case 'LINKED_LIST':   return <LinkedListEngine data={structure.data} />;
    case 'GRAPH':         return <PhysicsEngine data={structure.data} />;
    case 'STACK':         return <StackEngine data={structure.data} />;
    case 'QUEUE':         return <QueueEngine data={structure.data} />;
    case 'DEQUE':         return <DequeEngine data={structure.data} />;
    case 'HEAP':
    case 'HASH_MAP':
    case 'SET':           return <GridEngine data={structure.data} compact={compact} />;
    case 'MATRIX':        return <SmartGridEngine data={{ ...structure.data, name: structure.name }} compact={compact} />;
    case 'ARRAY':         return <GridEngine data={structure.data} compact={compact} />;
    default:
      return (
        <div className="flex flex-col items-center justify-center w-full h-full gap-3" style={{ background: T.surface }}>
          <motion.span
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="mono text-sm px-4 py-2 rounded-lg"
            style={{ background: T.reject.dim, color: T.reject.text, border: `1px solid ${T.reject.border}` }}
          >
            Unknown engine: <strong>{structure.type}</strong>
          </motion.span>
          <span className="mono text-xs uppercase tracking-widest" style={{ color: T.textSec }}>
            Add case in EngineRenderer
          </span>
        </div>
      );
  }
};

// ─────────────────────────────────────────────────────────────
//  RANK SORTER
// ─────────────────────────────────────────────────────────────
const getRank = (type, targetAiType) => {
  if (type === targetAiType)    return 100;
  if (type === 'N_QUEENS')      return 6;
  if (type === 'MATRIX')        return 5.5;
  if (type === 'LINKED_LIST')   return 5;
  if (type === 'DSU')           return 4.5;
  if (type === 'SEGMENT_TREE')  return 4.5;
  if (type === 'GRAPH')         return 4;
  if (type === 'DEQUE')         return 3.7;
  if (type === 'STACK' || type === 'QUEUE') return 3.5;
  if (type === 'TREE')          return 3;
  if (type === 'RECURSION_TREE')return 2;
  return 1;
};

// ─────────────────────────────────────────────────────────────
//  ANIMATED TYPE BADGE
// ─────────────────────────────────────────────────────────────
function TypeBadge({ type, name }) {
  return (
    <div className="flex items-center gap-2">
      <motion.span
        initial={{ opacity: 0, x: 12 }}
        animate={{ opacity: 1, x: 0 }}
        className="px-3 py-1.5 rounded-lg mono text-xs font-bold uppercase tracking-widest"
        style={{
          background: T.panel,
          border: `1px solid ${T.border}`,
          color: T.textSec,
          backdropFilter: 'blur(14px)',
        }}
      >
        {type}
      </motion.span>
      <motion.span
        initial={{ opacity: 0, x: 12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.05 }}
        className="px-3 py-1.5 rounded-lg mono text-xs font-black uppercase tracking-widest neon-flicker"
        style={{
          background: T.active.dim,
          border: `1px solid ${T.active.border}`,
          color: T.active.core,
          backdropFilter: 'blur(14px)',
          boxShadow: `0 0 16px ${T.active.glow}`,
        }}
      >
        {name}
      </motion.span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  MAIN EXPORT — PolymorphicRouter
// ─────────────────────────────────────────────────────────────
export default function PolymorphicRouter({ currentFrame, aiFallbackEngine, aiVariables }) {
  // ── LOADING STATE ──────────────────────────────────────────
  if (!currentFrame || !currentFrame.structures) {
    return (
      <>
        <GlobalStyles />
        <div
          className="flex flex-col items-center justify-center w-full h-full relative overflow-hidden"
          style={{ background: T.bg }}
        >
          {/* Ambient radial */}
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: `radial-gradient(ellipse at center, ${T.active.dim}, transparent 65%)` }}
          />
          {/* Scanline */}
          <motion.div
            animate={{ y: ['0vh','100vh'] }}
            transition={{ repeat: Infinity, duration: 3, ease: 'linear' }}
            className="absolute inset-x-0 h-12 pointer-events-none"
            style={{ background: 'linear-gradient(transparent,rgba(191,90,242,0.06),transparent)' }}
          />
          {/* Spinner */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
            className="w-14 h-14 rounded-full mb-6"
            style={{
              border: `3px solid ${T.border}`,
              borderTopColor: T.active.core,
              boxShadow: `0 0 20px ${T.active.glow}`,
            }}
          />
          <motion.p
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ repeat: Infinity, duration: 1.8 }}
            className="mono text-sm font-extrabold uppercase tracking-[0.25em]"
            style={{ color: T.active.core, textShadow: `0 0 16px ${T.active.glow}` }}
          >
            Tracing Execution…
          </motion.p>
        </div>
      </>
    );
  }

  const structures = currentFrame.structures;

  // ── AI FALLBACK ────────────────────────────────────────────
  if (structures.length === 0 && aiFallbackEngine) {
    const mockData = {
      id: 'ai-primed-view', type: aiFallbackEngine, name: 'AI Extracted Layout',
      array: [], activeIndices: [], frontIndex: 0, rearIndex: 0, variables: aiVariables || [],
    };
    return (
      <>
        <GlobalStyles />
        <div
          className="relative w-full h-full flex flex-col overflow-hidden gap-5 p-5"
          style={{ background: T.bg }}
        >
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: `radial-gradient(ellipse at top, ${T.active.dim}, transparent 60%)` }}
          />
          <FloatingVariables variables={aiVariables} />
          <div className="w-full h-full flex flex-col items-center justify-center relative z-10">
            <motion.div
              initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
              className="mb-5 px-5 py-2 rounded-2xl mono text-xs font-black uppercase tracking-widest"
              style={{
                background: T.active.dim,
                border: `1.5px solid ${T.active.border}`,
                color: T.active.core,
                boxShadow: T.active.shadow,
                backdropFilter: 'blur(16px)',
              }}
            >
              AI Primed: {aiFallbackEngine}
            </motion.div>
            <div
              className="relative flex-1 w-full rounded-3xl overflow-hidden"
              style={{
                background: T.panel,
                border: `1px solid ${T.border}`,
                backdropFilter: 'blur(28px)',
                boxShadow: '0 30px 80px rgba(0,0,0,0.7)',
              }}
            >
              <div className="absolute inset-0 pointer-events-none"
                style={{ background: `radial-gradient(ellipse at top left, ${T.active.dim}, transparent 50%)` }}
              />
              <EngineRenderer structure={{ type: aiFallbackEngine, data: mockData }} compact={false} />
            </div>
          </div>
        </div>
      </>
    );
  }

  // ── EMPTY FRAME ────────────────────────────────────────────
  if (structures.length === 0) {
    return (
      <>
        <GlobalStyles />
        <div className="relative w-full h-full flex items-center justify-center" style={{ background: T.bg }}>
          <FloatingVariables variables={currentFrame.variables} />
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            className="px-6 py-3.5 rounded-2xl mono text-sm tracking-wide"
            style={{
              background: T.panel,
              border: `1px solid ${T.border}`,
              backdropFilter: 'blur(20px)',
              color: T.textSec,
              boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
            }}
          >
            No complex data structures active in scope.
          </motion.div>
        </div>
      </>
    );
  }

  // ── NORMAL RENDER ──────────────────────────────────────────
  const sortedStructs = [...structures].sort(
    (a, b) => getRank(b.type, currentFrame.aiType) - getRank(a.type, currentFrame.aiType)
  );
  const primary = sortedStructs[0];

  const FULL_CANVAS_TYPES = new Set(['N_QUEENS']);
  const OWN_HUD_TYPES     = new Set(['N_QUEENS', 'MATRIX', 'DSU']);
  const auxiliary = FULL_CANVAS_TYPES.has(primary.type)
    ? []
    : sortedStructs.slice(1).filter(
        (s) => s.type !== 'RECURSION_TREE' || primary.type === 'RECURSION_TREE'
      );

  return (
    <>
      <GlobalStyles />
      <div
        className="relative w-full h-full flex flex-col overflow-hidden"
        style={{ background: T.bg }}
      >
        {/* Global ambient glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: `radial-gradient(ellipse at top, rgba(191,90,242,0.04), transparent 55%)` }}
        />

        <FloatingVariables variables={currentFrame.variables} />

        {/* ── PRIMARY PANEL ── */}
        <div className="flex-1 relative min-h-[300px]">
          {!OWN_HUD_TYPES.has(primary.type) && (
            <div className="absolute top-4 right-4 z-20 flex flex-col items-end gap-2.5 pointer-events-none">
              <TypeBadge type={primary.type} name={primary.name} />
            </div>
          )}
          <EngineRenderer structure={primary} compact={false} />
        </div>

        {/* ── AUXILIARY STRIP ── */}
        <AnimatePresence>
          {auxiliary.length > 0 && (
            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', stiffness: 320, damping: 32 }}
              className="poly-scroll flex gap-4 overflow-x-auto flex-shrink-0 p-4"
              style={{
                height: 'min(38%, 320px)',
                minHeight: 240,
                borderTop: `1px solid ${T.border}`,
                background: T.panel,
                backdropFilter: 'blur(28px)',
                boxShadow: `0 -24px 60px rgba(0,0,0,0.5)`,
              }}
            >
              {auxiliary.map((struct, i) => (
                <motion.div
                  key={struct.id}
                  initial={{ opacity: 0, y: 20, scale: 0.94 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ type: 'spring', stiffness: 340, damping: 28, delay: i * 0.06 }}
                  className="relative flex flex-col rounded-2xl overflow-hidden flex-1 group"
                  style={{
                    minWidth: 290,
                    maxWidth: 440,
                    background: T.surface,
                    border: `1px solid ${T.border}`,
                    boxShadow: '0 8px 40px rgba(0,0,0,0.4)',
                  }}
                >
                  {/* hover shimmer */}
                  <div
                    className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-400"
                    style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.03), transparent)' }}
                  />
                  {/* header */}
                  <div
                    className="flex justify-between items-center px-4 py-2.5"
                    style={{ borderBottom: `1px solid ${T.border}`, background: T.panel, backdropFilter: 'blur(16px)' }}
                  >
                    <span className="mono text-[10px] font-bold uppercase tracking-widest" style={{ color: T.textSec }}>
                      {struct.type}
                    </span>
                    <motion.span
                      animate={{ opacity: [0.7, 1, 0.7] }}
                      transition={{ repeat: Infinity, duration: 2.5 }}
                      className="mono text-xs font-black"
                      style={{ color: T.accept.core, textShadow: `0 0 8px ${T.accept.glow}` }}
                    >
                      {struct.name}
                    </motion.span>
                  </div>
                  {/* engine */}
                  <div className="flex-1 relative overflow-hidden">
                    <EngineRenderer structure={struct} compact={true} />
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
