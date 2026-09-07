import React from "react";
import { useNavigate } from "react-router-dom";
import { Video, BookOpen, ArrowLeft, Sparkles, HelpCircle } from "lucide-react";
import { motion } from "framer-motion";

const Ask = ({ isLightMode }) => {
  const navigate = useNavigate();

  return (
    <div
      className={`min-h-screen flex items-center justify-center px-4 sm:px-6 py-12 transition-colors duration-300 relative overflow-hidden ${
        isLightMode
          ? "bg-slate-50 bg-grid-pattern-light text-gray-900"
          : "bg-dark-bg bg-grid-pattern text-white"
      }`}
    >
      {/* Top Back Navigation */}
      <div className="absolute top-6 left-6 z-20">
        <button
          onClick={() => navigate(-1)}
          className={`flex items-center gap-2 px-4 py-2 rounded-tech font-mono text-xs font-semibold border backdrop-blur-md transition-all duration-200 ${
            isLightMode
              ? "bg-white/80 border-gray-200 text-gray-700 hover:border-accent-violet hover:text-accent-violet"
              : "bg-dark-surface/80 border-dark-border text-gray-300 hover:border-accent-violet hover:text-white"
          }`}
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back</span>
        </button>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className={`relative z-10 p-6 sm:p-8 rounded-tech-lg border backdrop-blur-xl max-w-md w-full text-center shadow-2xl ${
          isLightMode
            ? "bg-white/90 border-gray-200 shadow-purple-500/5"
            : "bg-dark-surface/90 border-dark-border shadow-black/80"
        }`}
      >
        <div
          className={`w-12 h-12 rounded-tech mx-auto flex items-center justify-center border mb-4 ${
            isLightMode
              ? "bg-accent-violet/10 border-accent-violet/20 text-accent-violet"
              : "bg-accent-violet/20 border-accent-violet/30 text-accent-violet"
          }`}
        >
          <HelpCircle className="w-6 h-6" />
        </div>

        <h2 className="font-mono text-2xl font-bold tracking-tight mb-2">
          New to CodeDoodle?
        </h2>

        <p
          className={`text-xs sm:text-sm mb-8 leading-relaxed font-sans ${
            isLightMode ? "text-gray-600" : "text-gray-400"
          }`}
        >
          Take a guided walkthrough of our collaborative tools or jump right into an active video meeting room.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => navigate("/Instruction")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-tech font-mono text-xs font-semibold border transition-all duration-200 ${
              isLightMode
                ? "bg-slate-50 border-gray-200 text-gray-800 hover:border-accent-violet hover:text-accent-violet"
                : "bg-dark-bg border-dark-border text-gray-200 hover:border-accent-violet hover:text-white"
            }`}
          >
            <BookOpen className="w-4 h-4 text-amber-500" />
            <span>Interactive Guide</span>
          </button>

          <button
            onClick={() => navigate("/LobbyPage")}
            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-tech font-mono text-xs font-semibold bg-accent-violet hover:bg-accent-violet/90 text-white shadow-md shadow-accent-violet/20 transition-all duration-200"
          >
            <Video className="w-4 h-4" />
            <span>Start Meeting</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default Ask;
