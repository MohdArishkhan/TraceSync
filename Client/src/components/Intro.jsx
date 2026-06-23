import React, { useState } from "react";
import { motion } from "framer-motion";
import CodeEditorImage from "../assets/CodeEditorPage.png";
import codeReviewer from "../assets/codeReviewer.png";
import chatBot from "../assets/chatBot.png";
import { MdOpenInNew } from "react-icons/md";
import { useNavigate } from "react-router-dom";

// This cardVariants is currently not being used in the component,
// but I've kept it as you requested no extra changes.
const cardVariants = {
  offscreen: { y: 100, opacity: 0 },
  onscreen: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.6, type: "spring", bounce: 0.3 },
  },
};


const allFeatures = [
  {
    image: CodeEditorImage,
    title: "Collaboration Editor",
    desc: "Work with teammates or friends instantly in a shared code editor. See changes live as you type, with seamless synchronization and zero delay.",
    link:"/RoomPage"
  },
  {
    image: codeReviewer,
    title: "AI Code Reviewer",
    desc: "Get instant feedback on your code with our intelligent reviewer. It analyzes your code in real time, detects bugs, suggests improvements.",
    link:"/CodeReviewer"
  },
  {
    image: chatBot,
    title: "AI Chatbot",
    desc: "Chat instantly with an intelligent AI that understands you, answers smartly, and assists in coding and conversations effortlessly.",
    link:"/ChatDesktop"
  },
];


const Features = ({ isLightMode, setisLightMode }) => {
  const [currentLink,setcurrentLink] = useState("/RoomPage");
  const myNavigate = useNavigate();
  // Your original highlightText function (unchanged)
  const highlightText = (text) => {
    const keywords = ["Real-Time", "Seamless", "Instantly", "Live"];
    let highlightedText = text;
    keywords.forEach((keyword) => {
      const regex = new RegExp(`\\b${keyword}\\b`, "gi");
      highlightedText = highlightedText.replace(
        regex,
        isLightMode
          ? `<span class="text-blue-500 underline font-semibold">${keyword}</span>`
          : `<span class="text-green-700 underline font-semibold">${keyword}</span>`
      );
    });
    return highlightedText;
  };

  // Your original state management (unchanged)
  const [title, setTitle] = useState("Real-Time Code Collaboration Editor");
  const [desc, setDesc] = useState(
    "Work with teammates or friends instantly in a shared code editor. See changes live as you type, with seamless synchronization and zero delay."
  );
  const [active,setActive] = useState(0);
  const [image, setImage] = useState(CodeEditorImage);
  const [ContentKey,setContentKey] = useState(0);

  const handleShifting = (idx) => {
    setTitle(allFeatures[idx].title);
    setDesc(allFeatures[idx].desc);
    setImage(allFeatures[idx].image);
    setContentKey(idx);
    setcurrentLink(allFeatures[idx].link);
    setActive(idx);
  };

  return (
    // FIX: Changed to min-h-screen to prevent overflow, removed w-screen
    <div
      id="features"
      className={`py-20 min-h-screen flex justify-center items-center ${isLightMode?"bg-[#FFFFFF]":"bg-[#030712]"}
      `}
    >
      {/* FIX: Using 'container' and 'mx-auto' for proper centering and max-width */}
      <div className="container mx-auto bg-transparent text-center p-4">
        <motion.h3
          initial={{ opacity: 0, y: -30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className={`text-5xl font-bold m-5 ${
            isLightMode ? "text-black" : "text-white"
          }`}
        >
          Our Features
        </motion.h3>

        {/* This container has been centered */}
        <div className="flex flex-row justify-center bg-transparent py-4 px-2">
          <div className={`text-white w-fit h-fit px-2 py-1 ${isLightMode?"bg-blue-300":"bg-[#1F2937]"} rounded-full`}>
            <button className={`px-4 ${isLightMode?"hover:bg-blue-500":"hover:bg-[#2e3b4f]"} rounded-full ${active==0?`${isLightMode?"active:bg-[#3B82F6] bg-[#3B82F6]":"active:bg-green-600 bg-green-700"} transition-all duration-300`:""} p-2`} onClick={() => handleShifting(0)}>
              Collaboration Editor
            </button>
            <button className={`px-4 ${isLightMode?"hover:bg-blue-500":"hover:bg-[#2e3b4f]"} mx-2 rounded-full ${active==1?`${isLightMode?"active:bg-[#3B82F6] bg-[#3B82F6]":"active:bg-green-600 bg-green-700"} transition-all duration-300`:""} p-2`} onClick={() => handleShifting(1)}>
              Code Reviewer
            </button>
            <button className={`px-4 ${isLightMode?"hover:bg-blue-500":"hover:bg-[#2e3b4f]"} rounded-full ${active==2?`${isLightMode?"active:bg-[#3B82F6] bg-[#3B82F6]":"active:bg-green-600 bg-green-700"} transition-all duration-300`:""} p-2`} onClick={() => handleShifting(2)}>
              AI Chatbot
            </button>
          </div>
        </div>

        {/* FIX: This is now a responsive flex container (column on mobile, row on desktop) */}
        <div className="bg-transparent py-5 flex flex-col md:flex-row gap-8 items-center">
          {/* Image Container */}
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            whileInView={{ opacity: 1, y: 0 }}
            key={title}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="w-full md:w-3/4" // FIX: Responsive width
          >
            <img src={image} className="rounded-md bg-transparent h-full w-full object-contain" alt={title} />
          </motion.div>
          
          {/* Text Content Container */}
          <motion.div 
          initial={{ opacity: 0, y: -30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            key={ContentKey}
            viewport={{ once: true }}
          className="w-full md:w-1/4 bg-transparent p-2 pl-5 text-left">
            <h1
              className={`text-3xl py-4 font-bold bg-transparent ${
                isLightMode ? "text-black" : "text-white"
              }`}
            >
              {title}
            </h1>
            <p
              className={`pb-6 bg-transparent ${
                isLightMode ? "text-black" : "text-white"
              }`}
              // IMPORTANT: Using dangerouslySetInnerHTML to render your HTML string
              dangerouslySetInnerHTML={{ __html: highlightText(desc) }}
            ></p>
            <button onClick={()=>myNavigate(currentLink)} className={`flex flex-row gap-2 items-center px-4 text-[15px] py-2 font-light  text-white hover:bg-transparent ${!isLightMode?"hover:text-[#1EAF53] hover:border-[#1EAF53] bg-[#1EAF53]":"hover:text-[#3B82F6] hover:border-blue-500 bg-[#3B82F6]"} border-2 hover:border-2 rounded-full transition-all duration-300`}>
              <p>Try now !</p>
              <MdOpenInNew/>
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Features;
