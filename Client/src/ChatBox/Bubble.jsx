import React, { useState } from "react";
import { ImCross } from "react-icons/im";
import { VscRobot } from "react-icons/vsc";

const Bubble = ({ setisChatOpen,isLightMode,setisLightMode }) => {
  const [isBubbleShow, setisBubbleShow] = useState(true);

  return (
    <>
      {isBubbleShow && (
        <div className="fixed right-0 bottom-0 mr-10 mb-10 z-20">
          <button
            className="relative group animate-bounce"
            onClick={() => setisChatOpen((prev) => !prev)}
          >
            {/* Glowing Aura */}
            <div className={`absolute inset-0 rounded-full ${isLightMode ? "bg-blue-400":"bg-green-400"} blur-xl opacity-70 group-hover:opacity-90 transition duration-300`}></div>

            {/* Bot Button */}
            <div className={`relative h-12 w-12 lg:h-16 lg:w-16 bg-gradient-to-br ${isLightMode ? "from-blue-500 to-blue-700":"from-green-500 to-green-700"}  rounded-full flex justify-center items-center shadow-2xl group-hover:scale-110 transform transition duration-300 cursor-pointer`}>
              
              {/* Cross Icon */}
              <ImCross
                className="absolute top-1 right-1 text-lg text-white bg-red-600 rounded-full p-1 cursor-pointer hover:scale-110 transition-transform duration-200 z-10"
                onClick={(e) => {
                  e.stopPropagation(); // prevent triggering chat open
                  setisBubbleShow(false);
                }}
              />

              {/* Bot Icon */}
              <VscRobot className="text-3xl text-white drop-shadow-md group-hover:rotate-6 transition-transform duration-300" />
            </div>
          </button>
        </div>
      )}
    </>
  );
};

export default Bubble;
