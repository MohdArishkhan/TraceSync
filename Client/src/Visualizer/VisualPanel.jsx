// import React, { useState } from "react";
// import Editor from "@monaco-editor/react";
// import {
//   MdPlayArrow, MdPause, MdSkipNext, MdSkipPrevious,
//   MdFastForward, MdFastRewind, MdTerminal, MdMemory, MdCode, MdLayers,
// } from "react-icons/md";

// import PolymorphicRouter from "../VisualEngine/PolymorphicRouter";

// const LANG_MONACO = { python: "python", javascript: "javascript", cpp: "cpp", java: "java" };

// // ─────────────────────────────────────────────────────────────────────────────
// //  DEBUG VALUE RENDERER
// // ─────────────────────────────────────────────────────────────────────────────
// const Val = ({ val }) => {
//   if (Array.isArray(val) && val[0] === "REF")
//     return <span className="text-[#6ab0f5] font-mono">@{val[1]}</span>;
//   if (Array.isArray(val) && ["FUNCTION", "JS_FUNCTION"].includes(val[0]))
//     return <span className="text-purple-400 font-mono">ƒ {val[1]}()</span>;
//   if (typeof val === "string")
//     return <span className="text-[#00b8a3] font-mono">"{val}"</span>;
//   if (val == null)
//     return <span className="text-[#4d4d4d] font-mono">{val === null ? "null" : "—"}</span>;
//   return <span className="text-[#ffb800] font-mono">{String(val)}</span>;
// };

// // ─────────────────────────────────────────────────────────────────────────────
// //  CALL-STACK PANEL
// // ─────────────────────────────────────────────────────────────────────────────
// const StackPanel = ({ frames = [] }) =>
//   frames.length === 0 ? (
//     <span className="text-[#4d4d4d] italic">Global scope — no frames</span>
//   ) : (
//     <div className="space-y-3">
//       {[...frames].reverse().map((frame, idx) => (
//         <div key={idx} className="rounded-lg overflow-hidden border border-[#3d3d3d] bg-[#262626]">
//           <div
//             className={`px-3 py-1.5 text-[10px] font-bold tracking-widest uppercase flex items-center gap-2 border-b border-[#3d3d3d] ${
//               idx === 0 ? "text-[#ffa116]" : "text-[#8d8d8d]"
//             }`}
//           >
//             {idx === 0 && <span className="w-1.5 h-1.5 rounded-full bg-[#ffa116]" />}
//             {frame.func_name}
//           </div>
//           <div className="p-3 space-y-1.5">
//             {frame.ordered_varnames?.length > 0 ? (
//               frame.ordered_varnames.map((v) => (
//                 <div key={v} className="flex justify-between items-center py-0.5">
//                   <span className="text-pink-400">{v}</span>
//                   <Val val={frame.encoded_locals[v]} />
//                 </div>
//               ))
//             ) : (
//               <span className="text-[#4d4d4d] italic">empty frame</span>
//             )}
//           </div>
//         </div>
//       ))}
//     </div>
//   );

// // ─────────────────────────────────────────────────────────────────────────────
// //  HEAP PANEL
// // ─────────────────────────────────────────────────────────────────────────────
// const HeapPanel = ({ heap = {} }) => {
//   const entries = Object.entries(heap);
//   return entries.length === 0 ? (
//     <span className="text-[#4d4d4d] italic">Heap is empty</span>
//   ) : (
//     <div className="space-y-2">
//       {entries.map(([id, value]) => (
//         <div key={id} className="rounded-lg border border-[#3d3d3d] bg-[#262626] p-3">
//           <div className="text-[#6ab0f5] text-[10px] font-bold mb-1.5">@{id}</div>
//           <span className="text-[#8d8d8d] break-all text-[11px]">
//             {Array.isArray(value)
//               ? `[${value.map((v) => (typeof v === "object" ? JSON.stringify(v) : v)).join(", ")}]`
//               : JSON.stringify(value)}
//           </span>
//         </div>
//       ))}
//     </div>
//   );
// };

