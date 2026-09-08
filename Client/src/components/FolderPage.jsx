import React, { useEffect, useState } from "react";
import GridLayout from "./GridLayout";
import StrapLayout from "./StrapLayout";
import { Toaster, toast } from "react-hot-toast";
import "../App.css";
import { LayoutGrid, List, Trash2, Search, ArrowLeft, FolderGit2, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useFileData } from "../Context/FileDataContext";
import { deleteDocument } from "../lib/documents";

function FolderPage({ isLightMode }) {
  const [isGrid, setGrid] = useState(true);
  const { fileList: durableFiles, setFileList: setDurableFiles } = useFileData();
  const [confirm, setConfirm] = useState("");
  const [fileTargeted, setFileTargeted] = useState("");
  const [fileList, setFileList] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setFileList([
      ...(durableFiles?.map((file) => ({
        ...file,
        dateCreated: new Date(file.dateCreated || file.created_at).toLocaleDateString(),
      })) || []),
    ]);
  }, [durableFiles]);

  async function deleteAllFiles() {
    const realQuery = "delete all files";
    if (confirm.toLowerCase() === realQuery) {
      try {
        const documentsToDelete = durableFiles.filter((file) => file.id);
        await Promise.all(documentsToDelete.map((file) => deleteDocument(file.id)));
        setDurableFiles((files) => files.filter((file) => !file.id));
        setIsOpen(false);
        toast.success("All workspace files deleted");
      } catch {
        toast.error("Failed to delete files");
      }
      setConfirm("");
    } else {
      toast.error("Please type 'delete all files' to confirm");
      setConfirm("");
    }
  }

  return (
    <>
      <Toaster position="top-center" />
      <div
        className={`min-h-screen flex flex-col transition-colors duration-300 ${
          isLightMode
            ? "bg-slate-50 bg-grid-pattern-light text-gray-900"
            : "bg-dark-bg bg-grid-pattern text-white"
        }`}
      >
        {/* Workspace Top Navigation Bar */}
        <header
          className={`sticky top-0 z-40 border-b backdrop-blur-md px-4 sm:px-6 lg:px-8 py-3.5 transition-colors ${
            isLightMode
              ? "bg-white/90 border-gray-200 shadow-sm"
              : "bg-dark-surface/90 border-dark-border"
          }`}
        >
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Left: Back & Title */}
            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
              <button
                onClick={() => navigate(-1)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-tech font-mono text-xs font-semibold border transition-all ${
                  isLightMode
                    ? "border-gray-200 text-gray-700 hover:border-accent-violet hover:text-accent-violet"
                    : "border-dark-border text-gray-300 hover:border-accent-violet hover:text-white"
                }`}
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>

              <div className="flex items-center gap-2">
                <FolderGit2 className="w-5 h-5 text-accent-violet" />
                <h1 className="font-mono text-base sm:text-lg font-bold">
                  Saved Workspace
                </h1>
              </div>
            </div>

            {/* Center: Search input */}
            <div className="w-full sm:w-72 lg:w-96 relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={fileTargeted}
                onChange={(e) => setFileTargeted(e.target.value)}
                placeholder="Search files in workspace..."
                className={`w-full font-mono text-xs sm:text-sm pl-9 pr-3 py-2 rounded-tech border transition-colors outline-none ${
                  isLightMode
                    ? "bg-slate-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-accent-violet"
                    : "bg-dark-bg border-dark-border text-white placeholder-gray-500 focus:border-accent-violet"
                }`}
              />
            </div>

            {/* Right: Layout toggles & actions */}
            <div className="flex items-center gap-2">
              <div
                className={`p-1 rounded-tech border flex items-center gap-1 ${
                  isLightMode ? "bg-slate-100 border-gray-200" : "bg-dark-bg border-dark-border"
                }`}
              >
                <button
                  onClick={() => setGrid(true)}
                  className={`p-1.5 rounded text-xs transition-colors ${
                    isGrid
                      ? "bg-accent-violet text-white shadow-sm"
                      : isLightMode
                      ? "text-gray-600 hover:text-gray-900"
                      : "text-gray-400 hover:text-white"
                  }`}
                  title="Grid view"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setGrid(false)}
                  className={`p-1.5 rounded text-xs transition-colors ${
                    !isGrid
                      ? "bg-accent-violet text-white shadow-sm"
                      : isLightMode
                      ? "text-gray-600 hover:text-gray-900"
                      : "text-gray-400 hover:text-white"
                  }`}
                  title="List view"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>

              {fileList.length > 0 && (
                <button
                  onClick={() => setIsOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-tech font-mono text-xs text-red-500 hover:bg-red-500/10 border border-transparent hover:border-red-500/30 transition-all"
                  title="Delete all workspace files"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Clear All</span>
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {fileList.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div
                className={`w-14 h-14 rounded-tech flex items-center justify-center border mb-4 ${
                  isLightMode
                    ? "bg-gray-100 border-gray-200 text-gray-400"
                    : "bg-dark-surface border-dark-border text-gray-500"
                }`}
              >
                <FolderGit2 className="w-7 h-7" />
              </div>
              <h2 className="font-mono text-lg font-bold mb-1">
                No Workspace Files Found
              </h2>
              <p
                className={`text-xs sm:text-sm font-sans max-w-sm ${
                  isLightMode ? "text-gray-500" : "text-gray-400"
                }`}
              >
                Create and save files in the TraceSync Editor to access them here.
              </p>
            </div>
          ) : isGrid ? (
            <GridLayout isLightMode={isLightMode} />
          ) : (
            <StrapLayout isLightMode={isLightMode} />
          )}
        </main>

        {/* Delete All Modal */}
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div
              className={`rounded-tech-lg border p-6 max-w-md w-full text-center shadow-2xl backdrop-blur-xl ${
                isLightMode
                  ? "bg-white border-gray-200 text-gray-900"
                  : "bg-dark-surface border-dark-border text-white"
              }`}
            >
              <h3 className="font-mono text-lg font-bold mb-2">
                Delete All Workspace Files?
              </h3>
              <p className="text-xs sm:text-sm font-sans mb-4 text-gray-500 dark:text-gray-400 leading-relaxed">
                This action cannot be undone. Type{" "}
                <span className="font-mono font-bold text-red-500">
                  delete all files
                </span>{" "}
                below to confirm.
              </p>

              <input
                type="text"
                placeholder="delete all files"
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
                  onClick={deleteAllFiles}
                  className="px-4 py-2 rounded-tech font-mono text-xs font-semibold bg-red-600 hover:bg-red-700 text-white transition shadow-sm"
                >
                  Delete Everything
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default FolderPage;
