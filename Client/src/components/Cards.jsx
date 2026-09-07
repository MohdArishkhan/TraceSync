import React from "react";
import { motion } from "framer-motion";
import {
  Code,
  Globe2,
  Lock,
  Sparkles,
  Video,
  Cpu,
  Palette,
  Zap,
} from "lucide-react";

const cardsData = [
  {
    icon: Code,
    tag: "LIVE",
    title: "Code Sharing",
    desc: "Collaborative multi-cursor editing with sub-millisecond AST sync.",
    accent: "from-purple-500/20 to-indigo-500/10",
    border: "group-hover:border-purple-500/50",
    iconColor: "text-purple-400",
  },
  {
    icon: Globe2,
    tag: "GLOBAL",
    title: "Instant Rooms",
    desc: "Spin up unique room IDs instantly with zero configuration or wait.",
    accent: "from-cyan-500/20 to-blue-500/10",
    border: "group-hover:border-cyan-500/50",
    iconColor: "text-cyan-400",
  },
  {
    icon: Lock,
    tag: "SECURE",
    title: "Private Sessions",
    desc: "End-to-end encrypted rooms protected by ephemeral session keys.",
    accent: "from-emerald-500/20 to-teal-500/10",
    border: "group-hover:border-emerald-500/50",
    iconColor: "text-emerald-400",
  },
  {
    icon: Sparkles,
    tag: "AI POWERED",
    title: "Smart Reviewer",
    desc: "Real-time AI code analysis, syntax fixes, and performance critique.",
    accent: "from-amber-500/20 to-orange-500/10",
    border: "group-hover:border-amber-500/50",
    iconColor: "text-amber-400",
  },
  {
    icon: Video,
    tag: "WEBRTC",
    title: "Integrated Video",
    desc: "HD video and crystal-clear voice calling directly beside the editor.",
    accent: "from-rose-500/20 to-pink-500/10",
    border: "group-hover:border-rose-500/50",
    iconColor: "text-rose-400",
  },
  {
    icon: Cpu,
    tag: "MULTI-LANG",
    title: "15+ Languages",
    desc: "Syntax highlighting, autocomplete, and runtime for major languages.",
    accent: "from-blue-500/20 to-indigo-500/10",
    border: "group-hover:border-blue-500/50",
    iconColor: "text-blue-400",
  },
  {
    icon: Palette,
    tag: "CUSTOM THEMES",
    title: "Theme Studio",
    desc: "Switch between custom crafted light & dark themes seamlessly.",
    accent: "from-fuchsia-500/20 to-purple-500/10",
    border: "group-hover:border-fuchsia-500/50",
    iconColor: "text-fuchsia-400",
  },
  {
    icon: Zap,
    tag: "EXECUTION",
    title: "Live Runner",
    desc: "Execute and visualize your algorithms without local environment setup.",
    accent: "from-lime-500/20 to-emerald-500/10",
    border: "group-hover:border-lime-500/50",
    iconColor: "text-lime-400",
  },
];

function Cards({ isLightMode }) {
  return (
    <section
      className={`py-20 px-4 sm:px-6 lg:px-8 transition-colors duration-300 relative overflow-hidden ${
        isLightMode ? "bg-slate-50/50" : "bg-[#09090f]"
      }`}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
          <div className="inline-flex items-center gap-2 font-mono text-xs tracking-widest uppercase text-accent-violet">
            <span className="w-1.5 h-1.5 rounded-full bg-accent-violet animate-pulse"></span>
            Capabilities
          </div>
          <h2
            className={`font-mono text-3xl sm:text-4xl font-bold tracking-tight ${
              isLightMode ? "text-gray-900" : "text-white"
            }`}
          >
            Engineered for Modern Engineering
          </h2>
          <p
            className={`text-sm sm:text-base font-sans ${
              isLightMode ? "text-gray-600" : "text-gray-400"
            }`}
          >
            A powerful suite of real-time collaborative development tools built with performance at core.
          </p>
        </div>

        {/* Responsive Grid of Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
          {cardsData.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className={`group relative p-6 rounded-tech-lg border backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 ${item.border} ${
                  isLightMode
                    ? "bg-white/80 border-gray-200 hover:shadow-xl hover:shadow-purple-500/5"
                    : "bg-dark-surface/60 border-dark-border hover:shadow-2xl hover:shadow-purple-500/10"
                }`}
              >
                {/* Subtle gradient background on hover */}
                <div
                  className={`absolute inset-0 rounded-tech-lg bg-gradient-to-br ${item.accent} opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`}
                />

                <div className="relative z-10 flex flex-col justify-between h-full space-y-4">
                  <div>
                    {/* Top Bar: Icon + Tag */}
                    <div className="flex items-center justify-between mb-4">
                      <div
                        className={`p-2.5 rounded-tech border transition-colors duration-300 ${
                          isLightMode
                            ? "bg-gray-100/80 border-gray-200"
                            : "bg-dark-bg/80 border-dark-border"
                        }`}
                      >
                        <IconComponent className={`w-5 h-5 ${item.iconColor}`} />
                      </div>
                      <span
                        className={`font-mono text-[10px] tracking-wider px-2 py-0.5 rounded border ${
                          isLightMode
                            ? "bg-gray-100 border-gray-200 text-gray-700"
                            : "bg-dark-bg border-dark-border text-gray-400"
                        }`}
                      >
                        {item.tag}
                      </span>
                    </div>

                    {/* Title */}
                    <h3
                      className={`font-mono text-lg font-bold tracking-tight mb-2 ${
                        isLightMode ? "text-gray-900" : "text-white"
                      }`}
                    >
                      {item.title}
                    </h3>

                    {/* Description */}
                    <p
                      className={`text-xs sm:text-sm leading-relaxed ${
                        isLightMode ? "text-gray-600" : "text-gray-400"
                      }`}
                    >
                      {item.desc}
                    </p>
                  </div>

                  <div className="pt-2 flex items-center gap-1.5 text-[11px] font-mono text-accent-violet font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    <span>Explore feature</span>
                    <span>→</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default Cards;
