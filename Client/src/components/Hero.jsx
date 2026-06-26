// original code
// import { useGSAP } from "@gsap/react";
// import gsap from "gsap";
// import ScrollTrigger from "gsap/ScrollTrigger";
// import React, { useRef, useState } from "react";
// import { MdOpenInNew } from "react-icons/md";
// import { Navigate, useNavigate } from "react-router-dom";
// import { FaMagnifyingGlass } from "react-icons/fa6";
// import { useAppContext } from "../Context/AppContext";
// import { Toaster, toast } from "react-hot-toast";

// gsap.registerPlugin(ScrollTrigger);

// function Hero({ isLightMode, setisLightMode }) {
//   const Navigate = useNavigate();
//   const { userData, setUserData } = useAppContext();
//   const [Query, setQuery] = useState("");

//   const h1Ref = useRef(null);

//   const pageMap = {
//     home: "/home",
//     about: "/about",
//     developer: "/Developer",
//     contact: "/Contact",
//     "code reviewer": "/CodeReviewer",
//     "chat box": "/ChatDesktop",
//     "codedoodle meeting": "/Ask",
//     "code editor":"/RoomPage"
//   };

//   function findPage() {
//     if (!userData) {
//       toast.error("Login/Register to access the tools");
//       return;
//     }
//     // if(!userData?.isAccountVerified){
//     //   toast.error("Verify Account to access the tools");
//     //   return;
//     // }
//     if (!Query) {
//       toast.error("Please enter a page name");
//       return;
//     }
//     const targetedPage = pageMap[Query.toLowerCase()];
//     if (targetedPage) {
//       Navigate(targetedPage);
//     } else {
//       alert("Page Not Found");
//     }
//   }

//   const breakTheText = () => {
//     const h1 = h1Ref.current;
//     const h1text = h1.textContent;
//     const splittedText = h1text.split("");
//     const halfvalue = Math.floor(splittedText.length / 2);
//     let clutter = "";

//     splittedText.forEach((char, idx) => {
//       if (idx < halfvalue) {
//         clutter += `<span class="firstHalf">${char}</span>`;
//       } else {
//         clutter += `<span class="secondHalf">${char}</span>`;
//       }
//     });

//     h1.innerHTML = clutter;
//   };

//   useGSAP(() => {
//     breakTheText();
//     gsap.set(h1Ref.current, { perspective: 1000 });

//     gsap.set(".firstHalf", {
//       rotateX: -90,
//       y: -100,
//       opacity: 0,
//       transformOrigin: "top center",
//     });
//     gsap.set(".secondHalf", {
//       rotateX: -90,
//       y: -100,
//       opacity: 0,
//       transformOrigin: "top center",
//     });

//     let tl = gsap.timeline();
//     tl.to(".firstHalf", {
//       rotateX: 0,
//       y: 0,
//       opacity: 1,
//       stagger: 0.04,
//       duration: 1,
//       ease: "power2.out",
//     });
//     tl.to(
//       ".secondHalf",
//       {
//         rotateX: 0,
//         y: 0,
//         opacity: 1,
//         stagger: 0.04,
//         duration: 1,
//         ease: "power2.out",
//       },
//       "-=1"
//     );

//     gsap.to(h1Ref.current, {
//       scale: 1.4,
//       scrollTrigger: {
//         trigger: h1Ref.current,
//         start: "top center",
//         end: "bottom top",
//         scrub: true,
//       },
//       ease: "power1.out",
//     });
//   }, []);

//   return (
//     <>
//       <Toaster />
//       <div
//         className={`flex flex-col items-center overflow-hidden justify-center py-10 pt-16 gap-y-10 sm:px-24 ${
//           isLightMode ? "bg-white" : "bg-gray-950"
//         }`}
//       >
//         {/* <button className="bg-green-600 font-semibold text-sm md:text-base text-yellow-200 hover:bg-green-500 focus:ring-4 focus:ring-gray-300 rounded-lg px-5 py-3 mb-6 focus:outline-none">
//     Free 30 Days Trial
//   </button> */}

//         {/* Hi Aditya 👋 Heading */}
//         <h1
//           className={`text-2xl sm:text-2xl md:text-3xl lg:text-4xl text-center font-bold ${
//             isLightMode ? "text-blue-400" : "text-green-400"
//           }`}
//         >
//           Hi {userData ? userData.name : "Developer"} ! 👋
//         </h1>

