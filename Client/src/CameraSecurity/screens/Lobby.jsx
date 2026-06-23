import React, { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../context/SocketProvider";
import { FaMoon, FaSun } from "react-icons/fa";
import { toast, Toaster } from "react-hot-toast";
import {v4 as uuidv4} from "uuid";

const LobbyScreen = ({ isLightMode, setisLightMode }) => {
  const [email, setEmail] = useState("");
  const [room, setRoom] = useState("");

  const socket = useSocket();
  const navigate = useNavigate();

  function createNewRoom() {
    const myRoomid = uuidv4();
    setRoom(myRoomid);
    toast.success("New Room Created!");
  }

  const handleSubmitForm = useCallback(
    (e) => {
      e.preventDefault();
      if (!email || !room) {
        toast.error("Please Provide Complete Data");
        return;
      }
      socket.emit("room:join", { email, room });
    },
    [email, room, socket]
  );

  const handleJoinRoom = useCallback(
    (data) => {
      const { room } = data;
      navigate(`/MyScreen/${room}`, {
        state: { email },
      });
    },
    [navigate, email]
  );

  useEffect(() => {
    socket.on("room:join", handleJoinRoom);
    return () => {
      socket.off("room:join", handleJoinRoom);
    };
  }, [socket, handleJoinRoom]);

  return (
    <div
      className={`${
        !isLightMode ? "bg-black" : "bg-slate-100"
      } min-h-screen transition-colors duration-300 flex items-center justify-center px-4 sm:px-6 lg:px-8`}
    >
      <Toaster />
      <div className="w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-md">

        <form
          onSubmit={handleSubmitForm}
          className={`w-full rounded-2xl p-5 sm:p-6 md:p-8 shadow-xl transition-all ${
            !isLightMode
              ? "bg-gray-900 border border-green-400"
              : "bg-white border border-gray-300"
          }`}
        >
          <div className="mb-4">
        <h1
          className={`text-2xl sm:text-3xl font-bold mb-6 text-center ${
            !isLightMode ? "text-white" : "text-gray-900"
          }`}
        >
          Join a Meeting
        </h1>
        <div className="mb-4">
            <label
              htmlFor="room"
              className={`block text-sm font-semibold mb-2 ${
                !isLightMode ? "text-green-400" : "text-gray-800"
              }`}
            >
              Room Number
            </label>
            <input
              type="text"
              id="room"
              value={room}
              onChange={(e) => setRoom(e.target.value)}
              placeholder="Enter room ID"
              className={`w-full px-4 py-2 rounded-lg transition border focus:outline-none focus:ring-2 ${
                !isLightMode
                  ? "bg-gray-800 border-green-500 text-green-300 placeholder-green-400 focus:ring-green-400"
                  : "bg-white border-gray-300 text-gray-800 placeholder-gray-400 focus:ring-blue-500"
              }`}
            />
          </div>
            <label
              htmlFor="email"
              className={`block text-sm font-semibold mb-2 ${
                !isLightMode ? "text-green-400" : "text-gray-800"
              }`}
            >
              Username
            </label>
            <input
              type="text"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your name"
              className={`w-full px-4 py-2 rounded-lg transition border focus:outline-none focus:ring-2 ${
                !isLightMode
                  ? "bg-gray-800 border-green-500 text-green-300 placeholder-green-400 focus:ring-green-400"
                  : "bg-white border-gray-300 text-gray-800 placeholder-gray-400 focus:ring-blue-500"
              }`}
            />
          </div>

          

          <button
            type="submit"
            className={`w-full py-2 text-base sm:text-lg font-semibold rounded-lg transition-all hover:scale-95 active:scale-90 ${
              !isLightMode
                ? "bg-green-500 hover:bg-green-600 text-white"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
          >
            Join Room
          </button>
          <p
              className={`text-sm lg:text-1xl text-center pt-6 ${
                isLightMode ? "text-gray-700" : "text-white"
              }`}
            >
              Don&apos;t have a room ID?{" "}
              <span
                className={`cursor-pointer ${
                  isLightMode ? "text-blue-600 hover:underline" : "text-green-400 hover:underline"
                }`}
                onClick={createNewRoom}
              >
                Create New Room
              </span>
            </p>
        </form>
      </div>
    </div>
  );
};

export default LobbyScreen;