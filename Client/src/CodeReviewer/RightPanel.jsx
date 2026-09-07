import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import "../App.css";

const RightPanel = ({ isLightMode, feedback }) => {
  const scrollRef = useRef();

  const cleanedFeedback = feedback
    ?.replace(/\\n/g, "\n")
    .replace(/\\'/g, "'")
    .replace(/\\"/g, '"')
    .replace(/\\\\/g, "\\")
    .replace(
      /(❌ Bad Code:|🔍 Issues:|✅ Recommended Fix:|💡 Improvements:|Further Considerations:)/g,
      "### $1"
    );

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [cleanedFeedback]);

  return (
    <motion.div
      ref={scrollRef}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
      className={`h-1/2 md:h-full w-full md:w-1/2 rounded-xl overflow-y-auto p-5 md:p-8 border shadow-sm transition-colors duration-300 ${
        isLightMode
          ? "bg-white text-gray-700 border-gray-200"
          : "bg-zinc-900 text-gray-300 border-zinc-800"
      }`}
    >
      <div className={`prose max-w-none ${isLightMode ? "prose-slate" : "prose-invert"} 
        prose-pre:border prose-pre:border-zinc-800 prose-pre:bg-zinc-950 prose-pre:text-zinc-300
        prose-code:text-accent-violet prose-code:bg-zinc-100 dark:prose-code:bg-zinc-800 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:before:content-none prose-code:after:content-none
      `}>
        <ReactMarkdown
          components={{
            h1: ({ node, ...props }) => <h1 className="text-2xl font-bold tracking-tight mb-4" {...props} />,
            h2: ({ node, ...props }) => <h2 className="text-xl font-semibold tracking-tight mt-6 mb-3" {...props} />,
            h3: ({ node, ...props }) => <h3 className="text-lg font-medium tracking-tight mt-6 mb-2" {...props} />,
            p: ({ node, ...props }) => <p className="leading-relaxed mb-4 text-sm md:text-base" {...props} />,
            ul: ({ node, ...props }) => <ul className="mb-4 space-y-1 list-disc list-outside ml-5 text-sm md:text-base" {...props} />,
          }}
        >
          {cleanedFeedback}
        </ReactMarkdown>
      </div>
    </motion.div>
  );
};

export default RightPanel;