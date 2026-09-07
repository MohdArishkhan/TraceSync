import React, { useEffect, useRef, useState } from "react";
import "../App.css";
import { toast, Toaster } from "react-hot-toast";
import { motion } from "framer-motion";
import { GoAlertFill } from "react-icons/go";
import { useAppContext } from "../Context/AppContext";
import { useNavigate } from "react-router-dom";
import { FiPlay, FiCopy, FiTerminal, FiX, FiTrash2, FiCheckCircle, FiAlertTriangle } from "react-icons/fi";
import axios from "axios";

// Import Yjs, Monaco binding, and IndexedDB for CRDT Collaboration & Caching
import * as Y from "yjs";
import { MonacoBinding } from "y-monaco";
import { IndexeddbPersistence } from "y-indexeddb";

const MonacoEditor = React.lazy(() => import("@monaco-editor/react"));

const LANGUAGE_MAP = {
  javascript: { language: "javascript", version: "*" },
  python: { language: "python", version: "*" },
  java: { language: "java", version: "*" },
  cpp: { language: "cpp", version: "*" },
  c: { language: "c", version: "*" },
  csharp: { language: "csharp", version: "*" },
  php: { language: "php", version: "*" },
  go: { language: "go", version: "*" },
  rust: { language: "rust", version: "*" },
  ruby: { language: "ruby", version: "*" },
  sql: { language: "sql", version: "*" },
  html: { language: "html", version: "*" },
  typescript: { language: "typescript", version: "*" },
};

const OUTPUT_MIN_HEIGHT = 140;
const OUTPUT_MAX_HEIGHT = 560;
const OUTPUT_DEFAULT_HEIGHT = 260;

