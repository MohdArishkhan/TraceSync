import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, ArrowLeft, HelpCircle, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const questions_answer = [
  {
    ques: "How does TraceSync synchronize code in real-time?",
    ans: "TraceSync uses WebSockets combined with operational transformation algorithms to synchronize AST state across all connected peers with sub-millisecond latency. Every keystroke is broadcasted and reconciled instantaneously.",
  },
  {
    ques: "How does the integrated voice and video calling work?",
    ans: "Voice and video are built directly on top of WebRTC mesh peer connections. Media flows directly between participants with zero third-party meeting servers, ensuring low latency and maximum privacy.",
  },
  {
    ques: "Can I use TraceSync for technical interviews and pair programming?",
    ans: "Yes! TraceSync provides integrated problem descriptions, live test case runners, code execution, multi-cursor indicators, and integrated audio/video designed specifically for interviews and pairing sessions.",
  },
  {
    ques: "Is my code secure and private?",
    ans: "All room traffic is end-to-end encrypted over secure WebSockets (WSS) and WebRTC DTLS/SRTP protocols. Code sessions are ephemeral unless explicitly saved to your personal workspace.",
  },
  {
    ques: "Which programming languages are supported?",
    ans: "TraceSync supports 15+ languages including JavaScript, TypeScript, Python, C++, Java, Rust, Go, SQL, HTML/CSS, and more with full syntax highlighting.",
  },
  {
    ques: "Do I need to install any software or extensions?",
    ans: "No installation is required. TraceSync runs completely inside any modern web browser on desktop, tablet, and mobile devices.",
  },
];

function FAQ({ isLightMode }) {
  const navigate = useNavigate();
  const [openIndex, setOpenIndex] = useState(0);

  const toggleAccordion = (index) => {
    setOpenIndex(openIndex === index ? -1 : index);
  };

  return (
    <div
      className={`min-h-screen px-4 sm:px-6 lg:px-8 py-12 sm:py-20 transition-colors duration-300 relative overflow-hidden ${
        isLightMode
          ? "bg-slate-50 bg-grid-pattern-light text-gray-900"
          : "bg-dark-bg bg-grid-pattern text-white"
      }`}
    >
      <div className="max-w-4xl mx-auto relative z-10">
        {/* Back Navigation */}
        <div className="flex justify-start mb-8">
          <button
            onClick={() => navigate(-1)}
            className={`flex items-center gap-2 px-4 py-2 rounded-tech font-mono text-xs font-semibold border backdrop-blur-md transition-all duration-200 ${
              isLightMode
                ? "bg-white border-gray-200 text-gray-700 hover:border-accent-violet hover:text-accent-violet"
                : "bg-dark-surface border-dark-border text-gray-300 hover:border-accent-violet hover:text-white"
            }`}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </button>
        </div>

        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <div className="inline-flex items-center gap-2 font-mono text-xs tracking-widest uppercase text-accent-violet">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Knowledge Base</span>
          </div>
          <h1
            className={`font-mono text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight ${
              isLightMode ? "text-gray-900" : "text-white"
            }`}
          >
            Frequently Asked Questions
          </h1>
          <p
            className={`text-sm sm:text-base font-sans ${
              isLightMode ? "text-gray-600" : "text-gray-400"
            }`}
          >
            Everything you need to know about TraceSync's architecture, security, and features.
          </p>
        </div>

        {/* Accordion List */}
        <div className="space-y-4">
          {questions_answer.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className={`rounded-tech-lg border backdrop-blur-sm transition-all overflow-hidden ${
                  isLightMode
                    ? "bg-white border-gray-200 shadow-sm hover:border-gray-300"
                    : "bg-dark-surface/80 border-dark-border hover:border-accent-violet/40"
                }`}
              >
                <button
                  onClick={() => toggleAccordion(index)}
                  className="w-full flex items-center justify-between p-5 sm:p-6 text-left cursor-pointer"
                >
                  <span
                    className={`font-mono text-base sm:text-lg font-semibold pr-4 ${
                      isOpen ? "text-accent-violet" : isLightMode ? "text-gray-900" : "text-white"
                    }`}
                  >
                    {item.ques}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 flex-shrink-0 transition-transform duration-300 ${
                      isOpen ? "rotate-180 text-accent-violet" : "text-gray-400"
                    }`}
                  />
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div
                        className={`px-5 sm:px-6 pb-6 text-xs sm:text-sm leading-relaxed border-t pt-4 ${
                          isLightMode
                            ? "border-gray-100 text-gray-600"
                            : "border-dark-border text-gray-300"
                        }`}
                      >
                        {item.ans}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default FAQ;
