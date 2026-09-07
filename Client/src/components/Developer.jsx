import React from "react";
import { Github, Linkedin, Instagram, ArrowLeft, Code, Sparkles, Terminal } from "lucide-react";
import coding from "../assets/coding.png";
import coder from "../assets/coder.png";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const developers = [
  {
    name: "Mohd Arish Khan",
    role: "Full-Stack Engineer & DSA Lead",
    image: coding,
    badge: "BACKEND & DSA",
    github: "https://github.com/MohdArishkhan",
    linkedin: "https://www.linkedin.com/in/mohd-arish-khan",
    instagram: "https://www.instagram.com/mohdarishkhan/",
    about: "Expert in distributed systems, real-time WebSocket architecture, and WebRTC streaming. Specializes in building scalable collaborative platforms with advanced DSA visualizations.",
    contributions: [
      "Engineered real-time collaborative state synchronization",
      "Built WebRTC low-latency audio/video mesh",
      "Architected Code Reviewer & Gemini AI integration",
      "Implemented secure JWT & OTP authentication system",
      "Developed workspace cloud persistence layer",
    ],
  },
  {
    name: "Salman Khan",
    role: "Frontend Architect & UI/UX",
    image: coder,
    badge: "FRONTEND & DESIGN",
    // github: "https://github.com/salmankhan",
    // linkedin: "https://www.linkedin.com/in/salman-khan",
    // instagram: "https://www.instagram.com/salmankhan/",
    about: "Passionate about creating modern, ultra-responsive web experiences, design systems, and micro-interactions for developer tools.",
    contributions: [
      "Led design architecture and Tailwind design system",
      "Engineered responsive multiplayer IDE interface",
      "Crafted smooth GSAP & Framer Motion interactions",
      "Built interactive visualizer and user walkthrough",
      "Engineered desktop-grade chat and file management",
    ],
  },
];

const Developer = ({ isLightMode }) => {
  const navigate = useNavigate();

  return (
    <div
      className={`min-h-screen py-12 sm:py-20 px-4 sm:px-6 lg:px-8 transition-colors duration-300 relative overflow-hidden ${
        isLightMode
          ? "bg-slate-50 bg-grid-pattern-light text-gray-900"
          : "bg-dark-bg bg-grid-pattern text-white"
      }`}
    >
      {/* Top Ambient Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-accent-violet/10 blur-[140px] rounded-full pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Back Button */}
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
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
          <div className="inline-flex items-center gap-2 font-mono text-xs tracking-widest uppercase text-accent-violet">
            <Terminal className="w-3.5 h-3.5" />
            <span>Core Engineers</span>
          </div>
          <h1
            className={`font-mono text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight ${
              isLightMode ? "text-gray-900" : "text-white"
            }`}
          >
            Meet the Builders
          </h1>
          <p
            className={`text-sm sm:text-base font-sans ${
              isLightMode ? "text-gray-600" : "text-gray-400"
            }`}
          >
            The engineers behind the architecture, real-time protocols, and interactive experience of TraceSync.
          </p>
        </div>

        {/* Developers Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {developers.map((dev, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className={`p-6 sm:p-8 rounded-tech-lg border backdrop-blur-sm transition-all duration-300 flex flex-col justify-between hover:-translate-y-1 ${
                isLightMode
                  ? "bg-white border-gray-200 shadow-xl shadow-purple-500/5 hover:border-accent-violet"
                  : "bg-dark-surface/80 border-dark-border shadow-2xl shadow-black/60 hover:border-accent-violet/60"
              }`}
            >
              <div>
                {/* Profile Header */}
                <div className="flex items-center gap-4 sm:gap-5 mb-6">
                  <img
                    src={dev.image}
                    alt={dev.name}
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-2 border-accent-violet/40 shadow-md"
                  />
                  <div>
                    <span className="font-mono text-[10px] tracking-wider px-2 py-0.5 rounded border text-accent-violet border-accent-violet/30 bg-accent-violet/10 font-semibold">
                      {dev.badge}
                    </span>
                    <h2
                      className={`font-mono text-xl sm:text-2xl font-bold mt-1.5 ${
                        isLightMode ? "text-gray-900" : "text-white"
                      }`}
                    >
                      {dev.name}
                    </h2>
                    <p
                      className={`text-xs font-mono ${
                        isLightMode ? "text-gray-500" : "text-gray-400"
                      }`}
                    >
                      {dev.role}
                    </p>
                  </div>
                </div>

                {/* Bio */}
                <p
                  className={`text-xs sm:text-sm leading-relaxed mb-6 ${
                    isLightMode ? "text-gray-600" : "text-gray-300"
                  }`}
                >
                  {dev.about}
                </p>

                {/* Contributions */}
                <div className="space-y-2 mb-6">
                  <h3
                    className={`font-mono text-xs font-bold tracking-wider uppercase ${
                      isLightMode ? "text-gray-700" : "text-gray-300"
                    }`}
                  >
                    Key Architectural Contributions:
                  </h3>
                  <ul className="space-y-1.5">
                    {dev.contributions.map((item, idx) => (
                      <li
                        key={idx}
                        className={`font-mono text-xs flex items-start gap-2 ${
                          isLightMode ? "text-gray-600" : "text-gray-400"
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-accent-violet mt-1.5 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Social Links Bar */}
              <div
                className={`pt-4 border-t flex items-center gap-3 ${
                  isLightMode ? "border-gray-100" : "border-dark-border"
                }`}
              >
                <a
                  href={dev.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`p-2 rounded-tech border transition-all ${
                    isLightMode
                      ? "border-gray-200 text-gray-700 hover:border-accent-violet hover:text-accent-violet"
                      : "border-dark-border text-gray-300 hover:border-accent-violet hover:text-white"
                  }`}
                  aria-label="GitHub"
                >
                  <Github className="w-4 h-4" />
                </a>
                <a
                  href={dev.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`p-2 rounded-tech border transition-all ${
                    isLightMode
                      ? "border-gray-200 text-gray-700 hover:border-accent-violet hover:text-accent-violet"
                      : "border-dark-border text-gray-300 hover:border-accent-violet hover:text-white"
                  }`}
                  aria-label="LinkedIn"
                >
                  <Linkedin className="w-4 h-4" />
                </a>
                <a
                  href={dev.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`p-2 rounded-tech border transition-all ${
                    isLightMode
                      ? "border-gray-200 text-gray-700 hover:border-accent-violet hover:text-accent-violet"
                      : "border-dark-border text-gray-300 hover:border-accent-violet hover:text-white"
                  }`}
                  aria-label="Instagram"
                >
                  <Instagram className="w-4 h-4" />
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Developer;
