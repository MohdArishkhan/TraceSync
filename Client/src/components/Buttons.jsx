import React from "react";
import { MdDarkMode } from "react-icons/md";
import { MdLightMode } from "react-icons/md";
import { useNavigate } from "react-router-dom";

const Buttons = ({ isLightMode, setisLightMode }) => {
  const Navigate = useNavigate();

  return (
    <>
      <div className="flex items-center gap-4">
        <button
          className={`text-gray-700 ${
            isLightMode
              ? "hover:text-blue-600 text-gray-700"
              : "hover:text-green-600 text-white"
          } transition hover:cursor-pointer`}
          onClick={() => Navigate("/LoginPage")}
        >
          Login
        </button>
        <button
          className={`text-white px-4 py-2 rounded-lg hover:scale-90 transform transition-all duration-300 active:scale-100 ${
            isLightMode
              ? "bg-blue-600 hover:bg-blue-700"
              : "bg-green-600 hover:bg-green-700"
          } transition hover:cursor-pointer`}
          onClick={() => Navigate("/RegisterPage")}
        >
          Register
        </button>
      </div>
    </>
  );
};

export default Buttons;
