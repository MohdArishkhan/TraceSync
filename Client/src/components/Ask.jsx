import React from "react";
import { Navigate, useNavigate } from "react-router-dom";

const Ask = ({ isLightMode, setisLightMode }) => {
  const Navigate = useNavigate();

  return (
    <div className={`${isLightMode?"bg-slate-300":"bg-gray-950"} flex items-center justify-center min-h-screen px-4 sm:px-6`}>
      <div className={`${isLightMode?"bg-white":"bg-gray-900"} text-center p-6 sm:p-8 rounded-xl shadow-md w-full max-w-md`}>
        <h2 className={`text-xl sm:text-2xl font-semibold mb-6 ${isLightMode?"text-gray-800":"text-white"}`}>
          Doesn't know how to use?
        </h2>

        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
          <button
            className="w-full sm:w-auto bg-yellow-400 hover:bg-yellow-500 text-white font-medium px-6 py-2 rounded-lg transition duration-300"
            onClick={() => Navigate("/Instruction")}
          >
            Learn More
          </button>

          <button
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg transition duration-300"
            onClick={() => Navigate("/LobbyPage")}
          >
            Start Meeting
          </button>
        </div>
      </div>
    </div>
  );
};

export default Ask;
