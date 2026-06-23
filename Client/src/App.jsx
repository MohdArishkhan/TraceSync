import "./App.css";
import Header from "./components/Header.jsx";
import React, { useEffect, useState } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
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

function App() {
  const { userData } = useAppContext();
  const [isLightMode, setisLightMode] = useState(true);
  const location = useLocation(); // ✅ Required for key

  useEffect(() => {
    setisLightMode(userData?.isLightMode);
  }, [userData]);

  return (
    <>
      <Routes>
        <Route path="/Header" element={<Header key={location.key} isLightMode={isLightMode} setisLightMode={setisLightMode} />} />
        <Route path="/Ask" element={<Ask key={location.key} isLightMode={isLightMode} setisLightMode={setisLightMode} />} />
        <Route path="/" element={<Home key={location.key} isLightMode={isLightMode} setisLightMode={setisLightMode} />} />
        <Route path="/about" element={<About key={location.key} isLightMode={isLightMode} setisLightMode={setisLightMode} />} />
        <Route path="/ChatDesktop" element={<ChatDesktop key={location.key} isLightMode={isLightMode} setisLightMode={setisLightMode} />} />
        <Route path="/login" element={<Login key={location.key} isLightMode={isLightMode} setisLightMode={setisLightMode} />} />
        <Route path="/Contact" element={<Contact key={location.key} isLightMode={isLightMode} setisLightMode={setisLightMode} />} />
        <Route path="/LoginPage" element={<Login key={location.key} isLightMode={isLightMode} setisLightMode={setisLightMode} />} />
        <Route path="/RegisteredEmail" element={<RegisteredEmail key={location.key} isLightMode={isLightMode} setisLightMode={setisLightMode} />} />
        <Route path="/registerPage" element={<Register key={location.key} isLightMode={isLightMode} setisLightMode={setisLightMode} />} />
        <Route path="/EnterOTPforPassword" element={<EnterOTPforPassword key={location.key} isLightMode={isLightMode} setisLightMode={setisLightMode} />} />
        <Route path="/ResetPassword" element={<ResetPassword key={location.key} isLightMode={isLightMode} setisLightMode={setisLightMode} />} />
        <Route path="/RoomPage" element={<RoomPage key={location.key} isLightMode={isLightMode} setisLightMode={setisLightMode} />} />
        <Route path="/MyScreen/:roomId" element={<MyScreen key={location.key} isLightMode={isLightMode} setisLightMode={setisLightMode} />} />
        <Route path="/EditorPage/:roomid" element={<EditorPage key={location.key} isLightMode={isLightMode} setisLightMode={setisLightMode} />} />
        <Route path="/StrapLayout" element={<StrapLayout key={location.key} />} />
        <Route path="/GridLayout" element={<GridLayout key={location.key} />} />
        <Route path="/workspace" element={<FolderPage key={location.key} isLightMode={isLightMode} />} />
        <Route path="/CodeReviewer" element={<FullScreen key={location.key} isLightMode={isLightMode} setisLightMode={setisLightMode} />} />
        <Route path="/Instruction" element={<Instruction key={location.key} isLightMode={isLightMode} setisLightMode={setisLightMode} />} />
        <Route path="/verifyEmail" element={<VerifyEmail key={location.key} isLightMode={isLightMode} setisLightMode={setisLightMode} />} />
        <Route path="/LobbyPage" element={<LobbyScreen key={location.key} isLightMode={isLightMode} setisLightMode={setisLightMode} />} />
        <Route path="/Developer" element={<Developer key={location.key} isLightMode={isLightMode} setisLightMode={setisLightMode} />} />
        <Route path="/RecycleBinFolderPage" element={<RecycleBinFolder />} />
      </Routes>
    </>
  );
}

export default App;
