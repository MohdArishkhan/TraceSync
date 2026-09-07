import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Enhanced Visual Polish Components
 * Professional micro-interactions and visual enhancements
 */

/**
 * Particle System for celebrations or highlights
 */
export const ParticleEffect = ({ trigger, count = 20, color = '#6366f1' }) => {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    if (trigger) {
      const newParticles = Array.from({ length: count }, (_, i) => ({
        id: `particle-${Date.now()}-${i}`,
        angle: (Math.PI * 2 * i) / count,
        velocity: 2 + Math.random() * 3,
        size: 4 + Math.random() * 4
      }));
      setParticles(newParticles);

      const timer = setTimeout(() => setParticles([]), 2000);
      return () => clearTimeout(timer);
    }
  }, [trigger, count]);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <AnimatePresence>
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute rounded-full"
            style={{
              width: particle.size,
              height: particle.size,
              backgroundColor: color,
              left: '50%',
              top: '50%',
              boxShadow: `0 0 ${particle.size * 2}px ${color}`
            }}
            initial={{ scale: 0, x: 0, y: 0, opacity: 1 }}
            animate={{
              scale: [0, 1, 0],
              x: Math.cos(particle.angle) * particle.velocity * 100,
              y: Math.sin(particle.angle) * particle.velocity * 100,
              opacity: [1, 1, 0]
            }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
            exit={{ opacity: 0 }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

/**
 * Ripple effect for interactive elements
 */
export const RippleEffect = ({ x, y, color = 'rgba(99, 102, 241, 0.3)' }) => {
  return (
    <motion.span
      className="absolute rounded-full pointer-events-none"
      style={{
        left: x,
        top: y,
        width: 0,
        height: 0,
        backgroundColor: color
      }}
      initial={{ width: 0, height: 0, opacity: 1 }}
      animate={{
        width: 200,
        height: 200,
        opacity: 0,
        x: -100,
        y: -100
      }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    />
  );
};

/**
 * Glow pulse effect for active elements
 */
export const GlowPulse = ({ color = '#6366f1', intensity = 0.5, children }) => {
  return (
    <motion.div
      animate={{
        boxShadow: [
          `0 0 8px ${color}${Math.floor(intensity * 128).toString(16)}`,
          `0 0 20px ${color}${Math.floor(intensity * 255).toString(16)}`,
          `0 0 8px ${color}${Math.floor(intensity * 128).toString(16)}`
        ]
      }}
      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
    >
      {children}
    </motion.div>
  );
};

/**
 * Morphing background gradient
 */
export const AnimatedGradient = ({ colors = ['#6366f1', '#8b5cf6', '#ec4899'] }) => {
  return (
    <motion.div
      className="absolute inset-0 pointer-events-none"
      animate={{
        background: [
          `radial-gradient(circle at 0% 0%, ${colors[0]}, transparent 50%)`,
          `radial-gradient(circle at 100% 0%, ${colors[1]}, transparent 50%)`,
          `radial-gradient(circle at 100% 100%, ${colors[2]}, transparent 50%)`,
          `radial-gradient(circle at 0% 100%, ${colors[0]}, transparent 50%)`,
          `radial-gradient(circle at 0% 0%, ${colors[0]}, transparent 50%)`
        ]
      }}
      transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
    />
  );
};

/**
 * Tooltip with smooth appearance
 */
export const SmoothTooltip = ({ content, children, position = 'top' }) => {
  const [isVisible, setIsVisible] = useState(false);

  const positions = {
    top: { bottom: '100%', left: '50%', x: '-50%', y: -8 },
    bottom: { top: '100%', left: '50%', x: '-50%', y: 8 },
    left: { right: '100%', top: '50%', x: -8, y: '-50%' },
    right: { left: '100%', top: '50%', x: 8, y: '-50%' }
  };

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            className="absolute z-50 px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-medium whitespace-nowrap shadow-lg border border-slate-700"
            style={positions[position]}
            initial={{ opacity: 0, scale: 0.9, ...positions[position] }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.15 }}
          >
            {content}
            <div
              className="absolute w-2 h-2 bg-slate-900 border-slate-700 transform rotate-45"
              style={{
                [position === 'top' ? 'bottom' : position === 'bottom' ? 'top' :
                 position === 'left' ? 'right' : 'left']: '-4px',
                ...(position === 'top' || position === 'bottom' ? { left: '50%', marginLeft: '-4px' } :
                    { top: '50%', marginTop: '-4px' })
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/**
 * Progress indicator with smooth transitions
 */
export const SmoothProgress = ({ progress, color = '#6366f1', height = 4, showLabel = false }) => {
  return (
    <div className="relative w-full">
      <div
        className="w-full rounded-full overflow-hidden bg-slate-800"
        style={{ height }}
      >
        <motion.div
          className="h-full rounded-full relative overflow-hidden"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        >
          {/* Shimmer effect */}
          <div
            className="absolute inset-0 opacity-50"
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
              animation: 'shimmer 2s infinite'
            }}
          />
        </motion.div>
      </div>
      {showLabel && (
        <motion.div
          className="absolute right-0 top-full mt-1 text-xs font-mono text-slate-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {Math.round(progress)}%
        </motion.div>
      )}
    </div>
  );
};

/**
 * Skeleton loader with shimmer effect
 */
export const SkeletonLoader = ({ width = '100%', height = 20, className = '', count = 1 }) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="relative overflow-hidden rounded-lg bg-slate-800"
          style={{ width, height }}
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-700 to-transparent"
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
          />
        </div>
      ))}
    </div>
  );
};

