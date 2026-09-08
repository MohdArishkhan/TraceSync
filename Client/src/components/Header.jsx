import React, { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useAppContext } from "../Context/AppContext";
import Profile from "./Profile";
import Buttons from "./Buttons";
import { Moon, Sun, Menu, X, Network } from "lucide-react";
import { supabase } from "../lib/supabase";

export default function Header({ isLightMode, setisLightMode }) {
  const { userData, getUserData } = useAppContext();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  function getPath(currFilePath) {
    return currFilePath === "home" ? "/" : `/${currFilePath}`;
  }

  // Instant UI toggle + background persistence
  async function handleToggleTheme() {
    const nextMode = !isLightMode;

    if (setisLightMode) {
      setisLightMode(nextMode);
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from("profiles")
          .update({ theme: nextMode ? "light" : "dark" })
          .eq("id", user.id);

        if (getUserData) {
          getUserData();
        }
      }
    } catch (err) {
      console.error("Failed to persist theme change to Supabase:", err);
    }
  }

  const menuItems = ["Home", "About", "Contact", "Developer", "Workspace"];

  return (
    <header
      className={`sticky top-0 z-50 border-b backdrop-blur-md transition-colors duration-300 ${
        isLightMode
          ? "bg-gray-100/90 border-gray-300"
          : "bg-black/90 border-dark-border"
      }`}
    >
      <nav className="max-w-7xl mx-auto px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <Network
              className={`w-7 h-7 transition-colors ${
                isLightMode
                  ? "text-gray-900 group-hover:text-accent-violet"
                  : "text-white group-hover:text-accent-violet"
              }`}
            />
            <span
              className={`font-mono text-xl md:text-2xl font-bold tracking-tight transition-colors ${
                isLightMode
                  ? "text-gray-900 group-hover:text-accent-violet"
                  : "text-white group-hover:text-accent-violet"
              }`}
            >
              TraceSync
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center gap-8">
            {menuItems.map((item, index) => (
              <NavLink
                key={index}
                to={getPath(item.toLowerCase())}
                className={({ isActive }) =>
                  `font-mono text-sm font-medium transition-all duration-200 relative group ${
                    item.toLowerCase() === "workspace" && !userData ? "hidden" : ""
                  } ${
                    isLightMode
                      ? isActive
                        ? "text-accent-violet"
                        : "text-gray-600 hover:text-gray-900"
                      : isActive
                      ? "text-accent-violet"
                      : "text-gray-400 hover:text-white"
                  }`
                }
              >
                {item}
                <span
                  className="absolute -bottom-1 left-0 h-[2px] w-0 transition-all duration-200 group-hover:w-full bg-accent-violet"
                />
              </NavLink>
            ))}
          </div>

          {/* Desktop Controls */}
          <div className="hidden lg:flex items-center gap-4">
            <button
              onClick={handleToggleTheme}
              className={`p-2 rounded-tech border transition-all duration-200 ${
                isLightMode
                  ? "border-gray-200 hover:border-accent-violet hover:bg-accent-violet/10"
                  : "border-dark-border hover:border-accent-violet hover:bg-accent-violet/10"
              }`}
              aria-label="Toggle theme"
            >
              {isLightMode ? (
                <Moon className="w-4 h-4 text-gray-700" />
              ) : (
                <Sun className="w-4 h-4 text-gray-300" />
              )}
            </button>

            {userData ? (
              <Profile userName={userData.name} isLightMode={isLightMode} setisLightMode={setisLightMode} />
            ) : (
              <Buttons isLightMode={isLightMode} setisLightMode={setisLightMode} />
            )}
          </div>

          {/* Mobile Toggle Buttons */}
          <div className="lg:hidden flex items-center gap-3">
            <button
              onClick={handleToggleTheme}
              className={`p-2 rounded-tech border ${
                isLightMode ? "border-gray-200" : "border-dark-border"
              }`}
              aria-label="Toggle theme"
            >
              {isLightMode ? (
                <Moon className="w-4 h-4 text-gray-700" />
              ) : (
                <Sun className="w-4 h-4 text-gray-300" />
              )}
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`p-2 ${isLightMode ? "text-gray-900" : "text-white"}`}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div
            className={`lg:hidden mt-6 pt-6 border-t space-y-4 ${
              isLightMode ? "border-gray-200" : "border-dark-border"
            }`}
          >
            {menuItems.map((item, index) => (
              <NavLink
                key={index}
                to={getPath(item.toLowerCase())}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `block font-mono text-base font-medium transition-colors ${
                    item.toLowerCase() === "workspace" && !userData ? "hidden" : ""
                  } ${
                    isLightMode
                      ? isActive
                        ? "text-accent-violet"
                        : "text-gray-600 hover:text-gray-900"
                      : isActive
                      ? "text-accent-violet"
                      : "text-gray-400 hover:text-white"
                  }`
                }
              >
                {item}
              </NavLink>
            ))}

            <div className="pt-4 border-t flex items-center gap-4">
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