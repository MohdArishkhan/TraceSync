import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../Context/AppContext";
import { toast } from "react-hot-toast";
import {
  Code2,
  Video,
  TerminalSquare,
  History,
  ArrowUpRight,
  Cpu,
} from "lucide-react";

const featureList = [
  {
    id: "editor",
    title: "Real-time Editor",
    badge: "SUB-MS SYNC",
    desc: "Multiplayer cursors, intelligent syntax highlighting, instant state replication.",
    link: "/RoomPage",
    icon: Code2,
    details: ["Multi-cursor support", "15+ languages", "Instant state sync"],
  },
  {
    id: "calls",
    title: "Voice & Video Calls",
    badge: "WEBRTC",
    desc: "Talk while you code with zero app switching or third-party meeting links.",
    link: "/Ask",
    icon: Video,
    details: ["Low-latency audio", "Screen sharing", "Integrated side panel"],
  },
  {
    id: "practice",
    title: "Code Visualizer",
    badge: "TREE RUNNER",
    desc: "Interactive visual executions and problem sets to master DSA Concepts.",
    link: "/Visualizer",
    icon: TerminalSquare,
    details: ["Visual AST tree", "Step-by-step debug", "Interactive execution"],
  },
  {
    id: "replay",
    title: "Code Reviewer",
    badge: "AI CODE REVIEW",
    desc: "Instant code audits, complexity analysis, and Gemini AI powered reviews.",
    link: "/CodeReviewer",
    icon: History,
    details: ["Time-travel diffs", "Instant AI critique", "Saved solutions"],
  },
];

const Features = ({ isLightMode }) => {
  const navigate = useNavigate();
  const { userData } = useAppContext();

  const handleCardClick = (link) => {
    if (!userData) {
      toast.error("Please login to access this feature");
      return;
    }
    navigate(link);
  };

  return (
    <section
      id="features"
      className={`py-20 sm:py-28 px-4 sm:px-6 lg:px-8 relative transition-colors duration-300 border-t ${
        isLightMode
          ? "bg-slate-50/70 border-gray-200"
          : "bg-dark-bg border-dark-border"
      }`}
    >
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 sm:mb-16 gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 font-mono text-xs tracking-widest uppercase text-accent-violet">
              <Cpu className="w-3.5 h-3.5" />
              <span>Core Architecture</span>
            </div>
            <h2
              className={`font-mono text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight ${
                isLightMode ? "text-gray-900" : "text-white"
              }`}
            >
              Built for Speed. Tuned for Flow.
            </h2>
          </div>
          <p
            className={`text-sm sm:text-base max-w-md leading-relaxed font-sans ${
              isLightMode ? "text-gray-600" : "text-gray-400"
            }`}
          >
            Everything you need to pair-program, conduct technical interviews, or solve DSA problems with teammates in one unified workspace.
          </p>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
          {featureList.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                onClick={() => handleCardClick(item.link)}
                className={`group relative p-6 rounded-tech-lg border transition-all duration-300 cursor-pointer flex flex-col justify-between hover:-translate-y-1 ${
                  isLightMode
                    ? "bg-white border-gray-200 hover:border-accent-violet hover:shadow-xl hover:shadow-purple-500/5"
                    : "bg-dark-surface/70 border-dark-border hover:border-accent-violet/60 hover:shadow-xl hover:shadow-accent-violet/10"
                }`}
              >
                <div>
                  {/* Top Bar: Icon + Badge */}
                  <div className="flex items-center justify-between mb-5">
                    <div
                      className={`p-2.5 rounded-tech border transition-colors duration-300 ${
                        isLightMode
                          ? "bg-gray-100 border-gray-200 text-gray-900 group-hover:text-accent-violet group-hover:border-accent-violet/30"
                          : "bg-dark-bg border-dark-border text-gray-200 group-hover:text-accent-violet group-hover:border-accent-violet/40"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <span
                      className={`font-mono text-[10px] tracking-wider px-2 py-0.5 rounded border ${
                        isLightMode
                          ? "bg-gray-100 border-gray-200 text-gray-600"
                          : "bg-dark-bg border-dark-border text-gray-400"
                      }`}
                    >
                      {item.badge}
                    </span>
                  </div>

                  {/* Title & Short Description */}
                  <h3
                    className={`font-mono text-lg font-bold mb-2 flex items-center justify-between ${
                      isLightMode ? "text-gray-900" : "text-white"
                    }`}
                  >
                    <span>{item.title}</span>
                    <ArrowUpRight className="w-4 h-4 opacity-0 -translate-x-1 translate-y-1 group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0 transition-all text-accent-violet" />
                  </h3>

                  <p
                    className={`text-xs sm:text-sm leading-relaxed mb-6 ${
                      isLightMode ? "text-gray-600" : "text-gray-400"
                    }`}
                  >
                    {item.desc}
                  </p>
                </div>

                {/* Sub Features Bullet list */}
                <div
                  className={`pt-4 border-t space-y-2 ${
                    isLightMode ? "border-gray-100" : "border-dark-border/60"
                  }`}
                >
                  {item.details.map((detail, dIdx) => (
                    <div
                      key={dIdx}
                      className={`font-mono text-[11px] flex items-center gap-2 ${
                        isLightMode ? "text-gray-500" : "text-gray-400"
                      }`}
                    >
                      <span className="w-1 h-1 rounded-full bg-accent-violet"></span>
                      <span>{detail}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Features;
