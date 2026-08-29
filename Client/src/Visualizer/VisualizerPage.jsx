// import React, { useState, useEffect, useRef } from "react";
// import { MdPlayArrow, MdAutoAwesome, MdArrowBack, MdLock } from "react-icons/md";
// import { VscDebugAlt } from "react-icons/vsc";
// import EditorPanel from "./EditorPanel";
// import VisualPanel from "./VisualPanel";

// const BACKEND_URL = "http://localhost:3000";

// export const TRACE_ENDPOINTS = {
//   python: "/api/execute/trace-py",
//   javascript: "/api/execute/trace-js",
//   cpp: "/api/execute/trace-cpp",
//   java: "/api/execute/trace-java",
// };

// export const LANG_DEFAULTS = {
//   python: `def greet(name):\n    msg = "Hello, " + name\n    print(msg)\n    return msg\n\ngreet("World")`,
//   javascript: `function greet(name) {\n  const msg = "Hello, " + name;\n  console.log(msg);\n  return msg;\n}\n\ngreet("World");`,
//   cpp: `#include <iostream>\nusing namespace std;\n\nint main() {\n    string name = "World";\n    cout << "Hello, " << name << endl;\n    return 0;\n}`,
//   java: `public class Main {\n    public static void main(String[] args) {\n        String name = "World";\n        System.out.println("Hello, " + name);\n    }\n}`,
// };

// const LANGS = ["python", "javascript", "cpp", "java"];

// // ─────────────────────────────────────────────────────────────────────────────
// //  HELPER: Convert AI analysis → vizType string consumed by TracerWorker
// // ─────────────────────────────────────────────────────────────────────────────
// const getVisualType = (analysis) => {
//   if (!analysis) return null; 

//   // 1. Highest Priority: The exact engine selected by the AI
//   const engine = (analysis.selectedEngine || "").toUpperCase();
//   if (engine.includes("N_QUEENS") || engine.includes("NQUEENS") || engine.includes("QUEENS")) return "N_QUEENS";
//   if (engine.includes("SEGMENT")) return "SEGMENT_TREE";
//   if (engine.includes("DEQUE")) return "DEQUE";
//   if (engine.includes("QUEUE")) return "QUEUE";
//   if (engine.includes("STACK")) return "STACK";
//   if (engine.includes("GRAPH")) return "GRAPH";
//   if (engine.includes("TREE")) return "TREE";
//   if (engine.includes("HEAP")) return "HEAP";
//   if (engine.includes("HASH")) return "HASH_MAP";
//   if (engine.includes("GRID") || engine.includes("MATRIX")) return "MATRIX";

//   // 2. Fallback: Guessing from Categories/Algorithms
//   const cat = (analysis.templateCategory ?? "").toUpperCase();
//   const algo = (analysis.algorithm ?? "").toUpperCase();

//   if (cat.includes("BST") || algo.includes("BST")) return "BST";
//   if (cat.includes("N_QUEENS") || algo.includes("N_QUEENS") || cat.includes("QUEENS") || algo.includes("QUEENS") || cat.includes("BACKTRACK") || algo.includes("N QUEEN")) return "N_QUEENS";
//   if (cat.includes("TREE") || algo.includes("TREE")) return "TREE";
//   if (cat.includes("TRIE") || algo.includes("TRIE")) return "TRIE";
//   if (cat.includes("HEAP") || algo.includes("HEAP")) return "HEAP";
//   if (cat.includes("LINKED") || algo.includes("LINKED")) return "LINKED_LIST";
//   if (cat.includes("GRAPH") || algo.includes("GRAPH")) return "GRAPH";
//   if (cat.includes("MATRIX") || algo.includes("MATRIX")) return "MATRIX";
//   if (cat.includes("STACK") || algo.includes("STACK")) return "STACK";
//   if (cat.includes("DEQUE") || algo.includes("DEQUE")) return "DEQUE";
//   if (cat.includes("QUEUE") || algo.includes("QUEUE")) return "QUEUE";
//   if (cat.includes("HASH") || algo.includes("HASH")) return "HASH_MAP";

//   return "ARRAY"; 
// };

// // ─────────────────────────────────────────────────────────────────────────────
// //  MAIN COMPONENT
// // ─────────────────────────────────────────────────────────────────────────────
// const VisualizerPage = () => {
//   const [view, setView] = useState("editor");
//   const [language, setLanguage] = useState("python");
//   const [userCode, setUserCode] = useState(LANG_DEFAULTS["python"]);
//   const [customInput, setCustomInput] = useState("");
//   const [runState, setRunState] = useState("idle");
//   const [runOutput, setRunOutput] = useState("");
//   const [canVisualize, setCanVisualize] = useState(false);
//   const [vizLoading, setVizLoading] = useState(false);
//   const [vizError, setVizError] = useState("");
//   const [aiAnalysis, setAiAnalysis] = useState(null);
//   const [isAnalyzing, setIsAnalyzing] = useState(false);
//   const [aiError, setAiError] = useState("");
//   const [currentIndex, setCurrentIndex] = useState(0);
//   const [isPlaying, setIsPlaying] = useState(false);
//   const [speed, setSpeed] = useState(500);
//   const [currentStep, setCurrentStep] = useState({});
//   const [maxSteps, setMaxSteps] = useState(0);
//   const [unlocking, setUnlocking] = useState(false);

//   const fullTraceRef = useRef([]);
//   const workerRef = useRef(null);
//   const editorRef = useRef(null);
//   const monacoRef = useRef(null);
//   const decorationsRef = useRef([]);

