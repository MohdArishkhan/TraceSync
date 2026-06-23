import React, { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useAppContext } from "../Context/AppContext";
import Profile from "./Profile";
import Buttons from "./Buttons";
import { MdDarkMode, MdLightMode } from "react-icons/md";
import { HiMenu, HiX } from "react-icons/hi";
import axios from "axios";

export default function Header({ isLightMode, setisLightMode }) {
  const { userData, BACKEND_URL, getUserData } = useAppContext();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  function getPath(currFilePath) {
    return currFilePath === "home" ? "/" : `/${currFilePath}`;
  }

  async function toggleThemeInDB() {
    try {
      const res = await axios.post(`${BACKEND_URL}/api/theme/changeTheme`, {}, { withCredentials: true });
      // console.log(res.data);
      getUserData();
      setisLightMode(userData.isLightMode);
    } catch (e) {
      console.error(e);
    }
  }

  const menuItems = ["Home", "About", "Contact", "Developer", "Workspace"];

  return (
    <header className={`shadow sticky top-0 z-50 ${isLightMode ? "bg-white" : "bg-black"}`}>
      <nav className={`border-gray-200 px-8 lg:px-16 py-4 ${isLightMode ? "text-black" : "text-white"}`}>
        <div className="flex justify-between items-center max-w-screen-xl mx-auto">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <svg className="text-sm lg:text-1xl" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="3em" height="3em">
              <path
                
                fill="currentColor"
                d="M9 6a3 3 0 1 0 6 0a3 3 0 0 0-6 0M2.5 18a3 3 0 1 0 6 0a3 3 0 0 0-6 0m16 3a3 3 0 1 1 0-6a3 3 0 0 1 0 6M7.205 7.562a.75.75 0 0 0-.993-1.124A8.73 8.73 0 0 0 3.25 13a.75.75 0 0 0 1.5 0a7.23 7.23 0 0 1 2.455-5.438m10.583-1.124a.75.75 0 0 0-.993 1.124A7.23 7.23 0 0 1 19.25 13a.75.75 0 0 0 1.5 0a8.73 8.73 0 0 0-2.962-6.562m-7.601 13.584a.75.75 0 1 0-.374 1.452a8.8 8.8 0 0 0 4.374 0a.75.75 0 1 0-.374-1.452A7.3 7.3 0 0 1 12 20.25a7.3 7.3 0 0 1-1.813-.228"
              ></path>
            </svg>
            <span className="text-2xl lg:text-3xl font-bold ml-3 font-sans tracking-wide">CodeDoodle</span>
          </Link>

          {/* Hamburger Icon (Mobile) */}
          <div className="lg:hidden">
            {mobileMenuOpen ? (
              <HiX className="text-2xl lg:text-3xl cursor-pointer" onClick={() => setMobileMenuOpen(false)} />
            ) : (
              <HiMenu className="text-2xl lg:text-3xl cursor-pointer" onClick={() => setMobileMenuOpen(true)} />
            )}
          </div>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center space-x-6 lg:space-x-10 font-sans">
            {menuItems.map((item, index) => (
              <NavLink
                key={index}
                to={getPath(item.toLowerCase())}
                className={`text-sm lg:text-xl ${
                  item.toLowerCase() === "workspace" && !userData ? "hidden" : ""
                } font-semibold duration-200 text-gray-600 ${
                  isLightMode ? "hover:text-black" : "hover:text-slate-500 text-white"
                }`}
              >
                {item}
              </NavLink>
            ))}
          </div>

          {/* Theme + Profile/Buttons */}
          <div className="hidden lg:flex items-center space-x-4">
            {isLightMode ? (
              <MdDarkMode
                className="text-xl cursor-pointer hover:scale-125 hover:rotate-45 transition"
                onClick={toggleThemeInDB}
              />
            ) : (
              <MdLightMode
                className="text-xl cursor-pointer hover:scale-125 hover:rotate-45 transition"
                onClick={toggleThemeInDB}
              />
            )}
            {userData ? (
              <Profile userName={userData.name} isLightMode={isLightMode} setisLightMode={setisLightMode} />
            ) : (
              <Buttons isLightMode={isLightMode} setisLightMode={setisLightMode} />
            )}
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden mt-4 space-y-4 flex flex-col text-center">
            {menuItems.map((item, index) => (
              <NavLink
                key={index}
                to={getPath(item.toLowerCase())}
                onClick={() => setMobileMenuOpen(false)}
                className={`text-lg ${
                  item.toLowerCase() === "workspace" && !userData ? "hidden" : ""
                } font-medium text-gray-600 ${
                  isLightMode ? "hover:text-black" : "hover:text-slate-400 text-white"
                }`}
              >
                {item}
              </NavLink>
            ))}
            <div className="flex justify-center items-center gap-4 mt-2">
              {isLightMode ? (
                <MdDarkMode className="text-xl cursor-pointer" onClick={toggleThemeInDB} />
              ) : (
                <MdLightMode className="text-xl cursor-pointer" onClick={toggleThemeInDB} />
              )}
              {userData ? (
                <Profile userName={userData.name} isLightMode={isLightMode} setisLightMode={setisLightMode} />
              ) : (
                <Buttons isLightMode={isLightMode} setisLightMode={setisLightMode} />
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
