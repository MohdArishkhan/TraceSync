import React, { useEffect, useState, useRef } from "react";
// import WebsiteLogo from "/src/assets/codeLogo.png";
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
import "../App.css";

const MotionDiv = motion.div;

function EditorPage({ isLightMode }) {
  const { userData } = useAppContext();
  const { fileList, setFileList } = useFileData();
  const [isExist, setisExist] = useState(false);
  const [isDownload, setisDownload] = useState(false);
  // const { fileList, setFileList } = useFileData();
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
  const [changerName,setchangerName] = useState("");
  const timerRef= useRef(null);

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

  // console.log(code.current);

  function speakText(mytext) {
    // console.log("here");
    if (!mytext) return;
    const utterance = new SpeechSynthesisUtterance(mytext);
    window.speechSynthesis.speak(utterance);
  }

  function handleError() {
    // console.error(`Socket error: ${err}`);
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
        visualState: {}
      });
      const saved = created.document;
      setDocumentId(saved.id);
      setDocumentRevision(saved.revision);
      setFileList((files) => [...files, {
        id: saved.id,
        fileName: saved.name,
        fileContent: saved.code_content,
        visualState: saved.visual_state,
        revision: saved.revision,
        language: saved.language,
        dateCreated: saved.created_at,
        updatedAt: saved.updated_at
      }]);
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

      socketRef.current.on("show-who-changed",({whoChanged})=>{
        if(timerRef.current){
          clearTimeout(timerRef.current);
        }

        setchangerName(whoChanged);

        timerRef.current = setTimeout(()=>{
           setchangerName("");
         },1000)
        
      })

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
      <Toaster />
      <div className="w-screen h-screen flex flex-row">
        {/* Sidebar */}
        <div
          className={`flex flex-col lg:w-1/4 text-white ${
            isLightMode ? "bg-white text-gray-900" : "bg-[#1F2937]"
          }`}
        >
          <div
            className={`w-full px-3 p-1 lg:p-5 text-start lg:text-center flex flex-row items-center justify-center gap-2 lg:gap-4 border-b ${
              isLightMode ? "border-gray-300 text-bl" : "border-gray-600"
            }`}
          >
            <ShareCircleBold
              className={`${isLightMode ? "text-blue-600" : ""}`}
            />
            <span
              className={`text-sm lg:text-2xl font-semibold ${
                isLightMode ? "text-blue-600" : ""
              } tracking-wide `}
            >
              TraceSync
            </span>
          </div>

          <div className="flex-1 flex flex-col justify-between p-4">
            <div className="flex-1 h-1/4   overflow-auto mb-4 scrollbar-hidden">
              <h3
                className={`text-sm font-medium mb-2 lg:mb-3 px-2 lg:px-3 ${
                  isLightMode ? "text-gray-700" : "text-gray-300"
                }`}
              >
                Participants
              </h3>
              <ul className="space-y-3 overflow-auto h- max-h-96 lg:max-h-80 pr-1 scrollbar-thin scrollbar-thumb-gray-400  my-8 lg:my-0 scrollbar-track-transparent hide-scrollbar ">
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
                  <p
                    className={`px-2 lg:px-3 ${
                      isLightMode ? "text-gray-500" : "text-gray-400"
                    }`}
                  >
                    No users in the room.
                  </p>
                )}
              </ul>
            </div>

            <div className="flex flex-col gap-3">
              <button
                className={`transition rounded-md px-4 py-2 text-sm font-medium cursor-pointer ${
                  isLightMode
                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                }`}
                onClick={copyRoomID}
              >
                Copy Room ID
              </button>
              <button
                className={`transition rounded-md px-4 py-2 text-sm font-medium cursor-pointer ${
                  isLightMode
                    ? "bg-gray-300 hover:bg-gray-400 text-gray-900"
                    : "bg-gray-700 hover:bg-gray-800 text-white"
                }`}
                onClick={() => leaveUser()}
              >
                Leave Room
              </button>
            </div>
          </div>
        </div>

        {/* Editor Area */}
        <div
          className={`w-3/4 flex flex-col relative h-screen ${
            isLightMode ? "bg-[#282A36]" : "bg-[#282A36]"
          }`}
        >
          <div className="bg-transparent w-full flex flex-row justify-end">
            {changerName && (
              <div
                className={`w-fit self-end m-1 lg:m-2 rounded-lg lg:rounded-lg lg:px-2 px-3 lg:py-2 py-1 text-[12px] lg:text-sm md:text-base disabled:opacity-60 disabled:cursor-not-allowed text-white
            `}
                onClick={() => code.current && setisDownload(true)}
              >
                <p>{changerName} is typing ....</p>
              </div>
            )}
            <button className="w-fit self-end m-1 lg:m-2 rounded-lg lg:rounded-lg lg:px-5 px-3 lg:py-2 py-2 lg:text-[12px] lg:text-sm md:text-base gap-2 transition-all hover:cursor-pointer hover:scale-95 active:scale-90 disabled:opacity-60 disabled:cursor-not-allowed bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white">
              <RxSpeakerLoud
                className="text-[10px] lg:text-xl"
                onClick={() => speakText(code.current)}
              />
            </button>
            <button
              className={`w-fit self-end m-1 lg:m-2 rounded-lg lg:rounded-lg lg:px-4 px-3 lg:py-2 py-1 text-[12px] lg:text-sm md:text-base gap-2 transition-all hover:cursor-pointer hover:scale-95 active:scale-90 disabled:opacity-60 disabled:cursor-not-allowed bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white
            `}
              onClick={() => code.current && setisDownload(true)}
            >
              Download Work
            </button>
            {documentId && (
              <span className="text-xs text-gray-300 self-center px-2">
                {saveStatus === "saving" ? "Saving..." : saveStatus === "saved" ? "Saved" : saveStatus}
              </span>
            )}
          </div>

          {isDownload && (
            <MotionDiv 
              initial={{ opacity: 0, y: -30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 flex items-center h-screen justify-center bg-black/30">
              <div
                className={`rounded-2xl m-6 lg:m-0 p-4 h-auto shadow-lg lg:p-6 w-full max-w-md flex flex-col gap-5 ${
                  isLightMode ? "bg-white" : "bg-gray-950"
                }`}
              >
                {/* Input Section */}
                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="myFileName"
                    className={`text-sm font-medium ${
                      isLightMode ? "text-gray-700" : "text-white"
                    }`}
                  >
                    File Name:
                  </label>
                  <input
                    type="text"
                    id="myFileName"
                    placeholder="Enter File Name"
                    value={fileName}
                    onChange={(e) => setfileName(e.target.value)}
                    className={`p-2 rounded-lg border focus:outline-none focus:ring-2 transition w-full ${
                      isLightMode
                        ? "border-gray-300 focus:ring-blue-500 text-gray-900 bg-white"
                        : "border-gray-700 focus:ring-green-500 text-white bg-black placeholder-gray-400"
                    }`}
                  />
                </div>

                {isExist && (
                  <p className="text-red-500 text-center lg:text-start text-sm lg:text-1xl">
                    **File with same name already exist
                  </p>
                )}
                {/* Action Buttons */}
                <div className="flex justify-between">
                  <button
                    onClick={() => saveTheFile()}
                    className={`text-white px-4 py-2 rounded-lg text-sm md:text-base transition-all hover:scale-95 active:scale-90 ${
                      isLightMode
                        ? "bg-green-600 hover:bg-green-700 active:bg-green-800"
                        : "bg-green-600 hover:bg-green-700 active:bg-green-800"
                    }`}
                  >
                    Save
                  </button>
                  <button
                    onClick={() => perform()}
                    className={`text-white px-4 py-2 rounded-lg text-sm md:text-base transition-all hover:scale-95 active:scale-90 ${
                      isLightMode
                        ? "bg-blue-600 hover:bg-blue-700 active:bg-blue-800"
                        : "bg-gray-800 hover:bg-gray-700 active:bg-gray-600"
                    }`}
                  >
                    Close
                  </button>
                </div>

                {/* Link to workspace */}
                <button
                  type="button"
                  className={`cursor-pointer text-end text-sm hover:underline ${
                    isLightMode ? "text-blue-700" : "text-green-400"
                  }`}
                  onClick={() => navigate("/workspace")}
                >
                  View All Folders
                </button>
              </div>
            </MotionDiv>
          )}

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
    </>
  );
}

export default EditorPage;
