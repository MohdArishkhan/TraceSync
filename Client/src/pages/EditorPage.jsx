import React, { useEffect, useState, useRef } from "react";
import CodeEditor from "./CodeEditor";
import ClientPage from "./Client";
import { motion } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import {
  useNavigate,
  useLocation,
  Navigate,
  useParams,
} from "react-router-dom";
import { initSocket } from "../socket";
import ShareCircleBold from "../assets/ShareCircleBold";
import { useFileData } from "../Context/FileDataContext";
import { useAppContext } from "../Context/AppContext";
import { RxSpeakerLoud } from "react-icons/rx";
import { createDocument } from "../lib/documents";
import { useDocumentAutosave } from "../hooks/useDocumentAutosave";
import { Save, Volume2, LogOut, Copy } from "lucide-react";
import "../App.css";

const MotionDiv = motion.div;

function EditorPage({ isLightMode }) {
  const { userData } = useAppContext();
  const { fileList, setFileList } = useFileData();
  const [isExist, setisExist] = useState(false);
  const [isDownload, setisDownload] = useState(false);
  const [fileName, setfileName] = useState("");
  const { roomid } = useParams();
  const location = useLocation();
  const socketRef = useRef(null);
  const navigate = useNavigate();
  const [userlist, setUserlist] = useState([]);
  const code = useRef(null);
  const [fileContent, setfileContent] = useState("");
  const [documentId, setDocumentId] = useState(null);
  const [documentRevision, setDocumentRevision] = useState(0);
  const [changerName, setchangerName] = useState("");
  const timerRef = useRef(null);

  const { status: saveStatus } = useDocumentAutosave({
    documentId,
    revision: documentRevision,
    codeContent: fileContent,
    visualState: {},
    enabled: Boolean(documentId && fileContent),
  });

  function codeChange(myCode) {
    code.current = myCode;
  }

  function perform() {
    setisDownload(false);
    setfileName("");
  }

  function speakText(mytext) {
    if (!mytext) return;
    const utterance = new SpeechSynthesisUtterance(mytext);
    window.speechSynthesis.speak(utterance);
  }

  function handleError() {
    toast.error("Socket not connected!");
    navigate("/homePage");
  }

  async function saveTheFile() {
    const normalizedName = fileName.trim();
    if (!normalizedName || !fileContent.trim()) {
      toast.error("Add a file name and code before saving.");
      return;
    }

    const isThere = fileList.find(
      (currFile) => currFile.fileName.toLowerCase() === normalizedName.toLowerCase()
    );

    if (isThere && isThere.id !== documentId) {
      setisExist(true);
      return;
    }
    setisExist(false);

    try {
      const created = await createDocument({
        projectId: userData?.projectId,
        path: normalizedName,
        name: normalizedName,
        kind: "mixed",
        language: "javascript",
        codeContent: fileContent,
        visualState: {},
      });
      const saved = created.document;
      setDocumentId(saved.id);
      setDocumentRevision(saved.revision);
      setFileList((files) => [
        ...files,
        {
          id: saved.id,
          fileName: saved.name,
          fileContent: saved.code_content,
          visualState: saved.visual_state,
          revision: saved.revision,
          language: saved.language,
          dateCreated: saved.created_at,
          updatedAt: saved.updated_at,
        },
      ]);
      toast.success("File saved to Supabase");
      setisDownload(false);
      setfileName("");
    } catch (error) {
      toast.error(error.message || "Error saving file");
    }
  }

  useEffect(() => {
    const init = async () => {
      try {
        socketRef.current = await initSocket();
        if (!socketRef.current) return;

        socketRef.current.on("connect_error", handleError);
        socketRef.current.on("connect_failed", handleError);

        socketRef.current.emit("join", {
          roomid,
          username: location.state?.username,
        });
      } catch {
        console.error("Socket initialization failed");
      }

      socketRef.current.on("joined", ({ clients, socketid, username }) => {
        setUserlist([...clients]);
        if (username !== location.state?.username) {
          toast.success(`${username} joined the room`);
        }

        socketRef.current.emit("sync-code", {
          socketid,
          code: code.current,
        });
      });

      socketRef.current.on("show-who-changed", ({ whoChanged }) => {
        if (timerRef.current) {
          clearTimeout(timerRef.current);
        }

        setchangerName(whoChanged);

        timerRef.current = setTimeout(() => {
          setchangerName("");
        }, 1000);
      });

      socketRef.current.on("user-leaved", ({ username, socketid }) => {
        toast(`${username} left the room`, {
          icon: "👋",
        });
        setUserlist((prev) =>
          prev.filter((client) => client.socketid !== socketid)
        );
      });
    };

    init();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []);

  async function leaveUser() {
    await socketRef.current.emit("user-leave");
    navigate("/RoomPage");
  }

  if (!location.state?.username) {
    return <Navigate to="/HomePage" />;
  }

  const copyRoomID = () => {
    navigator.clipboard.writeText(roomid);
    toast.success("Room ID copied to clipboard!");
  };

  return (
    <>
      <Toaster position="top-center" />
      
      {/* Main Layout Wrapper */}
      <div className={`h-screen w-full flex overflow-hidden transition-colors duration-300 ${
        isLightMode ? "bg-slate-50 text-gray-900" : "bg-zinc-950 text-gray-100"
      }`}>
        
        {/* Sidebar (Fixed Width) */}
        <div className={`flex flex-col w-64 md:w-72 flex-shrink-0 border-r transition-colors duration-300 ${
          isLightMode ? "bg-white border-gray-200" : "bg-zinc-900 border-zinc-800"
        }`}>
          {/* Brand Header */}
          <div className={`h-14 flex items-center px-5 border-b transition-colors duration-300 ${
            isLightMode ? "border-gray-200" : "border-zinc-800"
          }`}>
            <ShareCircleBold className={isLightMode ? "text-gray-900" : "text-gray-100"} size={22} />
            <span className="ml-3 font-mono text-lg font-bold tracking-tight">TraceSync</span>
          </div>

          {/* Participants List */}
          <div className="flex-1 flex flex-col p-4 overflow-hidden">
            <h3 className={`text-xs font-semibold uppercase tracking-wider mb-3 ${
              isLightMode ? "text-gray-500" : "text-gray-400"
            }`}>
              Participants ({userlist.length})
            </h3>
            
            <ul className="flex-1 overflow-y-auto space-y-2 pr-2 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent hide-scrollbar">
              {userlist && userlist.length > 0 ? (
                userlist.map((item, index) => (
                  <ClientPage
                    key={index}
                    username={item.username}
                    socketid={item.socketid}
                    isLightMode={isLightMode}
                  />
                ))
              ) : (
                <p className={`text-sm ${isLightMode ? "text-gray-500" : "text-gray-400"}`}>
                  Waiting for peers...
                </p>
              )}
            </ul>
          </div>

          {/* Sidebar Actions */}
          <div className={`p-4 border-t flex flex-col gap-2 transition-colors duration-300 ${
            isLightMode ? "border-gray-200 bg-slate-50/50" : "border-zinc-800 bg-zinc-950/50"
          }`}>
            <button
              onClick={copyRoomID}
              className={`flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                isLightMode 
                  ? "bg-gray-900 text-white hover:bg-gray-800" 
                  : "bg-white text-zinc-900 hover:bg-gray-200"
              }`}
            >
              <Copy size={16} />
              Copy Room ID
            </button>
            <button
              onClick={leaveUser}
              className={`flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all border ${
                isLightMode 
                  ? "border-gray-300 text-gray-700 hover:bg-gray-100" 
                  : "border-zinc-700 text-gray-300 hover:bg-zinc-800"
              }`}
            >
              <LogOut size={16} />
              Leave Room
            </button>
          </div>
        </div>

        {/* Main Editor Area (Fills remaining space) */}
        <div className="flex-1 flex flex-col min-w-0 relative">
          
          {/* Top Editor Toolbar */}
          <div className={`h-14 flex items-center justify-between px-4 border-b transition-colors duration-300 ${
            isLightMode ? "bg-white border-gray-200" : "bg-zinc-900 border-zinc-800"
          }`}>
            {/* Left Status Area */}
            <div className="flex items-center gap-4">
              {changerName && (
                <span className={`text-xs px-2 py-1 rounded-md font-mono animate-pulse ${
                  isLightMode ? "bg-accent-violet/10 text-accent-violet" : "bg-accent-violet/20 text-purple-300"
                }`}>
                  {changerName} is typing...
                </span>
              )}
              {documentId && (
                <span className={`text-xs flex items-center gap-1 ${isLightMode ? "text-gray-500" : "text-gray-400"}`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${saveStatus === "saved" ? "bg-green-500" : "bg-yellow-500 animate-pulse"}`} />
                  {saveStatus === "saving" ? "Saving..." : saveStatus === "saved" ? "Saved" : saveStatus}
                </span>
              )}
            </div>

            {/* Right Action Tools */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => speakText(code.current)}
                title="Read Code Aloud"
                className={`p-2 rounded-md transition-colors ${
                  isLightMode 
                    ? "text-gray-600 hover:bg-gray-100 hover:text-gray-900" 
                    : "text-gray-400 hover:bg-zinc-800 hover:text-white"
                }`}
              >
                <Volume2 size={18} />
              </button>
              
              <button
                onClick={() => code.current && setisDownload(true)}
                disabled={!code.current}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  isLightMode 
                    ? "bg-gray-900 text-white hover:bg-gray-800 disabled:bg-gray-300" 
                    : "bg-white text-zinc-900 hover:bg-gray-200 disabled:bg-zinc-800 disabled:text-zinc-600"
                }`}
              >
                <Save size={16} />
                Save Work
              </button>
            </div>
          </div>

          {/* Actual Code Editor Component */}
          <div className="flex-1 relative overflow-hidden">
            <CodeEditor
              socketRef={socketRef}
              roomid={roomid}
              username={location.state?.username}
              codeChange={codeChange}
              setfileContent={setfileContent}
              isLightMode={isLightMode}
            />
          </div>
        </div>

        {/* Save / Download Modal Overlay */}
        {isDownload && (
          <MotionDiv 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          >
            <MotionDiv
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className={`w-full max-w-md rounded-xl p-6 border shadow-2xl flex flex-col gap-5 ${
                isLightMode 
                  ? "bg-white border-gray-200" 
                  : "bg-zinc-900 border-zinc-800"
              }`}
            >
              <div className="space-y-1">
                <h2 className={`text-xl font-bold tracking-tight ${isLightMode ? "text-gray-900" : "text-white"}`}>
                  Save to Workspace
                </h2>
                <p className={`text-sm ${isLightMode ? "text-gray-500" : "text-gray-400"}`}>
                  Name your file to save it to your Supabase project.
                </p>
              </div>

              {/* Input Section */}
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="myFileName"
                  className={`text-sm font-medium ${isLightMode ? "text-gray-700" : "text-gray-300"}`}
                >
                  File Name
                </label>
                <input
                  type="text"
                  id="myFileName"
                  placeholder="e.g. main.js"
                  value={fileName}
                  onChange={(e) => setfileName(e.target.value)}
                  className={`w-full px-4 py-2.5 font-mono text-sm rounded-md transition-all border outline-none ${
                    isLightMode
                      ? "bg-slate-50 border-gray-300 text-gray-900 placeholder-gray-400 focus:border-gray-500 focus:ring-1 focus:ring-gray-500"
                      : "bg-zinc-950 border-zinc-700 text-gray-100 placeholder-zinc-500 focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500"
                  }`}
                />
              </div>

              {isExist && (
                <p className="text-red-500 text-sm flex items-center gap-1">
                  <span className="font-bold">Error:</span> A file with this name already exists.
                </p>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => perform()}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    isLightMode
                      ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      : "bg-zinc-800 text-gray-300 hover:bg-zinc-700"
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={() => saveTheFile()}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    isLightMode
                      ? "bg-gray-900 text-white hover:bg-gray-800"
                      : "bg-white text-zinc-900 hover:bg-gray-200"
                  }`}
                >
                  Save File
                </button>
              </div>

              <div className={`pt-4 border-t ${isLightMode ? "border-gray-200" : "border-zinc-800"} text-center`}>
                <button
                  type="button"
                  className={`text-sm font-medium transition-colors ${
                    isLightMode ? "text-blue-600 hover:text-blue-800" : "text-blue-400 hover:text-blue-300"
                  }`}
                  onClick={() => navigate("/workspace")}
                >
                  View Workspace Folders →
                </button>
              </div>
            </MotionDiv>
          </MotionDiv>
        )}
      </div>
    </>
  );
}

export default EditorPage;