// // ─────────────────────────────────────────────────────────────────────────────
// //  PLAYBACK BAR
// // ─────────────────────────────────────────────────────────────────────────────
// const NavBtn = ({ onClick, children }) => (
//   <button
//     onClick={onClick}
//     className="p-2 text-[#8d8d8d] hover:text-[#eff2f5] transition-colors rounded-lg hover:bg-white/5 flex items-center justify-center"
//   >
//     {children}
//   </button>
// );

// const PlaybackBar = ({
//   currentIndex, maxSteps, isPlaying, speed,
//   setCurrentIndex, setIsPlaying, setSpeed,
// }) => {
//   const progress = maxSteps > 0 ? (currentIndex / maxSteps) * 100 : 0;
//   return (
//     <div className="flex-shrink-0 border-t border-[#3d3d3d] bg-[#282828] z-10 w-full">
//       <div className="h-0.5 bg-[#3d3d3d]">
//         <div
//           className="h-full bg-[#ffa116] transition-all duration-200"
//           style={{ width: `${progress}%` }}
//         />
//       </div>
//       <div className="flex items-center justify-between px-6 h-14">
//         <div className="flex items-center gap-1">
//           <NavBtn onClick={() => setCurrentIndex(0)}><MdFastRewind className="text-lg" /></NavBtn>
//           <NavBtn onClick={() => setCurrentIndex((p) => Math.max(0, p - 1))}><MdSkipPrevious className="text-xl" /></NavBtn>
//           <button
//             onClick={() => setIsPlaying(!isPlaying)}
//             className="mx-1 w-9 h-9 flex items-center justify-center bg-[#ffa116] hover:bg-[#ffb800] text-[#1a1a1a] rounded-full transition-all shadow-[0_0_14px_rgba(255,161,22,0.45)]"
//           >
//             {isPlaying ? <MdPause className="text-lg" /> : <MdPlayArrow className="text-lg" />}
//           </button>
//           <NavBtn onClick={() => setCurrentIndex((p) => Math.min(maxSteps, p + 1))}><MdSkipNext className="text-xl" /></NavBtn>
//           <NavBtn onClick={() => setCurrentIndex(maxSteps)}><MdFastForward className="text-lg" /></NavBtn>
//         </div>

//         <div className="flex-1 mx-8 flex items-center gap-3">
//           <span className="text-[10px] font-mono text-[#4d4d4d] w-8 text-right tabular-nums">
//             {currentIndex}
//           </span>
//           <input
//             type="range" min="0" max={maxSteps} value={currentIndex}
//             onChange={(e) => setCurrentIndex(Number(e.target.value))}
//             className="flex-1 h-1 rounded-full cursor-pointer"
//           />
//           <span className="text-[10px] font-mono text-[#4d4d4d] w-8 tabular-nums">
//             {maxSteps}
//           </span>
//         </div>

//         <div className="flex items-center gap-2">
//           <span className="text-[10px] font-bold uppercase tracking-widest text-[#4d4d4d]">Speed</span>
//           <select
//             value={speed}
//             onChange={(e) => setSpeed(Number(e.target.value))}
//             className="bg-[#262626] border border-[#3d3d3d] text-xs rounded-md px-2 py-1 outline-none cursor-pointer text-[#8d8d8d] hover:border-[#555] transition-colors"
//           >
//             <option value={1000}>0.5×</option>
//             <option value={500}>1×</option>
//             <option value={250}>2×</option>
//             <option value={100}>4×</option>
//           </select>
//         </div>
//       </div>
//     </div>
//   );
// };

// // ─────────────────────────────────────────────────────────────────────────────
// //  MAIN VISUAL PANEL
// // ─────────────────────────────────────────────────────────────────────────────
// const TABS = [
//   { id: "output", label: "Stdout",     icon: MdTerminal },
//   { id: "stack",  label: "Call Stack", icon: MdLayers   },
//   { id: "heap",   label: "Heap",       icon: MdMemory   },
// ];