//   useEffect(() => { setCanVisualize(false); setRunState("idle"); setRunOutput(""); }, [userCode, language]);
//   useEffect(() => { setUserCode(LANG_DEFAULTS[language]); }, [language]);
//   useEffect(() => () => workerRef.current?.terminate(), []);

//   useEffect(() => {
//     if (canVisualize) {
//       setUnlocking(true);
//       const t = setTimeout(() => setUnlocking(false), 800);
//       return () => clearTimeout(t);
//     }
//   }, [canVisualize]);

//   useEffect(() => {
//     if (view === "visualizing" && fullTraceRef.current.length > 0)
//       setCurrentStep(fullTraceRef.current[currentIndex] || {});
//   }, [currentIndex, view]);

//   useEffect(() => {
//     if (!isPlaying || currentIndex >= maxSteps) { setIsPlaying(false); return; }
//     const iv = setInterval(() => setCurrentIndex((p) => p + 1), speed);
//     return () => clearInterval(iv);
//   }, [isPlaying, currentIndex, maxSteps, speed]);

//   const activeLine = currentStep?.line ?? null;

//   useEffect(() => {
//     if (!editorRef.current || !monacoRef.current || view !== "visualizing") return;
//     const newDecs = activeLine
//       ? [{
//           range: new monacoRef.current.Range(activeLine, 1, activeLine, 1),
//           options: {
//             isWholeLine: true,
//             className: "monaco-active-line",
//             glyphMarginClassName: "monaco-active-glyph",
//           },
//         }]
//       : [];
//     decorationsRef.current = editorRef.current.deltaDecorations(decorationsRef.current, newDecs);
//     if (activeLine) editorRef.current.revealLineInCenter(activeLine, 0);
//   }, [activeLine, view]);

//   const fetchPost = async (url, body) => {
//     const res = await fetch(url, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(body),
//       signal: AbortSignal.timeout(35000),
//     });
//     const text = await res.text();
//     if (!res.ok) throw new Error(`HTTP ${res.status}: ${text.slice(0, 150)}`);
//     try { return JSON.parse(text); } catch { throw new Error(`Invalid JSON: ${text.slice(0, 100)}`); }
//   };

//   const handleAnalyze = async () => {
//     if (!userCode.trim()) return;
//     setIsAnalyzing(true); setAiError(""); setAiAnalysis(null);
//     try {
//       setAiAnalysis(
//         await fetchPost(`${BACKEND_URL}/api/ai/analyze`, { code: userCode, language, runState, runOutput })
//       );
//     } catch (err) {
//       const msg = err.message ?? "";
//       if (msg.includes("GoogleGenerativeAI") || msg.includes("HTTP 500") || msg.includes("503"))
//         setAiError("The AI service is busy. Please try again in a moment! 🤖");
//       else if (msg.includes("Failed to fetch") || msg.includes("Network Error"))
//         setAiError("Network issue — check your connection or backend. 🔌");
//       else
//         setAiError("Oops! Something went wrong while analyzing. Please try again. ✨");
//     } finally { setIsAnalyzing(false); }
//   };

//   const handleRun = async () => {
//     if (!userCode.trim()) return;
//     setRunState("running"); setRunOutput(""); setCanVisualize(false);
//     const tracePath = TRACE_ENDPOINTS[language];

//     try {
//       let execResult, traceData = [];

//       if (tracePath) {
//         const [jr, tr] = await Promise.allSettled([
//           fetchPost(`${BACKEND_URL}/api/execute/execute`, { language, code: userCode, stdin: customInput }),
//           fetchPost(`${BACKEND_URL}${tracePath}`, { language, code: userCode }),
//         ]);
//         if (jr.status !== "fulfilled") throw new Error(jr.reason.message);
//         execResult = jr.value;
//         if (tr.status === "fulfilled" && tr.value?.trace?.length > 0)
//           traceData = tr.value.trace;
//       } else {
//         execResult = await fetchPost(`${BACKEND_URL}/api/execute/execute`, { language, code: userCode, stdin: customInput });
//       }

//       if (execResult.status === 0 || execResult.error)
//         throw new Error(execResult.error || "Execution failure");

//       const r = execResult.data ?? execResult;
//       const out = r.output ?? r.stdout ?? r.data?.output ?? "";
//       const stderr = r.stderr?.trim() ?? "";
//       const outLower = out.toLowerCase();

//       const isError =
//         stderr !== "" ||
//         outLower.includes("error:") ||
//         outLower.includes("syntaxerror") ||
//         outLower.includes("traceback") ||
//         outLower.includes("exception") ||
//         out.includes("JDoodle - Timeout") ||
//         (r.exitCode != null && Number(r.exitCode) !== 0) ||
//         (r.statusCode != null && Number(r.statusCode) !== 200);

//       const display = [out, stderr ? `\n— stderr —\n${stderr}` : ""].join("").trim();

//       if (isError) {
//         setRunState("error");
//         setRunOutput(display || "Execution Error");
//         setCanVisualize(false);
//         fullTraceRef.current = [];
//       } else {
//         setRunState("success");
//         setRunOutput(display);
//         setCanVisualize(!!tracePath);
//         fullTraceRef.current = traceData;
//       }
//     } catch (e) {
//       setRunState("error");
//       setRunOutput(`[Network Error] ${e.message}\n\nEnsure Node.js backend is running on port 3000.`);
//       setCanVisualize(false);
//     }
//   };

