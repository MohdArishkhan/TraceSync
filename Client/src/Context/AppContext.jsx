import { React, useContext } from "react";
import { createContext, useState } from "react";
import axios from "axios";
import { useEffect } from "react";
const AppContext = createContext();
//added toast
import {toast} from "react-hot-toast";

export const useAppContext = () => useContext(AppContext);

export const AppProvider = (props) => {
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
  const [isLoggedIn, setisLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);

  const getAuthState = async () => {
    // BYPASS - Always logged in
    setisLoggedIn(true);
    setUserData({
      name: "Test User",
      email: "test@example.com",
      isAccountVerified: true,
      allFiles: [],
      isLightMode: false,
      allChats: [],
      allRecycleBinFiles: []
    });

    // try{
    //     // console.log("Checking authentication state...");
    //     const response = await axios.get(`${BACKEND_URL}/api/auth/isAuthenticated`,{
    //         withCredentials: true
    //     });
    //     if(response.data.success === true){
    //         setisLoggedIn(true);
    //         getUserData();
    //     }
    //     else{
    //         setisLoggedIn(false);
    //     }
    // }catch(e){
    //     // console.log("Error fetching authentication state:", e);
    //     setisLoggedIn(false);
    // }
  }

  const getUserData = async () => {
    try {
      const response = await axios.get(
        `${BACKEND_URL}/api/userData/getUserData`,
        {
          withCredentials: true,
        }
      );

      if (response.data.status === 1) {
        // console.log("User Data:", response.data.userData);
        setUserData(response.data.userData);
      } else {
        setUserData(false);
      }
    } catch (e) {
      // console.log("Error fetching user data:", e);
    }
  };

  const addFileToRecycleBin = async ({removedBy,fileContent,fileName})=>{
    try{
      const response = await axios.post(`${BACKEND_URL}/api/file/addToRecycleBin`,{
        removedBy,fileContent,fileName
      },{
        withCredentials: true
      });
      // if(response.data.status == 1){
      //   toast.success("File added to recycle bin");
        // console.log("File added to recycle bin successfully");
      // }
      // else{
        // toast.error("Error adding file to recycle bin");
        // console.log("Error adding file to recycle bin:", response.data.message);
      // }
      return response;
    }catch(e){
      // console.log("Error adding file to recycle bin:", e);
    }
  }

  useEffect(()=>{
    getAuthState();
  },[])

  const value = {
    BACKEND_URL,
    isLoggedIn,
    setisLoggedIn,
    userData,
    setUserData,
    getUserData,
    getAuthState,
    addFileToRecycleBin
  };

  return (
    <AppContext.Provider value={value}>{props.children}</AppContext.Provider>
  );
};
