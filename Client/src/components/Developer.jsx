
import React, { useEffect } from "react";
import { FaGithub, FaLinkedin, FaInstagram } from "react-icons/fa";
import aditya from '../assets/aditya.jpg';
import harsh from '../assets/harsh.png';
import { useAppContext } from "../Context/AppContext";
import { Navigate, useNavigate } from "react-router-dom";

const developers = [
  {
    name: "Aditya Kumar",
    role: "Full-Stack Developer",
    image: aditya,
    github: "https://github.com/aditya-kumar-patraan1",
    linkedin: "https://www.linkedin.com/in/aditya-kumar--?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app",
    instagram: "https://www.instagram.com/adityakr_rajput/#",
    about: "Passionate about Data Structures & Algorithms, ranked in the top 3% globally on LeetCode with a 1900+ rating. Skilled Full Stack Web Developer.",
    contributions: [
      "Mainly works on Back-end",
      "Built real-time code editor",
      "Worked on login/auth system",
      "Built CodeDoddle Meeting",
      "Built Code Reviewer",
      "Built ChatBot",
      "Handled Sockets and WebRTC",
      "Built WorkSpace",
      "Handled Authentication (with OTP functionalities)",
    ],
    bgColor : "#CCF381"
  },
  {
    name: "Harsh Gupta",
    role: "Full Stack Developer",
    image: harsh,
    github: "https://github.com/harsh0655",
    linkedin: "https://www.linkedin.com/in/harsh-gupta-61b01a2a4?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app",
    instagram: "https://instagram.com/yourhandle",
    about: "Passionate about building scalable web apps and collaborative tools.",
    contributions: [
      "Led front-end design and architecture.",
  "Built responsive landing page and navbar.",
  "Created animated, interactive FAQ section.",
  "Integrated GSAP for smooth UI animations.",
  "Designed all key pages with consistent UI.",
  "Built animated user guide with Framer Motion.",
  "Managed CodeDoodle’s social media presence.",
  "Created Figma prototypes for UI planning.",
  "Designed real-time video chat interface.",
  "Ensured full responsiveness across devices.",
  "Developed UI for chat and code history logs."
    ],
    bgColor : "rgb(222,170,255)"
  },
  
];

const Developer = ({isLightMode}) => {

  const {userData} = useAppContext();
  const Navigate = useNavigate();

  useEffect(()=>{
    // console.log("But in Developer page");
    // console.log(userData);
  },[userData]);
  
  return (
    <div className={`${isLightMode?"bg-[#f5f5f5]":"bg-black"} py-9 lg:py-20 px-7 lg:px-10 `}>
      <h1 className={`text-3xl lg:text-5xl font-extrabold text-center ${isLightMode ? "text-gray-800" : "text-white"} mb-16 lg:mb-12`}>
        Meet the Developers
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-7xl mx-auto">
        {developers.map((dev, index) => (
          <div
            key={index}
            className={`bg-[${dev.bgColor}] border-2 ${isLightMode?"shadow-slate-200":"border-gray-100"} rounded-3xl p-8 flex flex-col items-center text-center hover:scale-105 duration-300`}
            >
            <img
              src={dev.image}
              alt={dev.name}
              className={`lg:w-40 h-24 lg:h-40 object-cover rounded-full border-2 lg:border-4 ${isLightMode?"border-gray-200":"border-green-600"} shadow-md mb-4`}
            />
            <h2 className={`text-1xl lg:text-2xl font-bold ${isLightMode?"text-gray-700":"text-green-500"}`}>{dev.name}</h2>
            <p className="text-gray-500 text-sm">{dev.role}</p>

            <div className="flex space-x-4 mt-4 text-xl text-gray-600">
              <button onClick={() => window.open(dev.github, "_blank")}  type="button">
                <FaGithub className={`${isLightMode?"hover:text-gray-800":"hover:text-white"}`} />
              </button>
              <button onClick={() => window.open(dev.linkedin, "_blank")}  type="button">
                <FaLinkedin className="hover:text-blue-600" />
              </button>
              <button onClick={() => window.open(dev.instagram, "_blank")} type="button">
                <FaInstagram className="hover:text-pink-500" />
              </button>
            </div>

            <div className="mt-6 text-left w-full">
              <h3 className={`text-sm lg:text-xl font-semibold ${isLightMode?"text-gray-800":"text-green-300"} mb-2`}>
                About
              </h3>
              <p className={`${isLightMode?"text-gray-800":"text-green-300"} text-sm`}>{dev.about}</p>

              <h3 className={`text-sm lg:text-xl ${isLightMode?"text-gray-800":"text-green-300"} font-semibold text-gray-800 mt-4 mb-2`}>
                Contributions
              </h3>
              <ul className={`list-disc pl-3 lg:pl-5 ${isLightMode?"text-gray-800":"text-green-100"} text-sm lg:text-sm-1`}>
                {dev.contributions.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>

              
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Developer;
