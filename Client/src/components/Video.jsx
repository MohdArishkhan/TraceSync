import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import React, { useRef, useEffect } from "react";
import CodeDoodleVideo from "../assets/CodeDoodle.mp4";
import ScrollTrigger from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);

function Video({ isLightMode, setisLightMode }) {
  const h1Ref = useRef(null);
  useGSAP(() => {
    gsap.to(h1Ref.current, {
      scale: 1.4,
      scrollTrigger: {
        trigger: h1Ref.current,
        start: "top center",
        end: "bottom top",
        scrub: true,
        // markers : true,
      },
      ease: "power1.out",
    });
  }, []);

  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;

    ScrollTrigger.create({
      trigger: video,
      start: "top 80%",
      onEnter: () => {
        video.play();
      },
      onLeaveBack: () => {
        video.pause();
        video.currentTime = 0;
      },
      // markers:true,
    });
  }, []);

  return (
    <div
      className={`flex items-center justify-center px-4 md:py-32 sm:py-20 sm:px-20 ${
        isLightMode ? "bg-white" : "bg-gray-950"
      } overflow-hidden`}
    >
      <div
        ref={h1Ref}
        className="flex items-center justify-center w-full max-w-5xl rounded-3xl"
      >
        <video
          src={CodeDoodleVideo}
          ref={videoRef}
          muted
          loop
          playsInline
          className="w-full h-auto rounded-2xl object-contain"
        />
      </div>
    </div>
  );
}

export default Video;