//   // ─── FIX: pass aiMetadata to worker so engines are selected correctly ───────
//   const handleVisualize = () => {
//     if (!canVisualize || !userCode.trim()) return;
//     setVizLoading(true); setVizError("");
//     workerRef.current?.terminate();

//     // Derive the vizType from AI analysis (null = worker auto-detects from heap)
//     const vizType = getVisualType(aiAnalysis);

//     try {
//       workerRef.current = new Worker(
//         new URL("../WebWorker/TracerWorker.js", import.meta.url),
//         { type: "module" }
//       );

//       workerRef.current.postMessage({
//         url: `${BACKEND_URL}${TRACE_ENDPOINTS[language]}`,
//         payload: { code: userCode, language, customInput },
//         // ↓ This was completely missing before — the #1 root cause of all DS bugs
//         aiMetadata: vizType ? { type: vizType } : null,
//       });

//       workerRef.current.onmessage = ({ data }) => {
//         setVizLoading(false);
//         if (data.type === "SUCCESS" && data.payload?.trace?.length > 0) {
//           fullTraceRef.current = data.payload.trace;
//           setMaxSteps(data.payload.trace.length - 1);
//           setCurrentStep(data.payload.trace[0]);
//           setCurrentIndex(0);
//           setIsPlaying(false);
//           setView("visualizing");
//         } else {
//           setVizError(data.message || "No trace returned.");
//         }
//       };
//       workerRef.current.onerror = () => {
//         setVizLoading(false);
//         setVizError("Worker error. Check console.");
//       };
//     } catch {
//       setVizLoading(false);
//       setVizError("Failed to start worker.");
//     }
//   };

//   const handleEditorMount = (editor, monaco) => {
//     editorRef.current = editor; monacoRef.current = monaco;
//     monaco.editor.defineTheme("lc-dark", {
//       base: "vs-dark", inherit: true,
//       rules: [
//         { token: "keyword", foreground: "ffa116" },
//         { token: "string", foreground: "00b8a3" },
//         { token: "number", foreground: "ffb800" },
//         { token: "type", foreground: "6ab0f5" },
//       ],
//       colors: {
//         "editor.background": "#1a1a1a",
//         "editor.foreground": "#eff2f5",
//         "editor.lineHighlightBackground": "#262626",
//         "editorLineNumber.foreground": "#4d4d4d",
//         "editorLineNumber.activeForeground": "#8d8d8d",
//         "editor.selectionBackground": "#ffa11640",
//         "editorCursor.foreground": "#ffa116",
//         "editorGutter.background": "#1a1a1a",
//         "scrollbarSlider.background": "#2d2d2d",
//         "scrollbarSlider.hoverBackground": "#3d3d3d",
//       },
//     });
//     monaco.editor.setTheme("vs-dark");
//   };
//   const shared = { language, userCode, handleEditorMount, activeLine, view };
  
//   const aiProps = { 
//     analysis: aiAnalysis, 
//     isAnalyzing, 
//     error: aiError, 
//     runState,
//     primedEngine: getVisualType(aiAnalysis) 
//   };;

//   return (
//     <>
//       <style>{`
//         .monaco-active-line { background: rgba(255,161,22,0.1) !important; border-left: 2px solid #ffa116; }
//         .monaco-active-glyph::before { content: '▶'; color: #ffa116; font-size: 10px; margin-left: 4px; }
//         ::-webkit-scrollbar { width: 6px; height: 6px; }
//         ::-webkit-scrollbar-track { background: transparent; }
//         ::-webkit-scrollbar-thumb { background: #3d3d3d; border-radius: 3px; }
//         ::-webkit-scrollbar-thumb:hover { background: #555; }
//         .panel-tab.active { color: #eff2f5; border-bottom: 2px solid #ffa116; }
//         .panel-tab { color: #8d8d8d; border-bottom: 2px solid transparent; }
//         input[type=range] { accent-color: #ffa116; }
//         .icon-container { position: relative; display: flex; align-items: center; justify-content: center; width: 16px; height: 16px; }
//         .explosion-ring { position: absolute; width: 100%; height: 100%; border-radius: 50%; border: 2px solid #ffa116; opacity: 0; pointer-events: none; }
//         .animate-explosion { animation: ringBurst 0.6s ease-out forwards; }
//         @keyframes ringBurst { 0% { transform: scale(0.3); opacity: 1; border-width: 4px; } 100% { transform: scale(3.5); opacity: 0; border-width: 0px; } }
//         .icon-pop-in { animation: bounceIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
//         @keyframes bounceIn { 0% { transform: scale(0) rotate(-45deg); opacity: 0; } 100% { transform: scale(1) rotate(0deg); opacity: 1; } }
//       `}</style>

//       <div
//         className="flex flex-col h-screen bg-[#1a1a1a] text-[#eff2f5] overflow-hidden"
//         style={{ fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif" }}
//       >
//         {/* ── HEADER ── */}
//         <header className="flex items-center justify-between px-4 h-12 border-b border-[#3d3d3d] bg-[#282828] flex-shrink-0">
//           <div className="flex items-center gap-3 flex-1">
//             {view === "visualizing" && (
//               <button
//                 onClick={() => { setView("editor"); setIsPlaying(false); }}
//                 className="flex items-center gap-1.5 text-xs text-[#8d8d8d] hover:text-[#eff2f5] transition-colors mr-2"
//               >
//                 <MdArrowBack /> Back
//               </button>
//             )}
//             <VscDebugAlt className="text-[#ffa116] text-base" />
//             <span className="text-xs font-semibold tracking-widest uppercase text-[#8d8d8d]">
//               Trace<span className="text-[#ffa116]">Lab</span>
//             </span>
//           </div>

