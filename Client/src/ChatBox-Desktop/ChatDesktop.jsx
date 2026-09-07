import { useEffect, useState, useRef } from "react";
import "../App.css";
import { IoSend } from "react-icons/io5";
import { AiFillSound } from "react-icons/ai";
import { FaCopy, FaEdit } from "react-icons/fa";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { MdOutlineDelete } from "react-icons/md";
import { toast, Toaster } from "react-hot-toast";
import axios from "axios";
import { useAppContext } from "../Context/AppContext";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import ShareCircleBold from "../assets/ShareCircleBold";
import generateContent from "../ChatBox/gemini";
import { supabase } from "../lib/supabase"; // Make sure this path points to your supabase client

const ChatDesktop = ({ isLightMode }) => {
  const Navigate = useNavigate();
  const { userData, BACKEND_URL, getUserData } = useAppContext();
  
  // Cleaned up states
  const [inputValue, setInputValue] = useState("");
  const [actualList, setactualList] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  // Edit Modal States
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editQuery, setEditQuery] = useState("");

  // Delete Modal States
  const [delIsOpen, setDelIsOpen] = useState(false);
  const [confirm, setConfirm] = useState("");

  // Auto-scroll reference
  const chatEndRef = useRef(null);

  // Load initial chats exactly twice to mimic your original logic
  const [count, setcount] = useState(0);
  useEffect(() => {
    if (count < 2 && userData?.allChats) {
      setactualList(userData.allChats);
      setcount((prev) => prev + 1);
    }
  }, [count, userData?.allChats]);

  // Auto-scroll to bottom whenever the chat list updates
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [actualList]);

  function formatTime(isoString) {
    const date = new Date(isoString);
    const options = {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    };
    return date.toLocaleString("en-US", options);
  }

  function speakText(mytext) {
    if (!mytext) return;
    const utterance = new SpeechSynthesisUtterance(mytext);
    window.speechSynthesis.speak(utterance);
  }

  // Handle Send & Database Update
  async function onSend(customText = null) {
    const textToProcess = customText !== null ? customText : inputValue;
    if (textToProcess.trim() === "") return;

    // Optimistically add message to UI with bot = null (triggering the loader)
    const newMsg = { user: textToProcess, bot: null, date: Date.now() };
    setactualList((prev) => [...prev, newMsg]);
    setInputValue("");
    setIsGenerating(true);

    try {
      // 1. Get Gemini Response
      let O = await generateContent(textToProcess);
      let botOutput = await O.replace(/\*/g, "");

      // 2. Update UI with actual bot response
      setactualList((prev) => {
        const updated = [...prev];
        updated[updated.length - 1].bot = botOutput;
        return updated;
      });

      // 3. Get Auth Session & Save to Database
      const { data: { session } } = await supabase.auth.getSession();
      
      await axios.post(
        `${BACKEND_URL}/api/chats/addDesktopChats`,
        { date: Date.now(), bot: botOutput, user: textToProcess },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token}`
          }
        }
      );
      
      getUserData();
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch response or save chat.");
    } finally {
      setIsGenerating(false);
    }
  }

  // Edit Action
  function openEditModal(oldQuery) {
    setEditQuery(oldQuery);
    setEditModalOpen(true);
  }

  function handleEditSend() {
    setEditModalOpen(false);
    onSend(editQuery);
  }

  // Delete Action
  async function checkValidity() {
    const realQuery = "delete chat history";
    if (confirm.toLowerCase() === realQuery) {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        await axios.post(
          `${BACKEND_URL}/api/chats/deleteDesktopChats`,
          {},
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${session?.access_token}`
            }
          }
        );
        
        setConfirm("");
        setactualList([]);
        setDelIsOpen(false);
        toast.success("Chat history deleted successfully");
      } catch (error) {
        toast.error("Error deleting chat history");
      }
    } else {
      toast.error("Please type 'Delete chat history'");
    }
  }

  // Support pressing "Enter" to send
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

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
          <div className="shadow-md px-4 py-3 flex">
            <div className="pl-3 sm:text-2xl font-bold w-full flex justify-between items-center gap-2">
              <div className="flex gap-6 items-center">
                <ShareCircleBold
                  onClick={() => Navigate("/")}
                  className={`${isLightMode ? "text-black" : "text-white"} cursor-pointer hover:scale-110 transition-transform`}
                />
                <span className={`${isLightMode ? "text-blue-600" : "text-white"}`}>
                  TraceSync Chat
                </span>
              </div>
              <button
                className="text-2xl hover:cursor-pointer hover:scale-110 transform transition-all duration-300"
                onClick={() => setDelIsOpen(true)}
              >
                <MdOutlineDelete className={`hover:text-red-500 ${isLightMode ? "text-black" : "text-white"}`} />
              </button>
            </div>
          </div>

          {/* Delete Modal */}
          {delIsOpen && (
            <motion.div
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              className={`fixed inset-0 ${
                isLightMode ? "bg-black/30" : "bg-black/50"
              } text-black flex justify-center backdrop-blur-sm items-center z-50 px-4`}
            >
              <div
                className={`${
                  isLightMode ? "bg-white border-gray-200 text-black" : "bg-gray-900 border-gray-700 text-white"
                } border rounded-lg shadow-lg w-full max-w-lg p-6`}
              >
                <p className="text-lg font-light mb-4 text-center">
                  Are You Sure you want to clear chat? Type{" "}
                  <span className="font-bold text-pink-600">"Delete Chat History"</span> to confirm.
                </p>

                <input
                  type="text"
                  placeholder="Enter 'Delete Chat History'"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className={`w-full border rounded-md px-3 py-2 mt-2 focus:outline-none focus:ring-2 ${
                    isLightMode
                      ? "bg-gray-100 text-black border-gray-300 focus:ring-blue-400"
                      : "bg-gray-800 text-white border-gray-600 focus:ring-orange-400"
                  }`}
                />

                <div className="flex justify-between items-center gap-3 mt-6">
                  <button
                    className={`px-5 py-2 rounded-lg transition-all active:scale-95 ${
                      isLightMode ? "bg-gray-200 text-black hover:bg-gray-300" : "bg-gray-700 text-white hover:bg-gray-600"
                    }`}
                    onClick={() => { setConfirm(""); setDelIsOpen(false); }}
                  >
                    Close
                  </button>
                  <button
                    className={`px-5 py-2 rounded-lg transition-all active:scale-95 ${
                      isLightMode ? "bg-red-500 text-white hover:bg-red-600" : "bg-red-600 text-white hover:bg-red-700"
                    }`}
                    onClick={checkValidity}
                  >
                    Confirm
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Chat Messages Area */}
          <div className="flex-1 overflow-y-auto hide-scrollbar p-4 space-y-4">
            {actualList.map((item, index) => (
              <div key={index} className="space-y-3">
                {/* User Message */}
                <div className={`p-4 rounded-xl flex justify-between items-start shadow-sm ${
                    isLightMode ? "bg-gray-100 text-black" : "bg-gray-900 text-white"
                }`}>
                  <div className="flex gap-3 w-full">
                    <img
                      src="https://th.bing.com/th/id/OIP.w-f-qDRUjGt9e_SuPTcfcgHaHw?rs=1&pid=ImgDetMain"
                      className="w-10 h-10 rounded-full object-cover"
                      alt="User Avatar"
                    />
                    <div className="flex-1">
                      <div className="text-sm font-semibold whitespace-pre-wrap">{item.user}</div>
                      <div className="text-xs text-gray-500 mt-1">{formatTime(item.date)}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => openEditModal(item.user)}
                    className="text-blue-500 hover:text-blue-700 p-2 rounded-full hover:bg-blue-500/10 transition-colors"
                  >
                    <FaEdit />
                  </button>
                </div>

                {/* Bot Response */}
                <div className={`p-4 rounded-xl flex justify-between items-start shadow-sm ${
                    isLightMode ? "bg-blue-50 text-black" : "bg-zinc-800 text-white"
                }`}>
                  <div className="flex gap-3 w-full">
                    <img
                      src="https://static.vecteezy.com/system/resources/previews/004/996/790/original/robot-chatbot-icon-sign-free-vector.jpg"
                      className="w-10 h-10 rounded-full object-cover"
                      alt="Bot Avatar"
                    />
                    <div className="flex-1 overflow-hidden">
                      <div className="text-sm leading-relaxed">
                        {item.bot == null ? (
                          <div className="flex items-center h-5">
                            <span className="animate-pulse font-bold text-gray-400 tracking-widest">. . .</span>
                          </div>
                        ) : (
                          item.bot
                        )}
                      </div>
                      <div className="text-xs text-gray-500 mt-2">{formatTime(item.date)}</div>
                    </div>
                  </div>
                  
                  {/* Action Icons for Bot */}
                  {item.bot && (
                    <div className="flex gap-2 items-center text-gray-400">
                      <button onClick={() => speakText(item.bot)} className="p-2 hover:text-blue-500 transition-colors">
                        <AiFillSound className="text-lg" />
                      </button>
                      <CopyToClipboard text={item.bot} onCopy={() => toast.success("Copied to Clipboard")}>
                        <button className="p-2 hover:text-blue-500 transition-colors">
                          <FaCopy className="text-lg" />
                        </button>
                      </CopyToClipboard>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {/* Invisible Div to scroll to */}
            <div ref={chatEndRef} />
          </div>

          {/* Input Area */}
          <div className={`px-4 py-3 flex gap-2 items-end border-t ${isLightMode ? "bg-white border-gray-200" : "bg-gray-950 border-gray-800"}`}>
            <textarea
              rows="1"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask TraceSync AI... (Press Enter to send)"
              className={`flex-1 border rounded-lg px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 ${
                isLightMode
                  ? "bg-gray-50 text-black border-gray-300 focus:ring-blue-400"
                  : "bg-gray-900 text-white border-gray-700 focus:ring-blue-500"
              }`}
              style={{ minHeight: "44px", maxHeight: "120px" }}
            />
            <button
              onClick={() => onSend()}
              disabled={isGenerating || !inputValue.trim()}
              className={`p-3 rounded-lg flex items-center justify-center transition-all duration-300 ${
                isLightMode ? "bg-blue-600 text-white" : "bg-blue-600 text-white"
              } hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 active:scale-95`}
            >
              <IoSend className="text-xl" />
            </button>
          </div>

          {/* Edit Modal */}
          {editModalOpen && (
            <motion.div
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              className={`fixed inset-0 ${
                isLightMode ? "bg-black/30" : "bg-black/50"
              } flex justify-center items-center backdrop-blur-sm z-50 px-4`}
            >
              <div
                className={`p-6 rounded-lg shadow-xl w-full max-w-xl border ${
                  isLightMode ? "bg-white border-gray-200 text-black" : "bg-gray-900 border-gray-700 text-white"
                }`}
              >
                <h3 className="text-xl font-semibold mb-4">Edit your message</h3>
                <textarea
                  rows="5"
                  value={editQuery}
                  onChange={(e) => setEditQuery(e.target.value)}
                  className={`w-full rounded-md px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 ${
                    isLightMode
                      ? "bg-gray-50 text-black border-gray-300 focus:ring-blue-400"
                      : "bg-gray-800 text-white border-gray-600 focus:ring-blue-500"
                  }`}
                />
                <div className="flex justify-end gap-3 mt-6">
                  <button
                    onClick={() => setEditModalOpen(false)}
                    className={`px-5 py-2 rounded-lg font-medium transition-colors ${
                      isLightMode ? "bg-gray-200 hover:bg-gray-300 text-black" : "bg-gray-700 hover:bg-gray-600 text-white"
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleEditSend}
                    className="flex items-center gap-2 px-5 py-2 rounded-lg font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors active:scale-95"
                  >
                    <IoSend /> Resend
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </>
  );
};

export default ChatDesktop;