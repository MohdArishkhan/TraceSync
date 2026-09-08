import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import React, { useRef, useEffect } from "react";
import TraceSync from "../assets/vid_tracesync.mp4";
import ScrollTrigger from "gsap/ScrollTrigger";
import { PlayCircle, ShieldCheck } from "lucide-react";
gsap.registerPlugin(ScrollTrigger);

function Video({ isLightMode }) {
  const containerRef = useRef(null);
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const trigger = ScrollTrigger.create({
      trigger: video,
      start: "top 80%",
      onEnter: () => {
        video.play().catch(() => {});
      },
      onLeaveBack: () => {
        video.pause();
        video.currentTime = 0;
      },
    });

    return () => trigger.kill();
  }, []);

  return (
    <section
      id="video-section" 
      className={`py-20 sm:py-24 px-4 sm:px-6 lg:px-8 transition-colors duration-300 relative overflow-hidden ${
        isLightMode ? "bg-white" : "bg-dark-bg"
      }`}
    >
      <div className="max-w-5xl mx-auto text-center">
        {/* Section Badge */}
        <div className="inline-flex items-center gap-2 font-mono text-xs tracking-widest uppercase text-accent-violet mb-3">
          <PlayCircle className="w-3.5 h-3.5" />
          <span>Interactive Preview</span>
        </div>

        <h2
          className={`font-mono text-2xl sm:text-3xl md:text-4xl font-bold mb-4 tracking-tight ${
            isLightMode ? "text-gray-900" : "text-white"
          }`}
        >
          See TraceSync in Action
        </h2>

        <p
          className={`text-sm sm:text-base max-w-xl mx-auto mb-10 ${
            isLightMode ? "text-gray-600" : "text-gray-400"
          }`}
        >
          Experience live code synchronization, WebRTC calls, Code Visualization and intelligent code review in action.
        </p>

        {/* Video Card Container */}
        <div
          ref={containerRef}
          className={`relative rounded-tech-lg border overflow-hidden backdrop-blur-sm transition-all shadow-2xl ${
            isLightMode
              ? "border-gray-200 bg-gray-50 shadow-purple-500/5"
              : "border-dark-border bg-dark-surface shadow-black/80"
          }`}
        >
          {/* Top Frame Bar */}
          <div
            className={`flex items-center justify-between px-4 py-2.5 border-b select-none ${
              isLightMode ? "bg-gray-100 border-gray-200" : "bg-dark-bg/90 border-dark-border"
            }`}
          >
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
            </div>

            <span className="font-mono text-xs text-gray-500 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>TraceSync-live-demo.mp4</span>
            </span>

            <div className="text-[10px] font-mono px-2 py-0.5 rounded bg-accent-violet/10 text-accent-violet">
              HD 60FPS
            </div>
          </div>

          {/* HTML5 Video */}
          <video
            src={TraceSync}
            ref={videoRef}
            muted
            loop
            playsInline
            controls
            className="w-full h-auto object-cover max-h-[600px]"
          />
        </div>
      </div>
    </section>
  );
}

export default Video;