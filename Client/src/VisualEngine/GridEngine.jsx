import React from 'react';
import { motion } from 'framer-motion';

const stripMetadata = (arr) => {
  if (!Array.isArray(arr)) return arr;
  const startIndex = (typeof arr[0] === 'string' && ['LIST', 'TUPLE', 'SET', 'DICT'].includes(arr[0])) ? 1 : 0;
  return arr.slice(startIndex).map(item => {
    if (Array.isArray(item)) return stripMetadata(item);
    return item;
  });
};

export default function GridEngine({ frameData }) {
  const rawData = frameData?.matrix || frameData?.array || [];
  const activeIndices = frameData?.activeIndices || [];
  const cleanData = stripMetadata(rawData);
  const isMatrix = cleanData.length > 0 && Array.isArray(cleanData[0]);

  return (
    <div className="flex flex-col items-center justify-center w-full h-full p-4 overflow-auto">
      {isMatrix ? (
        <div className="flex flex-col gap-1">
          {cleanData.map((row, rIdx) => (
            <div key={`row-${rIdx}`} className="flex gap-1">
              {row.map((val, cIdx) => {
                const isActive = activeIndices.includes(`${rIdx},${cIdx}`);
                const displayVal = val?.value !== undefined ? val.value : val;
                
                return (
                  <motion.div
                    key={`cell-${val?.id || `${rIdx}-${cIdx}`}`}
                    layout
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    // Added overflow-hidden for text-bleeding safety
                    className={`flex items-center justify-center w-12 h-12 rounded text-lg font-semibold border overflow-hidden ${
                      isActive ? 'bg-indigo-500 text-white border-indigo-700 shadow-[0_0_12px_rgba(99,102,241,0.6)] scale-110 z-10' : 'bg-slate-800 text-slate-200 border-slate-600'
                    }`}
                  >
                    {/* Added truncate utility class */}
                    <span className="truncate w-full text-center px-1">
                      {displayVal === '.' ? <span className="opacity-30">.</span> : displayVal}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-wrap gap-2 justify-center">
          {cleanData.map((val, idx) => {
            const isActive = activeIndices.includes(idx);
            const displayVal = val?.value !== undefined ? val.value : val;
            
            return (
              <motion.div
                key={`item-${val?.id || idx}`}
                layout
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                // Added overflow-hidden
                className={`flex items-center justify-center w-14 h-14 rounded-lg text-xl font-bold border-2 shadow-md overflow-hidden ${
                  isActive ? 'bg-indigo-500 text-white border-indigo-700 shadow-[0_0_12px_rgba(99,102,241,0.6)] scale-110 z-10' : 'bg-slate-800 text-slate-200 border-slate-600'
                }`}
              >
                {/* Added truncate utility class */}
                <span className="truncate w-full text-center px-1">
                  {displayVal}
                </span>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}