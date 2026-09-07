import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../Context/AppContext";
import { Toaster, toast } from "react-hot-toast";
import { motion } from "framer-motion";
import { Terminal, Sparkles, Play, ArrowRight, Video, Mic, Code2 } from "lucide-react";
import HeroBackground3D from "./HeroBackground3D";

function Hero({ isLightMode }) {
  const navigate = useNavigate();
  const { userData } = useAppContext();
  const [activeTab, setActiveTab] = useState("collaborate.js");

  const handleNavigation = (path) => {
    if (!userData) {
      toast.error("Please login to start a session");
      return;
    }
    navigate(path);
  };

  const codeLines = [
    { id: 1, code: 'import { createSession } from "@tracesync/sync";', color: "text-purple-400" },
    { id: 2, code: "", color: "" },
    { id: 3, code: "export default async function collaborate() {", color: "text-blue-400" },
    { id: 4, code: '  const room = await createSession({ audio: true, video: true });', color: "text-emerald-400", indent: 2 },
    { id: 5, code: '  room.sync("state", (peer) => `${peer.name} connected`);', color: "text-amber-400", indent: 2 },
    { id: 6, code: '  return "Code together. Talk together.";', color: "text-pink-400", indent: 2 },
    { id: 7, code: "}", color: "text-blue-400" },
  ];

  return (
    <>
      <Toaster position="top-center" />
      <div
        className={`relative min-h-[92vh] flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-16 sm:py-24 overflow-hidden transition-colors duration-300 ${
          isLightMode
            ? "bg-gradient-to-b from-slate-50 via-white to-slate-50 bg-grid-pattern-light"
            : "bg-gradient-to-b from-dark-bg via-[#0c0c16] to-dark-bg bg-grid-pattern"
        }`}
      >
        {/* 3D Background Layer */}
        <HeroBackground3D isLightMode={isLightMode} />

        {/* Ambient Glow behind Hero */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] sm:w-[600px] h-[350px] sm:h-[600px] bg-accent-violet/15 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[250px] sm:w-[450px] h-[250px] sm:h-[450px] bg-accent-cyan/10 blur-[100px] rounded-full pointer-events-none" />

        {/* Hero Content */}
        <div className="relative max-w-5xl w-full mx-auto text-center space-y-6 sm:space-y-8 z-10">

          

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className={`font-mono font-extrabold text-3xl sm:text-5xl md:text-6xl lg:text-7xl leading-[1.15] tracking-tight ${
              isLightMode ? "text-gray-950" : "text-white"
            }`}
          >
            Code together.{" "}
            <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-accent-violet via-purple-400 to-accent-cyan bg-clip-text text-transparent">
              Talk together.
            </span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className={`text-sm sm:text-lg md:text-xl max-w-2xl mx-auto leading-relaxed font-sans ${
              isLightMode ? "text-gray-600" : "text-gray-400"
            }`}
          >
            Ultra-low latency pair programming with integrated WebRTC voice & video, interactive visualizer, and instant AI reviews in a single browser window.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 pt-2"
          >
            <button
              onClick={() => handleNavigation("/RoomPage")}
              className="w-full sm:w-auto group relative px-7 py-3.5 text-base font-semibold font-mono rounded-tech-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] bg-accent-violet text-white hover:bg-accent-violet/90 shadow-lg shadow-accent-violet/30 flex items-center justify-center gap-2"
            >
              <span>Start Live Session</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => {
                const demoSection = document.getElementById("demo-visual");
                demoSection?.scrollIntoView({ behavior: "smooth" });
              }}
              className={`w-full sm:w-auto px-7 py-3.5 text-base font-semibold font-mono rounded-tech-lg border backdrop-blur-sm transition-all duration-300 flex items-center justify-center gap-2 ${
                isLightMode
                  ? "border-gray-300 bg-white/70 text-gray-700 hover:border-accent-violet hover:text-accent-violet"
                  : "border-dark-border bg-dark-surface/60 text-gray-300 hover:border-accent-violet hover:text-white"
              }`}
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Watch Interactive Demo</span>
            </button>
          </motion.div>

          {/* Floating Stats Pill */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex items-center justify-center gap-6 pt-2 text-xs font-mono text-gray-500"
          >
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              &lt;5ms sync latency
            </span>
            <span className="hidden sm:inline text-gray-400">•</span>
            <span className="hidden sm:flex items-center gap-1.5">
              <span>Zero-install WebRTC</span>
            </span>
            <span className="text-gray-400">•</span>
            <span>15+ Languages</span>
          </motion.div>
        </div>

        {/* Live Mock Code Editor Window with Interactive HUD */}
        <motion.div
          initial={{ opacity: 0, y: 35 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.45 }}
          className="relative max-w-4xl w-full mx-auto mt-12 sm:mt-16 z-10"
        >
          <div
            className={`relative rounded-tech-lg overflow-hidden border backdrop-blur-md transition-all ${
              isLightMode
                ? "bg-white/90 border-gray-300 shadow-2xl shadow-purple-500/5"
                : "bg-dark-surface/90 border-dark-border shadow-2xl shadow-black/80"
            }`}
          >
            {/* Window Top Bar */}
            <div
              className={`flex items-center justify-between px-4 py-2.5 border-b select-none ${
                isLightMode ? "bg-gray-100/90 border-gray-200" : "bg-dark-bg/80 border-dark-border"
              }`}
            >
              {/* Traffic Lights */}
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-[#FF5F56] border border-black/10" />
                <div className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-black/10" />
                <div className="w-3 h-3 rounded-full bg-[#27C93F] border border-black/10" />
              </div>

              {/* Tab Title */}
              <div className="flex items-center gap-2 px-3 py-1 rounded bg-accent-violet/10 text-accent-violet font-mono text-xs font-medium">
                <Terminal className="w-3.5 h-3.5" />
                <span>{activeTab}</span>
              </div>

              {/* Status Indicator */}
              <div className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-500">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                <span className="hidden sm:inline">LIVE SYNC</span>
              </div>
            </div>

            {/* Code Body */}
            <div className={`font-mono text-xs sm:text-sm p-4 sm:p-6 overflow-x-auto ${isLightMode ? "bg-slate-50/50" : "bg-[#0d0d15]/80"}`}>
              {codeLines.map((line) => (
                <div key={line.id} className="flex items-center gap-3 sm:gap-4 leading-6">
                  <span className={`select-none w-5 text-right text-xs ${isLightMode ? "text-gray-400" : "text-gray-600"}`}>
                    {line.id}
                  </span>
                  <pre className="flex-1">
                    <span style={{ paddingLeft: `${(line.indent || 0) * 0.75}rem` }} className={line.color || (isLightMode ? "text-gray-800" : "text-gray-300")}>
                      {line.code}
                      {line.id === 4 && (
                        <span className="inline-block w-0.5 h-4 bg-accent-violet ml-1 animate-blink align-middle" />
                      )}
                      {line.id === 5 && (
                        <motion.span
                          animate={{ opacity: [1, 0, 1] }}
                          transition={{ duration: 1.2, repeat: Infinity }}
                          className="inline-block w-0.5 h-4 bg-emerald-400 ml-1 align-middle"
                        />
                      )}
                    </span>
                  </pre>
                </div>
              ))}
            </div>

            {/* Floating Live Call Widget inside window */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.7 }}
              className={`absolute top-12 right-3 sm:right-6 rounded-tech-lg border p-2 sm:p-3 backdrop-blur-xl shadow-xl ${
                isLightMode
                  ? "bg-white/95 border-gray-300 text-gray-800 shadow-purple-500/10"
                  : "bg-dark-surface/95 border-dark-border text-white shadow-black/60"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className="flex -space-x-2">
                  <div className="w-7 h-7 rounded-full bg-accent-violet flex items-center justify-center text-white text-xs font-bold ring-2 ring-white dark:ring-dark-bg">
                    A
                  </div>
                  <div className="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center text-white text-xs font-bold ring-2 ring-white dark:ring-dark-bg">
                    S
                  </div>
                </div>
                <div className="hidden sm:block text-left font-mono">
                  <div className="text-[11px] font-semibold leading-none">Mohd Arish & Salman</div>
                  <div className="text-[9px] text-emerald-400 flex items-center gap-1 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Speaking
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <span className={`p-1 rounded ${isLightMode ? "bg-gray-100" : "bg-dark-bg"}`}>
                    <Mic className="w-3.5 h-3.5 text-accent-violet" />
                  </span>
                  <span className={`p-1 rounded ${isLightMode ? "bg-gray-100" : "bg-dark-bg"}`}>
                    <Video className="w-3.5 h-3.5 text-accent-cyan" />
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </>
  );
}

export default Hero;
