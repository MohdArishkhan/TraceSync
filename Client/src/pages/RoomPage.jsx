import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import toast, { Toaster } from "react-hot-toast";
import { motion } from "framer-motion";
import { Network, Plus, ArrowRight, KeyRound, User, Sparkles, ArrowLeft } from "lucide-react";
import { useAppContext } from "../Context/AppContext";

const MotionDiv = motion.div;

function RoomPage({ isLightMode }) {
  const navigate = useNavigate();
  // 1. Get BACKEND_URL from your AppContext
  const { userData, BACKEND_URL } = useAppContext();
  const [isLoading, setIsLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [roomid, setRoomid] = useState("");

  function handleSubmit(e) {
    e.preventDefault();

    if (!username.trim() || !roomid.trim()) {
      toast.error("Please enter both Room ID and your Username");
      return;
    }

    setIsLoading(true);
    const loadingToastId = toast.loading("Entering collaborative room...");

    setTimeout(() => {
      toast.dismiss(loadingToastId);
      toast.success("Joined room successfully!");
      navigate(`/EditorPage/${roomid.trim()}`, {
        state: {
          username: username.trim(),
        },
      });
      setIsLoading(false);
    }, 1200);
  }

  async function createNewRoom() {
    const myRoomid = uuidv4();
    const projectId = userData?.projectId || "00000000-0000-0000-0000-000000000002";
    const serverUrl = BACKEND_URL || import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

    try {
      const response = await fetch(`${serverUrl}/api/rooms`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          roomId: myRoomid, 
          projectId 
        }),
      });
      
      const result = await response.json().catch(() => ({}));

      if (!response.ok || !result.success) {
        toast.error(`Unable to create room: ${result.message || "Database insert failed"}`);
        return;
      }

      setRoomid(myRoomid);
      toast.success("New Room Created!");
    } catch (error) {
      toast.error(`Unable to create room: ${error.message}`);
    }
  }

  return (
    <>
      <Toaster position="top-center" />
      <div
        className={`min-h-screen w-full flex items-center justify-center p-4 sm:p-6 transition-colors duration-300 relative overflow-hidden ${
          isLightMode
            ? "bg-slate-50 bg-grid-pattern-light text-gray-900"
            : "bg-dark-bg bg-grid-pattern text-white"
        }`}
      >
        {/* Ambient Glows */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] sm:w-[500px] h-[350px] sm:h-[500px] bg-accent-violet/15 blur-[120px] rounded-full pointer-events-none" />

        {/* Top Back Navigation */}
        <div className="absolute top-6 left-6 z-20">
          <button
            onClick={() => navigate("/")}
            className={`flex items-center gap-2 px-4 py-2 rounded-tech font-mono text-xs font-semibold border backdrop-blur-md transition-all duration-200 ${
              isLightMode
                ? "bg-white/80 border-gray-200 text-gray-700 hover:border-accent-violet hover:text-accent-violet"
                : "bg-dark-surface/80 border-dark-border text-gray-300 hover:border-accent-violet hover:text-white"
            }`}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Home</span>
          </button>
        </div>

        <MotionDiv
          className={`relative z-10 backdrop-blur-xl border rounded-tech-lg shadow-2xl p-6 sm:p-8 w-full max-w-md ${
            isLightMode
              ? "bg-white/90 border-gray-200 shadow-purple-500/5"
              : "bg-dark-surface/90 border-dark-border shadow-black/80"
          }`}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          {/* Header & Logo */}
          <div className="flex flex-col items-center text-center mb-8">
            <div
              className={`w-12 h-12 rounded-tech flex items-center justify-center border mb-3 ${
                isLightMode
                  ? "bg-accent-violet/10 border-accent-violet/20 text-accent-violet"
                  : "bg-accent-violet/20 border-accent-violet/30 text-accent-violet"
              }`}
            >
              <Network className="w-6 h-6" />
            </div>
            <h1 className="font-mono text-2xl font-bold tracking-tight">
              TraceSync Room
            </h1>
            <p
              className={`text-xs font-sans mt-1 ${
                isLightMode ? "text-gray-500" : "text-gray-400"
              }`}
            >
              Real-time multiplayer coding & WebRTC workspace
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Room ID Input */}
            <div>
              <label
                className={`block font-mono text-xs font-semibold mb-1.5 ${
                  isLightMode ? "text-gray-700" : "text-gray-300"
                }`}
              >
                Room ID
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3 text-gray-400 pointer-events-none">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  placeholder="Paste or generate Room ID"
                  value={roomid}
                  onChange={(e) => setRoomid(e.target.value)}
                  className={`w-full font-mono text-sm pl-9 pr-3 py-2.5 rounded-tech border transition-colors outline-none ${
                    isLightMode
                      ? "bg-slate-50 border-gray-300 text-gray-900 placeholder-gray-400 focus:border-accent-violet focus:ring-1 focus:ring-accent-violet"
                      : "bg-dark-bg/80 border-dark-border text-white placeholder-gray-500 focus:border-accent-violet focus:ring-1 focus:ring-accent-violet"
                  }`}
                />
              </div>
            </div>

            {/* Username Input */}
            <div>
              <label
                className={`block font-mono text-xs font-semibold mb-1.5 ${
                  isLightMode ? "text-gray-700" : "text-gray-300"
                }`}
              >
                Your Nickname
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3 text-gray-400 pointer-events-none">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  placeholder="e.g. Alex, Maya"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className={`w-full font-mono text-sm pl-9 pr-3 py-2.5 rounded-tech border transition-colors outline-none ${
                    isLightMode
                      ? "bg-slate-50 border-gray-300 text-gray-900 placeholder-gray-400 focus:border-accent-violet focus:ring-1 focus:ring-accent-violet"
                      : "bg-dark-bg/80 border-dark-border text-white placeholder-gray-500 focus:border-accent-violet focus:ring-1 focus:ring-accent-violet"
                  }`}
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 group py-3 px-4 rounded-tech font-mono text-sm font-semibold transition-all duration-200 bg-accent-violet hover:bg-accent-violet/90 text-white shadow-md shadow-accent-violet/20 flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>{isLoading ? "Connecting to Room..." : "Join Room"}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            {/* Quick Generator Button */}
            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={createNewRoom}
                className={`inline-flex items-center gap-1.5 font-mono text-xs transition-colors ${
                  isLightMode
                    ? "text-accent-violet hover:text-purple-700"
                    : "text-purple-400 hover:text-purple-300"
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Need a new room? Create Room ID</span>
              </button>
            </div>
          </form>
        </MotionDiv>
      </div>
    </>
  );
}

export default RoomPage;