const CodeEditor = ({ socketRef, roomid, username, codeChange, setfileContent, isLightMode }) => {
  const editorRef = useRef(null);
  const navigate = useNavigate();
  const { addFileToRecycleBin, BACKEND_URL } = useAppContext();

  // Yjs Refs for Real-Time Collaboration
  const ydocRef = useRef(null);
  const ytextRef = useRef(null);
  const bindingRef = useRef(null);
  const previousCodeRef = useRef(""); // To track code for the recycle bin

  // State management
  const [open, setopen] = useState(false);
  const [fileName, setfileName] = useState("");
  const [whoChangedCode, setWhoChangedCode] = useState("");
  const [FileRecoveryCode, setFileRecoveryCode] = useState("");
  const [isExist, setisExist] = useState(false);
  const [language, setLanguage] = useState("javascript");
  const [code, setCode] = useState("");
  const [stdin, setStdin] = useState("");
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState(null);
  const [showOutput, setShowOutput] = useState(false);
  const [outputHeight, setOutputHeight] = useState(OUTPUT_DEFAULT_HEIGHT);
  const isResizingRef = useRef(false);

  const handleCloseDialoug = () => {
    setopen(false);
    setfileName("");
  };

  const TRACE_ENDPOINTS = {
    python: "/api/execute/trace-py",
    javascript: "/api/execute/trace-js",
    java: "/api/execute/trace-java",
    cpp: "/api/execute/trace-cpp",
    sql: "/api/execute/trace-sql",
  };

  const executeCode = async () => {
    if (!code.trim()) {
      toast.error("Please write some code first!");
      return;
    }

    setIsExecuting(true);
    try {
      const languageConfig = LANGUAGE_MAP[language];
      if (!languageConfig) {
        toast.error("Language execution not supported");
        setIsExecuting(false);
        return;
      }

      const jdoodleUrl = `${BACKEND_URL}/api/execute/execute`;
      let jdoodleResponse;
      const tracePath = TRACE_ENDPOINTS[language];

      if (tracePath) {
        const traceUrl = `${BACKEND_URL}${tracePath}`;
        const jdoodlePromise = axios.post(jdoodleUrl, { language, code, stdin }, { timeout: 35000 });
        const tracePromise = axios.post(traceUrl, { language, code }, { timeout: 35000 });

        const [jdoodleRes, traceRes] = await Promise.allSettled([jdoodlePromise, tracePromise]);

        if (jdoodleRes.status === "fulfilled") {
          jdoodleResponse = jdoodleRes.value;
        } else {
          throw jdoodleRes.reason;
        }

        if (traceRes.status === "fulfilled" && traceRes.value.data.trace) {
          console.log(`${language} Execution Trace:`, traceRes.value.data.trace);
        } else {
          console.error(`${language} Tracer API Error:`, traceRes.reason || "No trace found");
        }
      } else {
        jdoodleResponse = await axios.post(jdoodleUrl, { language, code, stdin }, { timeout: 35000 });
      }

      if (jdoodleResponse.data.status === 0) {
        throw new Error(jdoodleResponse.data.error || "Code execution failed");
      }

      const result = jdoodleResponse.data.data;
      setOutputHeight(OUTPUT_DEFAULT_HEIGHT);
      setShowOutput(true);

      const hasError = result.stderr && result.stderr.trim().length > 0;
      const executeFailed = result.isExecuteSuccess === false;

      if (hasError || executeFailed) {
        setExecutionResult({
          output: result.stdout || "",
          error: result.stderr || "Execution failed",
          statusId: 5,
          statusName: "Runtime Error",
          exitCode: result.statusCode ?? 1,
          memory: result.memory,
          cpuTime: result.cpuTime,
        });
        toast.error("Execution error!");
      } else {
        setExecutionResult({
          output: result.stdout || "",
          error: "",
          statusId: 3,
          statusName: "Success",
          exitCode: result.statusCode ?? 0,
          memory: result.memory,
          cpuTime: result.cpuTime,
        });
        toast.success("Code executed successfully!");
      }
    } catch (error) {
      console.error("❌ Execution error:", error);
      let errorMessage = "Error executing code";

      if (error.response?.status === 404) {
        errorMessage = "Backend endpoint not found (404). Check if backend server is running.";
      } else if (error.response?.status === 500) {
        errorMessage = error.response?.data?.error || "Backend server error (500)";
      } else if (error.code === "ECONNREFUSED") {
        errorMessage = "Cannot connect to backend. Is the server running?";
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast.error(errorMessage);
      setExecutionResult({
        output: "",
        error: errorMessage,
        statusId: -1,
        statusName: "Error",
      });
      setOutputHeight(OUTPUT_DEFAULT_HEIGHT);
      setShowOutput(true);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleAddingToRecycleBin = async () => {
    if (fileName.trim() === "") {
      toast.error("File name cannot be empty");
      return;
    }
    const response = await addFileToRecycleBin({
      removedBy: whoChangedCode,
      fileContent: FileRecoveryCode,
      fileName: fileName,
    });
    if (response.data.status == 2) {
      setisExist(true);
    } else {
      setisExist(false);
      if (response.data.status == 0) {
        toast.error("Error adding file to recycle bin");
        setfileName("");
      } else {
        toast.success("File added to recycle bin");
        handleCloseDialoug();
      }
    }
  };

  // ---------------------------------------------------------
  // TIER 1 & 2: Local Cache (IndexedDB) & WebSockets
  // ---------------------------------------------------------
  useEffect(() => {
    if (!socketRef.current) return;

    ydocRef.current = new Y.Doc();
    ytextRef.current = ydocRef.current.getText("monaco");

    // TIER 1: Instantly load from browser cache on refresh
    const indexeddbProvider = new IndexeddbPersistence(`tracesync-${roomid}`, ydocRef.current);

    indexeddbProvider.on("synced", () => {
      const cachedCode = ytextRef.current.toString();
      setCode(cachedCode);
      if (setfileContent) setfileContent(cachedCode);
      previousCodeRef.current = cachedCode;
    });

    // TIER 2: Listen for local editor changes and broadcast binary update
    ydocRef.current.on("update", (update, origin) => {
      if (origin !== "remote") {
        socketRef.current.emit("yjs-update", {
          roomid,
          username,
          update: Array.from(update), 
        });
      }
    });

    // Listen for remote updates from other users and apply them mathematically
    socketRef.current.on("yjs-update", ({ update, username: updaterName }) => {
      if (update) {
        Y.applyUpdate(ydocRef.current, new Uint8Array(update), "remote");
        
        const currentCode = ytextRef.current.toString();
        
        if (currentCode === "" && previousCodeRef.current.trim().length > 1) {
          setWhoChangedCode(updaterName || "Another User");
          setFileRecoveryCode(previousCodeRef.current);
          setopen(true);
        }
        
        previousCodeRef.current = currentCode;
      }
    });

    return () => {
      if (socketRef.current) socketRef.current.off("yjs-update");
      if (bindingRef.current) bindingRef.current.destroy();
      indexeddbProvider.destroy(); // Clean up IndexedDB connection
      if (ydocRef.current) ydocRef.current.destroy();
    };
  }, [socketRef.current, roomid, username, setfileContent]);

  // ---------------------------------------------------------
  // TIER 3: The Debounce Trigger (Tells backend to save)
  // ---------------------------------------------------------
  useEffect(() => {
    if (!code || !roomid) return;

    // Set a timer. When you stop typing for 3 seconds, ask backend to save.
    const saveTimer = setTimeout(() => {
      if (socketRef.current) {
        socketRef.current.emit("trigger-db-save", { 
          roomid, 
          codeContent: code 
        });
      }
    }, 3000);

    // Cleanup: If user types again before 3 seconds, cancel the timer
    return () => clearTimeout(saveTimer);
  }, [code, roomid, socketRef]);

  const handleEditorChange = (value) => {
    setCode(value || "");
    codeChange(value || "");
    setfileContent(value || "");
    previousCodeRef.current = value || "";
  };

  const handleEditorMount = (editor, monaco) => {
    editorRef.current = editor;
    editor.updateOptions({
      theme: isLightMode ? "vs" : "vs-dark",
      fontSize: 14,
      fontFamily: "'Fira Code', 'Courier New', monospace",
      minimap: { enabled: true },
      wordWrap: "on",
      formatOnPaste: true,
      formatOnType: true,
      autoClosingBrackets: "always",
      autoClosingQuotes: "always",
    });

    if (ydocRef.current && ytextRef.current) {
      bindingRef.current = new MonacoBinding(
        ytextRef.current,
        editor.getModel(),
        new Set([editor])
      );
    }
  };

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.updateOptions({
        theme: isLightMode ? "vs" : "vs-dark",
      });
    }
  }, [isLightMode]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(code);
    toast.success("Code copied to clipboard!");
  };

  const handleResizeMouseDown = (e) => {
    e.preventDefault();
    isResizingRef.current = true;
    const startY = e.clientY;
    const startHeight = outputHeight;
    document.body.style.cursor = "row-resize";
    document.body.style.userSelect = "none";

    const onMouseMove = (moveEvent) => {
      if (!isResizingRef.current) return;
      const delta = startY - moveEvent.clientY;
      const newHeight = Math.min(OUTPUT_MAX_HEIGHT, Math.max(OUTPUT_MIN_HEIGHT, startHeight + delta));
      setOutputHeight(newHeight);
    };
    const onMouseUp = () => {
      isResizingRef.current = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  };

  return (
    <>
      <Toaster />
      {open && (
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center h-screen justify-center bg-black/30"
        >
          <div
            className={`rounded-2xl m-6 lg:m-0 p-4 h-auto shadow-lg lg:p-6 w-full max-w-md flex flex-col gap-5 ${
              isLightMode ? "bg-white" : "bg-gray-950"
            }`}
          >
            <div className="flex flex-col sm:flex-row bg-transparent gap-4 sm:gap-7 my-3 items-center w-[100%] px-3">
              <GoAlertFill className="bg-transparent text-[#F0C21C] text-5xl" />
              <div className={`${isLightMode ? "text-black" : "text-white"} text-sm font-light flex flex-col`}>
                <p>
                  Code is trying to be deleted by <span className="font-bold">{whoChangedCode}.</span>
                </p>
                <p>Provide file name to store in Recycle Bin</p>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label
                htmlFor="myFileName"
                className={`text-sm font-medium ${isLightMode ? "text-gray-700" : "text-white"}`}
              >
                File Name:
              </label>
              <input
                type="text"
                id="myFileName"
                placeholder="Enter File Name"
                value={fileName}
                onChange={(e) => setfileName(e.target.value)}
                className={`p-2 rounded-lg border focus:outline-none focus:ring-2 transition w-full ${
                  isLightMode
                    ? "border-gray-300 focus:ring-blue-500 text-gray-900 bg-white"
                    : "border-gray-700 focus:ring-green-500 text-white bg-black placeholder-gray-400"
                }`}
              />
            </div>

            {isExist && (
              <p className="text-red-500 text-center lg:text-start text-sm lg:text-1xl">
                **File with same name already exist
              </p>
            )}
            <div className="flex flex-col sm:flex-row sm:justify-between gap-3">
              <button
                onClick={() => handleAddingToRecycleBin()}
                className="text-white px-4 py-2 rounded-lg text-sm md:text-base transition-all hover:scale-95 active:scale-90 w-full sm:w-auto bg-green-600 hover:bg-green-700 active:bg-green-800"
              >
                Add to Recycle Bin
              </button>
              <button
                onClick={() => handleCloseDialoug()}
                className={`text-white px-4 py-2 rounded-lg text-sm md:text-base transition-all hover:scale-95 active:scale-90 w-full sm:w-auto ${
                  isLightMode
                    ? "bg-blue-600 hover:bg-blue-700 active:bg-blue-800"
                    : "bg-gray-800 hover:bg-gray-700 active:bg-gray-600"
                }`}
              >
                Close
              </button>
            </div>

            <button
              type="button"
              className={`cursor-pointer text-end text-sm hover:underline ${
                isLightMode ? "text-blue-700" : "text-green-400"
              }`}
              onClick={() => navigate("/RecycleBinFolderPage")}
            >
              View Recycle Bin
            </button>
          </div>
        </motion.div>
      )}

      {/* Main Editor Container */}
      <div className={`w-full h-full flex flex-col ${isLightMode ? "bg-white" : "bg-[#1E1E1E]"}`}>
        {/* Toolbar */}
        <div
          className={`flex items-center justify-between p-3 border-b gap-3 flex-wrap ${
            isLightMode ? "bg-gray-100 border-gray-300" : "bg-[#252526] border-gray-700"
          }`}
        >
          <div className="flex items-center gap-3">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className={`px-3 py-1 rounded text-sm font-medium transition ${
                isLightMode
                  ? "bg-white border border-gray-300 text-gray-900"
                  : "bg-[#3E3E42] border border-gray-600 text-white"
              }`}
            >
              <option value="python">Python</option>
              <option value="javascript">JavaScript</option>
              <option value="cpp">C++</option>
              <option value="java">Java</option>
              <option value="sql">SQL</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={copyToClipboard}
              className={`flex items-center gap-2 px-3 py-1 rounded text-sm font-medium transition hover:scale-95 ${
                isLightMode
                  ? "bg-gray-200 hover:bg-gray-300 text-gray-900"
                  : "bg-[#3E3E42] hover:bg-[#454547] text-white"
              }`}
              title="Copy code to clipboard"
            >
              <FiCopy size={16} /> Copy
            </button>

            <button
              onClick={executeCode}
              disabled={isExecuting}
              className={`flex items-center gap-2 px-4 py-1 rounded text-sm font-medium transition hover:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
                isExecuting ? "bg-yellow-500 text-white" : "bg-green-600 hover:bg-green-700 text-white"
              }`}
            >
              <FiPlay size={16} /> {isExecuting ? "Running..." : "Run Code"}
            </button>
          </div>
        </div>

        {/* Editor + Side panel */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden min-h-0">
          {/* Monaco Editor */}
          <div className="flex-1 min-h-[280px] lg:min-h-0 overflow-hidden">
            <React.Suspense
              fallback={
                <div
                  className={`w-full h-full flex items-center justify-center ${
                    isLightMode ? "bg-gray-50" : "bg-[#1E1E1E]"
                  }`}
                >
                  <p className={isLightMode ? "text-gray-600" : "text-gray-400"}>Loading Editor...</p>
                </div>
              }
            >
              <MonacoEditor
                height="100%"
                language={language}
                value={code}
                onChange={handleEditorChange}
                onMount={handleEditorMount}
                theme={isLightMode ? "vs" : "vs-dark"}
                options={{
                  minimap: { enabled: true },
                  fontSize: 14,
                  fontFamily: "'Fira Code', 'Courier New', monospace",
                  wordWrap: "on",
                  formatOnPaste: true,
                  formatOnType: true,
                  autoClosingBrackets: "always",
                  autoClosingQuotes: "always",
                  bracketPairColorization: true,
                  "bracketPairColorization.independentColorPoolPerBracketType": true,
                  scrollBeyondLastLine: false,
                  smoothScrolling: true,
                  cursorBlinking: "smooth",
                }}
              />
            </React.Suspense>
          </div>

          {/* Side panel */}
          <div
            className={`flex flex-col w-full lg:w-[380px] xl:w-[420px] flex-shrink-0 border-t lg:border-t-0 lg:border-l min-h-[260px] lg:min-h-0 ${
              isLightMode ? "bg-gray-50 border-gray-300" : "bg-[#1E1E1E] border-gray-700"
            }`}
          >
            {/* Input section */}
            <div className={`flex flex-col min-h-[140px] ${showOutput ? "flex-shrink-0" : "flex-1"}`}>
              <div
                className={`flex items-center justify-between px-3 py-2 border-b ${
                  isLightMode ? "border-gray-300 bg-gray-100" : "border-gray-700 bg-[#252526]"
                }`}
              >
                <div
                  className={`flex items-center gap-2 text-sm font-semibold ${
                    isLightMode ? "text-gray-800" : "text-gray-200"
                  }`}
                >
                  <FiTerminal size={15} />
                  Input <span className="font-normal opacity-60">(stdin)</span>
                </div>
                {stdin.length > 0 && (
                  <button
                    onClick={() => setStdin("")}
                    title="Clear input"
                    className={`flex items-center gap-1 text-xs px-2 py-1 rounded transition ${
                      isLightMode
                        ? "bg-gray-200 hover:bg-gray-300 text-gray-700"
                        : "bg-[#3E3E42] hover:bg-[#454547] text-gray-200"
                    }`}
                  >
                    <FiTrash2 size={12} /> Clear
                  </button>
                )}
              </div>
              <textarea
                value={stdin}
                onChange={(e) => setStdin(e.target.value)}
                placeholder={"Type any input your program reads...\nLeave empty if not needed."}
                spellCheck={false}
                className={`flex-1 w-full p-3 text-sm font-mono resize-none focus:outline-none ${
                  isLightMode
                    ? "bg-white text-gray-900 placeholder-gray-400"
                    : "bg-[#1E1E1E] text-gray-100 placeholder-gray-500"
                }`}
              />
            </div>

            {/* Output section */}
            {showOutput && (
              <>
                <div
                  onMouseDown={handleResizeMouseDown}
                  title="Drag to resize"
                  className={`h-1.5 w-full cursor-row-resize flex-shrink-0 transition ${
                    isLightMode ? "bg-gray-300 hover:bg-gray-400" : "bg-gray-700 hover:bg-gray-600"
                  }`}
                />
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{ height: outputHeight }}
                  className={`flex flex-col flex-shrink-0 overflow-hidden border-t ${
                    isLightMode ? "border-gray-300 bg-white" : "border-gray-700 bg-[#1E1E1E]"
                  }`}
                >
                  <div
                    className={`flex items-center justify-between px-3 py-2 border-b flex-shrink-0 sticky top-0 z-10 ${
                      isLightMode ? "border-gray-300 bg-gray-100" : "border-gray-700 bg-[#252526]"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {executionResult?.statusId === 3 ? (
                        <FiCheckCircle className="text-green-500" size={15} />
                      ) : (
                        <FiAlertTriangle className="text-red-500" size={15} />
                      )}
                      <span
                        className={`text-sm font-semibold ${isLightMode ? "text-gray-800" : "text-gray-200"}`}
                      >
                        Output
                      </span>
                      {executionResult && (
                        <span
                          className={`text-xs font-medium ${
                            executionResult.statusId === 3 ? "text-green-500" : "text-red-500"
                          }`}
                        >
                          · {executionResult.statusName}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => setShowOutput(false)}
                      title="Close output"
                      className={`flex items-center gap-1 text-xs px-2 py-1 rounded transition ${
                        isLightMode
                          ? "bg-gray-200 hover:bg-gray-300 text-gray-900"
                          : "bg-[#3E3E42] hover:bg-[#454547] text-white"
                      }`}
                    >
                      <FiX size={14} /> Close
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-3 space-y-3">
                    {executionResult && (
                      <>
                        {(executionResult.memory || executionResult.cpuTime) && (
                          <div className={`text-xs flex gap-3 ${isLightMode ? "text-gray-500" : "text-gray-400"}`}>
                            {executionResult.cpuTime && <span>CPU: {executionResult.cpuTime}s</span>}
                            {executionResult.memory && <span>Memory: {executionResult.memory}</span>}
                          </div>
                        )}

                        {executionResult.output && (
                          <div>
                            <h4
                              className={`text-xs font-semibold mb-1 ${
                                isLightMode ? "text-gray-700" : "text-gray-300"
                              }`}
                            >
                              stdout:
                            </h4>
                            <pre
                              className={`p-2 rounded text-xs overflow-auto whitespace-pre-wrap break-words ${
                                isLightMode
                                  ? "bg-gray-50 border border-gray-300 text-gray-900"
                                  : "bg-[#252526] border border-gray-700 text-green-400"
                              }`}
                            >
                              {executionResult.output}
                            </pre>
                          </div>
                        )}

                        {executionResult.error && (
                          <div>
                            <h4 className="text-xs font-semibold mb-1 text-red-500">stderr:</h4>
                            <pre
                              className={`p-2 rounded text-xs overflow-auto whitespace-pre-wrap break-words ${
                                isLightMode
                                  ? "bg-red-50 border border-red-300 text-red-700"
                                  : "bg-[#2a1515] border border-red-700 text-red-400"
                              }`}
                            >
                              {executionResult.error}
                            </pre>
                          </div>
                        )}

                        {!executionResult.output && !executionResult.error && (
                          <p className={`text-xs italic ${isLightMode ? "text-gray-400" : "text-gray-500"}`}>
                            Program ran with no output.
                          </p>
                        )}
                      </>
                    )}
                  </div>
                </motion.div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default CodeEditor;