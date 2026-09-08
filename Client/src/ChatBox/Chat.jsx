import { useEffect, useState, useRef } from "react";
import { IoSend } from "react-icons/io5";
import generateContent from "./gemini";
import { AiFillSound } from "react-icons/ai";
import { FaCopy, FaEdit } from "react-icons/fa";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { ImCross } from "react-icons/im";
import "../App.css";
import { useAppContext } from "../Context/AppContext";
import axios from "axios";
import { CgArrowsExpandUpLeft } from "react-icons/cg";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { motion } from "framer-motion";

const Chat = ({ setisChatOpen, isLightMode }) => {
  const [actualList, setActualList] = useState([]);
  const [data, setData] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Edit Modal State
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editQuery, setEditQuery] = useState("");

  const { userData, BACKEND_URL, getUserData } = useAppContext();
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom of conversation
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [actualList, isLoading]);

  // Load existing user chats
  useEffect(() => {
    if (userData?.allChats) {
      setActualList(userData.allChats);
    }
  }, [userData?.allChats]);

  function formatTime(isoString) {
    if (!isoString) return "";
    const date = new Date(isoString);
    return date.toLocaleString("en-US", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  }

  function speakText(mytext) {
    if (!mytext) return;
    window.speechSynthesis.cancel(); // Stop any active speech
    const utterance = new SpeechSynthesisUtterance(mytext);
    window.speechSynthesis.speak(utterance);
  }

  // Unified Send Handler (Handles UI, Gemini API, and Database Sync)
 async function handleSend(queryToSend) {
    const prompt = (queryToSend || data).trim();
    if (!prompt || isLoading) return;

    const currentTimestamp = Date.now();
    setData("");

    // 1. Optimistic UI update
    setActualList((prev) => [
      ...prev,
      { user: prompt, bot: null, date: currentTimestamp },
    ]);
    setIsLoading(true);

    let cleanOutput = "";

    // 2. Fetch AI response first
    try {
      const rawOutput = await generateContent(prompt);
      cleanOutput = rawOutput ? rawOutput.replace(/\*/g, "") : "No response generated.";

      // Display bot response immediately
      setActualList((prev) =>
        prev.map((chat, idx) =>
          idx === prev.length - 1 ? { ...chat, bot: cleanOutput } : chat
        )
      );
    } catch (aiErr) {
      console.error("[Gemini Error]:", aiErr);
      toast.error("Failed to get answer from AI.");
      setActualList((prev) =>
        prev.map((chat, idx) =>
          idx === prev.length - 1 ? { ...chat, bot: "Error generating response." } : chat
        )
      );
      setIsLoading(false);
      return; // Stop here if Gemini genuinely failed
    } finally {
      setIsLoading(false);
    }

    // 3. Save to database in isolation (Failure here won't wipe the bot message)
    const currentUserId = userData?.id || userData?._id;
    if (currentUserId && cleanOutput) {
      try {
        await axios.post(
          `${BACKEND_URL}/api/chats/addDesktopChats`,
          {
            userId: currentUserId,
            user: prompt,
            bot: cleanOutput,
            date: currentTimestamp,
          },
          { withCredentials: true }
        );
        if (getUserData) getUserData();
      } catch (dbErr) {
        console.warn("[DB Save Warning]: Chat shown, but failed saving to DB:", dbErr);
      }
    }
  }

  // Open Edit Modal
  function openEdit(query) {
    setEditQuery(query);
    setIsEditOpen(true);
  }

  // Confirm Edited Prompt
  function submitEdit() {
    setIsEditOpen(false);
    handleSend(editQuery);
  }

  return (
    <>
      <Toaster />
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className={`w-3/4 lg:w-5/6 lg:max-w-sm h-1/2 lg:h-5/6 shadow-xl rounded-lg sm:rounded-2xl z-20 overflow-hidden border flex flex-col fixed bottom-0 right-0 mr-3 mb-3 ${
          isLightMode ? "bg-white border-gray-300" : "bg-gray-950 border-gray-800"
        }`}
      >
        {/* Header */}
        <div className="shadow-md px-4 py-3 flex justify-between items-center border-b border-inherit">
          <div className="flex items-center gap-3">
            <CgArrowsExpandUpLeft
              onClick={() => navigate("/ChatDesktop")}
              className={`hover:scale-110 transition-transform cursor-pointer text-xl ${
                isLightMode ? "text-black" : "text-white"
              }`}
              title="Expand Chat"
            />
            <span className={`font-bold ${isLightMode ? "text-blue-600" : "text-white"}`}>
              ChatBox
            </span>
          </div>
          <ImCross
            className={`cursor-pointer text-xs text-gray-500 hover:text-red-500 transition-colors`}
            onClick={() => setisChatOpen(false)}
          />
        </div>

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {actualList.map((item, index) => (
            <div key={index} className="space-y-2">
              {/* User Message */}
              <div
                className={`p-3 rounded-lg flex justify-between items-start ${
                  isLightMode ? "bg-gray-100 text-black" : "bg-gray-900 text-white"
                }`}
              >
                <div className="flex gap-3">
                  <img
                    src="https://th.bing.com/th/id/OIP.w-f-qDRUjGt9e_SuPTcfcgHaHw?rs=1&pid=ImgDetMain"
                    className="w-8 h-8 rounded-full"
                    alt="User"
                  />
                  <div>
                    <div className="text-sm font-semibold">{item.user}</div>
                    <div className="text-[10px] text-gray-400">{formatTime(item.date)}</div>
                  </div>
                </div>
                <button
                  onClick={() => openEdit(item.user)}
                  className="text-blue-500 hover:text-blue-700"
                >
                  <FaEdit size={14} />
                </button>
              </div>

              {/* Bot Response */}
              <div
                className={`p-3 rounded-lg flex justify-between items-start ${
                  isLightMode ? "bg-blue-50 text-black" : "bg-black text-white border border-gray-800"
                }`}
              >
                <div className="flex gap-3 flex-1">
                  <img
                    src="https://static.vecteezy.com/system/resources/previews/004/996/790/original/robot-chatbot-icon-sign-free-vector.jpg"
                    className="w-8 h-8 rounded-full flex-shrink-0"
                    alt="Bot"
                  />
                  <div className="flex-1 overflow-hidden">
                    <div className="text-sm break-words">
                      {item.bot === null ? (
                        <div className="flex items-center gap-2 text-xs text-gray-400 italic">
                          <span className="animate-pulse">Thinking...</span>
                        </div>
                      ) : (
                        item.bot
                      )}
                    </div>
                    {item.bot !== null && (
                      <div className="text-[10px] text-gray-400 mt-1">{formatTime(item.date)}</div>
                    )}
                  </div>
                </div>

                {item.bot !== null && (
                  <div className="flex gap-2 items-center text-blue-500 ml-2">
                    <button onClick={() => speakText(item.bot)} title="Speak">
                      <AiFillSound className="hover:text-blue-700 cursor-pointer" />
                    </button>
                    <CopyToClipboard text={item.bot} onCopy={() => toast.success("Copied!")}>
                      <button title="Copy">
                        <FaCopy className="hover:text-blue-700 cursor-pointer" />
                      </button>
                    </CopyToClipboard>
                  </div>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div
          className={`px-3 py-2 flex gap-2 items-center border-t ${
            isLightMode ? "bg-white border-gray-200" : "bg-gray-900 border-gray-800"
          }`}
        >
          <input
            type="text"
            value={data}
            onChange={(e) => setData(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            disabled={isLoading}
            placeholder={isLoading ? "Waiting for response..." : "Enter your query..."}
            className={`flex-1 border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 ${
              isLightMode
                ? "border-gray-300 text-black bg-white"
                : "border-gray-700 text-white bg-gray-950"
            }`}
          />
          <button
            onClick={() => handleSend()}
            disabled={isLoading || !data.trim()}
            className="p-2.5 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            <IoSend className="text-base" />
          </button>
        </div>

        {/* Edit Modal */}
        {isEditOpen && (
          <div className="fixed inset-0 bg-black/50 flex justify-center items-center backdrop-blur-sm z-50">
            <div
              className={`p-5 rounded-lg shadow-xl w-[90%] max-w-md border ${
                isLightMode ? "bg-white text-black border-gray-200" : "bg-gray-900 text-white border-gray-700"
              }`}
            >
              <h3 className="text-base font-semibold mb-3">Edit Query</h3>
              <textarea
                rows="4"
                value={editQuery}
                onChange={(e) => setEditQuery(e.target.value)}
                className={`w-full rounded-md p-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 border ${
                  isLightMode
                    ? "bg-gray-50 border-gray-300 text-black"
                    : "bg-gray-950 border-gray-700 text-white"
                }`}
              />
              <div className="flex justify-end gap-2 mt-4">
                <button
                  onClick={() => setIsEditOpen(false)}
                  className="px-3 py-1.5 rounded-md text-sm border hover:bg-gray-500/10"
                >
                  Cancel
                </button>
                <button
                  onClick={submitEdit}
                  className="px-4 py-1.5 rounded-md text-sm bg-blue-600 text-white hover:bg-blue-700"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </>
  );
};

export default Chat;