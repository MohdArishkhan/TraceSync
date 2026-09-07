import React, { useState, useEffect } from "react";
import "../App.css";
import { toast, Toaster } from "react-hot-toast";
import { Copy, FileCode, Trash2, X, Check } from "lucide-react";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { useFileData } from "../Context/FileDataContext";
import { deleteDocument } from "../lib/documents";

const StrapLayout = ({ isLightMode }) => {
  const [fileList, setFileList] = useState([]);
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [toBeDeleted, setToBeDeleted] = useState("");
  const { fileList: durableFiles, setFileList: setDurableFiles } = useFileData();
  const [confirm, setConfirm] = useState("");
  const [copied, setCopied] = useState(false);

  const toggleExpand = (index) => {
    setExpandedIndex(index);
    setCopied(false);
  };

  const copyContent = () => {
    setCopied(true);
    toast.success("Copied to Clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  async function handleDeleteOneFile(fileName) {
    try {
      const target = durableFiles.find((item) => item.fileName === fileName);
      if (!target?.id) throw new Error("Document not found");
      await deleteDocument(target.id);
      if (target.id) {
        setFileList((prevList) =>
          prevList.filter((item) => item.fileName !== fileName)
        );
        setDurableFiles((files) => files.filter((item) => item.id !== target.id));
        toast.success("File deleted successfully");
      }
    } catch {
      toast.error("Failed to delete file");
    }
  }

  function handleDelete(e, fileName) {
    e.stopPropagation();
    setIsOpen(true);
    setToBeDeleted(fileName);
  }

  function checkValidity() {
    const realQuery = `delete ${toBeDeleted.toLowerCase()}`;
    if (confirm.toLowerCase() === realQuery) {
      handleDeleteOneFile(toBeDeleted);
      setIsOpen(false);
      setConfirm("");
    } else {
      toast.error(`Please type 'delete ${toBeDeleted}'`);
    }
  }

  useEffect(() => {
    setFileList([
      ...(durableFiles?.map((file) => ({
        ...file,
        dateCreated: formatDate(file.dateCreated),
      })) || []),
    ]);
  }, [durableFiles]);

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

  return (
    <>
      <div className="h-5/6 flex justify-center overflow-auto hide-scrollbar py-6 px-4">
        <div className="w-full max-w-4xl flex flex-col gap-3">
          {fileList.map((item, index) => (
            <div
              key={index}
              onClick={() => toggleExpand(index)}
              className={`group border rounded-tech-lg cursor-pointer transition-all duration-200 p-4 sm:p-5 flex items-center justify-between backdrop-blur-sm hover:-translate-y-0.5 ${
                isLightMode
                  ? "bg-white/90 border-gray-200 hover:border-accent-violet hover:shadow-md"
                  : "bg-dark-surface/90 border-dark-border hover:border-accent-violet/60 hover:shadow-lg"
              }`}
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className="p-2.5 rounded-tech bg-accent-violet/10 text-accent-violet flex-shrink-0">
                  <FileCode className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h3
                    className={`font-mono font-bold text-sm sm:text-base truncate ${
                      isLightMode ? "text-gray-900" : "text-white"
                    }`}
                  >
                    {item.fileName}
                  </h3>
                  <p
                    className={`font-mono text-xs ${
                      isLightMode ? "text-gray-500" : "text-gray-400"
                    }`}
                  >
                    Created: {item.dateCreated}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="hidden sm:inline font-mono text-xs text-accent-violet opacity-0 group-hover:opacity-100 transition-opacity">
                  Open File →
                </span>
                <button
                  onClick={(e) => handleDelete(e, item.fileName)}
                  className="p-2 rounded-tech text-gray-400 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                  title="Delete file"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Delete Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div
            className={`rounded-tech-lg border p-6 max-w-md w-full text-center shadow-2xl backdrop-blur-xl ${
              isLightMode
                ? "bg-white border-gray-200 text-gray-900"
                : "bg-dark-surface border-dark-border text-white"
            }`}
          >
            <h3 className="font-mono text-lg font-bold mb-2">Confirm File Deletion</h3>
            <p className="text-xs sm:text-sm font-sans mb-4 text-gray-500 dark:text-gray-400 leading-relaxed">
              Type <span className="font-mono font-bold text-red-500">delete {toBeDeleted}</span> below to remove this file.
            </p>

            <input
              type="text"
              placeholder={`delete ${toBeDeleted}`}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className={`w-full font-mono text-xs sm:text-sm px-3.5 py-2.5 rounded-tech border mb-5 outline-none ${
                isLightMode
                  ? "bg-slate-50 border-gray-300 text-gray-900 focus:border-red-500"
                  : "bg-dark-bg border-dark-border text-white focus:border-red-500"
              }`}
            />

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setIsOpen(false);
                  setConfirm("");
                }}
                className="px-4 py-2 rounded-tech font-mono text-xs font-semibold border border-gray-300 dark:border-dark-border text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-bg transition"
              >
                Cancel
              </button>
              <button
                onClick={checkValidity}
                className="px-4 py-2 rounded-tech font-mono text-xs font-semibold bg-red-600 hover:bg-red-700 text-white transition shadow-sm"
              >
                Delete File
              </button>
            </div>
          </div>
        </div>
      )}

      {/* File Preview Overlay */}
      {expandedIndex !== null && fileList[expandedIndex] && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex justify-center items-center p-4 sm:p-6">
          <div
            className={`w-full max-w-3xl rounded-tech-lg border p-5 sm:p-6 shadow-2xl max-h-[85vh] flex flex-col relative backdrop-blur-xl ${
              isLightMode
                ? "bg-white border-gray-200 text-gray-900"
                : "bg-dark-surface border-dark-border text-white"
            }`}
          >
            <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-dark-border mb-4">
              <div className="flex items-center gap-2">
                <FileCode className="w-5 h-5 text-accent-violet" />
                <h2 className="font-mono text-base sm:text-lg font-bold truncate">
                  {fileList[expandedIndex].fileName}
                </h2>
              </div>

              <div className="flex items-center gap-2">
                <CopyToClipboard
                  text={fileList[expandedIndex].fileContent}
                  onCopy={copyContent}
                >
                  <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-tech border border-gray-200 dark:border-dark-border text-xs font-mono text-gray-600 dark:text-gray-300 hover:border-accent-violet transition">
                    {copied ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    <span>{copied ? "Copied" : "Copy"}</span>
                  </button>
                </CopyToClipboard>

                <button
                  onClick={closeOverlay}
                  className="p-1.5 rounded-tech text-gray-400 hover:text-gray-700 dark:hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div
              className={`overflow-auto p-4 rounded-tech font-mono text-xs sm:text-sm leading-relaxed ${
                isLightMode ? "bg-slate-50 text-gray-800" : "bg-dark-bg text-gray-200"
              }`}
            >
              <pre className="whitespace-pre-wrap font-mono">
                {fileList[expandedIndex].fileContent}
              </pre>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default StrapLayout;
