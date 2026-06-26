import React from "react";
import Editor from "@monaco-editor/react";
import { MdTerminal, MdCheckCircle, MdError, MdInfoOutline } from "react-icons/md";
import { AIAssistant } from "../pages/Artificial_integration.jsx";

const LANG_MONACO = { python: "python", javascript: "javascript", cpp: "cpp", java: "java" };

const SideLabel = ({ icon: Icon, label }) => (
  <div className="flex items-center gap-2 px-3 py-2 border-b border-[#3d3d3d]">
    <Icon className="text-[#8d8d8d] text-xs" />
    <span className="text-[10px] tracking-widest uppercase text-[#8d8d8d] font-semibold">{label}</span>
  </div>
);

const EditorPanel = ({
  language, userCode, setUserCode,
  customInput, setCustomInput,
  runOutput, runState, canVisualize, vizError,
  handleEditorMount, aiProps,
}) => (
  <div className="flex flex-1 min-h-0">

    {/* ── Monaco Editor ── */}
    <div className="flex-1 min-w-0 flex flex-col">
      <Editor
        height="100%"
        language={LANG_MONACO[language]}
        value={userCode}
        onChange={(v) => setUserCode(v || "")}
        onMount={handleEditorMount}
        options={{
          fontSize: 14, lineHeight: 22,
          fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
          fontLigatures: true,
          minimap: { enabled: true, scale: 1 },
          scrollBeyondLastLine: false,
          padding: { top: 16, bottom: 16 },
          renderLineHighlight: "all",
          smoothScrolling: true,
          cursorSmoothCaretAnimation: "on",
          glyphMargin: false, folding: true,
          wordWrap: "off", lineNumbers: "on", tabSize: 2,
        }}
        theme="vs-dark"
      />
    </div>

    {/* ── Right Sidebar ── */}
    <aside className="w-64 flex flex-col border-l border-[#3d3d3d] bg-[#222] flex-shrink-0">

      {/* Stdin */}
      <div className="flex flex-col border-b border-[#3d3d3d]">
        <SideLabel icon={MdTerminal} label="Stdin" />
        <textarea
          value={customInput}
          onChange={(e) => setCustomInput(e.target.value)}
          placeholder="Optional input…"
          className="bg-transparent p-3 text-xs font-mono text-[#8d8d8d] resize-none outline-none placeholder-[#4d4d4d] h-28 w-full custom-scrollbar"
        />
      </div>

      {/* Output */}
      <div className="flex flex-col flex-1 min-h-0 border-b border-[#3d3d3d]">
        <SideLabel icon={MdTerminal} label="Output" />
        <div className="flex-1 overflow-auto p-3 flex flex-col custom-scrollbar">
          
          {vizError && (
            <div className="text-[#ef4743] text-xs font-mono mb-2 bg-[#ef474315] rounded p-2 border border-[#ef474330] flex-shrink-0">
              {vizError}
            </div>
          )}
          
          <div className="flex items-center mb-2 flex-shrink-0">
            {runState === "success" && (
              <div className="flex items-center gap-1.5 text-xs font-mono text-[#00b8a3]">
                <MdCheckCircle className="text-sm" /> Ran successfully
              </div>
            )}
            {runState === "error" && (
              <div className="flex items-center gap-1.5 text-xs font-mono text-[#ef4743]">
                <MdError className="text-sm" /> Runtime error
              </div>
            )}
          </div>
          
          {/* 👇 GRACEFUL OUTPUT HANDLING YAHAN HAI 👇 */}
          <div className="flex-1 flex flex-col">
            {runState === "idle" ? (
              <div className="flex-1 flex flex-col items-center justify-center text-[#4d4d4d] opacity-60 mt-4">
                <MdTerminal className="text-2xl mb-1.5" />
                <span className="text-[11px] font-medium tracking-wide">Hit Run to execute</span>
              </div>
            ) : runOutput ? (
              <pre className={`text-xs font-mono whitespace-pre-wrap leading-relaxed ${runState === "error" ? "text-[#ef4743]" : "text-[#8d8d8d]"}`}>
                {runOutput}
              </pre>
            ) : (
              <div className="flex flex-col items-center justify-center text-[#666] bg-[#1a1a1a]/40 rounded-lg border border-dashed border-[#3d3d3d] p-4 text-center mt-2">
                <MdInfoOutline className="text-lg mb-1.5 text-[#555]" />
                <span className="text-[11px] italic">Program finished</span>
                <span className="text-[10px] text-[#4d4d4d] mt-0.5">No output generated</span>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Unlock hint */}
      {canVisualize && (
        <div className={`p-3 border-b border-[#3d3d3d] flex-shrink-0 ${runState === "error" ? "bg-[#ef4743]/5" : "bg-[#ffa116]/5"}`}>
          <p className={`text-[10px] leading-relaxed ${runState === "error" ? "text-[#ef4743]" : "text-[#ffa116]"}`}>
            {runState === "error"
              ? "⚠ Runtime error — partial trace available."
              : "✓ Code ran cleanly — Visualize is unlocked."}
          </p>
        </div>
      )}

      <AIAssistant {...aiProps} />
    </aside>
  </div>
);

export default EditorPanel;