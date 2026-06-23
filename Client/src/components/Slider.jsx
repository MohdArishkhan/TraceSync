import React, { useState } from "react";
import ChatBot from "../assets/chatBot.png";
import meeting from "../assets/meeting.png";
import codeReviewer from "../assets/codeReviewer.png";
import { MdOpenInNew } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../Context/AppContext";
import { Toaster, toast } from "react-hot-toast";

const slides = [
  {
    id: 1,
    heading: "CodeDoodle ChatBot",
    text: "Looking for coding assistance? Our AI-powered chatbot is here to help! Get real-time answers, debugging tips, and code suggestions instantly.",
    bg: "bg-slate-100",
    image: ChatBot,
    link: "/ChatDesktop",
  },
  {
    id: 2,
    heading: "CodeDoodle Meeting",
    text: "Need a space to collaborate and discuss your projects? CodeDoodle Meeting allows seamless video calls with your team. Share screens, chat, and brainstorm ideas.",
    bg: "bg-slate-100",
    image: meeting,
    link: "/Instruction",
  },
  {
    id: 3,
    heading: "CodeDoodle Code Reviewer",
    text: "Want your code reviewed? Get constructive feedback and grow as a developer with CodeDoodle’s reviewing tool!",
    bg: "bg-slate-100",
    image: codeReviewer,
    link: "/CodeReviewer",
  },
];

const Slider = ({ isLightMode }) => {
  // const { userData } = useAppContext();
  // const Navigate = useNavigate();
  // const [currentIndex, setCurrentIndex] = useState(0);

  // const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % slides.length);
  // const prevSlide = () =>
  //   setCurrentIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));

  // return (
  //   <>
  //     <Toaster />
  //     <div className={`${isLightMode ? "bg-white" : "bg-black"}`}>
  //       <h1
  //         className={`font-bold text-center text-3xl sm:text-4xl md:text-5xl lg:text-6xl p-4 ${
  //           isLightMode ? "text-gray-950" : "text-gray-100"
  //         }`}
  //       >
  //         New Features Launched
  //       </h1>

  //       <div className="w-full overflow-hidden p-3 relative">
  //         <div
  //           className="flex transition-transform duration-500 ease-in-out"
  //           style={{ transform: `translateX(-${currentIndex * 100}%)` }}
  //         >
  //           {slides.map((slide) => (
  //             <div
  //               key={slide.id}
  //               className={`min-w-full flex flex-col h-fit md:flex-row items-center justify-center p-4 sm:p-6 md:p-8 gap-6 ${slide.bg} rounded-xl shadow-lg h-[85vh]`}
  //             >
  //               {/* Text content */}
  //               <div className="w-full md:w-1/2 flex flex-col gap-4 text-center md:text-left">
  //                 <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900">
  //                   {slide.heading}
  //                 </h1>
  //                 <h2 className="text-base sm:text-lg md:text-xl text-gray-700 font-medium">
  //                   {slide.text}
  //                 </h2>

  //                 <button
  //                   onClick={() => {
  //                     !userData
  //                       ? toast.error("Login/Register to access the tools")
  //                       : Navigate(slide.link);
  //                   }}
  //                   className={`mt-4 w-fit flex items-center gap-2 px-5 py-2.5 text-sm sm:text-base rounded-full transition-all font-light text-white lg:font-bold self-center ${
  //                     isLightMode
  //                       ? "bg-blue-500 hover:bg-transparent hover:text-blue-600 hover:border-blue-600"
  //                       : "bg-green-500 hover:bg-transparent hover:text-green-500 hover:border-green-500"
  //                   } border-2 ${
  //                     !userData ? "cursor-not-allowed opacity-60" : ""
  //                   }`}
  //                 >
  //                   Try it Now!
  //                 </button>
  //               </div>

  //               {/* Image */}
  //               <div className="w-full sm:w-4/5 md:w-1/2 flex justify-center items-center">
  //                 <img
  //                   src={slide.image}
  //                   alt="Slide"
  //                   className="max-w-[50%] sm:max-w-[60%] md:max-w-[80%] lg:max-w-[90%] h-auto object-contain"
  //                 />
  //               </div>
  //             </div>
  //           ))}
  //         </div>

  //         {/* Navigation Buttons */}
  //         <button
  //           onClick={prevSlide}
  //           className="absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 bg-white border rounded-full px-3 py-1 shadow text-xl"
  //         >
  //           ‹
  //         </button>
  //         <button
  //           onClick={nextSlide}
  //           className="absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 bg-white border rounded-full px-3 py-1 shadow text-xl"
  //         >
  //           ›
  //         </button>
  //       </div>
  //     </div>
  //   </>
  // );
};

export default Slider;
