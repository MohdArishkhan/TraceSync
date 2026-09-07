import React from "react";
import { useNavigate } from "react-router-dom";

const Buttons = ({ isLightMode }) => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center gap-3">
      <button
        className={`font-mono text-sm px-3.5 py-1.5 rounded-tech transition-colors duration-200 ${
          isLightMode
            ? "text-gray-700 hover:text-gray-900 hover:bg-gray-100"
            : "text-gray-300 hover:text-white hover:bg-dark-surface"
        }`}
        onClick={() => navigate("/LoginPage")}
      >
        Sign in
      </button>
      <button
        className="font-mono text-sm px-4 py-1.5 rounded-tech bg-accent-violet text-white font-medium hover:bg-accent-violet/90 transition-all duration-200 shadow-sm active:scale-95"
        onClick={() => navigate("/RegisterPage")}
      >
        Get Started
      </button>
    </div>
  );
};

export default Buttons;
