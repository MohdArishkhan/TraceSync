import React, { useState, useEffect } from "react";
import { FaFile } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { useAppContext } from "../Context/AppContext";
import "../App.css";
import axios from "axios";
import { ToastBar,toast,Toaster } from "react-hot-toast";
import { FaCopy } from "react-icons/fa";
import { CopyToClipboard } from "react-copy-to-clipboard";


function GridLayout({ isLightMode }) {
  const [fileList, setFileList] = useState([]);
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [isOpen, setIsopen] = useState(false);
  const [ToBeDeleted, setToBeDeleted] = useState("");
  const { BACKEND_URL, userData, getUserData } = useAppContext();
  const [confirm, setConfirm] = useState("");

  const toggleExpand = (index) => {
    setExpandedIndex(index);
  };

  function copyKar() {
      toast.success("Copied to Clipboard");
    }

  async function handleDeleteOneFile(fileName) {
    // console.log("Deleting file:", fileName);
    await axios
      .post(
        `${BACKEND_URL}/api/file/deleteOneFile`,
        { fileName },
        {
          withCredentials: true,
        }
      )
      .then((res) => {
        // console.log(res.data);
        if (res.data.status === 1) {
          setFileList((prevList) =>
            prevList.filter((item) => item.fileName !== fileName)
          );
          getUserData();
          toast.success("File deleted successfully");
        } else {
          // console.log(res.data.message);
          toast.error("File not deleted");
        }
      });
  }

  function handleDelete(fileName) {
    setIsopen(true);
    // console.log("Deleting file:", fileName);
    setToBeDeleted(fileName);
  }

  function checkValidity() {
    const realQuery = `delete ${ToBeDeleted.toLowerCase()}`;
    // console.log("Real query is : ", realQuery);
    // console.log("Confirm is : ", confirm);
    if (confirm.toLowerCase() === realQuery) {
      handleDeleteOneFile(ToBeDeleted);
      setIsopen(false);
      setConfirm("");
    } else {
      toast.error(`Please type 'delete '${ToBeDeleted}'`);
    }
  }

  const closeOverlay = () => {
    setExpandedIndex(null);
  };

  const formatDate = (dateString) => {
    const options = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleString("en-US", options);
  };

  useEffect(() => {
    setFileList([
      ...(userData?.allFiles?.map((file) => ({
        fileName: file.fileName,
        fileContent: file.fileContent,
        dateCreated: formatDate(file.dateCreated),
      })) || []),
    ]);
  }, [userData]);

  return (
    <div
      className={`flex flex-col ${
        isLightMode ? "bg-white" : "bg-black"
      } h-auto max-h-screen overflow-x-hidden`}
    >
      <div className="flex-1 flex justify-center overflow-auto py-6 px-4 hide-scrollbar">
        <div className="w-full max-w-screen-lg grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-3 lg:gap-6 lg:gap-y-4">
          {fileList.map((item, index) => (
            <div
              key={index}
              className={`cursor-pointer border rounded-lg shadow-md transform transition-all h-fit duration-300 p-4 lg:p-6 flex justify-between items-start  ${
                isLightMode
                  ? "bg-white text-black hover:bg-slate-100 hover:border-slate-400"
                  : "bg-gray-950 text-white hover:bg-gray-900 hover:border-green-400"
              }`}
            >
              {/* File Info */}  
              <div className="flex flex-col w-5/6 gap-2" onClick={() => toggleExpand(index)}>
                <div className="flex items-center gap-2">
                  <FaFile
                    className={`${
                      isLightMode ? "text-slate-500" : ""
                    } text-sm lg:text-2xl`}
                  />
                  <p
                    className={`font-bold truncate w-[60px] lg:max-w-[200px] ${
                      isLightMode ? "text-slate-700" : ""
                    } text-sm lg:text-xl`}
                    title={item.fileName}
                  >
                    {item.fileName}
                  </p>
                </div>
                <p
                  className={`text-[10px] lg:text-sm ${
                    isLightMode ? "text-slate-600" : ""
                  }`}
                >
                  Date Created: {item.dateCreated}
                </p>
              </div>

              {/* Delete Icon */}
              <MdDelete
                onClick={()=>handleDelete(item.fileName)}
                className={`block text-sm md:text-2xl lg:text-3xl ${
                  isLightMode ? "text-slate-500" : ""
                } hover:text-red-400 transition duration-300`}
              />
            </div>
          ))}
        </div>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30 backdrop-blur-sm">
          <div className={` ${isLightMode?"bg-white border-2 border-gray-200":"bg-gray-950 border-2 border-gray-900"} rounded-lg w-[90%] sm:w-3/4 md:w-1/2 lg:w-2/5 p-4 m-10 lg:m-0 sm:p-6 shadow-xl text-center max-w-[600px]`}>
            <p className={`text-sm sm:text-lg font-light mb-4 leading-relaxed ${isLightMode?"text-black":"text-white"} `}>
              Are you sure you want to delete this file? Type{" "}
              <span className="font-bold text-pink-600">
                "Delete {ToBeDeleted}"
              </span>{" "}
              to delete the file from your workspace.
            </p>

            <input
              type="text"
              placeholder={`Enter Delete ${ToBeDeleted}`}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="w-full bg-gray-100 border border-gray-300 rounded-md px-4 py-2 mt-2 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm sm:text-base"
            />

            <div className="flex justify-between flex-row sm:flex-row justify-center sm:justify-between items-center mt-6 gap-3 sm:gap-4">
              <button
                onClick={()=>{setIsopen((prev)=>(!prev))}}
                className={`sm:w-auto ${isLightMode?"bg-pink-500 hover:bg-pink-600":"bg-orange-500 hover:bg-orange-600"} px-3 py-2  text-white lg:px-6 lg:py-2 rounded-lg transition-all duration-300 active:scale-95`}
              >
                Close
              </button>

              <button
                onClick={checkValidity}
                className={`sm:w-auto ${isLightMode?"bg-blue-500 hover:bg-blue-600":"bg-green-500 hover:bg-green-600"} px-3 py-2  text-white lg:px-6 lg:py-2 rounded-lg transition-all duration-300 active:scale-95`}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* File Preview Overlay */}
      {expandedIndex !== null && (
              <div className="fixed inset-0 bg-white/30 backdrop-blur-md z-50 flex justify-center items-center p-4 sm:p-6">
                <div className="bg-white w-full sm:w-5/6 lg:w-3/4 max-w-2xl rounded-lg p-4 sm:p-6 shadow-xl max-h-[80vh] flex flex-col relative">
                  <button
                    onClick={closeOverlay}
                    className="absolute top-3 right-4 text-xl sm:text-2xl font-bold text-gray-600 hover:text-red-500"
                  >
                    &times;
                  </button>
      
                  {/* Title */}
                  <h2 className="text-lg sm:text-2xl font-bold mb-4 text-gray-800 pr-10">
                    📁 {fileList[expandedIndex].fileName}
                  </h2>
                  <div className="flex justify-end h-fit">
                    {" "}
                    {/* Give some height */}
                    <CopyToClipboard
                      className="hover:cursor-pointer hover:text-blue-700"
                      text={fileList[expandedIndex].fileContent}
                      onCopy={() => setCopied(true)}
                    >
                      <button className="bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors">
                        <FaCopy className="text-sm lg:text-[20px]" onClick={() => copyKar()} />
                      </button>
                    </CopyToClipboard>
                  </div>
      
                  {/* Scrollable Content Area */}
                  <div className="overflow-auto">
                    <p className="text-sm sm:text-base text-gray-700 whitespace-pre-wrap">
                      {fileList[expandedIndex].fileContent}
                    </p>
                  </div>
                </div>
              </div>
            )}
    </div>
  );
}
export default GridLayout;
