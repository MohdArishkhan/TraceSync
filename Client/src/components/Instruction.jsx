import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRight,
  ChevronLeft,
  X,
  UserCheck,
  DoorOpen,
  PhoneCall,
  PhoneForwarded,
  Video,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const guideSteps = [
  {
    title: "1. Create Your Profile",
    icon: UserCheck,
    content: "Start by logging in or registering. Your developer profile will persist your saved files, themes, and room history across sessions.",
    tag: "AUTHENTICATION",
  },
  {
    title: "2. Create or Join Room",
    icon: DoorOpen,
    content: "Generate a unique room UUID or paste an existing room code from a teammate to jump into an active collaborative IDE instance.",
    tag: "ROOM SYNC",
  },
  {
    title: "3. Start Integrated Call",
    icon: PhoneCall,
    content: "Initiate peer-to-peer WebRTC voice or video calls directly beside your code. No Zoom or external links needed.",
    tag: "WEBRTC CALL",
  },
  {
    title: "4. Live Screen & Video",
    icon: Video,
    content: "Share your camera or stream high-FPS screen captures directly to connected room peers with crystal clarity.",
    tag: "SCREEN STREAM",
  },
  {
    title: "5. Real-Time Chat & AI",
    icon: MessageSquare,
    content: "Use the built-in desktop chat and AI reviewer to ask algorithmic questions, analyze code diffs, and brainstorm ideas.",
    tag: "AI & CHAT",
  },
  {
    title: "6. Ready to Code!",
    icon: Sparkles,
    content: "You're all set! Dive in and experience low-latency multiplayer coding and real-time communication with TraceSync.",
    tag: "READY",
    action: { label: "Enter Room Now", link: "/RoomPage" },
  },
];

const Instruction = ({ isLightMode }) => {
  const [step, setStep] = useState(0);
  const [isOpen, setIsOpen] = useState(true);
  const navigate = useNavigate();

  const nextStep = () => step < guideSteps.length - 1 && setStep(step + 1);
  const prevStep = () => step > 0 && setStep(step - 1);
  const closeGuide = () => {
    setIsOpen(false);
    navigate(-1);
  };

  const current = guideSteps[step];
  const IconComponent = current.icon;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            key={step}
            className="w-full max-w-lg rounded-tech-lg p-6 sm:p-8 relative text-center border backdrop-blur-xl shadow-2xl bg-dark-surface/95 border-dark-border text-white"
            initial={{ scale: 0.95, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: -20, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Close Button */}
            <button
              onClick={closeGuide}
              className="absolute top-4 right-4 p-1.5 rounded-tech text-gray-400 hover:text-white hover:bg-dark-bg transition"
              aria-label="Close guide"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Tag Badge */}
            <div className="inline-block mb-4">
              <span className="font-mono text-[10px] tracking-widest px-2.5 py-1 rounded border text-accent-violet border-accent-violet/30 bg-accent-violet/10 font-bold">
                {current.tag}
              </span>
            </div>

            {/* Icon */}
            <div className="w-16 h-16 mx-auto mb-5 rounded-tech flex items-center justify-center border bg-dark-bg/80 border-dark-border text-accent-violet shadow-lg">
              <IconComponent className="w-8 h-8" />
            </div>

            {/* Title & Content */}
            <h2 className="font-mono text-xl sm:text-2xl font-bold mb-3 tracking-tight text-white">
              {current.title}
            </h2>
            <p className="text-gray-300 text-sm leading-relaxed mb-6 font-sans">
              {current.content}
            </p>

            {/* Action button if last step */}
            {current.action && (
              <button
                onClick={() => navigate(current.action.link)}
                className="mb-6 px-6 py-2.5 rounded-tech font-mono text-xs font-semibold bg-accent-violet hover:bg-accent-violet/90 text-white shadow-lg shadow-accent-violet/30 transition"
              >
                {current.action.label}
              </button>
            )}

            {/* Progress Dots & Navigation */}
            <div className="flex justify-between items-center pt-4 border-t border-dark-border">
              <button
                onClick={prevStep}
                disabled={step === 0}
                className="flex items-center gap-1 font-mono text-xs px-3 py-1.5 rounded border border-dark-border bg-dark-bg text-gray-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>

              <div className="flex items-center gap-1.5">
                {guideSteps.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setStep(idx)}
                    className={`h-1.5 rounded-full transition-all duration-200 ${
                      idx === step ? "w-6 bg-accent-violet" : "w-1.5 bg-dark-border"
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={step === guideSteps.length - 1 ? closeGuide : nextStep}
                className="flex items-center gap-1 font-mono text-xs px-3 py-1.5 rounded border border-accent-violet/40 bg-accent-violet text-white hover:bg-accent-violet/90 transition"
              >
                <span>{step === guideSteps.length - 1 ? "Finish" : "Next"}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Instruction;
