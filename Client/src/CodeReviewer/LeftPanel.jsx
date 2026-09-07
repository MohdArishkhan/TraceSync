import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import CodeMirror from "codemirror";
import "codemirror/mode/javascript/javascript";
import "codemirror/theme/dracula.css";
import "codemirror/addon/edit/closetag";
import "codemirror/addon/edit/closebrackets";
import "codemirror/lib/codemirror.css";
import axios from "axios";
import { Toaster, toast } from "react-hot-toast";
import ShareCircleBold from "../assets/ShareCircleBold";

const LeftPanel = ({ isLightMode, setisLightMode, feedback, setFeedback }) => {
  const editorRef = useRef(null);
  const textareaRef = useRef(null);
  const [Code, setCode] = useState("// Write your Code here");
  const [isLoading, setIsLoading] = useState(false);
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    if (textareaRef.current && !editorRef.current) {
      const editor = CodeMirror.fromTextArea(textareaRef.current, {
        mode: { name: "javascript", json: true },
        theme: "dracula",
        autoCloseTags: true,
        autoCloseBrackets: true,
        lineNumbers: true,
      });

      editor.setSize("100%", "100%");
      editorRef.current = editor;

      const editorElement = editorRef.current.getWrapperElement();
      editorElement.style.borderRadius = "0px";
      editorElement.style.height = "100%";

      editor.on("change", (instance) => {
        setCode(instance.getValue());
      });
    }
    return () => {
      if (editorRef.current) {
        editorRef.current.toTextArea();
        editorRef.current = null;
      }
    };
  }, []);

  const sendCodeToAI = () => {
    setIsLoading(true);
    const loadingToastId = toast.loading("Analyzing complexity...");
    axios
      .post(`${BACKEND_URL}/Code-reviewer/get-response`, { Code })
      .then((res) => {
        setFeedback(res.data.msg);
        toast.dismiss(loadingToastId);
      })
      .catch(() => {
        toast.dismiss(loadingToastId);
        toast.error("Failed to fetch analysis.");
      })
      .finally(() => setIsLoading(false));
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
      className={`flex flex-col h-1/2 md:h-full w-full md:w-1/2 rounded-xl overflow-hidden border shadow-sm transition-colors duration-300 ${
        isLightMode ? "bg-white border-gray-200" : "bg-zinc-900 border-zinc-800"
      }`}
    >
      {/* Header Toolbar */}
      <div className={`flex-none flex items-center justify-between px-4 py-3 border-b ${
        isLightMode ? "border-gray-200" : "border-zinc-800"
      }`}>
        <div className="flex items-center gap-2">
          <ShareCircleBold
            className={isLightMode ? "text-gray-900" : "text-gray-100"}
            size={20}
          />
          <h1 className={`text-base font-semibold font-mono ${
            isLightMode ? "text-gray-900" : "text-gray-100"
          }`}>
            TraceSync
          </h1>
        </div>
        
        <button
          onClick={sendCodeToAI}
          disabled={isLoading}
          className={`flex items-center justify-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all
            ${isLightMode 
              ? "bg-gray-900 text-white hover:bg-gray-800" 
              : "bg-white text-zinc-900 hover:bg-gray-200"
            }
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
        >
          {isLoading ? "Processing..." : "Run Analysis"}
        </button>
      </div>

      {/* Editor Container */}
      <div className="flex-1 min-h-0 w-full relative">
        <textarea
          defaultValue="// Write your Code here"
          ref={textareaRef}
          className="hidden"
        />
      </div>
      <Toaster position="bottom-center" />
    </motion.div>
  );
};

export default LeftPanel;