/**
 * Notification toast with auto-dismiss
 */
export const NotificationToast = ({ message, type = 'info', duration = 3000, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const colors = {
    success: { bg: 'bg-emerald-500/10', border: 'border-emerald-500', text: 'text-emerald-400' },
    error: { bg: 'bg-red-500/10', border: 'border-red-500', text: 'text-red-400' },
    warning: { bg: 'bg-amber-500/10', border: 'border-amber-500', text: 'text-amber-400' },
    info: { bg: 'bg-blue-500/10', border: 'border-blue-500', text: 'text-blue-400' }
  };

  const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ'
  };

  const style = colors[type];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg border ${style.bg} ${style.border} backdrop-blur-md shadow-lg max-w-md`}
          initial={{ opacity: 0, x: 100, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 100, scale: 0.9 }}
          transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <div className="flex items-center gap-3">
            <span className={`text-lg ${style.text}`}>{icons[type]}</span>
            <p className={`text-sm font-medium ${style.text}`}>{message}</p>
            <button
              onClick={() => {
                setIsVisible(false);
                setTimeout(onClose, 300);
              }}
              className={`ml-auto ${style.text} hover:opacity-70 transition-opacity`}
            >
              ✕
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

/**
 * Counter animation
 */
export const AnimatedCounter = ({ value, duration = 1, decimals = 0 }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const startTime = Date.now();
    const startValue = displayValue;
    const diff = value - startValue;

    const animate = () => {
      const now = Date.now();
      const progress = Math.min((now - startTime) / (duration * 1000), 1);
      const eased = 1 - Math.pow(1 - progress, 3); // Ease out cubic
      const current = startValue + diff * eased;

      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [value, duration]);

  return <span>{displayValue.toFixed(decimals)}</span>;
};

/**
 * Badge with pulse animation
 */
export const PulseBadge = ({ children, color = 'indigo', pulse = true }) => {
  const colors = {
    indigo: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/40',
    emerald: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
    amber: 'bg-amber-500/20 text-amber-400 border-amber-500/40',
    red: 'bg-red-500/20 text-red-400 border-red-500/40'
  };

  return (
    <span className={`relative inline-flex items-center px-2.5 py-1 rounded-full border text-xs font-bold ${colors[color]}`}>
      {pulse && (
        <span className="absolute inset-0 rounded-full animate-ping opacity-75" style={{ backgroundColor: `var(--${color}-500)` }} />
      )}
      <span className="relative">{children}</span>
    </span>
  );
};

/**
 * Shine effect on hover
 */
export const ShineOnHover = ({ children, className = '' }) => {
  return (
    <div className={`relative overflow-hidden group ${className}`}>
      {children}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
          transform: 'translateX(-100%)',
          animation: 'shine 1.5s infinite'
        }}
      />
    </div>
  );
};

export default {
  ParticleEffect,
  RippleEffect,
  GlowPulse,
  AnimatedGradient,
  SmoothTooltip,
  SmoothProgress,
  SkeletonLoader,
  NotificationToast,
  AnimatedCounter,
  PulseBadge,
  ShineOnHover
};
