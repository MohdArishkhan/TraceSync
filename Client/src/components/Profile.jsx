import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { useAppContext } from "../Context/AppContext";
import { signOut } from "../lib/supabase";

const Profile = ({ userName, isLightMode }) => {
  const [showList, setShowList] = useState(false);
  const { setUserData, setisLoggedIn, isLoggedIn } = useAppContext();
  const navigate = useNavigate();

  async function logOutUser() {
    try {
      await signOut();
      setisLoggedIn(false);
      setUserData(null);
      navigate("/");
    } catch (error) {
      console.error("Error logging out user:", error);
    }
  }

  return (
    <div
      className="relative"
      onMouseEnter={() => setShowList(true)}
      onMouseLeave={() => setShowList(false)}
    >
      <button
        className={`font-mono text-sm font-semibold w-9 h-9 rounded-tech flex items-center justify-center border transition-all duration-200 ${
          isLightMode
            ? "bg-gray-100 border-gray-300 text-gray-800 hover:border-accent-violet"
            : "bg-dark-surface border-dark-border text-white hover:border-accent-violet"
        }`}
      >
        {userName ? userName[0].toUpperCase() : "U"}
      </button>

      <div
        className={`absolute right-0 mt-2 w-48 rounded-tech-lg border p-2 backdrop-blur-md shadow-xl transition-all duration-200 ${
          showList ? "opacity-100 scale-100 visible" : "opacity-0 scale-95 invisible"
        } ${
          isLightMode
            ? "bg-white/95 border-gray-200"
            : "bg-dark-surface/95 border-dark-border"
        }`}
      >
        <div className={`px-3 py-2 border-b font-mono text-xs ${isLightMode ? "border-gray-100 text-gray-500" : "border-dark-border text-gray-400"}`}>
          Signed in as <br />
          <span className={`font-semibold ${isLightMode ? "text-gray-900" : "text-white"}`}>
            {userName}
          </span>
        </div>

        {isLoggedIn && (
          <button
            onClick={logOutUser}
            className={`w-full flex items-center gap-2 px-3 py-2 mt-1 rounded-tech font-mono text-xs text-left transition-colors ${
              isLightMode
                ? "text-red-600 hover:bg-red-50"
                : "text-red-400 hover:bg-red-950/30"
            }`}
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        )}
      </div>
    </div>
  );
};

export default Profile;
