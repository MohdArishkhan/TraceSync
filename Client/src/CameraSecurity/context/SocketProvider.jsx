import React, { createContext, useMemo, useContext } from "react";
import { io } from "socket.io-client";

const SocketContext = createContext(null);
// addedd BACKEND_URL
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
export const useSocket = () => {
  const socket = useContext(SocketContext);
  return socket;
};

export const SocketProvider = (props) => {
  // const socket = useMemo(() => io("https://code-doodle-editor-6.onrender.com"), []);
  const socket = useMemo(() => io(`${BACKEND_URL}`), []);

  return (
    <SocketContext.Provider value={socket}>
      {props.children}
    </SocketContext.Provider>
  );
};
