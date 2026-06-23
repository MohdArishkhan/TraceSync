// src/components/Footer.js
import React from "react";
import { FaGithub, FaLinkedin, FaTwitter } from "react-icons/fa";

const Footer = ({ isLightMode, setisLightMode }) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className={`${
        !isLightMode ? "bg-gray-950" : "bg-white"
      } text-white py-10 px-4`}
    >
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        {/* Project Info */}
        <div className="text-center md:text-left">
          <h2
            className={`${
              isLightMode ? "text-blue-400" : "text-green-400"
            } text-2xl font-bold text-blue-500`}
          >
            CodeDoodle
          </h2>
          <p className="text-sm text-gray-400 mt-2">
            Collaborate. Share. Build together in real-time.
          </p>
          <p className="mt-4 text-xs text-gray-500">
            &copy; {currentYear} CodeDoodle. All rights reserved.
          </p>
        </div>
      </div>

      {/* Credit Line */}
      <div className="text-center mt-6 text-sm text-gray-500">
        Designed & Developed by{" "}
        <button
          onClick={() =>
            window.open(
              "https://www.linkedin.com/in/aditya-kumar--/",
              "_blank",
              "noopener,noreferrer"
            )
          }
          className={`${
            isLightMode ? "text-blue-400" : "text-green-400"
          } font-semibold`}
        >
          Aditya Kumar Rajput
        </button>{" "}
        and{" "}
        <button
        onClick={() =>
            window.open(
              "https://www.linkedin.com/in/harsh-gupta-61b01a2a4/",
              "_blank",
              "noopener,noreferrer"
            )
          }
          className={`${
            isLightMode ? "text-blue-400" : "text-green-400"
          } font-semibold`}
        >
          Harsh Gupta
        </button>
      </div>
    </footer>
  );
};
export default Footer;