// // ✅ FIX #2: Remove h-[800px] fixed height — use flex-1 so the panel fills the
// //    remaining screen space correctly and the canvas gets real height to render in.
// const VisualPanel = ({
//   language = "python",
//   userCode = "",
//   handleEditorMount,
//   activeLine,
//   currentStep = {},
//   currentIndex = 0,
//   maxSteps = 0,
//   isPlaying = false,
//   speed = 500,
//   setCurrentIndex,
//   setIsPlaying,
//   setSpeed,
//   // aiProps intentionally unused here — PolymorphicRouter is self-contained
// }) => {
//   const [activeTab, setActiveTab] = useState("output");

//   return (
//     // ✅ FIX #2 (cont): was h-[800px], now flex-1 so it fills parent height properly
//     <div className="flex flex-col flex-1 w-full bg-[#1a1a1a] text-white overflow-hidden min-h-0">
//       <div className="flex flex-1 min-h-0 w-full">

//         {/* ── LEFT HALF: Code + State ── */}
//         <div className="flex w-1/2 border-r border-[#3d3d3d] min-w-0">

//           {/* Read-only source editor */}
//           <div className="flex-1 min-w-0 flex flex-col">
//             <div className="flex items-center justify-between px-4 h-8 bg-[#282828] border-b border-[#3d3d3d] flex-shrink-0">
//               <div className="flex items-center gap-2">
//                 <MdCode className="text-[#8d8d8d] text-xs" />
//                 <span className="text-[10px] tracking-widest uppercase text-[#8d8d8d] font-semibold">Source</span>
//               </div>
//               <span className="text-[10px] font-mono text-[#ffa116]">
//                 {activeLine ? `line ${activeLine}` : "—"}
//               </span>
//             </div>
//             <div className="flex-1 overflow-hidden relative">
//               <Editor
//                 height="100%"
//                 language={LANG_MONACO[language]}
//                 value={userCode}
//                 onMount={handleEditorMount}
//                 options={{
//                   readOnly: true, fontSize: 13, lineHeight: 21,
//                   fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
//                   fontLigatures: true, minimap: { enabled: false },
//                   scrollBeyondLastLine: false, padding: { top: 12, bottom: 12 },
//                   renderLineHighlight: "none", glyphMargin: true,
//                   lineNumbers: "on", wordWrap: "off", folding: false,
//                   contextmenu: false,
//                   scrollbar: { vertical: "auto", horizontal: "auto" },
//                 }}
//                 theme="vs-dark"
//               />
//             </div>
//           </div>

//           {/* State sidebar */}
//           <aside className="w-64 xl:w-80 flex flex-col border-l border-[#3d3d3d] bg-[#222] flex-shrink-0">
//             <div className="flex border-b border-[#3d3d3d] flex-shrink-0">
//               {TABS.map(({ id, label, icon: Icon }) => (
//                 <button
//                   key={id}
//                   onClick={() => setActiveTab(id)}
//                   className={`panel-tab flex items-center justify-center flex-1 gap-1.5 py-2.5 text-[10px] tracking-widest uppercase font-semibold transition-colors ${
//                     activeTab === id
//                       ? "text-[#eff2f5] border-b-2 border-[#ffa116]"
//                       : "text-[#8d8d8d] border-b-2 border-transparent"
//                   }`}
//                 >
//                   <Icon className="text-xs" />{label}
//                 </button>
//               ))}
//             </div>

//             <div className="flex-1 overflow-auto p-4 font-mono text-xs text-[#eff2f5]">
//               {activeTab === "output" && (
//                 <pre className="whitespace-pre-wrap text-[#8d8d8d] leading-relaxed">
//                   {currentStep.stdout || (
//                     <span className="text-[#4d4d4d] italic">no output yet</span>
//                   )}
//                 </pre>
//               )}
//               {activeTab === "stack" && (
//                 <StackPanel frames={currentStep.stack_to_render} />
//               )}
//               {activeTab === "heap" && (
//                 <HeapPanel heap={currentStep.heap} />
//               )}
//             </div>

//             <div className="border-t border-[#3d3d3d] px-4 py-2.5 flex items-center justify-between flex-shrink-0">
//               <span className="text-[10px] font-mono text-[#4d4d4d]">
//                 step {currentIndex + 1} / {maxSteps + 1}
//               </span>
//               {currentStep.event && (
//                 <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#ffa116]/10 text-[#ffa116] border border-[#ffa116]/20">
//                   {currentStep.event}
//                 </span>
//               )}
//             </div>
//           </aside>
//         </div>

