import "./App.css";
import Header from "./components/Header.jsx";
import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import About from "./pages/About";
import Login from "./Auth/Login.jsx";
import Contact from "./components/Contact.jsx";
import Register from "./Auth/Register.jsx";
import RegisteredEmail from "./Auth/RegisteredEmail.jsx";
import EnterOTPforPassword from "./Auth/EnterOTPforPassword.jsx";
import ResetPassword from "./Auth/ResetPassword.jsx";
import RoomPage from "./pages/RoomPage.jsx";
import EditorPage from "./pages/EditorPage.jsx";
import FullScreen from "./CodeReviewer/FullScreen.jsx";
import Developer from "./components/Developer.jsx";
import FolderPage from "./components/FolderPage.jsx";
import StrapLayout from "./components/StrapLayout.jsx";
import GridLayout from "./components/GridLayout.jsx";
import ChatDesktop from "./ChatBox-Desktop/ChatDesktop.jsx";
import LobbyScreen from "./CameraSecurity/screens/Lobby.jsx";
import { MyScreen } from "./CameraSecurity/screens/MyScreen.jsx";
import "./index.css";
import VerifyEmail from "./Auth/verifyEmail.jsx";
import { useAppContext } from "./Context/AppContext.jsx";
import Instruction from "./components/Instruction.jsx";
import Ask from "./components/Ask.jsx";
import RecycleBinFolder from "./components/RecycleBinFolder.jsx";
import VisualizerPage from "./Visualizer/VisualizerPage.jsx";

function App() {
  const { userData, isLoggedIn, authLoading, BACKEND_URL } = useAppContext();
  const [isLightMode, setisLightMode] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (userData?.isLightMode !== undefined) {
      setisLightMode(userData.isLightMode);
    }
  }, [userData]);

  useEffect(() => {
    const trackVisit = async () => {
      try {
        const baseUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";
        await fetch(`${baseUrl}/api/analytics/track-visit`);
      } catch (err) {
        console.error("Tracking ping failed:", err);
      }
    };

    trackVisit();
  }, [BACKEND_URL]);

  const ProtectedRoute = ({ children }) => {
    if (authLoading) return null;
    return isLoggedIn && userData ? (
      children
    ) : (
      <Navigate to="/LoginPage" replace state={{ from: location.pathname }} />
    );
  };

  const protectedElement = (element) => (
    <ProtectedRoute>{element}</ProtectedRoute>
  );

  return (
    <Routes>
      <Route
        path="/Header"
        element={<Header key={location.key} isLightMode={isLightMode} setisLightMode={setisLightMode} />}
      />
      <Route
        path="/Ask"
        element={protectedElement(<Ask key={location.key} isLightMode={isLightMode} setisLightMode={setisLightMode} />)}
      />
      <Route
        path="/"
        element={<Home key={location.key} isLightMode={isLightMode} setisLightMode={setisLightMode} />}
      />
      <Route
        path="/about"
        element={<About key={location.key} isLightMode={isLightMode} setisLightMode={setisLightMode} />}
      />
      <Route
        path="/ChatDesktop"
        element={protectedElement(<ChatDesktop key={location.key} isLightMode={isLightMode} setisLightMode={setisLightMode} />)}
      />
      <Route
        path="/login"
        element={<Login key={location.key} isLightMode={isLightMode} setisLightMode={setisLightMode} />}
      />
      <Route
        path="/Contact"
        element={<Contact key={location.key} isLightMode={isLightMode} setisLightMode={setisLightMode} />}
      />
      <Route
        path="/LoginPage"
        element={<Login key={location.key} isLightMode={isLightMode} setisLightMode={setisLightMode} />}
      />
      <Route
        path="/RegisteredEmail"
        element={<RegisteredEmail key={location.key} isLightMode={isLightMode} setisLightMode={setisLightMode} />}
      />
      <Route
        path="/registerPage"
        element={<Register key={location.key} isLightMode={isLightMode} setisLightMode={setisLightMode} />}
      />
      <Route
        path="/EnterOTPforPassword"
        element={<EnterOTPforPassword key={location.key} isLightMode={isLightMode} setisLightMode={setisLightMode} />}
      />
      <Route
        path="/ResetPassword"
        element={<ResetPassword key={location.key} isLightMode={isLightMode} setisLightMode={setisLightMode} />}
      />
      <Route
        path="/RoomPage"
        element={protectedElement(<RoomPage key={location.key} isLightMode={isLightMode} setisLightMode={setisLightMode} />)}
      />
      <Route
        path="/MyScreen/:roomId"
        element={protectedElement(<MyScreen key={location.key} isLightMode={isLightMode} setisLightMode={setisLightMode} />)}
      />
      <Route
        path="/EditorPage/:roomid"
        element={protectedElement(<EditorPage key={location.key} isLightMode={isLightMode} setisLightMode={setisLightMode} />)}
      />
      <Route
        path="/StrapLayout"
        element={protectedElement(<StrapLayout key={location.key} />)}
      />
      <Route
        path="/GridLayout"
        element={protectedElement(<GridLayout key={location.key} />)}
      />
      <Route
        path="/workspace"
        element={protectedElement(<FolderPage key={location.key} isLightMode={isLightMode} />)}
      />
      <Route
        path="/CodeReviewer"
        element={protectedElement(<FullScreen key={location.key} isLightMode={isLightMode} setisLightMode={setisLightMode} />)}
      />
      <Route
        path="/Instruction"
        element={protectedElement(<Instruction key={location.key} isLightMode={isLightMode} setisLightMode={setisLightMode} />)}
      />
      <Route
        path="/verifyEmail"
        element={<VerifyEmail key={location.key} isLightMode={isLightMode} setisLightMode={setisLightMode} />}
      />
      <Route
        path="/LobbyPage"
        element={protectedElement(<LobbyScreen key={location.key} isLightMode={isLightMode} setisLightMode={setisLightMode} />)} 
      />
      <Route
        path="/Developer"
        element={protectedElement(<Developer key={location.key} isLightMode={isLightMode} setisLightMode={setisLightMode} />)} 
      />
      <Route
        path="/RecycleBinFolderPage"
        element={protectedElement(<RecycleBinFolder />)}
      />
      <Route
        path="/Visualizer"
        element={protectedElement(<VisualizerPage key={location.key} isLightMode={isLightMode} setisLightMode={setisLightMode} />)}
      />
    </Routes>
  );
}

export default App;