import React from "react";
import Hero from "../components/Hero";
import Video from "../components/Video.jsx";
import Intro from "../components/Intro.jsx";
import Cards from "../components/Cards.jsx";
import Brands from "../components/Brands.jsx";
import Features from "../components/Features.jsx";
import Footer from "../components/Footer.jsx";
import Header from "../components/Header.jsx";
import ChatOrBubble from "../ChatBox/ChatOrBubble.jsx";
import FullScreen from "../CodeReviewer/FullScreen.jsx";
// import Camera from "../CameraSecurity/Camera.jsx";
import ScrollToTop from "../components/ScrollToTop.jsx";
import Contact from "../components/Contact.jsx";
import ChatDesktop from "../ChatBox-Desktop/ChatDesktop.jsx";
import LobbyScreen from "../CameraSecurity/screens/Lobby.jsx";
import Slider from "../components/Slider.jsx";
import Instruction from "../components/Instruction.jsx";

function Home({ isLightMode, setisLightMode }) {
  return (
    <>
      {/* <Instruction/> */}
      {/* <LobbyScreen/>       */}
      {/* <Camera/> */}
      {/* <FullScreen/> */}
      {/* <ChatDesktop isLightMode={isLightMode} setisLightMode={setisLightMode}/> */}
      <ChatOrBubble isLightMode={isLightMode} setisLightMode={setisLightMode}/>
      <ScrollToTop isLightMode={isLightMode} setisLightMode={setisLightMode}/>
      <Header isLightMode={isLightMode} setisLightMode={setisLightMode} />
      <Hero isLightMode={isLightMode} setisLightMode={setisLightMode} />
      <Video isLightMode={isLightMode} setisLightMode={setisLightMode} />
      <Intro isLightMode={isLightMode} setisLightMode={setisLightMode} />
      <Cards isLightMode={isLightMode} setisLightMode={setisLightMode} />
      {/* <Brands isLightMode={isLightMode} setisLightMode={setisLightMode} /> */}
      <Slider isLightMode={isLightMode} setisLightMode={setisLightMode}/>
      <Features isLightMode={isLightMode} setisLightMode={setisLightMode} />
      <Footer isLightMode={isLightMode} setisLightMode={setisLightMode} />
    </>
  );
}

export default Home;