//           <div className="flex items-center justify-center gap-2 flex-1">
//             {view === "editor" && (
//               <>
//                 {/* Run */}
//                 <button
//                   onClick={handleRun}
//                   disabled={runState === "running"}
//                   className="flex items-center gap-1.5 px-4 py-1.5 rounded-md text-xs font-semibold bg-[#3e3e3e] hover:bg-[#4d4d4d] text-[#eff2f5] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
//                 >
//                   {runState === "running" ? (
//                     <>
//                       <span className="w-3.5 h-3.5 border-2 border-[#eff2f5] border-t-transparent rounded-full animate-spin" />
//                       Running
//                     </>
//                   ) : (
//                     <><MdPlayArrow className="text-sm text-[#00b8a3]" /> Run</>
//                   )}
//                 </button>

//                 {/* Visualize */}
//                 <button
//                   onClick={handleVisualize}
//                   disabled={!canVisualize || vizLoading}
//                   title={!canVisualize ? "Run without errors first" : "Click to Visualize!"}
//                   className={`relative overflow-hidden flex items-center gap-2 px-4 py-1.5 rounded-md text-xs font-semibold transition-all duration-300 
//                     ${canVisualize && !vizLoading
//                       ? "bg-[#3e3e3e] hover:bg-[#4d4d4d] text-[#ffa116]"
//                       : "bg-[#1a1a1a] text-[#4d4d4d] cursor-not-allowed"} 
//                     ${unlocking ? "bg-[#ffa116]/10 border border-[#ffa116]/30 shadow-[0_0_12px_rgba(255,161,22,0.15)]" : "border border-transparent"}`}
//                 >
//                   {vizLoading ? (
//                     <span className="w-3.5 h-3.5 border-2 border-[#ffa116] border-t-transparent rounded-full animate-spin" />
//                   ) : (
//                     <div className="icon-container">
//                       {unlocking && <div className="explosion-ring animate-explosion" />}
//                       {!canVisualize ? (
//                         <MdLock className="absolute text-sm text-[#4d4d4d]" />
//                       ) : (
//                         <VscDebugAlt className={`absolute text-sm ${unlocking ? "icon-pop-in text-[#ffa116]" : ""}`} />
//                       )}
//                     </div>
//                   )}
//                   <span>Visualize</span>
//                 </button>

//                 {/* Analyze */}
//                 <button
//                   onClick={handleAnalyze}
//                   disabled={isAnalyzing || !userCode.trim()}
//                   title="AI Analyze"
//                   className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-[#282828] hover:bg-[#3e3e3e] text-[#8ab4f8] transition-all disabled:opacity-40 disabled:cursor-not-allowed border border-[#3d3d3d]"
//                 >
//                   <MdAutoAwesome className="text-sm" />
//                 </button>
//               </>
//             )}
//           </div>

//           <div className="flex items-center justify-end gap-3 flex-1">
//             {view === "editor" && (
//               <select
//                 value={language}
//                 onChange={(e) => setLanguage(e.target.value)}
//                 className="bg-[#1a1a1a] border border-[#3d3d3d] text-[#eff2f5] text-xs rounded-md px-3 py-1.5 outline-none focus:border-[#ffa116] transition-colors cursor-pointer"
//               >
//                 {LANGS.map((l) => (
//                   <option key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</option>
//                 ))}
//               </select>
//             )}
//           </div>
//         </header>

//         {view === "editor" ? (
//           <EditorPanel
//             {...shared}
//             customInput={customInput} setCustomInput={setCustomInput}
//             setUserCode={setUserCode} runOutput={runOutput} runState={runState}
//             canVisualize={canVisualize} vizError={vizError} aiProps={aiProps}
//           />
//         ) : (
//           <VisualPanel
//             {...shared}
//             currentStep={currentStep} currentIndex={currentIndex} maxSteps={maxSteps}
//             isPlaying={isPlaying} speed={speed}
//             setCurrentIndex={setCurrentIndex} setIsPlaying={setIsPlaying} setSpeed={setSpeed}
//             aiProps={aiProps}
//           />
//         )}
//       </div>
//     </>
//   );
// };

// export default VisualizerPage;


import React, { useState, useEffect, useRef } from "react";
import { MdPlayArrow, MdAutoAwesome, MdArrowBack, MdLock } from "react-icons/md";
import { VscDebugAlt } from "react-icons/vsc";
import EditorPanel from "./EditorPanel";
import VisualPanel from "./VisualPanel";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

export const TRACE_ENDPOINTS = {
  python: "/api/execute/trace-py",
  javascript: "/api/execute/trace-js",
  cpp: "/api/execute/trace-cpp",
  java: "/api/execute/trace-java",
};

export const LANG_DEFAULTS = {
  python: `def greet(name):\n    msg = "Hello, " + name\n    print(msg)\n    return msg\n\ngreet("World")`,
  javascript: `function greet(name) {\n  const msg = "Hello, " + name;\n  console.log(msg);\n  return msg;\n}\n\ngreet("World");`,
  cpp: `#include <iostream>\nusing namespace std;\n\nint main() {\n    string name = "World";\n    cout << "Hello, " << name << endl;\n    return 0;\n}`,
  java: `public class Main {\n    public static void main(String[] args) {\n        String name = "World";\n        System.out.println("Hello, " + name);\n    }\n}`,
};

