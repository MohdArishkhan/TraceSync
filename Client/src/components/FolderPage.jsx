import React, { useEffect, useState } from "react";
import { IoMdSettings } from "react-icons/io";
import SearchBar from "./SearchBar";
import GridLayout from "./GridLayout";
import StrapLayout from "./StrapLayout";
import { useAppContext } from "../Context/AppContext";
import { Toaster, toast } from "react-hot-toast";
import axios from "axios";
import { FaFile } from "react-icons/fa";
import "../App.css";
import { useFileData } from "../Context/FileDataContext";
import { MdDelete } from "react-icons/md";

function FolderPage({ isLightMode }) {
  const [isGrid, setGrid] = useState(false);
  const [showList, setshowList] = useState(false);
  const { BACKEND_URL, userData, getUserData } = useAppContext();
  const [confirm, setConfirm] = useState("");
  const [fileTargeted, setfileTargeted] = useState("");
  const [fileList, setFileList] = useState([]);
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [ToBeDeleted, setToBeDeleted] = useState("");
  const [result, setresult] = useState({});
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [myTruncateFile,setmyTruncateFile] = useState("");
  const [count, setCount] = useState(0);

  useEffect(()=>{
    const F = fileTargeted;
    // console.log("truncate kr : "+F);
    if(F.length > 4){
      const f = F.slice(0, 4) + "..";
      // console.log("ye bhi inside : "+f);
      setmyTruncateFile(f);
    }
  },[fileTargeted]);

  useEffect(() => {
  getUserData(); // Refresh latest data from DB
    // console.log("Updated files:", userData?.allFiles);
}, []); // On mount

// useEffect(() => {
// }, [userData]);

  // useEffect(()=>{
  //   if(count<3){
  //     console.log("refresh");
  //     console.log(userData?.allFiles);
  //     setCount((prev)=>prev+1);
  //   }
  // },[userData,count]);

  // console.log("files are : ");
  // console.log(fileList);

  const toggleExpand = () => {
    setExpandedIndex(true);
  };

  const closeOverlay = () => {
    setExpandedIndex(null);
  };

  useEffect(() => {
    setFileList([
      ...(userData?.allFiles?.map((file) => ({
        fileName: file.fileName,
        fileContent: file.fileContent,
        dateCreated: formatDate(file.dateCreated),
      })) || []),
    ]);
  }, [getUserData]);

  function deleteAllFiles() {
    setIsOpen(true);
  }

  function closing() {
    setIsOpen(false);
    // console.log("Closing");
    setConfirm("");
  }

  // console.log(userData?.allFiles);

  async function deleteAllFiles() {
    const realQuery = "delete all files";
    if (confirm.toLowerCase() === realQuery) {
      await axios
        .post(
          `${BACKEND_URL}/api/file/deleteFile`,
          {},
          {
            withCredentials: true,
          }
        )
        .then((res) => {
          // console.log(res.data);
          setIsOpen(false);
          getUserData();
          setresult({});
        })
        .catch((e) => {
          // console.log(e);
        });

      setConfirm("");
    } else {
      toast.error("Please type 'delete all files' to confirm");
      setConfirm("");
    }
  }

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
  // console.log(fileList);
  // console.log(result);

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
    setIsDeleteOpen(true);
    // console.log("Deleting file:", fileName);
    setToBeDeleted(fileName);
  }

  function checkValidity() {
    const realQuery = `delete ${ToBeDeleted.toLowerCase()}`;
    // console.log("Real query is : ", realQuery);
    // console.log("Confirm is : ", confirm);
    if (confirm.toLowerCase() === realQuery) {
      handleDeleteOneFile(ToBeDeleted);
      setresult({});
      setIsDeleteOpen(false);
      setConfirm("");
    } else {
      toast.error(`Please type 'delete '${ToBeDeleted}'`);
    }
  }

  function call() {
    const myTarget = fileList.find(
      (currfile) =>
        currfile.fileName.toLowerCase() === fileTargeted.toLowerCase()
    );
    // console.log(myTarget);
    // return myTarget;
    if (!myTarget) {
      setresult({});
    } else {
      setresult(myTarget);
    }
  }

  useEffect(() => {
    if (fileTargeted.trim() !== "") {
      call();
    }
  }, [fileTargeted]);

  return (
    <>
      <Toaster />
      <div
        className={`flex flex-col ${
          isLightMode ? "" : "bg-black"
        } h-screen relative p-4`}
      >
        {/* Top Bar */}
        <div
          className={`${
            isLightMode ? "bg-white" : "bg-black"
          } h-1/6 flex items-center justify-between px-4 lg:px-6 z-10 relative`}
        >
          <div
            className={`transition-all lg:m-28 duration-300 w-60 m-0 ${
              isGrid ? "lg:m-24" : ""
            } focus-within:w-1/2`}
          >
            <div className="relative flex w-full h-10 lg:h-12 rounded-lg focus-within:shadow-lg bg-white overflow-hidden">
              <div className="grid place-items-center h-full w-12 text-gray-500">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 lg:h-6 lg:w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>

              <input
                className="peer h-full w-full text-sm lg:text-lg text-gray-800 pr-2 outline-none"
                type="text"
                id="search"
                value={fileTargeted}
                onChange={(e) => setfileTargeted(e.target.value)}
                placeholder="Search Folder..."
              />
            </div>
          </div>

          {/* Settings Icon with Dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setshowList(true)}
            onMouseLeave={() => setshowList(false)}
          >
            <IoMdSettings
              className={`text-2xl lg:text-3xl ${
                isLightMode ? "text-black" : "text-white"
              }  cursor-pointer`}
            />

            <div
              className={`absolute right-0 mt-2 w-40 bg-white rounded-md shadow-lg p-1 lg:p-2 transform transition-all duration-200 ${
                showList
                  ? "opacity-100 scale-100 visible"
                  : "opacity-0 scale-95 invisible"
              }`}
            >
              <button
                onClick={() => setGrid(true)}
                className="block w-full text-left px-3 py-1 lg:px-4 lg:py-2 hover:bg-gray-200 text-sm"
              >
                Grid Layout
              </button>
              <button
                onClick={() => setGrid(false)}
                className="block w-full text-left px-3 py-1 lg:px-4 hover:bg-gray-200 text-sm"
              >
                Strap Layout
              </button>
              <button
                disabled={!userData || userData?.allFiles.length === 0}
                onClick={() => setIsOpen(true)}
                className={`block w-full text-left ${
                  userData?.allFiles.length > 0
                    ? "hover:bg-gray-200"
                    : "cursor-not-allowed"
                } px-3 py-1 lg:px-4  text-sm`}
              >
                Delete all Files
              </button>
            </div>
          </div>
        </div>
        <div
          className={`${
            !isOpen ? "hidden" : "fixed"
          } inset-0 bg-transparent bg-opacity-40 backdrop-blur-lg flex justify-center items-center z-50 ${
            isLightMode ? "text-black" : "text-white"
          }`}
        >
          <div
            className={`${
              isLightMode
                ? "bg-white border-slate-100"
                : "bg-gray-950 border-gray-800"
            } border-2 rounded-lg w-[90%] sm:w-4/5 md:w-3/5 lg:w-1/2 max-w-[600px] text-center p-4 sm:p-6`}
          >
            <p className="text-sm sm:text-lg font-light mb-4 leading-relaxed">
              Are you sure you want to delete all files? Type{" "}
              <span className="font-bold text-red-600">"Delete all files"</span>{" "}
              to delete the files from your workspace.
            </p>

            <input
              type="text"
              className={`w-full rounded-md mt-2 px-4 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 ${
                isLightMode
                  ? "bg-white text-black focus:ring-blue-400"
                  : "bg-gray-800 text-white focus:ring-blue-500"
              }`}
              placeholder="Type 'Delete all files'"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />

            <div className="flex flex-col sm:flex-row justify-center sm:justify-between items-center mt-6 gap-3 sm:gap-4">
              <button
                onClick={() => deleteAllFiles()}
                className="w-full sm:w-auto bg-pink-600 px-4 py-2 hover:bg-pink-700 text-white rounded-lg transition-all duration-300 active:scale-95"
              >
                Confirm
              </button>
              <button
                onClick={() => closing()}
                className="w-full sm:w-auto bg-blue-600 px-4 py-2 hover:bg-blue-700 text-white rounded-lg transition-all duration-300 active:scale-95"
              >
                Close
              </button>
            </div>
          </div>
        </div>

        {userData?.allFiles.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <h1
              className={`text-1xl sm:text-2xl md:text-3xl lg:text-4xl font-bold ${
                isLightMode ? "text-slate-800" : "text-white"
              } `}
            >
              Oops ! No file Created by {userData.name} 🤭 !
            </h1>
          </div>
        )}

        {userData?.allFiles.length > 0 &&
          !fileTargeted &&
          (isGrid ? (
            <GridLayout isLightMode={isLightMode} />
          ) : (
            <StrapLayout isLightMode={isLightMode} />
          ))}

        {(fileTargeted && Object.keys(result).length) > 0 ? (
          !isGrid ? (
            <div
              className={`${
                isLightMode
                  ? "bg-white hover:border-slate-400 hover:bg-slate-100"
                  : "bg-gray-950 hover:border-green-400 hover:bg-gray-900"
              } border border-white cursor-pointer hover:border-1  transform duration-300 p-3 lg:mx-32 lg:my-10 lg:p-6 rounded-lg text-white shadow-md flex items-center gap-4 hide-scrollbar justify-between`}
            >
              <div
                className="flex flex-row gap-8 items-center w-full justify-start"
                onClick={() => toggleExpand()}
              >
                <FaFile
                  className={`${
                    isLightMode ? "text-slate-500" : ""
                  } text-2xl lg:text-3xl`}
                />
                <div>
                  <div
                    className={`font-bold ${
                      isLightMode ? "text-slate-700" : ""
                    } text-sm lg:text-xl`}
                  >
                    {result.fileName}
                  </div>
                  <div
                    className={`text-[8px] lg:text-sm ${
                      isLightMode ? "text-slate-600" : ""
                    }`}
                  >
                    Date Created: {result.dateCreated}
                  </div>
                </div>
              </div>
              <MdDelete
                onClick={() => handleDelete(result.fileName)}
                className={`text-2xl lg:text-2xl lg:text-3xl ${
                  isLightMode ? "text-slate-500" : ""
                } hover:text-red-400 transform transition-all duration-300`}
              />
            </div>
          ) : 

          // start
          
          <div
            className={`${
              isLightMode
                ? "bg-white hover:border-slate-400 hover:bg-slate-100"
                : "bg-gray-950 hover:border-green-400 hover:bg-gray-900"
            } border border-white cursor-pointer hover:border-1  transform duration-300 w-1/2 m-4 lg:w-1/4 p-3 lg:mx-32 lg:my-10 lg:p-6 rounded-lg text-white shadow-md flex items-center gap-4 hide-scrollbar justify-between`}
          >
            <div
              className="flex flex-row gap-8 items-center w-full justify-start"
              onClick={() => toggleExpand()}
            >
              <FaFile
                className={`${
                  isLightMode ? "text-slate-500" : ""
                } text-xl lg:text-3xl`}
              />
              <div>
                <div
                  className={`truncate font-bold ${
                    isLightMode ? "text-slate-700" : ""
                  } text-sm lg:text-xl`}
                  title = {result.fileName}
                >
                  {myTruncateFile}
                </div>
                <div
                  className={`text-[9px] lg:text-sm ${
                    isLightMode ? "text-slate-600" : ""
                  }`}
                >
                  Date Created: {result.dateCreated}
                </div>
              </div>
            </div>
            <MdDelete
              onClick={() => handleDelete(result.fileName)}
              className={`text-xl lg:text-2xl lg:text-3xl ${
                isLightMode ? "text-slate-500" : ""
              } hover:text-red-400 transform transition-all duration-300`}
            />
          </div>
          
          //end

        ) : null}

        {isDeleteOpen && (
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
                onClick={() => {
                    setIsDeleteOpen((prev) => !prev);
                  }}
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

        {/* Overlay */}
        {/* Fullscreen Overlay with Blur */}
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
                📁 {result.fileName}
              </h2>

              {/* Scrollable Content Area */}
              <div className="overflow-auto">
                <p className="text-sm sm:text-base text-gray-700 whitespace-pre-wrap">
                  {result.fileContent}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
export default FolderPage;
