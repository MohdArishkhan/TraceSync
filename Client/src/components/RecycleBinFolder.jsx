import React, { useEffect, useState } from "react";
import { useAppContext } from "../Context/AppContext";
import { Toaster, toast } from "react-hot-toast";
import { FaCopy, FaFile } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { motion } from "framer-motion";
import { IoMdSettings } from "react-icons/io";
import { listRecycleBin, permanentlyDeleteRecycleItem } from "../lib/documents";

const MotionDiv = motion.div;

function RecycleBinFolder() {
  const { userData } = useAppContext();
  const [recycleItems, setRecycleItems] = useState([]);

  const [codeIndex, setCodeIndex] = useState(null);
  const [code, setCode] = useState("");
  const [file, setFile] = useState("");
  const [optionVisibility, setoptionVisibility] = useState(false);
  const [isDeleteOpen, setisDeleteOpen] = useState(false);
  const [isallDeleteOpen, setisallDeleteOpen] = useState(false);
  const [confirm, setConfirm] = useState("");
  const [individualFileText,setindividualFileText] = useState("");
  const [OPP,setOPP] = useState(false);

  const refreshRecycleBin = async () => {
    if (!userData?.workspaceId) return;
    try {
      const result = await listRecycleBin(userData.workspaceId);
      setRecycleItems(result.items || []);
    } catch (error) {
      toast.error(error.message || "Unable to load recycle bin");
    }
  };

  useEffect(() => { refreshRecycleBin(); }, [userData?.workspaceId]);

  const handleOpenCode = (currIndex, itemFile) => {
    setCodeIndex(itemFile?.id);
    // console.log(itemFile);
    setOPP(true);
    setFile(itemFile?.documents?.name);
    setCode(itemFile?.documents?.code_content);
  };

  // console.log(file);
  // console.log(codeIndex);

  const handleCopyCode = () => {
    toast.success("Code copied to clipboard");
    navigator.clipboard.writeText(code);
  };

  const handleCloseCode = () => {
    setCodeIndex(null);
    setCode(null);
    setFile("");
    setOPP(false);
  };

  const handleDeleteVisibility = (item) => {
    setisDeleteOpen(true);
    setindividualFileText("");
    setFile(item?.documents?.name);
    setCodeIndex(item?.id);
  };

  const handleDeleteCloseVisibility = () => {
    setisDeleteOpen(false);
    setFile("");
    setCodeIndex(null);
    setindividualFileText("");
  }

  // console.log(OPP);

  const handleDeleteAllFiles = async () => {
    if (confirm.trim() === "" || confirm.trim().toLowerCase() !== "delete all files") {
      toast.error(`Type 'delete all files'`);
      return;
    }

    try {
      await Promise.all(recycleItems.map((item) => permanentlyDeleteRecycleItem(item.id)));
      toast.success(`All Files Deleted`);
      await refreshRecycleBin();
      closingAllFiles();
    } catch {
      toast.error(`Error occurred while deleting files`);
    }
  };

  const closingAllFiles = () => {
    setisallDeleteOpen(false);
    setindividualFileText("");
    setoptionVisibility(false);
  };

  const handleDeletingIndividualFile = async () => {
    
    if(individualFileText.trim()=="" || individualFileText.trim().toLowerCase()!=`delete ${file.toLowerCase()}`){
      toast.error(`Type '${file}'`)
      return;
    }
    
    try{
      await permanentlyDeleteRecycleItem(codeIndex);
      toast.success(`File deleted Successfully`);
      await refreshRecycleBin();
    }
    catch{
      toast.error(`File not deleted`);
    }
  }

  return (
    <>
      <Toaster />
      <div className="bg-[#000000] relative w-full h-screen overflow-hidden flex flex-col">
        
        {/* Code Viewer Modal */}
        {OPP==true && (
          <div className="fixed inset-0 bg-white/30 backdrop-blur-md z-[60] flex justify-center items-center p-4">
            <div className="w-full sm:w-5/6 md:w-2/3 lg:w-1/2 h-5/6 bg-[#FFFFFF] p-4 sm:p-6 rounded-xl shadow-lg text-black border flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <p className="text-lg sm:text-2xl font-bold text-gray-800 break-all pr-4">
                  📁 {file}
                </p>
                <button
                  onClick={handleCloseCode}
                  className="text-2xl sm:text-3xl font-bold text-gray-600 hover:text-red-500 leading-none"
                >
                  &times;
                </button>
              </div>
              <div className="flex flex-1 flex-col overflow-hidden">
                <button
                  onClick={handleCopyCode}
                  className="self-end p-2 hover:text-blue-600 mb-2"
                >
                  <FaCopy size={20} />
                </button>
                <div className="bg-gray-50 p-4 rounded-md text-[#374151] whitespace-pre-wrap overflow-auto flex-1 font-mono text-sm sm:text-base">
                  {code}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete All Modal */}
        <div className={`${!isallDeleteOpen ? "hidden" : "fixed"} inset-0 bg-black/40 backdrop-blur-lg flex justify-center items-center z-[70] p-4 text-white`}>
          <div className="bg-gray-950 border-gray-800 border-2 rounded-lg w-full max-w-[500px] text-center p-6 shadow-2xl">
            <p className="text-sm sm:text-lg font-light mb-4">
              Are you sure you want to delete all files? Type{" "}
              <span className="font-bold text-red-600">"Delete all files"</span>
            </p>
            <input
              type="text"
              className="w-full rounded-md px-4 py-2 bg-gray-800 text-white border border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Type 'Delete all files'"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <button onClick={handleDeleteAllFiles} className="flex-1 bg-pink-600 py-2 rounded-lg hover:bg-pink-700 transition-all active:scale-95">Confirm</button>
              <button onClick={closingAllFiles} className="flex-1 bg-blue-600 py-2 rounded-lg hover:bg-blue-700 transition-all active:scale-95">Close</button>
            </div>
          </div>
        </div>

        {/* Individual Delete Modal */}
        {isDeleteOpen && (
          <MotionDiv
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          >
            <div className="bg-white border-2 border-gray-200 rounded-lg w-full max-w-[500px] p-6 shadow-xl text-center">
              <p className="text-sm sm:text-lg font-light mb-4 text-gray-800">
                Are you sure you want to delete this file permanently? Type{" "}
                <span className="font-bold text-pink-600">"Delete {file}"</span>
              </p>
              <input
                type="text"
                value={individualFileText}
                onChange={(e)=>setindividualFileText(e.target.value)}
                placeholder={`Enter Delete ${file}`}
                className="w-full bg-gray-100 border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-400 outline-none text-black"
              />
              <div className="flex gap-3 mt-6">
                <button onClick={handleDeleteCloseVisibility} className="flex-1 bg-pink-500 py-2 text-white rounded-lg hover:bg-pink-600 active:scale-95">Close</button>
                <button onClick={handleDeletingIndividualFile} className="flex-1 bg-blue-500 py-2 text-white rounded-lg hover:bg-blue-600 active:scale-95">Confirm</button>
              </div>
            </div>
          </MotionDiv>
        )}

        {/* Header Section (Stays Fixed at Top) */}
        <div className="w-full flex flex-row justify-between items-center p-6 sm:p-10 shrink-0">
          <div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold text-white">Recycle Bin</h1>
            <p className="text-gray-500 mt-2">Manage your deleted files</p>
          </div>
          
          <div className="relative" onMouseEnter={() => setoptionVisibility(true)} onMouseLeave={() => setoptionVisibility(false)}>
            <button className="p-2 text-white hover:bg-white/10 rounded-full transition-colors">
              <IoMdSettings size={30} />
            </button>
            {optionVisibility && (
              <div className="absolute right-0 top-12 w-48 bg-white rounded-md shadow-xl py-2 z-50 animate-in fade-in zoom-in duration-200">
                {/* <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Grid Layout</button>
                <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Strap Layout</button> */}
                {/* <hr className="my-1" /> */}
                <button 
                  disabled={recycleItems.length === 0}
                  onClick={() => setisallDeleteOpen(true)}
                  className={`w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 ${recycleItems.length === 0 ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  Delete all Files
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Files List Section (This part scrolls) */}
        <div className="flex-1 overflow-y-auto hide-scrollbar px-4 pb-10">
          <div className="max-w-5xl mx-auto flex flex-col gap-4">
            {recycleItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <p className="text-xl sm:text-3xl md:text-4xl font-bold text-white opacity-80">
                  Oops! Recycle Bin is Empty 🤭
                </p>
              </div>
            ) : (
              recycleItems.map((item, index) => (
                <div
                  key={index}
                  className="group w-full p-4 flex justify-between items-center rounded-xl bg-gray-950 border border-gray-800 hover:border-green-400 hover:bg-gray-900 transition-all duration-300 shadow-lg "
                >
                  <div
                    onClick={() => handleOpenCode(index, item)}
                    className="flex items-center gap-4 sm:gap-6 cursor-pointer flex-1 min-w-0"
                  >
                    <FaFile className="text-white text-xl sm:text-3xl shrink-0" />
                    <div className="min-w-0">
                      <p className="font-bold text-white text-base sm:text-xl truncate">
                        {item.documents?.name}
                      </p>
                      <p className="text-[10px] sm:text-xs text-gray-400 mt-1">
                        Deleted: {new Date(item.deleted_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  
                  <button
                    onClick={()=>handleDeleteVisibility(item)}
                    className="p-2 text-gray-500 hover:text-red-400 transition-colors shrink-0"
                  >
                    <MdDelete size={28} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default RecycleBinFolder;