const LANGS = ["python", "javascript", "cpp", "java"];

// ─────────────────────────────────────────────────────────────────────────────
//  HELPER: legacy type string from analysis (fallback when no vizSpec)
// ─────────────────────────────────────────────────────────────────────────────
const getVisualType = (analysis) => {
  if (!analysis) return null;

  // If vizSpec exists, use its engine directly
  if (analysis.vizSpec?.primary?.engine) {
    return analysis.vizSpec.primary.engine;
  }

  // Legacy fallback from selectedEngine string
  const engine = (analysis.selectedEngine || "").toUpperCase();
  if (engine.includes("N_QUEENS") || engine.includes("NQUEENS") || engine.includes("QUEENS")) return "N_QUEENS";
  if (engine.includes("SEGMENT"))  return "SEGMENT_TREE";
  if (engine.includes("DEQUE"))    return "DEQUE";
  if (engine.includes("QUEUE"))    return "QUEUE";
  if (engine.includes("STACK"))    return "STACK";
  if (engine.includes("PHYSICS") || engine.includes("GRAPH")) return "GRAPH";
  if (engine.includes("SVG") || engine.includes("TREE")) return "TREE";
  if (engine.includes("HEAP"))     return "HEAP";
  if (engine.includes("HASH") || engine.includes("MAP")) return "HASH_MAP";
  if (engine.includes("GRID") || engine.includes("MATRIX")) return "MATRIX";
  if (engine.includes("DSU"))      return "DSU";

  // From templateCategory / algorithm
  const cat  = (analysis.templateCategory ?? "").toUpperCase();
  const algo = (analysis.algorithm ?? "").toUpperCase();

  if (cat.includes("BST")    || algo.includes("BST"))      return "BST";
  if (cat.includes("N_QUEEN")|| algo.includes("N.QUEEN"))  return "N_QUEENS";
  if (cat.includes("TRIE")   || algo.includes("TRIE"))     return "TRIE";
  if (cat.includes("HEAP")   || algo.includes("HEAP"))     return "HEAP";
  if (cat.includes("LINKED") || algo.includes("LINKED"))   return "LINKED_LIST";
  if (cat.includes("GRAPH")  || algo.includes("GRAPH") ||
      algo.includes("BFS")   || algo.includes("DIJKSTRA")) return "GRAPH";
  if (cat.includes("MATRIX") || algo.includes("MATRIX") ||
      cat.includes("GRID")   || algo.includes("ISLAND"))   return "MATRIX";
  if (cat.includes("STACK")  || algo.includes("STACK"))    return "STACK";
  if (cat.includes("DEQUE")  || algo.includes("DEQUE"))    return "DEQUE";
  if (cat.includes("QUEUE")  || algo.includes("QUEUE"))    return "QUEUE";
  if (cat.includes("HASH")   || algo.includes("HASH"))     return "HASH_MAP";
  if (cat.includes("TREE")   || algo.includes("TREE"))     return "TREE";

  return "ARRAY";
};

