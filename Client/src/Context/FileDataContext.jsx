import { createContext, useState, useContext, useEffect } from "react";

const FileDataContext = createContext();

export const useFileData = () => useContext(FileDataContext);

const initialFiles = [
  { fileName: "hello.txt", fileContent: "Hello world!" },
  { fileName: "readme.md", fileContent: "# Readme content" },
];

export const FileDataProvider = ({ children }) => {
  const [fileList, setFileList] = useState(() => {
    const storedFiles = localStorage.getItem("fileList");
    return storedFiles ? JSON.parse(storedFiles) : initialFiles;
  });

  useEffect(() => {
    localStorage.setItem("fileList", JSON.stringify(fileList));
  }, [fileList]);

  return (
    <FileDataContext.Provider value={{ fileList, setFileList }}>
      {children}
    </FileDataContext.Provider>
  );
};
