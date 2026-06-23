import { useEffect, useState } from "react";
import "../App.css";  //already right
import { IoSend } from "react-icons/io5";
import { AiFillSound } from "react-icons/ai";
import { FaCopy, FaEdit } from "react-icons/fa";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { VscRobot } from "react-icons/vsc";
import { ImCross } from "react-icons/im";
import { MdDarkMode } from "react-icons/md";
import { MdLightMode } from "react-icons/md";
import generateContent from "../ChatBox/gemini";
import ShareCircleBold from "../assets/ShareCircleBold";
import { MdOutlineDelete } from "react-icons/md";
import { toast, Toaster } from "react-hot-toast";
import axios from "axios";
import { useAppContext } from "../Context/AppContext";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";   //added framer-motion link commit-1

const ChatDesktop = ({ isLightMode, setisLightMode }) => {
  const Navigate = useNavigate();
  const { userData, BACKEND_URL, getUserData } = useAppContext();
  const [isMenuOpen, setisMenuOpen] = useState(false);
  const [text, setText] = useState("");
  const [copied, setCopied] = useState(false);
  const [chats, setChats] = useState([]);
  const [data, setData] = useState(""); //mera question
  const [bot, setBot] = useState(""); //mera answer
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

  // console.log("USER DATA IS BELOW : ");

  // useEffect(() => console.log(userData), [userData]);

  function click(data) {
    setapplied(data ? "hidden" : "show");
    setClass(data ? "child-show" : "child-hidden");
    setmyval(data ? "close" : "open");
    setisOpen(!data);
  }

  function fixData(e) {
    setData(e.target.value);
  }

  function speakText(mytext) {
    if (!mytext) return;
    const utterance = new SpeechSynthesisUtterance(mytext);
    window.speechSynthesis.speak(utterance);
  }

  // console.log("actualList is : ");
  // console.log(actualList);

  async function onSend() {
    if (data.trim() === "") return;

    let O = await generateContent(data);
    let output = await O.replace(/\*/g, "");
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

  async function deleteAllDesktopChats() {
    setDelIsOpen(true);
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

  async function closeScreen() {
    setConfirm("");    //added newly
    setDelIsOpen(false);
  }

  function ending() {
    click(isOpen);
    setmyquery(remainFix);
    setremainFix("empty");
  }

  function copyKar() {
    toast.success("Copied to Clipboard");
  }

  function fixData2(e) {
    setTempUpdate(e.target.value);
    setmyquery(e.target.value);
  }

  return (
    <>
      <Toaster />
      <div
        className={`fixed inset-0 z-50 ${
          isLightMode ? "bg-gray-100" : "bg-gray-950"
        } flex items-center justify-center`}
      >
        <div
          className={`w-full h-full sm:rounded-none overflow-hidden flex flex-col border border-gray-300 ${
            isLightMode ? "bg-white" : "bg-gray-950"
          }`}
        >
          {/* Header */}
          <div className=" shadow-md px-4 py-3 flex">
            <div className=" pl-3 sm:text-2xl font-bold w-full flex justify-between items-center gap-2">
              <div className="flex gap-6 items-center">
                <ShareCircleBold
                  onClick={() => Navigate("/")}
                  className={`${
                    isLightMode ? "text-black" : "text-white"
                  } cursor-pointer`}
                />
                <span
                  className={`${isLightMode ? "text-blue-600" : "text-white"}`}
                >
                  ChatBox
                </span>
              </div>
              <button
                className={`text-black text-2xl hover:text-red-700 hover:cursor-pointer hover:scale-110 transform transition-all duration-300 `}
                onClick={() => deleteAllDesktopChats()}
              >
                <MdOutlineDelete
                  className={`hover:text-red-500 ${
                    isLightMode ? "text-black" : "text-white"
                  }`}
                />
              </button>
            </div>
          </div>

          {delIsOpen && (
            <motion.div
              initial={{ opacity: 0, y: -30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className={`${!isOpen ? "hidden" : "fixed"} inset-0 ${
                isLightMode
                  ? "bg-black bg-opacity-30"
                  : "bg-black bg-opacity-50"
              } text-black flex justify-center backdrop-blur-sm items-center z-50 px-4`}
            >
              <div
                className={`${
                  isLightMode
                    ? "bg-white border-gray-200 text-black"
                    : "bg-gray-900 border-gray-700 text-white"
                } border-2 rounded-lg shadow-lg w-full max-w-lg sm:max-w-md md:max-w-lg lg:max-w-xl p-4 sm:p-6`}
              >
                <p className="text-base sm:text-lg font-light mb-4 text-center">
                  Are You Sure to delete this File? Type{" "}
                  <span className="font-bold text-pink-600">
                    "Delete Chat History"
                  </span>{" "}
                  to delete the file from your workspace.
                </p>

                <input
                  type="text"
                  placeholder={`Enter 'Delete Chat History'`}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className={`w-full border rounded-md px-3 py-2 mt-2 sm:mt-4 focus:outline-none focus:ring-2 ${
                    isLightMode
                      ? "bg-gray-100 text-black border-gray-300 focus:ring-blue-400"
                      : "bg-gray-800 text-white border-gray-600 focus:ring-orange-400"
                  }`}
                />

                <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mt-6">
                  <button
                    className={`w-full sm:w-auto px-5 py-2 rounded-lg transition-all duration-300 active:scale-95 ${
                      isLightMode
                        ? "bg-pink-500 text-white hover:bg-pink-600"
                        : "bg-orange-500 text-black hover:bg-orange-600"
                    }`}
                    onClick={closeScreen}
                  >
                    Close
                  </button>

                  <button
                    className={`w-full sm:w-auto px-5 py-2 rounded-lg transition-all duration-300 active:scale-95 ${
                      isLightMode
                        ? "bg-blue-500 text-white hover:bg-blue-600"
                        : "bg-green-500 text-black hover:bg-green-600"
                    }`}
                    onClick={checkValidity}
                  >
                    Confirm
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto hide-scrollbar p-4">
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
              isLightMode ? "bg-white" : "bg-gray-950"
            }`}
          >
            <input
              type="text"
              value={data}
              onChange={fixData}
              placeholder="Enter your query"
              className={`flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 ${
                isLightMode ? "text-black" : " text-white bg-transparent"
              }`}
            />
            <button
              onClick={() => onSend()}
              className={`bg-blue-500 cursor-pointer text-white rounded-md px-4 py-2 m-2 my-3 hover:scale-100 transform transition-all ease-in-out hover:active:scale-90 ${
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
              <h3 className="text-xl font-semibold mb-4">
                Do you want to edit?
              </h3>

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
        </div>
      </div>
    </>
  );
};

export default ChatDesktop;












// import { useEffect, useState, useRef } from "react";
// import "../App.css";
// import { IoSend } from "react-icons/io5";
// import { AiFillSound } from "react-icons/ai";
// import { FaCopy, FaEdit } from "react-icons/fa";
// import { CopyToClipboard } from "react-copy-to-clipboard";
// import { VscRobot } from "react-icons/vsc";
// import { ImCross } from "react-icons/im";
// import { MdDarkMode, MdLightMode, MdOutlineDelete } from "react-icons/md";
// import {generateSuggestions, generateStreamingContent } from "../ChatBox/gemini.js";
// import ShareCircleBold from "../assets/ShareCircleBold";
// import { toast, Toaster } from "react-hot-toast";
// import axios from "axios";
// import { useAppContext } from "../Context/AppContext";
// import { useNavigate } from "react-router-dom";
// import { MdLightbulb, MdLightbulbOutline, MdClose } from "react-icons/md";
// import { FaTrash } from "react-icons/fa";

// const ChatDesktop = ({ isLightMode, setisLightMode }) => {
//   const Navigate = useNavigate();
//   const { userData, BACKEND_URL, getUserData } = useAppContext();
//   const [isMenuOpen, setisMenuOpen] = useState(false);
//   const [text, setText] = useState("");
//   const [copied, setCopied] = useState(false);
//   const [chats, setChats] = useState([]);
//   const [data, setData] = useState(""); // user question
//   const [bot, setBot] = useState(""); // AI answer
//   const [myclass, setClass] = useState("child-hidden");
//   const [isOpen, setisOpen] = useState(true);
//   const [myval, setmyval] = useState("open");
//   const [applied, setapplied] = useState("show");
//   const [myquery, setmyquery] = useState("");
//   const [tempUpdate, setTempUpdate] = useState("");
//   const [remainFix, setremainFix] = useState("");
//   const [delIsOpen, setDelIsOpen] = useState(false);
//   const [confirm, setConfirm] = useState("");
//   const [actualList, setactualList] = useState([]);
//   const [count, setcount] = useState(0);
  
//   const [suggestions, setSuggestions] = useState([]);
//   const [loadingSuggestions, setLoadingSuggestions] = useState(false);
//   const [suggestionsEnabled, setSuggestionsEnabled] = useState(true);
  
//   const [streamingResponse, setStreamingResponse] = useState("");
//   const [isStreaming, setIsStreaming] = useState(false);
//   const [currentStreamingIndex, setCurrentStreamingIndex] = useState(null);
  
//   const [currentTheme, setCurrentTheme] = useState("default");
  
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

//   function click(data) {
//     setapplied(data ? "hidden" : "show");
//     setClass(data ? "child-show" : "child-hidden");
//     setmyval(data ? "close" : "open");
//     setisOpen(!data);
//   }

//   function fixData(e) {
//     setData(e.target.value);
//   }

//   function handleKeyPress(e) {
//     if (e.key === 'Enter' && !e.shiftKey) {
//       e.preventDefault();
//       onSend();
//     }
//   }

//   function speakText(mytext) {
//     if (!mytext) return;
//     const utterance = new SpeechSynthesisUtterance(mytext);
//     window.speechSynthesis.speak(utterance);
//   }

//   async function onSend() {
//     if (data.trim() === "") return;

//     const userMessage = data.trim();
//     const tempId = Date.now(); // Temporary ID for immediate display
    
//     // 🔥 CHANGE: Immediately add user message to chat (like ChatGPT)
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

//       // 🔥 CHANGE: Finalize the streaming response
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
      
//       getUserData(); // Refresh user data
//     } catch (error) {
//       // console.error("Error saving to database:", error);
//     }
//   }

//   async function deleteMessage(messageId) {
//     try {
//       await axios.post(
//         `${BACKEND_URL}/api/chats/deleteSpecificMessage`,
//         { messageId },
//         { withCredentials: true }
//       );
      
//       // Remove from local state
//       setactualList(prev => prev.filter(item => item.id !== messageId && item.date !== messageId));
//       toast.success("Message deleted successfully");
//       getUserData(); // Refresh user data
//     } catch (error) {
//       // console.error("Error deleting message:", error);
//       toast.error("Failed to delete message");
//     }
//   }

//   function perform(mylastquery) {
//     click(isOpen);
//     setmyquery(mylastquery);
//     setremainFix(mylastquery);
//   }

//   function perform2(updatedQuery) {
//     setData(updatedQuery);
//     click(isOpen);
//   }

//   async function deleteAllDesktopChats() {
//     setDelIsOpen(true);
//   }

//   async function checkValidity() {
//     const realQuery = "delete chat history";
//     if (confirm.toLowerCase() === realQuery) {
//       await axios
//         .post(
//           `${BACKEND_URL}/api/chats/deleteDesktopChats`,
//           {},
//           { withCredentials: true }
//         )
//         .then((res) => {
//           setConfirm("");
//           setactualList([]);
//           toast.success("History Chats deleted successfully");
//           setDelIsOpen(false);
//         })
//         .catch((e) => {
//           // console.log("Internal Error in deleting from Database");
//         });
//     } else {
//       toast.error("Please type 'Delete Chat history'");
//     }
//   }

//   async function closeScreen() {
//     setDelIsOpen(false);
//   }

//   function ending() {
//     click(isOpen);
//     setmyquery(remainFix);
//     setremainFix("empty");
//   }

//   function copyKar() {
//     toast.success("Copied to Clipboard");
//   }

//   function fixData2(e) {
//     setTempUpdate(e.target.value);
//     setmyquery(e.target.value);
//   }

//   function formatAIResponse(text) {
//     if (!text) return "";
    
//     return text
//       .split('\n')
//       .map((line, index) => {
//         // Handle bullet points
//         if (line.trim().startsWith('-') || line.trim().startsWith('*')) {
//           return (
//             <li key={index} className="ml-4 mb-1">
//               {line.trim().substring(1).trim()}
//             </li>
//           );
//         }
        
//         // Handle numbered lists
//         if (/^\d+\./.test(line.trim())) {
//           return (
//             <li key={index} className="ml-4 mb-1 list-decimal">
//               {line.trim().replace(/^\d+\.\s*/, '')}
//             </li>
//           );
//         }
        
//         // Handle headers (lines that end with :)
//         if (line.trim().endsWith(':') && line.trim().length < 50) {
//           return (
//             <h4 key={index} className="font-semibold mt-3 mb-2 text-sm">
//               {line.trim()}
//             </h4>
//           );
//         }
        
//         // Regular paragraphs
//         if (line.trim()) {
//           return (
//             <p key={index} className="mb-2 leading-relaxed">
//               {line.trim()}
//             </p>
//           );
//         }
        
//         return <br key={index} />;
//       });
//   }

//   return (
//     <>
//       <Toaster />
//       <div
//         className={`fixed inset-0 z-50 ${
//           isLightMode ? "bg-gray-100" : "bg-gray-950"
//         } flex items-center justify-center`}
//       >
//         <div
//           className={`w-full h-full sm:rounded-none overflow-hidden flex flex-col border border-gray-300 ${
//             isLightMode ? "bg-white" : "bg-gray-950"
//           }`}
//         >
//           {/* 🔥 CHANGE: Updated Header with STILLMIND branding and theme-aware colors */}
//           <div className={`shadow-md px-4 py-3 flex ${themeColors.bgSecondary}`}>
//             <div className="pl-3 sm:text-2xl font-bold w-full flex justify-between items-center gap-2">
//               <div className="flex gap-6 items-center">
//                 <ShareCircleBold
//                   onClick={() => Navigate("/")}
//                   className={`${
//                     isLightMode ? "text-black" : "text-white"
//                   } cursor-pointer`}
//                 />
//                 <span className={`${themeColors.primary} font-bold`}>
//                   CodeDoodle
//                 </span>
//                 <span className="text-xs opacity-60 font-normal">
//                   {/* {currentTheme.charAt(0).toUpperCase() + currentTheme.slice(1)} Mode */}
                  
//                 </span>
//               </div>
//               <button
//                 className="text-black text-2xl hover:text-red-700 hover:cursor-pointer hover:scale-110 transform transition-all duration-300"
//                 onClick={() => deleteAllDesktopChats()}
//               >
//                 <MdOutlineDelete
//                   className={`hover:text-red-500 ${
//                     isLightMode ? "text-black" : "text-white"
//                   }`}
//                 />
//               </button>
//             </div>
//           </div>

//           {delIsOpen && (
//             <div
//               className={`${!isOpen ? "hidden" : "fixed"} inset-0 ${
//                 isLightMode
//                   ? "bg-black bg-opacity-30"
//                   : "bg-black bg-opacity-50"
//               } text-black flex justify-center backdrop-blur-sm items-center z-50 px-4`}
//             >
//               <div
//                 className={`${
//                   isLightMode
//                     ? "bg-white border-gray-200 text-black"
//                     : "bg-gray-900 border-gray-700 text-white"
//                 } border-2 rounded-lg shadow-lg w-full max-w-lg sm:max-w-md md:max-w-lg lg:max-w-xl p-4 sm:p-6`}
//               >
//                 <p className="text-base sm:text-lg font-light mb-4 text-center">
//                   Are You Sure to delete this File? Type{" "}
//                   <span className="font-bold text-pink-600">
//                     "Delete Chat History"
//                   </span>{" "}
//                   to delete the file from your workspace.
//                 </p>

//                 <input
//                   type="text"
//                   placeholder={`Enter 'Delete Chat History'`}
//                   value={confirm}
//                   onChange={(e) => setConfirm(e.target.value)}
//                   className={`w-full border rounded-md px-3 py-2 mt-2 sm:mt-4 focus:outline-none focus:ring-2 ${
//                     isLightMode
//                       ? "bg-gray-100 text-black border-gray-300 focus:ring-blue-400"
//                       : "bg-gray-800 text-white border-gray-600 focus:ring-orange-400"
//                   }`}
//                 />

//                 <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mt-6">
//                   <button
//                     className={`w-full sm:w-auto px-5 py-2 rounded-lg transition-all duration-300 active:scale-95 ${
//                       isLightMode
//                         ? "bg-pink-500 text-white hover:bg-pink-600"
//                         : "bg-orange-500 text-black hover:bg-orange-600"
//                     }`}
//                     onClick={closeScreen}
//                   >
//                     Close
//                   </button>

//                   <button
//                     className={`w-full sm:w-auto px-5 py-2 rounded-lg transition-all duration-300 active:scale-95 ${
//                       isLightMode
//                         ? "bg-blue-500 text-white hover:bg-blue-600"
//                         : "bg-green-500 text-black hover:bg-green-600"
//                     }`}
//                     onClick={checkValidity}
//                   >
//                     Confirm
//                   </button>
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* 🔥 CHANGE: Enhanced Chat Messages with better formatting and delete functionality */}
//           <div ref={chatContainerRef} className="flex-1 overflow-y-auto hide-scrollbar p-4">
//             <div className="space-y-4">
//               {actualList.map((item, index) => (
//                 <div key={item.id || index} className="space-y-3">
//                   {/* User Message with delete button */}
//                   <div
//                     className={`p-4 rounded-xl ${
//                       isLightMode
//                         ? "bg-gray-100 text-black"
//                         : "bg-gray-900 text-white"
//                     } flex justify-between items-start hover:shadow-md transition-shadow duration-200`}
//                   >
//                     <div className="flex gap-3 flex-1">
//                       <img
//                         src="https://th.bing.com/th/id/OIP.w-f-qDRUjGt9e_SuPTcfcgHaHw?rs=1&pid=ImgDetMain"
//                         className="w-10 h-10 rounded-full flex-shrink-0"
//                         alt="User"
//                       />
//                       <div className="flex-1">
//                         <div className="text-sm font-medium leading-relaxed">
//                           {item.user}
//                         </div>
//                         <div className="text-xs text-gray-500 mt-1">
//                           {formatTime(item.date)}
//                         </div>
//                       </div>
//                     </div>
//                     <div className="flex gap-2 items-start">
//                       <button
//                         onClick={() => perform(item.user)}
//                         className={`${themeColors.primary} hover:opacity-70 hover:cursor-pointer p-1 rounded`}
//                         title="Edit message"
//                       >
//                         <FaEdit />
//                       </button>
//                       {/* 🔥 CHANGE: Added delete button for individual messages */}
//                       <button
//                         onClick={() => deleteMessage(item.id || item.date)}
//                         className="text-red-500 hover:text-red-700 hover:cursor-pointer p-1 rounded"
//                         title="Delete message"
//                       >
//                         <FaTrash className="text-xs" />
//                       </button>
//                     </div>
//                   </div>

//                   {/* 🔥 CHANGE: Enhanced AI Response with better formatting and streaming */}
//                   <div
//                     className={`p-4 rounded-xl flex justify-between items-start hover:shadow-md transition-shadow duration-200 ${
//                       isLightMode
//                         ? themeColors.bgSecondary + " text-black"
//                         : "bg-gray-800 text-white"
//                     }`}
//                   >
//                     <div className="flex gap-3 flex-1">
//                       <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-lg font-bold flex-shrink-0 ${themeColors.bgPrimary}`}>
//                         S
//                       </div>
//                       <div className="flex-1">
//                         <div className="text-sm">
//                           {item.bot == null ? (
//                             <div className="flex items-center gap-2">
//                               <div className={`w-4 h-4 border-2 ${themeColors.primary.replace('text-', 'border-')} border-t-transparent rounded-full animate-spin`}></div>
//                               <span className="text-gray-500">CodeDoodle is thinking...</span>
//                             </div>
//                           ) : (
//                             <div className="prose prose-sm max-w-none">
//                               {/* 🔥 CHANGE: Enhanced formatting for AI responses */}
//                               <div className="leading-relaxed space-y-2">
//                                 {formatAIResponse(item.bot)}
//                               </div>
//                               {/* 🔥 CHANGE: Show streaming cursor for active streaming */}
//                               {item.isStreaming && (
//                                 <span className="inline-block w-2 h-4 bg-blue-500 animate-pulse ml-1"></span>
//                               )}
//                             </div>
//                           )}
//                         </div>
//                         <div className="text-xs text-gray-500 mt-2">
//                           {formatTime(item.date)}
//                         </div>
//                       </div>
//                     </div>
//                     <div className={`flex gap-2 items-center ${themeColors.primary}`}>
//                       <button 
//                         onClick={() => speakText(item.bot)}
//                         className="hover:opacity-70 p-1 rounded"
//                         title="Read aloud"
//                       >
//                         <AiFillSound />
//                       </button>
//                       <CopyToClipboard
//                         text={item.bot}
//                         onCopy={() => setCopied(true)}
//                       >
//                         <button 
//                           className="hover:opacity-70 p-1 rounded"
//                           title="Copy response"
//                         >
//                           <FaCopy onClick={() => copyKar()} />
//                         </button>
//                       </CopyToClipboard>
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>

//           {/* 🔥 CHANGE: Enhanced AI Suggestions Section with professional UI and disable functionality */}
//           {(suggestions.length > 0 || loadingSuggestions) && (
//             <div className={`px-4 py-3 border-t ${isLightMode ? "bg-gray-50 border-gray-200" : "bg-gray-800 border-gray-700"}`}>
//               <div className="flex items-center justify-between mb-3">
//                 <div className="flex items-center gap-2">
//                   <MdLightbulb className={`${themeColors.primary} text-sm`} />
//                   <span className="text-sm font-medium text-gray-600">
//                     AI Suggestions
//                   </span>
//                 </div>
//                 <button
//                   onClick={() => setSuggestionsEnabled(!suggestionsEnabled)}
//                   className={`text-xs px-3 py-1 rounded-full border transition-all duration-200 ${
//                     suggestionsEnabled
//                       ? `${themeColors.bgPrimary} text-white`
//                       : isLightMode
//                       ? "bg-gray-200 text-gray-600 border-gray-300 hover:bg-gray-300"
//                       : "bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600"
//                   }`}
//                   title={suggestionsEnabled ? "Disable suggestions" : "Enable suggestions"}
//                 >
//                   {suggestionsEnabled ? "Enabled" : "Disabled"}
//                 </button>
//               </div>
              
//               {suggestionsEnabled && (
//                 <div className="flex flex-wrap gap-2">
//                   {loadingSuggestions ? (
//                     <div className="flex items-center gap-2">
//                       <div className={`w-4 h-4 border-2 ${themeColors.primary.replace('text-', 'border-')} border-t-transparent rounded-full animate-spin`}></div>
//                       <span className="text-sm text-gray-500">Generating suggestions...</span>
//                     </div>
//                   ) : (
//                     suggestions.map((suggestion, index) => (
//                       <div 
//                         key={index}
//                         className={`group relative flex items-center rounded-lg border transition-all duration-200 hover:scale-105 ${
//                           isLightMode
//                             ? `bg-white ${themeColors.border} ${themeColors.primary} hover:${themeColors.bgSecondary.replace('bg-', 'hover:bg-')}`
//                             : "bg-gray-700 border-gray-600 text-blue-300 hover:bg-gray-600 hover:border-blue-400"
//                         }`}
//                       >
//                         <button
//                           onClick={() => handleSuggestionClick(suggestion)}
//                           className="flex-1 px-4 py-2 text-sm text-left"
//                         >
//                           {suggestion}
//                         </button>
//                         {/* 🔥 CHANGE: Individual suggestion dismiss button */}
//                         <button
//                           onClick={() => removeSuggestion(index)}
//                           className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-2 text-gray-400 hover:text-red-500"
//                           title="Remove this suggestion"
//                         >
//                           <MdClose className="text-xs" />
//                         </button>
//                       </div>
//                     ))
//                   )}
//                 </div>
//               )}
//             </div>
//           )}

//           {/* 🔥 CHANGE: Enhanced Input with Enter key support and theme-aware styling */}
//           <div
//             className={`px-4 py-3 flex gap-2 items-center ${
//               isLightMode ? "bg-white border-t border-gray-200" : "bg-gray-950 border-t border-gray-700"
//             }`}
//           >
//             <input
//               ref={inputRef}
//               type="text"
//               value={data}
//               onChange={fixData}
//               onKeyPress={handleKeyPress} // 🔥 CHANGE: Added Enter key support
//               placeholder="Type your message to CodeDoodle..."
//               disabled={isStreaming}
//               className={`flex-1 border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 transition-all duration-200 ${
//                 isStreaming 
//                   ? "opacity-50 cursor-not-allowed"
//                   : ""
//               } ${
//                 isLightMode 
//                   ? `text-black bg-gray-50 border-gray-300 focus:${themeColors.primary.replace('text-', 'ring-')}`
//                   : `text-white bg-gray-800 border-gray-600 focus:${themeColors.primary.replace('text-', 'ring-')}`
//               }`}
//             />
//             <button
//               onClick={onSend}
//               disabled={isStreaming || !data.trim()}
//               className={`rounded-xl px-6 py-3 transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${themeColors.bgPrimary} text-white`}
//             >
//               {isStreaming ? (
//                 <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
//               ) : (
//                 <IoSend className="text-lg" />
//               )}
//             </button>
//           </div>

//           {/* Edit Modal - kept unchanged but with theme-aware colors */}
//           <div
//             className={`${isOpen ? "hidden" : "fixed"} inset-0 ${
//               isLightMode ? "bg-black bg-opacity-20" : "bg-black bg-opacity-40"
//             } flex justify-center items-center backdrop-blur-lg z-50`}
//           >
//             <div
//               className={`p-6 rounded-lg shadow-xl w-[90%] max-w-xl border ${
//                 isLightMode
//                   ? "bg-white border-gray-200 text-black"
//                   : "bg-gray-900 border-gray-700 text-white"
//               }`}
//             >
//               <h3 className="text-xl font-semibold mb-4">
//                 Do you want to edit?
//               </h3>

//               <textarea
//                 rows="6"
//                 defaultValue={myquery}
//                 onChange={fixData2}
//                 className={`w-full rounded-md px-4 py-2 text-sm resize-none mt-2 focus:outline-none focus:ring-2 ${
//                   isLightMode
//                     ? `bg-gray-100 text-black border border-gray-300 focus:${themeColors.primary.replace('text-', 'ring-')}`
//                     : "bg-gray-800 text-white border border-gray-600 focus:ring-orange-400"
//                 }`}
//               ></textarea>

//               <div className="flex justify-between items-center mt-6">
//                 <button
//                   onClick={() => perform2(tempUpdate)}
//                   className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium hover:scale-105 transition-all duration-300 active:scale-95 ${themeColors.bgPrimary} text-white`}
//                 >
//                   <IoSend className="text-lg" />
//                   Send
//                 </button>

//                 <button
//                   onClick={ending}
//                   className={`px-4 py-2 rounded-md font-medium transition-all duration-300 active:scale-95 border ${
//                     isLightMode
//                       ? "text-black border-black hover:bg-black hover:text-white"
//                       : "text-white border-white hover:bg-red-600 hover:border-red-600"
//                   }`}
//                 >
//                   Close
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </>
//   );
// };

// export default ChatDesktop;
