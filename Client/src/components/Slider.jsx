import React, { useState } from "react";
import ChatBot from "../assets/chatBot.png";
import meeting from "../assets/meeting.png";
import codeReviewer from "../assets/codeReviewer.png";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../Context/AppContext";
import { toast } from "react-hot-toast";
import { ChevronLeft, ChevronRight, ArrowRight, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const slides = [
  {
    id: 1,
    tag: "AI ASSISTANT",
    heading: "TraceSync Intelligent ChatBot",
    text: "Get real-time code completions, algorithmic insights, debugging tips, and step-by-step logic explanations powered by state-of-the-art AI.",
    image: ChatBot,
    link: "/ChatDesktop",
    badgeColor: "text-purple-400 border-purple-500/30 bg-purple-500/10",
  },
  {
    id: 2,
    tag: "WEBRTC CONFERENCING",
    heading: "TraceSync Live Meetings",
    text: "Seamless peer-to-peer audio/video calling and screen-sharing directly integrated with the collaborative editor. Zero delay, zero setup.",
    image: meeting,
    link: "/LobbyPage",
    badgeColor: "text-cyan-400 border-cyan-500/30 bg-cyan-500/10",
  },
  {
    id: 3,
    tag: "CODE QUALITY",
    heading: "Automated Code Reviewer",
    text: "Instant code audits, security vulnerability scan, AST analysis, and performance tips to elevate your code quality before every commit.",
    image: codeReviewer,
    link: "/CodeReviewer",
    badgeColor: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
  },
];

const Slider = ({ isLightMode }) => {
  const { userData } = useAppContext();
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % slides.length);
  const prevSlide = () =>
    setCurrentIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));

  const handleTryNow = (link) => {
    if (!userData) {
      toast.error("Please login to access this tool");
      return;
    }
    navigate(link);
  };

  const slide = slides[currentIndex];

  return (
    <section
      className={`py-20 sm:py-24 px-4 sm:px-6 lg:px-8 transition-colors duration-300 relative ${
        isLightMode ? "bg-white" : "bg-dark-bg"
      }`}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <div className="inline-flex items-center gap-2 font-mono text-xs tracking-widest uppercase text-accent-violet">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Spotlight Tools</span>
          </div>
          <h2
            className={`font-mono text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight ${
              isLightMode ? "text-gray-900" : "text-white"
            }`}
          >
            Integrated Power Tools
          </h2>
        </div>

        {/* Carousel Container */}
        <div
          className={`relative rounded-tech-lg border p-6 sm:p-10 lg:p-12 backdrop-blur-sm transition-all overflow-hidden ${
            isLightMode
              ? "bg-slate-50 border-gray-200 shadow-xl"
              : "bg-dark-surface/80 border-dark-border shadow-2xl"
          }`}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={slide.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.35 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center"
            >
              {/* Left Column: Text & Action */}
              <div className="lg:col-span-7 space-y-5">
                <span
                  className={`font-mono text-[11px] tracking-wider px-3 py-1 rounded border font-medium ${slide.badgeColor}`}
                >
                  {slide.tag}
                </span>

                <h3
                  className={`font-mono text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight ${
                    isLightMode ? "text-gray-900" : "text-white"
                  }`}
                >
                  {slide.heading}
                </h3>

                <p
                  className={`text-sm sm:text-base leading-relaxed ${
                    isLightMode ? "text-gray-600" : "text-gray-400"
                  }`}
                >
                  {slide.text}
                </p>

                <div className="pt-2">
                  <button
                    onClick={() => handleTryNow(slide.link)}
                    className="group px-6 py-3 rounded-tech font-mono text-sm font-semibold transition-all duration-300 bg-accent-violet hover:bg-accent-violet/90 text-white shadow-md shadow-accent-violet/20 flex items-center gap-2"
                  >
                    <span>Launch Tool</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>

              {/* Right Column: Screenshot / Illustration */}
              <div className="lg:col-span-5 flex justify-center items-center">
                <div
                  className={`relative p-4 rounded-tech-lg border overflow-hidden ${
                    isLightMode ? "bg-white border-gray-200" : "bg-dark-bg/60 border-dark-border"
                  }`}
                >
                  <img
                    src={slide.image}
                    alt={slide.heading}
                    className="max-h-64 sm:max-h-80 w-auto object-contain rounded"
                  />
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Carousel Navigation Buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200 dark:border-dark-border">
            <div className="flex items-center gap-2">
              {slides.map((s, idx) => (
                <button
                  key={s.id}
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    idx === currentIndex
                      ? "w-8 bg-accent-violet"
                      : isLightMode
                      ? "w-2 bg-gray-300 hover:bg-gray-400"
                      : "w-2 bg-dark-border hover:bg-gray-600"
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={prevSlide}
                className={`p-2 rounded-tech border transition-all ${
                  isLightMode
                    ? "bg-white border-gray-200 hover:border-accent-violet text-gray-700"
                    : "bg-dark-bg border-dark-border hover:border-accent-violet text-gray-300"
                }`}
                aria-label="Previous slide"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={nextSlide}
                className={`p-2 rounded-tech border transition-all ${
                  isLightMode
                    ? "bg-white border-gray-200 hover:border-accent-violet text-gray-700"
                    : "bg-dark-bg border-dark-border hover:border-accent-violet text-gray-300"
                }`}
                aria-label="Next slide"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Slider;
