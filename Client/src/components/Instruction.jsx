import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MdNavigateNext,
  MdNavigateBefore,
  MdClose,
} from "react-icons/md";
import {
  FaUserCircle,
  FaSignInAlt,
  FaDoorOpen,
  FaPhoneAlt,
  FaPhoneSlash,
  FaVideo,
  FaComments,
  FaRocket,
} from "react-icons/fa";

// 🌈 Guide steps with emojis and enhanced text
const guideSteps = [
  {
    title: "Welcome to CodeDoodle 🚀",
    icon: <FaUserCircle size={40} />,
    content:
      "Start your journey by signing up and building your developer profile. Connect, code, and collaborate in real-time!",
    bg: "bg-gradient-to-br from-violet-700 via-purple-800 to-indigo-900",
    overlayBg: "bg-gradient-to-br from-violet-700 via-purple-800 to-indigo-9000"
  },
  {
    title: "Create or Join a Room 🔗",
    icon: <FaDoorOpen size={40} />,
    content:
      "Click 'Create Room' to host a session or use a room code to join a collaborative coding space instantly.",
    bg: "bg-gradient-to-br from-yellow-400 via-orange-400 to-red-400",
    overlayBg: "bg-gradient-to-br from-yellow-400 via-orange-400 to-red-400"
  },
  {
    title: "Send a Call 📞",
    icon: <FaPhoneAlt size={40} />,
    content:
      "Initiate a call by clicking 'Call User' to connect with your teammate face-to-face.",
    bg: "bg-gradient-to-br from-blue-600 via-sky-500 to-cyan-500",
    overlayBg: "bg-gradient-to-br from-blue-600 via-sky-500 to-cyan-500"
  },
  {
    title: "Accept or Decline 📲",
    icon: <FaPhoneSlash size={40} />,
    content:
      "When someone calls you, you’ll receive a notification. You can choose to accept or decline the call.",
    bg: "bg-gradient-to-br from-pink-600 via-rose-500 to-red-500",
    overlayBg: "bg-gradient-to-br from-pink-600 via-rose-500 to-red-500"
  },
  {
    title: "Video Chat 🎥",
    icon: <FaVideo size={40} />,
    content:
      "Enable your camera to have live face-to-face video chats while you code together in the room.",
    bg: "bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500",
    overlayBg: "bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500"
  },
  {
    title: "Real-Time Chat 💬",
    icon: <FaComments size={40} />,
    content:
      "Use the built-in chat to communicate effectively with your peers without leaving the editor.",
    bg: "bg-gradient-to-br from-teal-400 via-cyan-400 to-blue-400",
    overlayBg: "bg-gradient-to-br from-teal-400 via-cyan-400 to-blue-400"
  },
  {
    title: "Try it Now! ⚡",
    icon: <FaRocket size={40} />,
    content:
      "You're all set! Dive in and experience collaborative coding and real-time communication with CodeDoodle.",
    bg: "bg-gradient-to-br from-gray-800 via-gray-900 to-black",
    overlayBg: "bg-gradient-to-br from-gray-800 via-gray-900 to-black",
   action: { label: "Try it now !", link: "/LobbyPage" }
  },
];


const Instruction = () => {
  const [step, setStep] = useState(0);
  const [isOpen, setIsOpen] = useState(true);

  const nextStep = () => step < guideSteps.length - 1 && setStep(step + 1);
  const prevStep = () => step > 0 && setStep(step - 1);
  const closeGuide = () => setIsOpen(false);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={`fixed inset-0 z-50 flex items-center justify-center px-4 transition-all duration-500 ${guideSteps[step].overlayBg}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            key={step} // Ensures background transition on step change
            className={`w-full max-w-xl rounded-2xl p-6 relative text-center shadow-[0_0_30px_rgba(255,255,255,0.2)] text-white ring-2 ring-white/10 transition-all duration-500 ${guideSteps[step].bg}`}
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
          >
            {/* ❌ Close Button */}
            <button
              onClick={closeGuide}
              className="absolute top-4 right-4 text-white/70 hover:text-red-400 transition"
            >
              <MdClose size={24} />
            </button>

            {/* 🎯 Icon */}
            <div className="text-4xl mb-3 drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
              {guideSteps[step].icon}
            </div>

            {/* 🧠 Title + Content */}
            <h2 className="text-2xl font-bold mb-2 tracking-wide">
              {guideSteps[step].title}
            </h2>
            <p className="text-white/90 text-base mb-5 leading-relaxed">
              {guideSteps[step].content}
            </p>

            {/* 🚀 Action Link */}
            {guideSteps[step].action && (
              <button
                
              
                onClick={() => window.open(`${guideSteps[step].action.link}`, "_blank")}
                className="inline-block bg-white text-black px-6 py-2 rounded-full font-semibold shadow-lg hover:bg-gray-100 transition mb-5"
              >
                {guideSteps[step].action.label}
              </button>
            )}

            {/* ⬅️➡️ Navigation Controls */}
            <div className="flex justify-between items-center mt-2">
              <button
                onClick={prevStep}
                disabled={step === 0}
                className="bg-white/10 border border-white/20 text-white px-4 py-2 rounded-md text-sm hover:bg-white/20 transition disabled:opacity-30"
              >
                <MdNavigateBefore className="inline-block mr-1" />
                Back
              </button>

              <span className="text-sm text-white/80 font-mono">
                Step {step + 1} of {guideSteps.length}
              </span>

              <button
                onClick={nextStep}
                disabled={step === guideSteps.length - 1}
                className="bg-white/10 border border-white/20 text-white px-4 py-2 rounded-md text-sm hover:bg-white/20 transition disabled:opacity-30"
              >
                Next <MdNavigateNext className="inline-block ml-1" />
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Instruction;
