import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import React, { useRef } from 'react';
import "../App.css";

gsap.registerPlugin(ScrollTrigger);

function Cards({isLightMode,setisLightMode}) {
  const cards_obj = [
    {
      color: "bg-[rgb(252,207,0)]",
      span_content: "Live",
      h1_content: " Code Sharing.",
      h4_content: "Write, edit, and debug code together instantly.",
    },
    
    {
      color: "bg-[rgb(255,111,145)]",
      span_content: "Global",
      h1_content: " Rooms",
      h4_content: "Collaborate with anyone around the world in shared coding sessions.",
    },
    {
      color: "bg-[rgb(0,221,176)]",
      span_content: "Private",
      h1_content: " Sessions",
      h4_content: "Create invite-only rooms for secure and focused collaboration.",
    },
    {
      color: "bg-[rgb(255,163,102)]",
      span_content: "AI",
      h1_content: " Code Suggestions",
      h4_content: "Get real-time code completions and intelligent bug detection.",
    },
    {
      color: "bg-[rgb(161,196,253)]",
      span_content: "Video +",
      h1_content: " Voice Chat",
      h4_content: "Talk face-to-face while you code using built-in voice and video.",
    },
    {
      color: "bg-[rgb(255,203,176)]",
      span_content: "20+",
      h1_content: " Programming Languages",
      h4_content: "From JavaScript to Python, share code in your favorite language.",
    },
    {
      color: "bg-[rgb(250,214,165)]",
      span_content: "Theme",
      h1_content: " Customization",
      h4_content: "Switch between light, dark, or your own custom themes.",
    },
    {
      color: "bg-[rgb(174,217,224)]",
      span_content: "Real-Time",
      h1_content: " Code Execution",
      h4_content: "Run and test your code live without any setup.",
    },
  ];

  return (
    <div className={`hide-scrollbar overflow-x-auto overflow-y-hidden scrollbar-hide ${isLightMode ? "bg-white" : "bg-black"} w-full py-12 px-4`}>
      <div className="flex space-x-4 sm:space-x-8 md:space-x-10 w-max">
        {cards_obj.map((item, index) => (
          <div
            key={index}
            className={`${item.color} flex-shrink-0 w-[250px] sm:w-[340px] md:w-[380px] lg:w-[400px] h-[380px] sm:h-[520px] md:h-[580px] rounded-3xl shadow-xl hover:scale-105 transition-transform duration-500 ease-in-out flex flex-col items-start justify-center px-4 lg:px-6 sm:px-8 py-3 lg:py-6`}
          >
            <h1 className="text-gray-800 font-bold text-2xl lg:text-3xl sm:text-4xl md:text-5xl leading-tight">
              <span className="text-5xl sm:text-6xl md:text-7xl block">{item.span_content}</span>
              {item.h1_content}
            </h1>
            <h4 className="text-gray-700 font-medium text-1xl lg:text-lg sm:text-xl md:text-2xl mt-4 sm:mt-6">
              {item.h4_content}
            </h4>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Cards;
