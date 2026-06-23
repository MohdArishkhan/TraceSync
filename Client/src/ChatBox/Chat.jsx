import { useEffect, useState } from "react";
import { IoSend } from "react-icons/io5";
import generateContent from "./gemini";
import { AiFillSound } from "react-icons/ai";
import { FaCopy, FaEdit } from "react-icons/fa";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { VscRobot } from "react-icons/vsc";
import ShareCircleBold from "../assets/ShareCircleBold";
import { ImCross } from "react-icons/im";
import { MdDarkMode } from "react-icons/md";
import { MdLightMode } from "react-icons/md";
import "../App.css";
import { useAppContext } from "../Context/AppContext";
import axios from "axios";
import { CgArrowsExpandUpLeft } from "react-icons/cg";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import {motion} from 'framer-motion';

const Chat = ({ setisChatOpen, isLightMode, setisLightMode }) => {
  const [isMenuOpen, setisMenuOpen] = useState(false);
  const [text, setText] = useState("");
  const [copied, setCopied] = useState(false);
  const [chats, setChats] = useState([]);
  const [myclass, setClass] = useState("child-hidden");
  const [isOpen, setisOpen] = useState(true);
  const [myval, setmyval] = useState("open");
  const [applied, setapplied] = useState("show");
  const [myquery, setmyquery] = useState("");
  const [tempUpdate, setTempUpdate] = useState("");
  const [remainFix, setremainFix] = useState("");
  const [delIsOpen, setDelIsOpen] = useState(false);
  const [confirm, setConfirm] = useState("");
  const [actualList, setactualList] = useState([]);
  const [count, setcount] = useState(0);
  const [data, setData] = useState(""); //mera question
  const [bot, setBot] = useState(""); //mera answer
  const { userData, BACKEND_URL, getUserData } = useAppContext();
  const Navigate = useNavigate();

  function click(data) {
    setapplied(data ? "hidden" : "show");
    setClass(data ? "child-show" : "child-hidden");
    setmyval(data ? "close" : "open");
    setisOpen(!data);
  }

  useEffect(() => {
    if (count < 2 && userData?.allChats) {
      setactualList(userData.allChats);
      setcount((prev) => prev + 1);
    }
  }, [count, userData?.allChats]);

  function formatTime(isoString) {
    const date = new Date(isoString);

    // Format options
    const options = {
      day: "2-digit",
      month: "short", // use '2-digit' for numeric month
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    };

    return date.toLocaleString("en-US", options);
  }

  function fixData(e) {
    setData(e.target.value);
  }
  function copyKar() {
    toast.success("Copied to Clipboard");
  }

  function speakText(mytext) {
    if (!mytext) return;
    const utterance = new SpeechSynthesisUtterance(mytext);
    window.speechSynthesis.speak(utterance);
  }

  async function onSend() {
    if (data.trim() === "") return;

    setChats((prevChats) => [...prevChats, { user: data, bot: null }]);
    let O = await generateContent(data);
    let output = O.replace(/\*/g, "");
    setBot(output);
  }

  useEffect(() => {
    // console.log("Bot aara hai : " + bot);
    // console.log("USER ara hai : " + data);

    const doAddQuery = async () => {
      const tempQ = data;
      setData("");
      await axios
        .post(
          `${BACKEND_URL}/api/chats/addDesktopChats`,
          {
            date: Date.now(), // 🟢 Fixed here
            bot,
            user: tempQ,
          },
          {
            withCredentials: true,
          }
        )
        .then((res) => {
          // console.log(res);
          if (res.data.status === 1) {
            // console.log("Query get Added to Database");
            getUserData();
            setactualList((prev) => [
              ...prev,
              { bot, user: tempQ, date: Date.now() },
            ]);
          } else {
            // console.log("New Entry not added");
          }
        })
        .catch((e) => {
          // console.log("Internal error in adding query to DB");
        });
    };

    if (bot) {
      doAddQuery();
    }
  }, [bot]);

  function perform(mylastquery) {
    click(isOpen);
    setmyquery(mylastquery);
    setremainFix(mylastquery);
  }

  function perform2(updatedQuery) {
    setData(updatedQuery);
    click(isOpen);
  }

  function ending() {
    click(isOpen);
    setmyquery(remainFix);
    setremainFix("empty");
  }

  function fixData2(e) {
    setTempUpdate(e.target.value);
    setmyquery(e.target.value);
  }

  async function checkValidity() {
    const realQuery = "delete chat history";
    if (confirm.toLowerCase() === realQuery) {
      await axios
        .post(
          `${BACKEND_URL}/api/chats/deleteDesktopChats`,
          {},
          {
            withCredentials: true,
          }
        )
        .then((res) => {
          setConfirm("");
          setactualList([]);
          toast.success("History Chats deleted successfully");
          setDelIsOpen(false);
        })
        .catch((e) => {
          // console.log("Internal Error in deleting from Database");
        });
    } else {
      toast.error("Please type 'Delete Chat history'");
    }
  }

  return (
    <>
      <Toaster/>
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className={`w-3/4 lg:w-5/6 lg:max-w-sm h-1/2 lg:h-5/6 shadow-xl  rounded-lg sm:rounded-2xl z-20 overflow-hidden border  flex flex-col border-gray-300 scrollbar-hide fixed bottom-0 right-0 mr-3 mb-3 ${
          isLightMode ? "bg-white" : "bg-gray-950"
        }`}
      >
        {/* Header */}
        <div className=" shadow-md px-4 pl-1 py-3 flex justify-start items-start">
          <div className="pl-3 sm:text-2xl font-bold flex items-center gap-4">
            <CgArrowsExpandUpLeft
              onClick={() => Navigate("/ChatDesktop")}
              className={`hover:scale-90 transform transition-all duration-300  ${
                isLightMode ? "text-black" : "text-white"
              } cursor-pointer`}
            />
            <span className={`${isLightMode ? "text-blue-600" : "text-white"}`}>
              ChatBox
            </span>
            <ImCross
              className={`cursor-pointer absolute right-6 text-sm text-gray-500 ${
                isLightMode ? "hover:text-blue-500" : "hover:text-white"
              } transform transition duration-300 hover:scale-110 hover:rotate-90`}
              onClick={() => setisChatOpen((prev) => !prev)}
            />
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 hide-scrollbar">
          <div className="space-y-4">
            {actualList.map((item, index) => (
              <div key={index} className="space-y-2">
                {/* User Message */}
                <div
                  className={`p-4 ${
                    isLightMode
                      ? "bg-gray-100 text-black"
                      : "bg-gray-900  text-white"
                  }  rounded-md flex justify-between items-start`}
                >
                  <div className="flex gap-3">
                    <img
                      src="https://th.bing.com/th/id/OIP.w-f-qDRUjGt9e_SuPTcfcgHaHw?rs=1&pid=ImgDetMain"
                      className="w-10 h-10 rounded-full"
                    />
                    <div>
                      <div className="text-sm font-semibold">{item.user}</div>
                      <div className="text-xs text-gray-500">
                        {formatTime(item.date)}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => perform(item.user)}
                    className="text-blue-500 hover:text-blue-700 hover:cursor-pointer"
                  >
                    <FaEdit />
                  </button>
                </div>

                {/* Bot Response */}
                <div
                  className={`p-4 rounded-md flex justify-between items-start ${
                    isLightMode
                      ? "bg-blue-100 text-black"
                      : "bg-black text-white"
                  }`}
                >
                  <div className="flex gap-3">
                    <img
                      src="https://static.vecteezy.com/system/resources/previews/004/996/790/original/robot-chatbot-icon-sign-free-vector.jpg"
                      className="w-10 h-10 rounded-full"
                    />
                    <div>
                      <div className="text-sm">
                        {item.bot == null ? (
                          <img
                            className="w-5 h-5"
                            src="https://cdnl.iconscout.com/lottie/premium/thumb/loader-dot-dark-point-animation-6790347-5577789.gif"
                          />
                        ) : (
                          item.bot
                        )}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {formatTime(item.date)}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 items-center text-blue-500">
                    <button onClick={() => speakText(item.bot)}>
                      <AiFillSound className="hover:cursor-pointer hover:text-blue-700" />
                    </button>
                    <CopyToClipboard
                      className="hover:cursor-pointer hover:text-blue-700"
                      text={item.bot}
                      onCopy={() => setCopied(true)}
                    >
                      <button>
                        <FaCopy onClick={() => copyKar()} />
                      </button>
                    </CopyToClipboard>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Input */}
        <div
          className={` px-4 py-3 flex gap-2 items-center ${
            isLightMode ? "bg-white" : "bg-black-800"
          }`}
        >
          <input
            type="text"
            value={data}
            onChange={fixData}
            placeholder="Enter your query"
            className={`flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 ${
              isLightMode ? "text-black" : " text-white bg-gray-900"
            }`}
          />
          <button
            onClick={onSend}
            className={`bg-blue-500 cursor-pointer text-white rounded-md px-4 py-2 m-2 my-3 hover:scale-90 transform  ease-in-out  transition-all duration-300 ${
              isLightMode
                ? "bg-blue-500 hover:bg-blue-600"
                : "bg-green-500 hover:bg-green-600"
            }`}
          >
            <IoSend className="text-lg" />
          </button>
        </div>

        {/* Edit Modal */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className={`${isOpen ? "hidden" : "fixed"} inset-0 ${
            isLightMode ? "bg-black bg-opacity-20" : "bg-black bg-opacity-40"
          } flex justify-center items-center backdrop-blur-lg z-50`}
        >
          <div
            className={`p-6 rounded-lg shadow-xl w-[90%] max-w-xl border ${
              isLightMode
                ? "bg-white border-gray-200 text-black"
                : "bg-gray-900 border-gray-700 text-white"
            }`}
          >
            <h3 className="text-xl font-semibold mb-4">Do you want to edit?</h3>

            <textarea
              rows="6"
              defaultValue={myquery}
              onChange={fixData2}
              className={`w-full rounded-md px-4 py-2 text-sm resize-none mt-2 focus:outline-none focus:ring-2 ${
                isLightMode
                  ? "bg-gray-100 text-black border border-gray-300 focus:ring-blue-400"
                  : "bg-gray-800 text-white border border-gray-600 focus:ring-orange-400"
              }`}
            ></textarea>

            <div className="flex justify-between items-center mt-6">
              <button
                onClick={() => perform2(tempUpdate)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium hover:scale-105 transition-all duration-300 active:scale-95 ${
                  isLightMode
                    ? "bg-blue-500 text-white hover:bg-blue-600"
                    : "bg-green-500 text-black hover:bg-green-600"
                }`}
              >
                <IoSend className="text-lg" />
                Send
              </button>

              <button
                onClick={ending}
                className={`px-4 py-2 rounded-md font-medium transition-all duration-300 active:scale-95 border ${
                  isLightMode
                    ? "text-black border-black hover:bg-black hover:text-white"
                    : "text-white border-white hover:bg-red-600 hover:border-red-600"
                }`}
              >
                Close
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </>
  );
};

export default Chat;



// import { useEffect, useState, useRef } from "react";
// import { IoSend } from "react-icons/io5";
// import   {generateSuggestions, generateStreamingContent } from "./gemini.js";
// import { AiFillSound } from "react-icons/ai";
// import { FaCopy, FaEdit, FaTrash } from "react-icons/fa";
// import { CopyToClipboard } from "react-copy-to-clipboard";
// import { VscRobot } from "react-icons/vsc";
// import ShareCircleBold from "../assets/ShareCircleBold";
// import { ImCross } from "react-icons/im";
// import { MdDarkMode, MdLightMode, MdLightbulb, MdClose } from "react-icons/md";
// import "../App.css";
// import { useAppContext } from "../Context/AppContext";
// import axios from "axios";
// import { CgArrowsExpandUpLeft } from "react-icons/cg";
// import { useNavigate } from "react-router-dom";
// import { toast } from "react-hot-toast";

// const Chat = ({ setisChatOpen, isLightMode, setisLightMode }) => {
//   const [text, setText] = useState("");
//   const [copied, setCopied] = useState(false);
//   const [chats, setChats] = useState([]);
//   const [data, setData] = useState("");
//   const [bot, setBot] = useState("");
//   const [actualList, setactualList] = useState([]);
//   const [count, setcount] = useState(0);
  
//   const [suggestions, setSuggestions] = useState([]);
//   const [loadingSuggestions, setLoadingSuggestions] = useState(false);
//   const [suggestionsEnabled, setSuggestionsEnabled] = useState(true);
  
//   const [streamingResponse, setStreamingResponse] = useState("");
//   const [isStreaming, setIsStreaming] = useState(false);
//   const [currentStreamingIndex, setCurrentStreamingIndex] = useState(null);

//   const [currentTheme, setCurrentTheme] = useState("default");
  
//   const { userData, BACKEND_URL, getUserData } = useAppContext();
//   const Navigate = useNavigate(); 
  
//   const inputRef = useRef(null);
//   const chatContainerRef = useRef(null);

//   useEffect(() => {
//     if (count < 2 && userData?.allChats) {
//       setactualList(userData.allChats);
//       setcount((prev) => prev + 1);
//     }
//   }, [count, userData?.allChats]);

//   useEffect(() => {
//     if (actualList.length >= 2 && suggestionsEnabled) {
//       generateAISuggestions();
//     } else if (!suggestionsEnabled) {
//       setSuggestions([]);
//     }
//   }, [actualList, suggestionsEnabled]);

//   useEffect(() => {
//     detectThemeFromConversation();
//   }, [actualList]);

//   useEffect(() => {
//     if (chatContainerRef.current) {
//       chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
//     }
//   }, [actualList, streamingResponse]);

//   function detectThemeFromConversation() {
//     const recentMessages = actualList.slice(-5);
//     const allText = recentMessages.map(msg => `${msg.user} ${msg.bot}`).join(' ').toLowerCase();
    
//     if (allText.includes('meditat') || allText.includes('mindful') || allText.includes('calm') || allText.includes('peace')) {
//       setCurrentTheme("meditation");
//     } else if (allText.includes('health') || allText.includes('medical') || allText.includes('doctor') || allText.includes('symptom')) {
//       setCurrentTheme("medical");
//     } else if (allText.includes('mood') || allText.includes('feeling') || allText.includes('emotion') || allText.includes('stress')) {
//       setCurrentTheme("mood");
//     } else {
//       setCurrentTheme("stillmind");
//     }
//   }

//   function getThemeColors() {
//     switch (currentTheme) {
//       case "meditation":
//         return {
//           primary: isLightMode ? "text-purple-600" : "text-purple-400",
//           bgPrimary: isLightMode ? "bg-purple-500 hover:bg-purple-600" : "bg-purple-600 hover:bg-purple-700",
//           bgSecondary: isLightMode ? "bg-purple-50" : "bg-purple-900",
//           border: isLightMode ? "border-purple-200" : "border-purple-700"
//         };
//       case "medical":
//         return {
//           primary: isLightMode ? "text-green-600" : "text-green-400",
//           bgPrimary: isLightMode ? "bg-green-500 hover:bg-green-600" : "bg-green-600 hover:bg-green-700",
//           bgSecondary: isLightMode ? "bg-green-50" : "bg-green-900",
//           border: isLightMode ? "border-green-200" : "border-green-700"
//         };
//       case "mood":
//         return {
//           primary: isLightMode ? "text-orange-600" : "text-orange-400",
//           bgPrimary: isLightMode ? "bg-orange-500 hover:bg-orange-600" : "bg-orange-600 hover:bg-orange-700",
//           bgSecondary: isLightMode ? "bg-orange-50" : "bg-orange-900",
//           border: isLightMode ? "border-orange-200" : "border-orange-700"
//         };
//       default:
//         return {
//           primary: isLightMode ? "text-blue-600" : "text-blue-400",
//           bgPrimary: isLightMode ? "bg-blue-500 hover:bg-blue-600" : "bg-blue-600 hover:bg-blue-700",
//           bgSecondary: isLightMode ? "bg-blue-50" : "bg-blue-900",
//           border: isLightMode ? "border-blue-200" : "border-blue-700"
//         };
//     }
//   }

//   const themeColors = getThemeColors();

//   async function generateAISuggestions() {
//     if (!suggestionsEnabled) return;
    
//     setLoadingSuggestions(true);
//     try {
//       const recentChats = actualList.slice(-3);
//       const newSuggestions = await generateSuggestions(recentChats);
//       setSuggestions(newSuggestions);
//     } catch (error) {
//       // console.error("Failed to generate suggestions:", error);
//       setSuggestions([]);
//     } finally {
//       setLoadingSuggestions(false);
//     }
//   }

//   function handleSuggestionClick(suggestion) {
//     setData(suggestion);
//     setSuggestions([]);
//   }

//   function removeSuggestion(indexToRemove) {
//     setSuggestions(prev => prev.filter((_, index) => index !== indexToRemove));
//   }

//   function formatTime(isoString) {
//     const date = new Date(isoString);
//     const options = {
//       day: "2-digit",
//       month: "short",
//       year: "numeric",
//       hour: "2-digit",
//       minute: "2-digit",
//       hour12: true,
//     };
//     return date.toLocaleString("en-US", options);
//   }

//   function speakText(mytext) {
//     if (!mytext) return;
//     const utterance = new SpeechSynthesisUtterance(mytext);
//     window.speechSynthesis.speak(utterance);
//   }

//   function handleKeyPress(e) {
//     if (e.key === 'Enter' && !e.shiftKey) {
//       e.preventDefault();
//       onSend();
//     }
//   }


//   async function onSend() {
//     if (data.trim() === "") return;

//     const userMessage = data.trim();
//     const tempId = Date.now();
    
//     setactualList(prev => [...prev, { 
//       id: tempId,
//       user: userMessage, 
//       bot: null, 
//       date: tempId,
//       isStreaming: true 
//     }]);
    
//     setCurrentStreamingIndex(tempId);
//     setIsStreaming(true);
//     setStreamingResponse("");
//     setSuggestions([]);
//     setData("");

//     try {
//       // 🔥 CHANGE: Use streaming content generation
//       const streamingGen = generateStreamingContent(userMessage);
//       let fullResponse = "";
      
//       for await (const chunk of streamingGen) {
//         fullResponse += chunk;
//         setStreamingResponse(fullResponse);
        
//         // Update the specific message in actualList with streaming response
//         setactualList(prev => prev.map(item => 
//           item.id === tempId 
//             ? { ...item, bot: fullResponse, isStreaming: true }
//             : item
//         ));
//       }

//       // Finalize the streaming response
//       setIsStreaming(false);
//       setCurrentStreamingIndex(null);
      
//       // Update with final response
//       setactualList(prev => prev.map(item => 
//         item.id === tempId 
//           ? { ...item, bot: fullResponse, isStreaming: false }
//           : item
//       ));

//       // Save to database
//       await saveToDatabase(userMessage, fullResponse, tempId);

//     } catch (error) {
//       // console.error("Error generating response:", error);
//       setIsStreaming(false);
//       setCurrentStreamingIndex(null);
      
//       // Show error message
//       setactualList(prev => prev.map(item => 
//         item.id === tempId 
//           ? { ...item, bot: "Sorry, I encountered an error. Please try again.", isStreaming: false }
//           : item
//       ));
//     }
//   }

//   // 🔥 CHANGE: Separate function to save to database
//   async function saveToDatabase(userMessage, botResponse, tempId) {
//     try {
//       await axios.post(
//         `${BACKEND_URL}/api/chats/addDesktopChats`,
//         {
//           date: tempId,
//           bot: botResponse,
//           user: userMessage,
//         },
//         { withCredentials: true }
//       );
      
//       getUserData();
//     } catch (error) {
//       // console.error("Error saving to database:", error);
//     }
//   }

//   // 🔥 CHANGE: Delete individual message function
//   // async function deleteMessage(messageId) {
//   //   try {
//   //     await axios.post(
//   //       `${BACKEND_URL}/api/chats/deleteSpecificMessage`,
//   //       { messageId },
//   //       { withCredentials: true }
//   //     );
      
//   //     setactualList(prev => prev.filter(item => item.id !== messageId && item.date !== messageId));
//   //     toast.success("Message deleted successfully");
//   //     getUserData();
//   //   } catch (error) {
//   //     // console.error("Error deleting message:", error);
//   //     toast.error("Failed to delete message");
//   //   }
//   // }

//   // 🔥 CHANGE: Enhanced message formatting function for AI responses
//   function formatAIResponse(text) {
//     if (!text) return "";
    
//     return text
//       .split('\n')
//       .map((line, index) => {
//         if (line.trim().startsWith('-') || line.trim().startsWith('*')) {
//           return (
//             <li key={index} className="ml-3 mb-1 text-xs">
//               {line.trim().substring(1).trim()}
//             </li>
//           );
//         }
        
//         if (/^\d+\./.test(line.trim())) {
//           return (
//             <li key={index} className="ml-3 mb-1 list-decimal text-xs">
//               {line.trim().replace(/^\d+\.\s*/, '')}
//             </li>
//           );
//         }
        
//         if (line.trim().endsWith(':') && line.trim().length < 30) {
//           return (
//             <h4 key={index} className="font-semibold mt-2 mb-1 text-xs">
//               {line.trim()}
//             </h4>
//           );
//         }
        
//         if (line.trim()) {
//           return (
//             <p key={index} className="mb-1 leading-relaxed text-xs">
//               {line.trim()}
//             </p>
//           );
//         }
        
//         return <br key={index} />;
//       });
//   }

//   return (
//     <div
//       className={`w-[74vw] h-[60vh] lg:w-1/4 lg:h-5/6 fixed bottom-2 right-2 z-50 flex flex-col rounded-xl shadow-xl border overflow-hidden ${
//         isLightMode ? "bg-white" : "bg-gray-950"
//       }`}
//     >
//       {/* 🔥 CHANGE: Updated Header with STILLMIND branding and theme-aware colors */}
//       <div className={`flex items-center justify-between p-3 shadow-md ${themeColors.bgSecondary}`}>
//         <div className="flex items-center gap-2">
//           <CgArrowsExpandUpLeft
//             onClick={() => Navigate("/ChatDesktop")}
//             className={`cursor-pointer ${
//               isLightMode ? "text-black" : "text-white"
//             }`}
//           />
//           <span className={`text-sm font-bold ${themeColors.primary}`}>
//             CodeDoodle
//           </span>
//           <span className="text-xs opacity-60 font-normal">
//             {/* {currentTheme} */}
//           </span>
//         </div>
//         <ImCross
//           className={`cursor-pointer text-sm text-gray-500 ${
//             isLightMode ? "hover:text-blue-500" : "hover:text-white"
//           } transform transition duration-300 hover:scale-110 hover:rotate-90`}
//           onClick={() => setisChatOpen((prev) => !prev)}
//         />
//       </div>

//       {/* 🔥 CHANGE: Enhanced Chat messages with better formatting and delete functionality */}
//       <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-3 space-y-3 hide-scrollbar">
//         {actualList.map((item, index) => (
//           <div key={item.id || index} className="space-y-2">
//             {/* User Message with delete button */}
//             <div
//               className={`p-2 rounded-lg flex gap-2 items-start justify-between ${
//                 isLightMode
//                   ? "bg-gray-100 text-black"
//                   : "bg-gray-900 text-white"
//               }`}
//             >
//               <div className="flex gap-2 flex-1">
//                 <img
//                   src="https://th.bing.com/th/id/OIP.w-f-qDRUjGt9e_SuPTcfcgHaHw?rs=1&pid=ImgDetMain"
//                   className="w-6 h-6 rounded-full flex-shrink-0"
//                   alt="User"
//                 />
//                 <div className="flex-1">
//                   <div className="text-xs font-medium leading-relaxed">{item.user}</div>
//                   <div className="text-xs text-gray-400 mt-1">
//                     {formatTime(item.date)}
//                   </div>
//                 </div>
//               </div>
//               <div className="flex gap-1 items-start">
//                 <button 
//                   className={`${themeColors.primary} hover:opacity-70 text-xs p-1`}
//                   title="Edit"
//                 >
//                   <FaEdit />
//                 </button>
//                 {/* 🔥 CHANGE: Added delete button for individual messages */}
//                 {/* <button
//                   onClick={() => deleteMessage(item.id || item.date)}
//                   className="text-red-500 hover:text-red-700 text-xs p-1"
//                   title="Delete"
//                 >
//                   <FaTrash />
//                 </button> */}
//               </div>
//             </div>
            
//             {/* 🔥 CHANGE: Enhanced AI Response with better formatting and streaming */}
//             <div
//               className={`p-2 rounded-lg flex gap-2 justify-between items-start ${
//                 isLightMode ? themeColors.bgSecondary + " text-black" : "bg-gray-800 text-white"
//               }`}
//             >
//               <div className="flex gap-2 flex-1">
//                 <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${themeColors.bgPrimary}`}>
//                   S
//                 </div>
//                 <div className="flex-1">
//                   <div className="text-xs">
//                     {item.bot == null ? (
//                       <div className="flex items-center gap-2">
//                         <div className={`w-3 h-3 border-2 ${themeColors.primary.replace('text-', 'border-')} border-t-transparent rounded-full animate-spin`}></div>
//                         <span className="text-gray-500">Thinking...</span>
//                       </div>
//                     ) : (
//                       <div className="prose prose-xs max-w-none">
//                         {/* 🔥 CHANGE: Enhanced formatting for AI responses */}
//                         <div className="leading-relaxed space-y-1">
//                           {formatAIResponse(item.bot)}
//                         </div>
//                         {/* 🔥 CHANGE: Show streaming cursor for active streaming */}
//                         {item.isStreaming && (
//                           <span className="inline-block w-1 h-3 bg-blue-500 animate-pulse ml-1"></span>
//                         )}
//                       </div>
//                     )}
//                   </div>
//                   <div className="text-xs text-gray-400 mt-1">
//                     {formatTime(item.date)}
//                   </div>
//                 </div>
//               </div>
//               <div className={`flex gap-1 text-xs ${themeColors.primary}`}>
//                 <button 
//                   onClick={() => speakText(item.bot)}
//                   className="hover:opacity-70 p-1"
//                   title="Read aloud"
//                 >
//                   <AiFillSound />
//                 </button>
//                 <CopyToClipboard text={item.bot} onCopy={() => setCopied(true)}>
//                   <button className="hover:opacity-70 p-1" title="Copy">
//                     <FaCopy />
//                   </button>
//                 </CopyToClipboard>
//               </div>
//             </div>
//           </div>
//         ))}
//       </div>

//       {/* 🔥 CHANGE: Enhanced AI Suggestions Section with professional UI and disable functionality */}
//       {(suggestions.length > 0 || loadingSuggestions) && (
//         <div className={`px-3 py-2 border-t ${isLightMode ? "bg-gray-50 border-gray-200" : "bg-gray-800 border-gray-700"}`}>
//           <div className="flex items-center justify-between mb-2">
//             <div className="flex items-center gap-2">
//               <MdLightbulb className={`${themeColors.primary} text-xs`} />
//               <span className="text-xs font-medium text-gray-600">
//                 AI Suggestions
//               </span>
//             </div>
//             <button
//               onClick={() => setSuggestionsEnabled(!suggestionsEnabled)}
//               className={`text-xs px-2 py-1 rounded-full border transition-all duration-200 ${
//                 suggestionsEnabled
//                   ? `${themeColors.bgPrimary} text-white`
//                   : isLightMode
//                   ? "bg-gray-200 text-gray-600 border-gray-300"
//                   : "bg-gray-700 text-gray-300 border-gray-600"
//               }`}
//             >
//               {suggestionsEnabled ? "On" : "Off"}
//             </button>
//           </div>
          
//           {suggestionsEnabled && (
//             <div className="flex flex-wrap gap-1">
//               {loadingSuggestions ? (
//                 <div className="flex items-center gap-2">
//                   <div className={`w-3 h-3 border-2 ${themeColors.primary.replace('text-', 'border-')} border-t-transparent rounded-full animate-spin`}></div>
//                   <span className="text-xs text-gray-500">Loading...</span>
//                 </div>
//               ) : (
//                 suggestions.map((suggestion, index) => (
//                   <div 
//                     key={index}
//                     className={`group relative flex items-center rounded-lg border transition-all duration-200 hover:scale-105 ${
//                       isLightMode
//                         ? `bg-white ${themeColors.border} ${themeColors.primary}`
//                         : "bg-gray-700 border-gray-600 text-blue-300"
//                     }`}
//                   >
//                     <button
//                       onClick={() => handleSuggestionClick(suggestion)}
//                       className="flex-1 px-2 py-1 text-xs text-left"
//                     >
//                       {suggestion}
//                     </button>
//                     {/* 🔥 CHANGE: Individual suggestion dismiss button */}
//                     <button
//                       onClick={() => removeSuggestion(index)}
//                       className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1 text-gray-400 hover:text-red-500"
//                       title="Remove"
//                     >
//                       <MdClose className="text-xs" />
//                     </button>
//                   </div>
//                 ))
//               )}
//             </div>
//           )}
//         </div>
//       )}

//       {/* 🔥 CHANGE: Enhanced Input with Enter key support and theme-aware styling */}
//       <div
//         className={`flex items-center gap-2 p-3 ${
//           isLightMode ? "bg-white border-t border-gray-200" : "bg-black border-t border-gray-700"
//         }`}
//       >
//         <input
//           ref={inputRef}
//           type="text"
//           value={data}
//           onChange={(e) => setData(e.target.value)}
//           onKeyPress={handleKeyPress} // 🔥 CHANGE: Added Enter key support
//           placeholder="Message CodeDoodle..."
//           disabled={isStreaming}
//           className={`flex-1 px-3 py-2 text-xs rounded-md border focus:outline-none focus:ring-2 transition-all duration-200 ${
//             isStreaming 
//               ? "opacity-50 cursor-not-allowed"
//               : ""
//           } ${
//             isLightMode
//               ? `bg-white text-black border-gray-300 focus:${themeColors.primary.replace('text-', 'ring-')}`
//               : `bg-gray-800 text-white border-gray-700 focus:${themeColors.primary.replace('text-', 'ring-')}`
//           }`}
//         />
//         <button
//           onClick={onSend}
//           disabled={isStreaming || !data.trim()}
//           className={`p-2 rounded-md transition-all duration-200 hover:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${themeColors.bgPrimary}`}
//         >
//           {isStreaming ? (
//             <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
//           ) : (
//             <IoSend className="text-white text-sm" />
//           )}
//         </button>
//       </div>
//     </div>
//   );
// };

// export default Chat;
