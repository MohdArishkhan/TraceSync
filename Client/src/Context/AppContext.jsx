import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { onAuthStateChange, supabase } from "../lib/supabase";
import { ensurePersonalProject } from "../lib/workspace";
const AppContext = createContext();

export const useAppContext = () => useContext(AppContext);

export const AppProvider = (props) => {
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
  const [isLoggedIn, setisLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const clearUser = () => {
    setisLoggedIn(false);
    setUserData(null);
  };

  const loadProfile = async (user) => {
    if (!user) {
      clearUser();
      return;
    }

    let { data: profile, error } = await supabase
      .from("profiles")
      .select("id, display_name, avatar_path, theme, created_at, updated_at")
      .eq("id", user.id)
      .maybeSingle();

    if (error) throw error;

    // Recover gracefully when the database trigger was not applied before signup.
    if (!profile) {
      const { data: createdProfile, error: profileError } = await supabase
        .from("profiles")
        .insert({
          id: user.id,
          display_name: user.user_metadata?.display_name || user.email?.split("@")[0] || "User",
        })
        .select("id, display_name, avatar_path, theme, created_at, updated_at")
        .single();

      if (profileError) throw profileError;
      profile = createdProfile;
    }

    const personalProject = await ensurePersonalProject();

    setisLoggedIn(true);
    setUserData({
      id: user.id,
      workspaceId: personalProject?.workspace.id || null,
      projectId: personalProject?.project.id || null,
      project: personalProject?.project || null,
      name: profile?.display_name || user.user_metadata?.display_name || user.email?.split("@")[0] || "User",
      email: user.email || "",
      isAccountVerified: Boolean(user.email_confirmed_at),
      isLightMode: profile?.theme === "light",
      avatarPath: profile?.avatar_path || null,
      allFiles: [],
      allChats: [],
      allRecycleBinFiles: []
    });
  };

  const getAuthState = async () => {
    setAuthLoading(true);
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      await loadProfile(session?.user ?? null);
    } catch (error) {
      console.error("Error fetching Supabase auth state:", error.message);
      clearUser();
    } finally {
      setAuthLoading(false);
    }
  };

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
    } catch {
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
    }catch{
      // console.log("Error adding file to recycle bin:", e);
    }
  }

  useEffect(() => {
    const { data: { subscription } } = onAuthStateChange(async (_event, session) => {
      try {
        await loadProfile(session?.user ?? null);
      } catch (error) {
        console.error("Error loading Supabase profile:", error.message);
        clearUser();
      } finally {
        setAuthLoading(false);
      }
    });

    getAuthState();

    return () => subscription.unsubscribe();
  }, []);

  const value = {
    BACKEND_URL,
    isLoggedIn,
    authLoading,
    setisLoggedIn,
    userData,
    setUserData,
    getUserData,
    getAuthState,
    loadProfile,
    addFileToRecycleBin
  };

  return (
    <AppContext.Provider value={value}>{props.children}</AppContext.Provider>
  );
};
