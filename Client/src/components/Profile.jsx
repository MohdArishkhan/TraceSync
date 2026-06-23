import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MdEmail, MdLogout } from "react-icons/md";
import { useAppContext } from "../Context/AppContext";
import axios from "axios";
import { useEffect } from "react";

const  Profile = ({ userName, isLightMode, setisLightMode }) => {
  const [showList, setshowList] = useState(false);
  const { BACKEND_URL,getUserData, userData, setUserData, setisLoggedIn, isLoggedIn } = useAppContext();
  const navigate = useNavigate();

  useEffect(() => {
    // console.log("bhai hora hai referesh");
    // console.log("Is Logged In ? "+isLoggedIn);
    getUserData(); // ✅ ye context se userData ko refresh karega
}, []);


  async function logOutUser() {
    try {
      const response = await axios.post(`${BACKEND_URL}/api/auth/logout`,{}, {
        withCredentials: true,
      });
        // console.log("Logout response:", response.data);

      if (response.data.status) {
        // console.log("User logged out successfully");
        setisLoggedIn(false);
        setUserData(null); 
        navigate("/");
      }
    } catch (e) {
      // console.log("Error logging out user:", e);
    }
  }
  
  function gotopage(){
    navigate("/verifyEmail");
  }

  useEffect(() => {
  // console.log("UPDATED userData in Profile:", userData);
}, [userData]);


  return (
    <div
      className="relative"
      onMouseEnter={() => setshowList(true)}
      onMouseLeave={() => setshowList(false)}
    >
      <p
        className={`font-bold text-2xl ${
          isLightMode
            ? "bg-gray-200 hover:border border-gray-500"
            : "text-black hover:border border-white bg-white"
        } hover:cursor-pointer rounded-full px-4 py-2 hover:transition-all duration-200 transform hover:scale-105`}
      >
        {userName[0].toUpperCase()}
      </p>

      <div
        className={`absolute right-0 mt-2 w-40 bg-white rounded-md shadow-lg p-2 transform transition-all duration-200 ${
          showList ? "opacity-100 scale-100 visible" : "opacity-0 scale-95 invisible"
        }`}
      >

        {/* CAUTION */}


        
        {/* /* {!userData?.isAccountVerified && (
          <button
            onClick={()=>gotopage()}
            className={`block w-full text-left px-4 py-2 hover:bg-gray-200 text-sm ${
              isLightMode ? "" : "text-black"
            }`}
          >
            Verify Email
          </button>
        )} */ }

        {isLoggedIn && (
          <button
            onClick={()=>logOutUser()}
            className={`block w-full text-left px-4 py-2 hover:bg-gray-200 text-sm ${
              isLightMode ? "" : "text-black"
            }`}
          >
            Logout
          </button>
        )}
      </div>
    </div>
  );
};
export default Profile;
