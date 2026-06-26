import React, { useState, useEffect } from "react";
import { 
  MdAutoAwesome, 
  MdLightbulbOutline, 
  MdKeyboardArrowDown, 
  MdKeyboardArrowUp,
  MdInfoOutline
} from "react-icons/md";

const Typewriter = ({ text, speed = 15 }) => {
  const [displayedText, setDisplayedText] = useState("");
  const fullText = String(text || "");

  useEffect(() => {
    setDisplayedText("");
    let i = 0;
    const timer = setInterval(() => {
      if (i < fullText.length) {
        setDisplayedText(fullText.slice(0, i + 1));
        i++;
      } else {
        clearInterval(timer);
      }
    }, speed);
    return () => clearInterval(timer);
  }, [fullText, speed]);

  return <span>{displayedText}</span>;
};

export const AIAssistant = ({ analysis, isAnalyzing, error, runState }) => {
  const [showWorkingStyle, setShowWorkingStyle] = useState(false);

  // Safe checks
  const isAnalysisEmpty = !analysis || (typeof analysis === 'object' && Object.keys(analysis).length === 0);
  
  // Extract data flexibly
  const rawText = typeof analysis === "string" ? analysis : (analysis?.summary || analysis?.message || analysis?.feedback || analysis?.analysis || "");
  const suggestions = analysis?.suggestions;
  const hasLogicData = analysis?.templateCategory || analysis?.algorithm || (analysis?.variables && analysis?.variables.length > 0);

  return (
    <>
      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        .animate-blink { animation: blink 1s step-end infinite; }
      `}</style>

      <div className="flex flex-col border-t border-indigo-500/20 bg-gradient-to-b from-[#111827] to-[#0a0f1a] p-5 flex-shrink-0 h-[400px] shadow-[0_-10px_40px_-15px_rgba(99,102,241,0.15)] relative z-10">
        
        {/* ── HEADER ── */}
        <div className="flex items-center justify-between mb-4 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-indigo-500/20 rounded-lg">
              <MdAutoAwesome className={`text-indigo-400 text-lg ${isAnalyzing ? "animate-spin-slow" : ""}`} />
            </div>
            <span className="text-sm font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 to-cyan-300 tracking-wide">
              AI Insights
            </span>
          </div>
        </div>

        {/* ── CONTENT AREA ── */}
        <div className="flex flex-col flex-1 overflow-y-auto pr-2 custom-scrollbar">
          
          {/* 1. LOADING STATE */}
          {isAnalyzing ? (
            <div className="flex flex-col mt-2">
              <div className="bg-[#0d1524] border border-indigo-500/20 rounded-xl p-4 font-mono text-xs text-indigo-200/70 shadow-sm">
                <div className="flex flex-col gap-2.5">
                  <span className="text-indigo-400 font-semibold">$ analyze_code()</span>
                  <span className="text-slate-500">{"// Scanning logic and variables..."}</span>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="text-indigo-300">{">"}generating_insights</span>
                    <span className="w-2 h-3.5 bg-indigo-400 animate-blink inline-block"></span>
                  </div>
                </div>
              </div>
            </div>

          ) : error ? (
            
            /* 2. ERROR STATE */
            <div className="text-rose-400 text-xs font-mono mt-2 bg-rose-500/10 rounded-xl p-3 border border-rose-500/20 shadow-sm flex-shrink-0">
              🚨 {error}
            </div>

          ) : (!analysis || isAnalysisEmpty) ? (
            
            /* 3. EMPTY STATE */
            <div className="flex flex-col items-center justify-center h-full border border-dashed border-slate-700 rounded-xl bg-white/[0.02]">
              <span className="text-slate-300 text-sm font-semibold mb-1">Ready for magic? ✨</span>
              <span className="text-slate-500 text-xs text-center px-4">
                Hit "Analyze" up top to get the tea on your code.
              </span>
            </div>

          ) : (
            
            /* 4. SUCCESS / ANALYSIS DATA STATE */
            <div className="flex flex-col gap-4">
              
              {/* General Summary */}
              {rawText && !hasLogicData && !suggestions && (
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-slate-300 text-xs leading-relaxed whitespace-pre-wrap">
                  {/* 👇 Typewriter effect added here */}
                  <Typewriter text={rawText} speed={15} />
                </div>
              )}

              {/* Fixes Block */}
              {(runState === "error" || suggestions) && (
                <div className="bg-gradient-to-br from-orange-500/10 to-rose-500/10 border border-orange-500/20 rounded-2xl p-4 shadow-sm flex-shrink-0">
                  <div className="flex items-center gap-1.5 text-orange-400 text-xs font-bold uppercase tracking-wider mb-2.5">
                    <MdLightbulbOutline className="text-base" /> {runState === "error" ? "Fixes Needed" : "Suggestions"}
                  </div>
                  <div className="text-orange-200/90 leading-relaxed text-xs">
                    {Array.isArray(suggestions) ? (
                      <ul className="flex flex-col gap-2">
                        {suggestions.map((fix, idx) => (
                          <li key={idx} className="flex gap-2">
                            <span className="text-orange-400/50 mt-0.5">•</span>
                            {/* 👇 Typewriter effect added here for array items */}
                            <Typewriter text={fix} speed={15} />
                          </li>
                        ))}
                      </ul>
                    ) : suggestions ? (
                      /* 👇 Typewriter effect added here */
                      <Typewriter text={suggestions} speed={15} />
                    ) : (
                      /* 👇 Typewriter effect added here */
                      <Typewriter text={rawText || "AI detected an error but couldn't generate specific fixes. Please review the output above."} speed={15} />
                    )}
                  </div>
                </div>
              )}

              {/* Logic & Variables Accordion */}
              {hasLogicData && (
                <div className="border border-indigo-500/10 rounded-2xl overflow-hidden bg-[#0d1524] shadow-sm flex-shrink-0 mb-4">
                  <button 
                    onClick={() => setShowWorkingStyle(!showWorkingStyle)}
                    className="w-full flex items-center justify-between p-4 text-xs font-bold text-indigo-300 hover:bg-indigo-500/10 transition-all active:scale-[0.99]"
                  >
                    <div className="flex items-center gap-2">
                      <span>🧠</span>
                      <span>Logic & Variables</span>
                    </div>
                    {showWorkingStyle ? (
                      <MdKeyboardArrowUp className="text-lg text-indigo-400" />
                    ) : (
                      <MdKeyboardArrowDown className="text-lg text-indigo-400" />
                    )}
                  </button>
                  
                  {showWorkingStyle && (
                    <div className="p-4 border-t border-indigo-500/10 flex flex-col gap-4 bg-[#0a0f1a]/50">
                      
                      {/* Core DSA Badges */}
                      {(analysis.templateCategory || analysis.algorithm) && (
                        <div className="grid grid-cols-2 gap-3">
                          <div className="flex flex-col gap-1 bg-white/5 p-3 rounded-xl">
                            <span className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold">Visual Category</span>
                            <span className="font-mono text-cyan-400 text-xs font-bold">{analysis.templateCategory || "N/A"}</span>
                          </div>
                          <div className="flex flex-col gap-1 bg-white/5 p-3 rounded-xl">
                            <span className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold">Core DSA</span>
                            <span className="text-fuchsia-400 text-xs font-bold">{analysis.algorithm || "N/A"}</span>
                          </div>
                        </div>
                      )}

                      {/* Variables List */}
                      {analysis.variables && analysis.variables.length > 0 && (
                        <div className="flex flex-col gap-2.5">
                          <span className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold pl-1">Memory Roles</span>
                          <div className="grid grid-cols-1 gap-2">
                            {analysis.variables.map((v, i) => (
                              <div key={i} className="flex flex-col bg-white/5 p-3 rounded-xl hover:bg-white/10 transition-colors">
                                <span className="text-indigo-400 font-mono text-xs font-bold mb-1">{v.name}</span>
                                <span className="text-slate-300 text-xs leading-relaxed">{v.role}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Ultimate JSON Fallback */}
              {!hasLogicData && !suggestions && !rawText && !isAnalysisEmpty && (
                <div className="flex flex-col items-center justify-center p-4 border border-dashed border-slate-700 rounded-xl bg-white/[0.02]">
                    <MdInfoOutline className="text-slate-500 text-xl mb-2" />
                    <span className="text-slate-400 text-xs text-center">
                        AI response received, but format wasn't recognized.
                    </span>
                    <pre className="mt-3 text-[10px] text-slate-500 max-w-full overflow-hidden text-ellipsis bg-black/50 p-2 rounded w-full">
                        {JSON.stringify(analysis).slice(0, 150)}...
                    </pre>
                </div>
              )}

            </div>
          )}
        </div>
      </div>
    </>
  );
};