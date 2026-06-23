import React, { useEffect, useRef, useState } from "react";
import CodeMirror from "codemirror";
import "codemirror/mode/javascript/javascript";
import "codemirror/theme/dracula.css";
import "codemirror/addon/edit/closetag";
import "codemirror/addon/edit/closebrackets";
import "codemirror/lib/codemirror.css";
import { MdLightMode, MdDarkMode } from "react-icons/md";
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
      editorElement.style.borderRadius = "15px";
      editorElement.style.overflow = "hidden";

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
    const loadingToastId = toast.loading("Processing...");
    axios
      .post(`${BACKEND_URL}/Code-reviewer/get-response`, { Code })
      .then((res) => {
        setFeedback(res.data.msg);
        toast.dismiss(loadingToastId);
      })
      .catch(() => {
        toast.dismiss(loadingToastId);
        toast.error("Error receiving message.");
      })
      .finally(() => setIsLoading(false));
  };

  return (
    <div className="flex flex-col md:flex-col gap-3 rounded-lg overflow-hidden h-full w-full md:w-1/2">
      {/* Editor Container */}
      <div className="flex-grow h-[60vh] md:h-[70vh] w-full rounded-lg relative">
        <textarea
          defaultValue="// Write your Code here"
          ref={textareaRef}
          style={{
            position: "absolute",
            left: "-9999px",
            top: "-9999px",
            opacity: 0,
            pointerEvents: "none",
          }}
        />
      </div>

      {/* Bottom controls */}
      <div className="flex flex-col md:flex-row gap-3 md:gap-4 items-center justify-between p-3">
        <div className="flex items-center gap-3 w-full sm:flex justify-center md:w-auto">
          <ShareCircleBold
            className={`${isLightMode ? "text-blue-500" : "text-green-400"}`}
            size={28}
          />
          
          <h1
            className={`text-lg md:text-2xl  font-bold ${
              isLightMode ? "text-blue-700" : "text-green-300"
            }`}
          >
            Code Reviewer
          </h1>
        </div>

        <button
          onClick={sendCodeToAI}
          disabled={isLoading}
          className={`w-full md:w-auto flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-white transition transform
            ${
              isLightMode
                ? "bg-blue-500 hover:bg-blue-700 active:bg-blue-800"
                : "bg-green-500 hover:bg-green-700 active:bg-green-800"
            }
            disabled:opacity-60 disabled:cursor-not-allowed
            text-sm md:text-base
            hover:scale-95 active:scale-90
          `}
        >
          {isLoading ? (
            <>
              <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                />
              </svg>
              <span>Processing...</span>
            </>
          ) : (
            "Execute and Analyze with AI"
          )}
        </button>
      </div>
      <Toaster />
    </div>
  );
};

export default LeftPanel;