//         {/* ── RIGHT HALF: Visualization Canvas ── */}
//         <div className="flex flex-col w-1/2 min-w-0 bg-[#0f172a] relative">
//           <div className="flex items-center px-4 h-8 bg-[#282828] border-b border-[#3d3d3d] flex-shrink-0">
//             <span className="text-[10px] tracking-widest uppercase text-[#8d8d8d] font-semibold">
//               Visualization Canvas
//             </span>
//           </div>

//           {/* ✅ FIX #3: Was missing min-h-0 — without it flex children can overflow
//               and the canvas collapses to 0 height, making all engines invisible. */}
//           <div className="flex-1 overflow-hidden relative min-h-0">
//             {/* ✅ FIX #1 (cont): PolymorphicRouter now receives currentStep which has
//                 the .structures[] array produced by TracerWorker. The old inline
//                 router was reading .vizType which no longer exists on frames. */}
//             <PolymorphicRouter currentFrame={currentStep} />
//           </div>
//         </div>
//       </div>

//       <PlaybackBar
//         currentIndex={currentIndex} maxSteps={maxSteps}
//         isPlaying={isPlaying} speed={speed}
//         setCurrentIndex={setCurrentIndex}
//         setIsPlaying={setIsPlaying}
//         setSpeed={setSpeed}
//       />
//     </div>
//   );
// };

// export default VisualPanel;
import React, { useState } from "react";
import Editor from "@monaco-editor/react";
import {
  MdPlayArrow, MdPause, MdSkipNext, MdSkipPrevious,
  MdFastForward, MdFastRewind, MdTerminal, MdMemory, MdCode, MdLayers,
} from "react-icons/md";

import PolymorphicRouter from "../VisualEngine/PolymorphicRouter";

const LANG_MONACO = { python: "python", javascript: "javascript", cpp: "cpp", java: "java" };

const Val = ({ val }) => {
  if (Array.isArray(val) && val[0] === "REF") return <span className="text-[#6ab0f5] font-mono">@{val[1]}</span>;
  if (Array.isArray(val) && ["FUNCTION", "JS_FUNCTION"].includes(val[0])) return <span className="text-purple-400 font-mono">ƒ {val[1]}()</span>;
  if (typeof val === "string") return <span className="text-[#00b8a3] font-mono">"{val}"</span>;
  if (val == null) return <span className="text-[#4d4d4d] font-mono">{val === null ? "null" : "—"}</span>;
  return <span className="text-[#ffb800] font-mono">{String(val)}</span>;
};

const StackPanel = ({ frames = [] }) =>
  frames.length === 0 ? (<span className="text-[#4d4d4d] italic">Global scope — no frames</span>) : (
    <div className="space-y-3">
      {[...frames].reverse().map((frame, idx) => (
        <div key={idx} className="rounded-lg overflow-hidden border border-[#3d3d3d] bg-[#262626]">
          <div className={`px-3 py-1.5 text-[10px] font-bold tracking-widest uppercase flex items-center gap-2 border-b border-[#3d3d3d] ${idx === 0 ? "text-[#ffa116]" : "text-[#8d8d8d]"}`}>
            {idx === 0 && <span className="w-1.5 h-1.5 rounded-full bg-[#ffa116]" />}
            {frame.func_name}
          </div>
          <div className="p-3 space-y-1.5">
            {frame.ordered_varnames?.length > 0 ? (frame.ordered_varnames.map((v) => (
                <div key={v} className="flex justify-between items-center py-0.5">
                  <span className="text-pink-400">{v}</span><Val val={frame.encoded_locals[v]} />
                </div>
              ))
            ) : (<span className="text-[#4d4d4d] italic">empty frame</span>)}
          </div>
        </div>
      ))}
    </div>
  );

