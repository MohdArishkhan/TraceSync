import { memo, useMemo, useCallback, useRef, useState } from 'react';

/**
 * Performance optimization utilities for visual engines
 * Reduces unnecessary re-renders and optimizes animation performance
 */

// Memoized comparison for data objects - prevents re-renders when data hasn't changed
export const deepCompare = (prevProps, nextProps) => {
  return JSON.stringify(prevProps) === JSON.stringify(nextProps);
};

// Throttle function for high-frequency updates
export const useThrottle = (callback, delay) => {
  const lastRun = useRef(Date.now());

  return useCallback((...args) => {
    const now = Date.now();
    if (now - lastRun.current >= delay) {
      callback(...args);
      lastRun.current = now;
    }
  }, [callback, delay]);
};

// Optimized animation variants for framer-motion
export const optimizedVariants = {
  // Fast, smooth entrance
  fadeIn: {
    initial: { opacity: 0, scale: 0.95 },
    animate: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.2,
        ease: [0.25, 0.1, 0.25, 1] // Custom easing for smoothness
      }
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      transition: { duration: 0.15 }
    }
  },

  // Slide animations
  slideUp: {
    initial: { y: 20, opacity: 0 },
    animate: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 400,
        damping: 30
      }
    }
  },

  // Scale with spring physics
  scaleSpring: {
    initial: { scale: 0.8, opacity: 0 },
    animate: {
      scale: 1,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 20
      }
    }
  },

  // List item stagger
  listItem: (index) => ({
    initial: { opacity: 0, x: -20 },
    animate: {
      opacity: 1,
      x: 0,
      transition: {
        delay: index * 0.05,
        duration: 0.2,
        ease: 'easeOut'
      }
    }
  })
};

// CSS optimization helpers - add will-change hints for better performance
export const optimizeForAnimation = (element) => {
  if (!element) return;
  element.style.willChange = 'transform, opacity';

  // Remove will-change after animation completes to free up resources
  setTimeout(() => {
    element.style.willChange = 'auto';
  }, 1000);
};

// Reduce motion for accessibility and performance
export const shouldReduceMotion = () => {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

// Optimized motion config
export const getMotionConfig = () => {
  const reduced = shouldReduceMotion();
  return {
    transition: {
      duration: reduced ? 0 : 0.2,
      ease: 'easeInOut'
    }
  };
};

// Batch updates to prevent layout thrashing
export const useBatchedUpdates = () => {
  const pendingUpdates = useRef([]);
  const rafId = useRef(null);

  const scheduleUpdate = useCallback((updateFn) => {
    pendingUpdates.current.push(updateFn);

    if (!rafId.current) {
      rafId.current = requestAnimationFrame(() => {
        pendingUpdates.current.forEach(fn => fn());
        pendingUpdates.current = [];
        rafId.current = null;
      });
    }
  }, []);

  return scheduleUpdate;
};

// Create memoized selectors for engine data
export const useEngineData = (data) => {
  return useMemo(() => ({
    nodes: data?.nodes ?? [],
    activeIndices: data?.activeIndices ?? [],
    narration: data?.narration ?? null,
    statusText: data?.statusText ?? null,
    // Add any other commonly accessed properties
  }), [data]);
};

// Optimize array comparisons
export const useStableArray = (arr) => {
  const stringified = JSON.stringify(arr);
  return useMemo(() => arr, [stringified]);
};

// Virtual scrolling helper for large datasets
export const useVirtualization = (items, containerHeight, itemHeight) => {
  const [scrollTop, setScrollTop] = useState(0);

  const visibleRange = useMemo(() => {
    const start = Math.floor(scrollTop / itemHeight);
    const visibleCount = Math.ceil(containerHeight / itemHeight);
    const end = Math.min(start + visibleCount + 1, items.length);

    return { start, end };
  }, [scrollTop, itemHeight, containerHeight, items.length]);

  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.start, visibleRange.end);
  }, [items, visibleRange]);

  return { visibleItems, visibleRange, setScrollTop };
};

export default {
  deepCompare,
  useThrottle,
  optimizedVariants,
  optimizeForAnimation,
  shouldReduceMotion,
  getMotionConfig,
  useBatchedUpdates,
  useEngineData,
  useStableArray,
  useVirtualization
};
