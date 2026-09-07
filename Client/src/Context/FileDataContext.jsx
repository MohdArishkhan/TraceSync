import { createContext, useState, useContext, useEffect } from "react";
import { useAppContext } from "./AppContext";
import { getPersonalProjectDocuments } from "../lib/workspace";

const FileDataContext = createContext();

export const useFileData = () => useContext(FileDataContext);

const initialFiles = [
  { fileName: "hello.txt", fileContent: "Hello world!" },
  { fileName: "readme.md", fileContent: "# Readme content" },
];

export const FileDataProvider = ({ children }) => {
  const { isLoggedIn, authLoading, userData } = useAppContext();
  const [fileList, setFileList] = useState(() => {
    const storedFiles = localStorage.getItem("fileList");
    return storedFiles ? JSON.parse(storedFiles) : initialFiles;
  });
  const [documentsLoading, setDocumentsLoading] = useState(false);
  const [documentsError, setDocumentsError] = useState(null);

  useEffect(() => {
    localStorage.setItem("fileList", JSON.stringify(fileList));
  }, [fileList]);

  useEffect(() => {
    if (authLoading || !isLoggedIn || !userData?.projectId) return undefined;

    let cancelled = false;
    setDocumentsLoading(true);
    setDocumentsError(null);

    getPersonalProjectDocuments(userData.projectId)
      .then((documents) => {
        if (cancelled) return;
        setFileList(documents.map((document) => ({
          id: document.id,
          fileName: document.name,
          fileContent: document.code_content,
          visualState: document.visual_state,
          revision: document.revision,
          language: document.language,
          dateCreated: document.created_at,
          updatedAt: document.updated_at
        })));
      })
      .catch((error) => {
        if (!cancelled) setDocumentsError(error);
      })
      .finally(() => {
        if (!cancelled) setDocumentsLoading(false);
      });

    return () => { cancelled = true; };
  }, [authLoading, isLoggedIn, userData?.projectId]);

  return (
    <FileDataContext.Provider value={{ fileList, setFileList, documentsLoading, documentsError }}>
      {children}
    </FileDataContext.Provider>
  );
};