const HeapPanel = ({ heap = {} }) => {
  const entries = Object.entries(heap);
  return entries.length === 0 ? (<span className="text-[#4d4d4d] italic">Heap is empty</span>) : (
    <div className="space-y-2">
      {entries.map(([id, value]) => (
        <div key={id} className="rounded-lg border border-[#3d3d3d] bg-[#262626] p-3">
          <div className="text-[#6ab0f5] text-[10px] font-bold mb-1.5">@{id}</div>
          <span className="text-[#8d8d8d] break-all text-[11px]">{Array.isArray(value) ? `[${value.map((v) => (typeof v === "object" ? JSON.stringify(v) : v)).join(", ")}]` : JSON.stringify(value)}</span>
        </div>
      ))}
    </div>
  );
};

const NavBtn = ({ onClick, children }) => (
  <button onClick={onClick} className="p-2 text-[#8d8d8d] hover:text-[#eff2f5] transition-colors rounded-lg hover:bg-white/5 flex items-center justify-center">{children}</button>
);

const PlaybackBar = ({ currentIndex, maxSteps, isPlaying, speed, setCurrentIndex, setIsPlaying, setSpeed }) => {
  const progress = maxSteps > 0 ? (currentIndex / maxSteps) * 100 : 0;
  return (
    <div className="flex-shrink-0 border-t border-[#3d3d3d] bg-[#282828] z-10 w-full">
      <div className="h-0.5 bg-[#3d3d3d]"><div className="h-full bg-[#ffa116] transition-all duration-200" style={{ width: `${progress}%` }} /></div>
      <div className="flex items-center justify-between px-6 h-14">
        <div className="flex items-center gap-1">
          <NavBtn onClick={() => setCurrentIndex(0)}><MdFastRewind className="text-lg" /></NavBtn>
          <NavBtn onClick={() => setCurrentIndex((p) => Math.max(0, p - 1))}><MdSkipPrevious className="text-xl" /></NavBtn>
          <button onClick={() => setIsPlaying(!isPlaying)} className="mx-1 w-9 h-9 flex items-center justify-center bg-[#ffa116] hover:bg-[#ffb800] text-[#1a1a1a] rounded-full transition-all shadow-[0_0_14px_rgba(255,161,22,0.45)]">
            {isPlaying ? <MdPause className="text-lg" /> : <MdPlayArrow className="text-lg" />}
          </button>
          <NavBtn onClick={() => setCurrentIndex((p) => Math.min(maxSteps, p + 1))}><MdSkipNext className="text-xl" /></NavBtn>
          <NavBtn onClick={() => setCurrentIndex(maxSteps)}><MdFastForward className="text-lg" /></NavBtn>
        </div>
        <div className="flex-1 mx-8 flex items-center gap-3">
          <span className="text-[10px] font-mono text-[#4d4d4d] w-8 text-right tabular-nums">{currentIndex}</span>
          <input type="range" min="0" max={maxSteps} value={currentIndex} onChange={(e) => setCurrentIndex(Number(e.target.value))} className="flex-1 h-1 rounded-full cursor-pointer" />
          <span className="text-[10px] font-mono text-[#4d4d4d] w-8 tabular-nums">{maxSteps}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#4d4d4d]">Speed</span>
          <select value={speed} onChange={(e) => setSpeed(Number(e.target.value))} className="bg-[#262626] border border-[#3d3d3d] text-xs rounded-md px-2 py-1 outline-none cursor-pointer text-[#8d8d8d] hover:border-[#555] transition-colors">
            <option value={1000}>0.5×</option><option value={500}>1×</option><option value={250}>2×</option><option value={100}>4×</option>
          </select>
        </div>
      </div>
    </div>
  );
};

const TABS = [
  { id: "output", label: "Stdout", icon: MdTerminal },
  { id: "stack", label: "Call Stack", icon: MdLayers },
  { id: "heap", label: "Heap", icon: MdMemory },
];