//         {/* Main Animated Heading */}
//         <div className=" h-hit w-fit flex justify-center px-11 lg:px-0">
//           <h1
//             ref={h1Ref}
//             className={`${
//               isLightMode ? "text-black" : "text-white"
//             } text-center font-bold max-w-6xl leading-tight text-1xl md:text-4xl lg:text-5xl sm:px-8 md:px-16`}
//           >
//             Empowering Developers: Share, Collaborate, and Innovate with Code.
//           </h1>
//         </div>

//         <div className="w-full h-fit bg-pink gap-3 flex flex-row px-32 justify-center">
//           <input
//             list="pages"
//             className={`w-80 flex flex-row gap-2 px-2 py-2 lg:p-3 rounded-lg ${
//               isLightMode ? "bg-slate-200 text-black" : "bg-gray-900 text-white"
//             }`}
//             placeholder="Search ..."
//             value={Query}
//             onChange={(e) => setQuery(e.target.value)}
//           />
//           <datalist id="pages">
//             {/* <option value="About" />
//             <option value="Developer" />
//             <option value="Contact" /> */}
//             <option value="Code Reviewer" />
//             <option value="Chat Box" />
//             <option value="Code Editor"/>
//             <option value="CodeDoodle Meeting" />
//           </datalist>
//           <button
//             className={`active:scale-95 hover:scale-90 transform transition-all duration-300   ${
//               isLightMode
//                 ? "active:bg-blue-800 bg-blue-500 rounded-lg hover:bg-blue-700"
//                 : "bg-green-500 rounded-lg hover:bg-green-700 active:bg-green-800 "
//             } text-white p-2 px-4`}
//             onClick={() => findPage()}
//           >
//             <FaMagnifyingGlass />
//           </button>
//         </div>
//         {/* Description */}
//         <h2
//           className={`text-sm sm:text-base md:text-lg text-center ${
//             isLightMode ? "text-black" : "text-white"
//           } font-medium max-w-3xl mt-6 text-gray-700`}
//         >
//           Collaborative Coding and Platform Highlights.
//         </h2>

//         <button
//           onClick={() => (!userData ? toast.error("Login/Register to access the tools") : Navigate("/RoomPage")) }
//           className={`${
//             isLightMode ? "bg-blue-600" : "bg-green-600"
//           } text-white px-4 py-2 font-light lg:px-6 lg:py-3 ${
//             userData ? "" : " cursor-not-allowed"
//           } rounded-full text_dm lg:text-lg lg:font-semibold hover:bg-transparent ${
//             isLightMode
//               ? "border hover:border-blue-600 hover:text-blue-600"
//               : "border hover:border-green-600 hover:text-green-600"
//           } flex items-center gap-2 transition duration-300`}
//         >
//           Get Started <MdOpenInNew className="text-xl" />
//         </button>
//       </div>
//     </>
//   );
// }

// export default Hero;


// my changed code
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import React, { useRef } from "react";
import { 
  MdOutlineCode, 
  MdChat, 
  MdVideocam, 
  MdRateReview,
  MdAccountTree // Naya icon Code Visualizer ke liye
} from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../Context/AppContext";
import { Toaster, toast } from "react-hot-toast";

gsap.registerPlugin(ScrollTrigger);

