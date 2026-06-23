import { io } from "socket.io-client";

const HOST = import.meta.env.VITE_BACKEND_URL;

export const initSocket = async () => {
  return io(HOST, {
    transports: ["websocket"],
    reconnectionAttempts: Infinity,
    timeout: 10000,
    autoConnect: true,
  });
};