const VisualPanel = ({
  language = "python", userCode = "", handleEditorMount, activeLine,
  currentStep = {}, currentIndex = 0, maxSteps = 0,
  isPlaying = false, speed = 500,
  setCurrentIndex, setIsPlaying, setSpeed,
  aiProps // 👇 Pura file same, bas isko access kiya
}) => {
  const [activeTab, setActiveTab] = useState("output");

  return (
    <div className="flex flex-col flex-1 w-full bg-[#1a1a1a] text-white overflow-hidden min-h-0">
      <div className="flex flex-1 min-h-0 w-full">
        <div className="flex w-1/2 border-r border-[#3d3d3d] min-w-0">
          <div className="flex-1 min-w-0 flex flex-col">
            <div className="flex items-center justify-between px-4 h-8 bg-[#282828] border-b border-[#3d3d3d] flex-shrink-0">
              <div className="flex items-center gap-2">
                <MdCode className="text-[#8d8d8d] text-xs" />
                <span className="text-[10px] tracking-widest uppercase text-[#8d8d8d] font-semibold">Source</span>
              </div>
              <span className="text-[10px] font-mono text-[#ffa116]">{activeLine ? `line ${activeLine}` : "—"}</span>
            </div>
            <div className="flex-1 overflow-hidden relative">
              <Editor height="100%" language={LANG_MONACO[language]} value={userCode} onMount={handleEditorMount} options={{ readOnly: true, fontSize: 13, lineHeight: 21, fontFamily: "'JetBrains Mono', 'Fira Code', monospace", fontLigatures: true, minimap: { enabled: false }, scrollBeyondLastLine: false, padding: { top: 12, bottom: 12 }, renderLineHighlight: "none", glyphMargin: true, lineNumbers: "on", wordWrap: "off", folding: false, contextmenu: false, scrollbar: { vertical: "auto", horizontal: "auto" } }} theme="vs-dark" />
            </div>
          </div>
          <aside className="w-64 xl:w-80 flex flex-col border-l border-[#3d3d3d] bg-[#222] flex-shrink-0">
            <div className="flex border-b border-[#3d3d3d] flex-shrink-0">
              {TABS.map(({ id, label, icon: Icon }) => (
                <button key={id} onClick={() => setActiveTab(id)} className={`panel-tab flex items-center justify-center flex-1 gap-1.5 py-2.5 text-[10px] tracking-widest uppercase font-semibold transition-colors ${activeTab === id ? "text-[#eff2f5] border-b-2 border-[#ffa116]" : "text-[#8d8d8d] border-b-2 border-transparent"}`}><Icon className="text-xs" />{label}</button>
              ))}
            </div>
            <div className="flex-1 overflow-auto p-4 font-mono text-xs text-[#eff2f5]">
              {activeTab === "output" && (<pre className="whitespace-pre-wrap text-[#8d8d8d] leading-relaxed">{currentStep.stdout || (<span className="text-[#4d4d4d] italic">no output yet</span>)}</pre>)}
              {activeTab === "stack" && (<StackPanel frames={currentStep.stack_to_render} />)}
              {activeTab === "heap" && (<HeapPanel heap={currentStep.heap} />)}
            </div>
            <div className="border-t border-[#3d3d3d] px-4 py-2.5 flex items-center justify-between flex-shrink-0">
              <span className="text-[10px] font-mono text-[#4d4d4d]">step {currentIndex + 1} / {maxSteps + 1}</span>
              {currentStep.event && (<span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#ffa116]/10 text-[#ffa116] border border-[#ffa116]/20">{currentStep.event}</span>)}
            </div>
          </aside>
        </div>

        <div className="flex flex-col w-1/2 min-w-0 bg-[#0f172a] relative">
          <div className="flex items-center px-4 h-8 bg-[#282828] border-b border-[#3d3d3d] flex-shrink-0">
            <span className="text-[10px] tracking-widest uppercase text-[#8d8d8d] font-semibold">Visualization Canvas</span>
          </div>

          <div className="flex-1 overflow-hidden relative min-h-0">
            {/* 👇 AI se mila hua data router mein pass kar diya */}
            <PolymorphicRouter 
              currentFrame={currentStep} 
              aiFallbackEngine={aiProps?.primedEngine}
              aiVariables={aiProps?.analysis?.variables}
            />
          </div>
        </div>
      </div>

      <PlaybackBar currentIndex={currentIndex} maxSteps={maxSteps} isPlaying={isPlaying} speed={speed} setCurrentIndex={setCurrentIndex} setIsPlaying={setIsPlaying} setSpeed={setSpeed} />
    </div>
  );
};

export default VisualPanel;