function Hero({ isLightMode, setisLightMode }) {
  const navigate = useNavigate();
  const { userData } = useAppContext();
  const containerRef = useRef(null);

  const headingText = "Empowering Developers: Share, Collaborate, and Innovate with Code.";
  const splittedText = headingText.split("");
  const halfValue = Math.floor(splittedText.length / 2);

  const handleNavigation = (path) => {
    if (!userData) {
      toast.error("Please Login/Register to access the tools.");
      return;
    }
    navigate(path);
  };

  const toolsData = [
    {
      title: "Code Editor",
      subtitle: "Real-time collaborative workspace",
      path: "/RoomPage",
      icon: <MdOutlineCode className="text-3xl" />,
      themeClass: isLightMode 
        ? "bg-blue-600 hover:bg-blue-700 shadow-[0_4px_20px_rgba(37,99,235,0.4)]" 
        : "bg-blue-500 hover:bg-blue-400 shadow-[0_0_25px_rgba(59,130,246,0.5)]"
    },
    {
      title: "CodeDoodle",
      subtitle: "Video meetings & whiteboards",
      path: "/Ask",
      icon: <MdVideocam className="text-3xl" />,
      themeClass: isLightMode 
        ? "bg-purple-600 hover:bg-purple-700 shadow-[0_4px_20px_rgba(147,51,234,0.4)]" 
        : "bg-purple-500 hover:bg-purple-400 shadow-[0_0_25px_rgba(168,85,247,0.5)]"
    },
    {
      title: "AI Reviewer",
      subtitle: "Intelligent code analysis",
      path: "/CodeReviewer",
      icon: <MdRateReview className="text-3xl" />,
      themeClass: isLightMode 
        ? "bg-green-600 hover:bg-green-700 shadow-[0_4px_20px_rgba(22,163,74,0.4)]" 
        : "bg-green-500 hover:bg-green-400 shadow-[0_0_25px_rgba(34,197,94,0.5)]"
    },
    {
      title: "Chat Box",
      subtitle: "Instant developer messaging",
      path: "/ChatDesktop",
      icon: <MdChat className="text-3xl" />,
      themeClass: isLightMode 
        ? "bg-pink-600 hover:bg-pink-700 shadow-[0_4px_20px_rgba(219,39,119,0.4)]" 
        : "bg-pink-500 hover:bg-pink-400 shadow-[0_0_25px_rgba(236,72,153,0.5)]"
    },
    {
      // Yahan add hua hai naya Code Visualizer button
      title: "Code Visualizer",
      subtitle: "Step-by-step execution flow",
      path: "/Visualizer", // Aap is path ko apne hisaab se update kar lena
      icon: <MdAccountTree className="text-3xl" />,
      themeClass: isLightMode 
        ? "bg-orange-600 hover:bg-orange-700 shadow-[0_4px_20px_rgba(234,88,12,0.4)]" 
        : "bg-orange-500 hover:bg-orange-400 shadow-[0_0_25px_rgba(249,115,22,0.5)]"
    }
  ];

  useGSAP(() => {
    gsap.set(containerRef.current, { perspective: 1000 });
    gsap.set(".firstHalf, .secondHalf", { rotateX: -90, y: -100, opacity: 0, transformOrigin: "top center" });
    
    let tl = gsap.timeline();
    
    tl.to(".firstHalf", { rotateX: 0, y: 0, opacity: 1, stagger: 0.04, duration: 1, ease: "power2.out" })
      .to(".secondHalf", { rotateX: 0, y: 0, opacity: 1, stagger: 0.04, duration: 1, ease: "power2.out" }, "-=1");

    tl.from(".action-btn", {
      y: 30,
      scale: 0.8,
      opacity: 0,
      stagger: 0.1,
      duration: 0.6,
      ease: "back.out(1.7)"
    }, "-=0.6");

    gsap.to(containerRef.current, {
      scale: 1.1,
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top center",
        end: "bottom top",
        scrub: true,
      },
      ease: "power1.out",
    });
  }, { scope: containerRef });

  return (
    <>
      <Toaster />
      <div
        className={`flex flex-col items-center overflow-hidden justify-center py-24 gap-y-8 sm:px-12 lg:px-24 min-h-[85vh] transition-colors duration-300 ${
          isLightMode ? "bg-white" : "bg-gray-950"
        }`}
      >
        <h1
          className={`text-xl md:text-2xl text-center font-bold tracking-widest uppercase ${
            isLightMode ? "text-blue-600" : "text-green-400"
          }`}
        >
          Welcome, {userData ? userData.name : "Developer"}
        </h1>

        <div ref={containerRef} className="h-fit w-full flex justify-center px-4 lg:px-0">
          <h1
            className={`${
              isLightMode ? "text-gray-900" : "text-white"
            } text-center font-extrabold max-w-5xl leading-tight text-4xl md:text-5xl lg:text-7xl`}
          >
            {splittedText.map((char, idx) => (
              <span
                key={idx}
                className={`inline-block ${idx < halfValue ? "firstHalf" : "secondHalf"}`}
              >
                {char === " " ? "\u00A0" : char}
              </span>
            ))}
          </h1>
        </div>

        <p
          className={`text-base md:text-xl text-center font-medium max-w-2xl mt-2 mb-6 ${
            isLightMode ? "text-gray-500" : "text-gray-400"
          }`}
        >
          Launch directly into your workspace. Select a tool to begin.
        </p>

        <div className="flex flex-wrap justify-center items-center gap-4 lg:gap-6 w-full max-w-6xl px-4 z-10">
          {toolsData.map((tool, index) => (
            <button
              key={index}
              onClick={() => handleNavigation(tool.path)}
              className={`action-btn flex items-center text-left gap-4 px-6 rounded-[2rem] text-white transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 active:scale-95 w-[300px] h-[88px] ${tool.themeClass}`}
            >
              <div className="flex-shrink-0 bg-white/10 p-2.5 rounded-full">
                {tool.icon}
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-lg leading-tight tracking-wide">{tool.title}</span>
                <span className="text-sm font-medium text-white/80 mt-0.5">{tool.subtitle}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

export default Hero;