// ─────────────────────────────────────────────────────────────────────────────
//  MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
const VisualizerPage = () => {
  const [view, setView] = useState("editor");
  const [language, setLanguage] = useState("python");
  const [userCode, setUserCode] = useState(LANG_DEFAULTS["python"]);
  const [customInput, setCustomInput] = useState("");
  const [runState, setRunState] = useState("idle");
  const [runOutput, setRunOutput] = useState("");
  const [canVisualize, setCanVisualize] = useState(false);
  const [vizLoading, setVizLoading] = useState(false);
  const [vizError, setVizError] = useState("");
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [vizSpec, setVizSpec] = useState(null);
  const [libraryMatch, setLibraryMatch] = useState(null); // ← pre-match metadata from library
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiError, setAiError] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(500);
  const [currentStep, setCurrentStep] = useState({});
  const [maxSteps, setMaxSteps] = useState(0);
  const [unlocking, setUnlocking] = useState(false);

  const fullTraceRef = useRef([]);
  const workerRef    = useRef(null);
  const editorRef    = useRef(null);
  const monacoRef    = useRef(null);
  const decorationsRef = useRef([]);

  useEffect(() => {
    setCanVisualize(false); setRunState("idle"); setRunOutput("");
    setLibraryMatch(null); setVizSpec(null); setAiAnalysis(null);
  }, [userCode, language]);
  useEffect(() => { setUserCode(LANG_DEFAULTS[language]); }, [language]);
  useEffect(() => () => workerRef.current?.terminate(), []);

  useEffect(() => {
    if (canVisualize) {
      setUnlocking(true);
      const t = setTimeout(() => setUnlocking(false), 800);
      return () => clearTimeout(t);
    }
  }, [canVisualize]);

  useEffect(() => {
    if (view === "visualizing" && fullTraceRef.current.length > 0)
      setCurrentStep(fullTraceRef.current[currentIndex] || {});
  }, [currentIndex, view]);

  useEffect(() => {
    if (!isPlaying || currentIndex >= maxSteps) { setIsPlaying(false); return; }
    const iv = setInterval(() => setCurrentIndex((p) => p + 1), speed);
    return () => clearInterval(iv);
  }, [isPlaying, currentIndex, maxSteps, speed]);

  const activeLine = currentStep?.line ?? null;

  useEffect(() => {
    if (!editorRef.current || !monacoRef.current || view !== "visualizing") return;
    const newDecs = activeLine
      ? [{ range: new monacoRef.current.Range(activeLine, 1, activeLine, 1),
           options: { isWholeLine: true, className: "monaco-active-line", glyphMarginClassName: "monaco-active-glyph" } }]
      : [];
    decorationsRef.current = editorRef.current.deltaDecorations(decorationsRef.current, newDecs);
    if (activeLine) editorRef.current.revealLineInCenter(activeLine, 0);
  }, [activeLine, view]);

  const fetchPost = async (url, body) => {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(40000),
    });
    const text = await res.text();
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${text.slice(0, 150)}`);
    try { return JSON.parse(text); } catch { throw new Error(`Invalid JSON: ${text.slice(0, 100)}`); }
  };

  // ── Analyze: calls AI, stores both analysis display data and vizSpec ──
  // Shared logic: run the analyze call and store results. Used both by the
  // explicit "Analyze" button AND silently by "Visualize" when the user
  // skipped Analyze — this is what lets the 47-problem library (and any
  // future LLM-generated spec) actually get used even if Analyze was never
  // clicked. Without this, vizSpec stays null forever and every problem
  // falls back to pure heuristic rank-based routing, which is wrong for any
  // non-recursive function called from a multi-test-case harness.
  const runAnalysis = async (silent = false) => {
    if (!userCode.trim()) return null;
    if (!silent) { setIsAnalyzing(true); setAiError(""); }
    try {
      const result = await fetchPost(`${BACKEND_URL}/api/ai/analyze`, {
        code: userCode, language, runState, runOutput
      });
      setAiAnalysis(result);
      if (result.vizSpec) {
        setVizSpec(result.vizSpec);
        console.log('[TraceLab] vizSpec:', result.vizSpec.problemName, '→', result.vizSpec.primary?.engine);
      }
      if (result._libraryMatch) {
        setLibraryMatch(result._libraryMatch);
        console.log('[Library]', result._libraryMatch.problemId, result._libraryMatch.confidence);
      } else {
        setLibraryMatch(null);
      }
      return result;
    } catch (err) {
      if (!silent) {
        const msg = err.message ?? "";
        if (msg.includes("HTTP 500") || msg.includes("503"))
          setAiError("The AI service is busy. Please try again in a moment! 🤖");
        else if (msg.includes("Failed to fetch") || msg.includes("Network Error"))
          setAiError("Network issue — check your connection or backend. 🔌");
        else
          setAiError(`Analysis failed: ${msg.slice(0, 80)}`);
      } else {
        // Silent auto-analyze failure: don't surface an error banner, just
        // fall through to heuristic routing like before — Visualize should
        // never be blocked by a background analysis attempt failing.
        console.warn('[TraceLab] Silent auto-analyze failed, falling back to heuristics:', err.message);
      }
      return null;
    } finally {
      if (!silent) setIsAnalyzing(false);
    }
  };

  const handleAnalyze = async () => {
    setAiAnalysis(null); setVizSpec(null);
    await runAnalysis(false);
  };

  // ── Run: execute code and get trace ──
  const handleRun = async () => {
    if (!userCode.trim()) return;
    setRunState("running"); setRunOutput(""); setCanVisualize(false);
    const tracePath = TRACE_ENDPOINTS[language];

    try {
      let execResult, traceData = [];

      if (tracePath) {
        const [jr, tr] = await Promise.allSettled([
          fetchPost(`${BACKEND_URL}/api/execute/execute`, { language, code: userCode, stdin: customInput }),
          fetchPost(`${BACKEND_URL}${tracePath}`, { language, code: userCode }),
        ]);
        if (jr.status !== "fulfilled") throw new Error(jr.reason.message);
        execResult = jr.value;
        if (tr.status === "fulfilled" && tr.value?.trace?.length > 0)
          traceData = tr.value.trace;
      } else {
        execResult = await fetchPost(`${BACKEND_URL}/api/execute/execute`, { language, code: userCode, stdin: customInput });
      }

      if (execResult.status === 0 || execResult.error)
        throw new Error(execResult.error || "Execution failure");

      const r = execResult.data ?? execResult;
      const out = r.output ?? r.stdout ?? r.data?.output ?? "";
      const stderr = r.stderr?.trim() ?? "";
      const outLower = out.toLowerCase();

      const isError =
        stderr !== "" ||
        outLower.includes("error:") || outLower.includes("syntaxerror") ||
        outLower.includes("traceback") || outLower.includes("exception") ||
        out.includes("JDoodle - Timeout") ||
        (r.exitCode != null && Number(r.exitCode) !== 0) ||
        (r.statusCode != null && Number(r.statusCode) !== 200);

      const display = [out, stderr ? `\n— stderr —\n${stderr}` : ""].join("").trim();

      if (isError) {
        setRunState("error");
        setRunOutput(display || "Execution Error");
        setCanVisualize(false);
        fullTraceRef.current = [];
      } else {
        setRunState("success");
        setRunOutput(display);
        setCanVisualize(!!tracePath);
        fullTraceRef.current = traceData;
      }
    } catch (e) {
      setRunState("error");
      setRunOutput(`[Network Error] ${e.message}\n\nEnsure Node.js backend is running on port 3000.`);
      setCanVisualize(false);
    }
  };

  // ── Visualize: start TracerWorker with full AI context ──
  // Auto-runs analysis silently first if the user skipped the Analyze button
  // — otherwise vizSpec stays null forever and the entire problem library
  // (and any real algorithm classification) never gets consulted, falling
  // back to pure heuristic rank-based routing for every single problem.
  const handleVisualize = async () => {
    if (!canVisualize || !userCode.trim()) return;
    setVizLoading(true); setVizError("");
    workerRef.current?.terminate();

    // If Analyze was never clicked, run it silently now (non-blocking UI,
    // no error banner on failure — just falls through to heuristics).
    if (!vizSpec) {
      await runAnalysis(true);
    }

    // Derive legacy type string (fallback for when vizSpec is absent)
    const vizType = getVisualType(aiAnalysis);

    // Which problem types should suppress the recursion tree
    const SUPPRESS_TREE_ENGINES = new Set([
      'MATRIX', 'N_QUEENS', 'GRAPH', 'HEAP', 'SORTING', 'BINARY_SEARCH', 'SLIDING_WINDOW', 'DSU'
    ]);

    try {
      workerRef.current = new Worker(
        new URL("../WebWorker/TracerWorker.js", import.meta.url),
        { type: "module" }
      );

      workerRef.current.postMessage({
        url: `${BACKEND_URL}${TRACE_ENDPOINTS[language]}`,
        payload: { code: userCode, language, customInput },
        // ─── FULL AI METADATA (not just one string) ───────────────────────
        aiMetadata: {
          // Legacy field (used by name-matching heuristics as fallback)
          type: vizType ?? null,

          // NEW: full vizSpec drives all rendering decisions spec-first
          vizSpec: vizSpec ?? null,

          // Legacy variable list for FloatingVariables display
          allVars:   aiAnalysis?.variables ?? [],
          algorithm: aiAnalysis?.algorithm ?? null,

          // Explicit suppress flag (derived from vizSpec or legacy engine)
          suppressRecursionTree:
            vizSpec?.primary?.suppressRecursionTree ??
            SUPPRESS_TREE_ENGINES.has(vizType),
        },
      });

      workerRef.current.onmessage = ({ data }) => {
        setVizLoading(false);
        if (data.type === "SUCCESS" && data.payload?.trace?.length > 0) {
          fullTraceRef.current = data.payload.trace;
          setMaxSteps(data.payload.trace.length - 1);
          setCurrentStep(data.payload.trace[0]);
          setCurrentIndex(0);
          setIsPlaying(false);
          setView("visualizing");
        } else {
          setVizError(data.message || "No trace returned.");
        }
      };
      workerRef.current.onerror = () => {
        setVizLoading(false);
        setVizError("Worker error. Check browser console.");
      };
    } catch {
      setVizLoading(false);
      setVizError("Failed to start worker.");
    }
  };

  const handleEditorMount = (editor, monaco) => {
    editorRef.current = editor; monacoRef.current = monaco;
    monaco.editor.defineTheme("lc-dark", {
      base: "vs-dark", inherit: true,
      rules: [
        { token: "keyword", foreground: "ffa116" },
        { token: "string",  foreground: "00b8a3" },
        { token: "number",  foreground: "ffb800" },
        { token: "type",    foreground: "6ab0f5" },
      ],
      colors: {
        "editor.background": "#1a1a1a", "editor.foreground": "#eff2f5",
        "editor.lineHighlightBackground": "#262626",
        "editorLineNumber.foreground": "#4d4d4d",
        "editorLineNumber.activeForeground": "#8d8d8d",
        "editor.selectionBackground": "#ffa11640",
        "editorCursor.foreground": "#ffa116",
        "editorGutter.background": "#1a1a1a",
        "scrollbarSlider.background": "#2d2d2d",
        "scrollbarSlider.hoverBackground": "#3d3d3d",
      },
    });
    monaco.editor.setTheme("vs-dark");
  };

  const shared = { language, userCode, handleEditorMount, activeLine, view };

  const aiProps = {
    analysis:     aiAnalysis,
    isAnalyzing,
    error:        aiError,
    runState,
    primedEngine: getVisualType(aiAnalysis),
    vizSpec,      // ← NEW: pass vizSpec down so VisualPanel → PolymorphicRouter can use it
  };

  return (
    <>
      <style>{`
        .monaco-active-line { background: rgba(255,161,22,0.1) !important; border-left: 2px solid #ffa116; }
        .monaco-active-glyph::before { content: '▶'; color: #ffa116; font-size: 10px; margin-left: 4px; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #3d3d3d; border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: #555; }
        .panel-tab.active { color: #eff2f5; border-bottom: 2px solid #ffa116; }
        .panel-tab { color: #8d8d8d; border-bottom: 2px solid transparent; }
        input[type=range] { accent-color: #ffa116; }
        .icon-container { position: relative; display: flex; align-items: center; justify-content: center; width: 16px; height: 16px; }
        .explosion-ring { position: absolute; width: 100%; height: 100%; border-radius: 50%; border: 2px solid #ffa116; opacity: 0; pointer-events: none; }
        .animate-explosion { animation: ringBurst 0.6s ease-out forwards; }
        @keyframes ringBurst { 0% { transform: scale(0.3); opacity: 1; border-width: 4px; } 100% { transform: scale(3.5); opacity: 0; border-width: 0px; } }
        .icon-pop-in { animation: bounceIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
        @keyframes bounceIn { 0% { transform: scale(0) rotate(-45deg); opacity: 0; } 100% { transform: scale(1) rotate(0deg); opacity: 1; } }
      `}</style>

      <div className="flex flex-col h-screen bg-[#1a1a1a] text-[#eff2f5] overflow-hidden"
        style={{ fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif" }}>

        {/* ── HEADER ── */}
        <header className="flex items-center justify-between px-4 h-12 border-b border-[#3d3d3d] bg-[#282828] flex-shrink-0">
          <div className="flex items-center gap-3 flex-1">
            {view === "visualizing" && (
              <button onClick={() => { setView("editor"); setIsPlaying(false); }}
                className="flex items-center gap-1.5 text-xs text-[#8d8d8d] hover:text-[#eff2f5] transition-colors mr-2">
                <MdArrowBack /> Back
              </button>
            )}
            <VscDebugAlt className="text-[#ffa116] text-base" />
            <span className="text-xs font-semibold tracking-widest uppercase text-[#8d8d8d]">
              Trace<span className="text-[#ffa116]">Lab</span>
            </span>
            {/* Library optimized badge */}
            {libraryMatch && (
              <span className="px-2 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/30 text-[9px] font-mono text-emerald-400 uppercase tracking-widest">
                ✦ Optimized · {libraryMatch.problemId}
              </span>
            )}
            {/* vizSpec loaded (LLM-generated, not library) */}
            {vizSpec && !libraryMatch && (
              <span className="px-2 py-0.5 rounded bg-indigo-500/15 border border-indigo-500/30 text-[9px] font-mono text-indigo-400 uppercase tracking-widest">
                ✦ {vizSpec.problemName || 'Spec Loaded'}
              </span>
            )}
          </div>

          <div className="flex items-center justify-center gap-2 flex-1">
            {view === "editor" && (
              <>
                {/* Run */}
                <button onClick={handleRun} disabled={runState === "running"}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-md text-xs font-semibold bg-[#3e3e3e] hover:bg-[#4d4d4d] text-[#eff2f5] transition-all disabled:opacity-70 disabled:cursor-not-allowed">
                  {runState === "running" ? (
                    <><span className="w-3.5 h-3.5 border-2 border-[#eff2f5] border-t-transparent rounded-full animate-spin" />Running</>
                  ) : (
                    <><MdPlayArrow className="text-sm text-[#00b8a3]" /> Run</>
                  )}
                </button>

                {/* Visualize */}
                <button onClick={handleVisualize} disabled={!canVisualize || vizLoading}
                  title={!canVisualize ? "Run without errors first" : vizSpec ? `Visualize with spec: ${vizSpec.category}` : "Click to Visualize!"}
                  className={`relative overflow-hidden flex items-center gap-2 px-4 py-1.5 rounded-md text-xs font-semibold transition-all duration-300
                    ${canVisualize && !vizLoading ? "bg-[#3e3e3e] hover:bg-[#4d4d4d] text-[#ffa116]" : "bg-[#1a1a1a] text-[#4d4d4d] cursor-not-allowed"}
                    ${unlocking ? "bg-[#ffa116]/10 border border-[#ffa116]/30 shadow-[0_0_12px_rgba(255,161,22,0.15)]" : "border border-transparent"}`}>
                  {vizLoading ? (
                    <span className="w-3.5 h-3.5 border-2 border-[#ffa116] border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <div className="icon-container">
                      {unlocking && <div className="explosion-ring animate-explosion" />}
                      {!canVisualize ? <MdLock className="absolute text-sm text-[#4d4d4d]" /> : <VscDebugAlt className={`absolute text-sm ${unlocking ? "icon-pop-in text-[#ffa116]" : ""}`} />}
                    </div>
                  )}
                  <span>Visualize{vizSpec ? ' ✦' : ''}</span>
                </button>

                {/* Analyze */}
                <button onClick={handleAnalyze} disabled={isAnalyzing || !userCode.trim()}
                  title="AI Analyze — generates vizSpec for smart visualization"
                  className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-[#282828] hover:bg-[#3e3e3e] text-[#8ab4f8] transition-all disabled:opacity-40 disabled:cursor-not-allowed border border-[#3d3d3d]">
                  {isAnalyzing
                    ? <span className="w-3.5 h-3.5 border-2 border-[#8ab4f8] border-t-transparent rounded-full animate-spin" />
                    : <MdAutoAwesome className="text-sm" />}
                </button>
              </>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 flex-1">
            {view === "editor" && (
              <select value={language} onChange={(e) => setLanguage(e.target.value)}
                className="bg-[#1a1a1a] border border-[#3d3d3d] text-[#eff2f5] text-xs rounded-md px-3 py-1.5 outline-none focus:border-[#ffa116] transition-colors cursor-pointer">
                {LANGS.map((l) => (<option key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</option>))}
              </select>
            )}
          </div>
        </header>

        {view === "editor" ? (
          <EditorPanel {...shared}
            customInput={customInput} setCustomInput={setCustomInput}
            setUserCode={setUserCode} runOutput={runOutput} runState={runState}
            canVisualize={canVisualize} vizError={vizError} aiProps={aiProps}
          />
        ) : (
          <VisualPanel {...shared}
            currentStep={currentStep} currentIndex={currentIndex} maxSteps={maxSteps}
            isPlaying={isPlaying} speed={speed}
            setCurrentIndex={setCurrentIndex} setIsPlaying={setIsPlaying} setSpeed={setSpeed}
            aiProps={aiProps}
            vizSpec={vizSpec}    // ← NEW: pass vizSpec directly to VisualPanel
          />
        )}
      </div>
    </>
  );
};

export default VisualizerPage;