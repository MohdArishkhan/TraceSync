import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import toast, { Toaster } from "react-hot-toast";
import { motion } from "framer-motion";
import ShareCircleBold from "../assets/ShareCircleBold";

function HomePage({ isLightMode }) {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [username, setusername] = useState("");
  const [roomid, setroomid] = useState("");

  function handleSubmit(e) {
    e.preventDefault();

    if (!username || !roomid) {
      toast.error("Please fill complete details");
      return;
    }

    setIsLoading(true);
    const loadingToastId = toast.loading("Entering the room...");

    setTimeout(() => {
      toast.dismiss(loadingToastId);
      toast.success("Entered successfully!");
      navigate(`/EditorPage/${roomid}`, {
        state: {
          username: username,
        },
      });
      setIsLoading(false);
    }, 2000);
  }

  function createNewRoom() {
    const myRoomid = uuidv4();
    setroomid(myRoomid);
    toast.success("New Room Created!");
  }

  function handleUserName(e) {
    setusername(e.target.value);
  }

  function handleroomid(e) {
    setroomid(e.target.value);
  }

  return (
    <>
      <Toaster />
      <div
        className={`h-screen w-screen flex items-center justify-center ${
          isLightMode ? "bg-gray-100" : "bg-[#0F172A]"
        }`}
      >
        <motion.div
          className={`backdrop-blur-lg border rounded-xl shadow-xl p-4 lg:p-8 w-[90%] max-w-md
            ${
              isLightMode
                ? "bg-white border-gray-300"
                : "bg-white/20 border-white/30"
            }`}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div className="flex flex-row justify-center items-center gap-4 mb-6">
            <div
              className={`h-10 w-10 lg:h-12 lg:w-12 p-2 rounded-full border flex items-center justify-center ${
                isLightMode
                  ? "bg-blue-100 border-blue-300"
                  : "bg-white border-white"
              }`}
            >
              <ShareCircleBold
                className={`w-full h-full ${
                  isLightMode ? "text-blue-600" : "text-blue-500"
                }`}
              />
            </div>
            <span
              className={`font-semibold text-2xl lg:text-3xl tracking-wide ${
                isLightMode ? "text-gray-900" : "text-white"
              }`}
            >
              CodeDoodle
            </span>
          </div>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input
              type="text"
              placeholder="Enter room ID"
              value={roomid}
              onChange={handleroomid}
              className={`border p-2 rounded focus:outline-none focus:ring-2 transition duration-200
                ${
                  isLightMode
                    ? "bg-white text-gray-900 border-gray-300 placeholder-gray-500 focus:ring-blue-500"
                    : "bg-white/20 text-white border-gray-600 placeholder-gray-300 focus:ring-blue-500"
                }
              `}
            />
            <input
              type="text"
              placeholder="Enter username"
              value={username}
              onChange={handleUserName}
              className={`border p-2 rounded focus:outline-none focus:ring-2 transition duration-200
                ${
                  isLightMode
                    ? "bg-white text-gray-900 border-gray-300 placeholder-gray-500 focus:ring-blue-500"
                    : "bg-white/20 text-white border-gray-600 placeholder-gray-300 focus:ring-blue-500"
                }
              `}
            />
            <button
              type="submit"
              className={`rounded-lg py-2 px-6 font-medium transition duration-300
                ${
                  isLightMode
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }
                ${
                  isLoading
                    ? "opacity-50 cursor-not-allowed"
                    : "cursor-pointer"
                }
              `}
              disabled={isLoading}
            >
              {isLoading ? "Joining..." : "Join"}
            </button>
            <p
              className={`text-sm lg:text-1xl text-center ${
                isLightMode ? "text-gray-700" : "text-white"
              }`}
            >
              Don&apos;t have a room ID?{" "}
              <span
                className={`cursor-pointer ${
                  isLightMode ? "text-blue-600 hover:underline" : "text-blue-400 hover:underline"
                }`}
                onClick={createNewRoom}
              >
                Create New Room
              </span>
            </p>
          </form>
        </motion.div>
      </div>
    </>
  );
}

export default HomePage;
