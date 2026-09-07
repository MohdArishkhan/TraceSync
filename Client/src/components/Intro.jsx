import React from "react";
import { motion } from "framer-motion";
import { Play, Users, Code2, MessageSquare, CheckCircle2, Video } from "lucide-react";

function Intro({ isLightMode }) {
  return (
    <section
      id="demo-visual"
      className={`py-20 sm:py-28 px-4 sm:px-6 lg:px-8 relative transition-colors duration-300 ${
        isLightMode ? "bg-white" : "bg-dark-bg"
      }`}
    >
      <div className="max-w-7xl mx-auto">
        {/* Split Screen Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">

          {/* LEFT: Code Editor Mock with Problem Statement (7 cols) */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-7"
          >
            <div
              className={`rounded-tech-lg border overflow-hidden backdrop-blur-sm transition-all ${
                isLightMode
                  ? "bg-white border-gray-200 shadow-xl shadow-purple-500/5"
                  : "bg-dark-surface/90 border-dark-border shadow-2xl shadow-black/60"
              }`}
            >
              {/* Problem Panel Header */}
              <div
                className={`border-b px-4 py-3 flex items-center justify-between ${
                  isLightMode ? "bg-gray-50 border-gray-200" : "bg-dark-bg/70 border-dark-border"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-accent-violet"></span>
                  <span className={`font-mono text-xs sm:text-sm font-semibold ${isLightMode ? "text-gray-800" : "text-gray-200"}`}>
                    Challenge: Two Sum
                  </span>
                </div>
                <span className="px-2.5 py-0.5 bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[11px] font-mono rounded font-medium">
                  EASY • 15 MIN
                </span>
              </div>

              {/* Problem Description */}
              <div className={`p-4 sm:p-5 border-b text-xs sm:text-sm ${isLightMode ? "border-gray-200 text-gray-700 bg-slate-50/50" : "border-dark-border text-gray-300 bg-dark-surface/40"}`}>
                <p className="leading-relaxed">
                  Given an array of integers <code className="font-mono text-accent-violet px-1 py-0.5 rounded bg-accent-violet/10">nums</code> and an integer{" "}
                  <code className="font-mono text-accent-violet px-1 py-0.5 rounded bg-accent-violet/10">target</code>, return indices of the two numbers that sum to target.
                </p>
                <div className={`mt-3 p-2.5 rounded font-mono text-xs space-y-1 ${isLightMode ? "bg-white border border-gray-200 text-gray-600" : "bg-dark-bg/60 border border-dark-border text-gray-400"}`}>
                  <div><span className="text-gray-500">Input:</span> nums = [2, 7, 11, 15], target = 9</div>
                  <div><span className="text-emerald-500 font-semibold">Output:</span> [0, 1]</div>
                </div>
              </div>

              {/* Code Editor Area */}
              <div className={`font-mono text-xs sm:text-sm p-4 sm:p-5 overflow-x-auto ${isLightMode ? "bg-white" : "bg-[#0b0b12]"}`}>
                <div className="space-y-1 leading-relaxed">
                  <div className="flex gap-3">
                    <span className={`select-none w-5 text-right ${isLightMode ? "text-gray-400" : "text-gray-600"}`}>1</span>
                    <pre className={isLightMode ? "text-gray-900" : "text-gray-200"}>
                      <span className="text-purple-400">function</span> <span className="text-blue-400">twoSum</span>(nums, target) {"{"}
                    </pre>
                  </div>
                  <div className="flex gap-3">
                    <span className={`select-none w-5 text-right ${isLightMode ? "text-gray-400" : "text-gray-600"}`}>2</span>
                    <pre className={`pl-4 ${isLightMode ? "text-gray-900" : "text-gray-200"}`}>
                      <span className="text-purple-400">const</span> map = <span className="text-purple-400">new</span> <span className="text-cyan-400">Map</span>();
                    </pre>
                  </div>
                  <div className="flex gap-3">
                    <span className={`select-none w-5 text-right ${isLightMode ? "text-gray-400" : "text-gray-600"}`}>3</span>
                    <pre className={`pl-4 ${isLightMode ? "text-gray-900" : "text-gray-200"}`}>
                      <span className="text-purple-400">for</span> (<span className="text-purple-400">let</span> i = 0; i &lt; nums.length; i++) {"{"}
                      <span className="inline-block w-0.5 h-4 bg-accent-violet ml-1 animate-blink align-middle" />
                    </pre>
                  </div>
                  <div className="flex gap-3">
                    <span className={`select-none w-5 text-right ${isLightMode ? "text-gray-400" : "text-gray-600"}`}>4</span>
                    <pre className={`pl-8 ${isLightMode ? "text-gray-400" : "text-gray-500"}`}>
                      <span className="italic">// calculate complement and match</span>
                    </pre>
                  </div>
                  <div className="flex gap-3">
                    <span className={`select-none w-5 text-right ${isLightMode ? "text-gray-400" : "text-gray-600"}`}>5</span>
                    <pre className={`pl-4 ${isLightMode ? "text-gray-900" : "text-gray-200"}`}>{"}"}</pre>
                  </div>
                  <div className="flex gap-3">
                    <span className={`select-none w-5 text-right ${isLightMode ? "text-gray-400" : "text-gray-600"}`}>6</span>
                    <pre className={isLightMode ? "text-gray-900" : "text-gray-200"}>{"}"}</pre>
                  </div>
                </div>
              </div>

              {/* Action Bar */}
              <div
                className={`px-4 sm:px-5 py-3 border-t flex items-center justify-between ${
                  isLightMode ? "bg-gray-50 border-gray-200" : "bg-dark-bg/80 border-dark-border"
                }`}
              >
                <div className="flex items-center gap-2 text-xs font-mono text-emerald-500">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>3 / 3 test cases passed</span>
                </div>
                <button
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-tech font-mono font-semibold text-xs transition-all bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  Run Tests
                </button>
              </div>
            </div>
          </motion.div>

          {/* RIGHT: Call & Collaboration Feature Details (5 cols) */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-5 space-y-6"
          >
            {/* Text Content */}
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 font-mono text-xs tracking-widest uppercase text-accent-violet">
                <span className="w-1.5 h-1.5 rounded-full bg-accent-violet"></span>
                Integrated Voice & Video
              </div>
              <h2
                className={`font-mono text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight ${
                  isLightMode ? "text-gray-900" : "text-white"
                }`}
              >
                Code + Talk in One Unified Window
              </h2>
              <p className={`text-sm sm:text-base leading-relaxed ${isLightMode ? "text-gray-600" : "text-gray-400"}`}>
                Zero alt-tabbing or external meeting links. Crystal-clear WebRTC video and low-latency audio docked directly inside your editor.
              </p>
            </div>

            {/* Call Participants Panel */}
            <div
              className={`rounded-tech-lg border p-4 sm:p-5 ${
                isLightMode
                  ? "bg-white border-gray-200 shadow-lg"
                  : "bg-dark-surface/80 border-dark-border shadow-xl shadow-black/30"
              }`}
            >
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100 dark:border-dark-border">
                <div className="flex items-center gap-2">
                  <Users className={`w-4 h-4 ${isLightMode ? "text-gray-700" : "text-gray-300"}`} />
                  <span className={`font-mono text-xs sm:text-sm font-semibold ${isLightMode ? "text-gray-900" : "text-white"}`}>
                    Active Room (3 Peers)
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                  <span className="font-mono text-[11px] text-emerald-500 font-semibold">ENCRYPTED</span>
                </div>
              </div>

              <div className="space-y-3">
                {/* Participant 1 */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-accent-violet flex items-center justify-center text-white font-bold text-xs">
                      A
                    </div>
                    <div>
                      <div className={`font-mono text-xs font-semibold ${isLightMode ? "text-gray-900" : "text-white"}`}>
                        Arish (Host)
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-accent-violet">
                        <Code2 className="w-3 h-3" />
                        <span>Editing line 3</span>
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Host
                  </span>
                </div>

                {/* Participant 2 */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold text-xs">
                      S
                    </div>
                    <div>
                      <div className={`font-mono text-xs font-semibold ${isLightMode ? "text-gray-900" : "text-white"}`}>
                        Salman
                      </div>
                      <div className="text-[11px] text-gray-500 font-mono">
                        Screen sharing (1080p)
                      </div>
                    </div>
                  </div>
                  <Video className="w-3.5 h-3.5 text-accent-cyan" />
                </div>

                {/* Participant 3 */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-cyan-500 flex items-center justify-center text-white font-bold text-xs">
                      AI
                    </div>
                    <div>
                      <div className={`font-mono text-xs font-semibold ${isLightMode ? "text-gray-900" : "text-white"}`}>
                        CodeDoodle Bot
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-purple-400">
                        <MessageSquare className="w-3 h-3" />
                        <span>Reviewing PR</span>
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
                    Bot
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default Intro;
