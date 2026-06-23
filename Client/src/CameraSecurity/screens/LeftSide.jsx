// import React, { useEffect, useCallback, useState } from "react";
// import { CiMicrophoneOff } from "react-icons/ci";
// import { BiSolidCameraOff } from "react-icons/bi";
// import { MdOutlineCallEnd } from "react-icons/md";
// import { FaCamera } from "react-icons/fa";
// import ReactPlayer from "react-player";
// import peer from "../service/peer";
// import { useSocket } from "../context/SocketProvider";
// import { IoSend } from "react-icons/io5";
// import { Toaster, toast } from "react-hot-toast";
// import { CiMicrophoneOn } from "react-icons/ci";
// import "../../App.css";
// import { FaUser } from "react-icons/fa";
// import { useNavigate } from "react-router-dom";
// import { LuShieldCheck } from "react-icons/lu";

// export const LeftSide = ({ room, email, isLightMode }) => {
//   const socket = useSocket();
//   const Navigate = useNavigate();
//   const [mySocket, setmySocket] = useState();
//   const [remoteSocketId, setRemoteSocketId] = useState(null);
//   const [myStream, setMyStream] = useState(null);
//   const [remoteStream, setRemoteStream] = useState(null);
//   const [incomingCall, setIncomingCall] = useState(null);
//   const [messages, setMessages] = useState([]);
//   const [currMsg, setcurrMsg] = useState("");
//   const [showPrompt, setShowPrompt] = useState(false);
//   const [micOn, setMicOn] = useState(true);
//   const [cameraOn, setCameraOn] = useState(true);

//   const toggleMic = () => {
//     if (!myStream) return;
//     myStream.getAudioTracks().forEach((track) => {
//       track.enabled = !track.enabled;
//       setMicOn(track.enabled);
//     });
//   };

//   useEffect(() => {
//     if (socket) {
//       setmySocket(socket.id);
//     }
//   }, [socket]);

//   const toggleCamera = () => {
//     if (!myStream) return;
//     const newCameraState = !cameraOn;
//     myStream.getVideoTracks().forEach((track) => {
//       track.enabled = !track.enabled;
//     });
//     setCameraOn(newCameraState);
//     socket.emit("camera:toggle", { to: remoteSocketId, email, newCameraState });
//   };

//   const cutCall = () => {
//     if (myStream) {
//       myStream.getTracks().forEach((track) => track.stop());
//     }
//     setMyStream(null);
//     setRemoteStream(null);
//     socket.emit("call:ended", { to: remoteSocketId });
//     toast("📴 Call Ended");
//     Navigate("/");
//   };

//   const handleUserJoined = useCallback(({ email, id }) => {
//     // console.log(`Email ${email} joined room`);
//     toast.success(`${email} joined the Meeting..`);
//     setRemoteSocketId(id);
//   }, []);

//   const handleCallUser = useCallback(async () => {
//     const stream = await navigator.mediaDevices.getUserMedia({
//       audio: true,
//       video: true,
//     });
//     const offer = await peer.getOffer();
//     socket.emit("user:call", { to: remoteSocketId, offer });
//     setMyStream(stream);
//   }, [remoteSocketId, socket]);

//   const handleAcceptCall = async () => {
//     if (!incomingCall) return;
//     const { from, offer } = incomingCall;
//     setShowPrompt(false);
//     setRemoteSocketId(from);
//     const stream = await navigator.mediaDevices.getUserMedia({
//       audio: true,
//       video: true,
//     });
//     setMyStream(stream);
//     const ans = await peer.getAnswer(offer);
//     socket.emit("call:accepted", { to: from, ans });
//   };

//   const handleDeclineCall = () => {
//     setShowPrompt(false);
//     setIncomingCall(null);
//   };

//   const renderAcceptDeclinePrompt = () => {
//     if (!showPrompt) return null;

//     return (
//       <div className="fixed top-0 left-0 w-full h-full backdrop-blur-md flex items-center justify-center z-50">
//         <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center gap-4">
//           <p className="text-lg font-semibold text-gray-800">
//             Incoming Call...
//           </p>
//           <div className="flex gap-4">
//             <button
//               onClick={handleAcceptCall}
//               className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded transition duration-200 hover:scale-90 hover:active:scale-80 transform cursor-pointer"
//             >
//               Accept
//             </button>
//             <button
//               onClick={handleDeclineCall}
//               className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition duration-200 hover:scale-90 hover:active:scale-80 transform cursor-pointer"
//             >
//               Decline
//             </button>
//           </div>
//         </div>
//       </div>
//     );
//   };

//   const handleIncommingCall = useCallback(({ from, offer }) => {
//     toast.success("📲 Incoming Call...");
//     setIncomingCall({ from, offer });
//     setShowPrompt(true);
//   }, []);

//   const sendStreams = useCallback(() => {
//     for (const track of myStream.getTracks()) {
//       peer.peer.addTrack(track, myStream);
//     }
//   }, [myStream]);

//   const handleCallAccepted = useCallback(
//     ({ from, ans }) => {
//       peer.setLocalDescription(ans);
//       // console.log("Call Accepted!");
//       sendStreams();
//     },
//     [sendStreams]
//   );

//   const handleNegoNeeded = useCallback(async () => {
//     const offer = await peer.getOffer();
//     socket.emit("peer:nego:needed", { offer, to: remoteSocketId });
//   }, [remoteSocketId, socket]);

//   useEffect(() => {
//     peer.peer.addEventListener("negotiationneeded", handleNegoNeeded);
//     return () => {
//       peer.peer.removeEventListener("negotiationneeded", handleNegoNeeded);
//     };
//   }, [handleNegoNeeded]);

//   const handleNegoNeedIncomming = useCallback(
//     async ({ from, offer }) => {
//       const ans = await peer.getAnswer(offer);
//       socket.emit("peer:nego:done", { to: from, ans });
//     },
//     [socket]
//   );

//   const handleNegoNeedFinal = useCallback(async ({ ans }) => {
//     await peer.setLocalDescription(ans);
//   }, []);

//   useEffect(() => {
//     peer.peer.addEventListener("track", async (ev) => {
//       const remoteStream = ev.streams;
//       // console.log("GOT TRACKS!!");
//       setRemoteStream(remoteStream[0]);
//     });
//   }, []);

//   useEffect(() => {
//     socket.on("call:ended", () => {
//       if (myStream) {
//         myStream.getTracks().forEach((track) => track.stop());
//       }
//       setMyStream(null);
//       setRemoteStream(null);
//       toast("📴 Call Ended");
//       Navigate("/");
//     });

//     return () => {
//       socket.off("call:ended");
//     };
//   }, [socket, myStream]);

//   const giveMutedMessage = ({ from, email, newCameraState }) => {
//     // console.log(email);
//     if (newCameraState) {
//       const msg = email + " turned On the Camera";
//       toast.success(msg);
//     } else {
//       const msg = email + " turned Off the Camera";
//       toast.success(msg);
//     }
//   };

//   const changeMessages = ({ from, currMsg }) => {
//     // console.log("agya bhai mein idhar");
//     setMessages((prevMessages) => [
//       ...prevMessages,
//       {
//         icon: from[0].toUpperCase(),
//         SID: from,
//         message: currMsg,
//       },
//     ]);
//   };

//   useEffect(() => {
//     socket.on("user:joined", handleUserJoined);
//     socket.on("incomming:call", handleIncommingCall);
//     socket.on("call:accepted", handleCallAccepted);
//     socket.on("peer:nego:needed", handleNegoNeedIncomming);
//     socket.on("peer:nego:final", handleNegoNeedFinal);
//     socket.on("camera:toggle", giveMutedMessage);
//     socket.on("messages:sent", changeMessages);

//     return () => {
//       socket.off("user:joined", handleUserJoined);
//       socket.off("incomming:call", handleIncommingCall);
//       socket.off("call:accepted", handleCallAccepted);
//       socket.off("peer:nego:needed", handleNegoNeedIncomming);
//       socket.off("peer:nego:final", handleNegoNeedFinal);
//       socket.off("camera:toggle", giveMutedMessage);
//       socket.off("messages:sent", changeMessages);
//     };
//   }, [
//     socket,
//     handleUserJoined,
//     handleIncommingCall,
//     handleCallAccepted,
//     handleNegoNeedIncomming,
//     handleNegoNeedFinal,
//   ]);

//   const sendMessage = (e) => {
//     if(!currMsg || !currMsg.trim()) return;
//     // console.log("Sending to:", remoteSocketId);
//     setMessages((prevMessages) => [
//       ...prevMessages,
//       {
//         icon: email[0].toUpperCase(),
//         SID: mySocket,
//         message: currMsg,
//       },
//     ]);

//     socket.emit("messages:sent", { to: remoteSocketId, currMsg });
//     setcurrMsg("");
//   };

//   // Wrap the JSX inside a responsive container
//   return (
//     <>
//       <Toaster />
//       {renderAcceptDeclinePrompt()}
//       <div
//         className={`flex flex-col md:flex-row ${isLightMode?"bg-transparent":"bg-gray-950"} h-screen items-center w-full ${
//           isLightMode ? "bg-white" : "bg-black"
//         }`}
//       >
//         {/* Video + Controls Section */}
//         <div className={`flex h-fit flex-col ${isLightMode?"bg-transparent":"bg-gray-950"} items-center justify-center w-full md:w-2/3`}>

//           {/* Video Streams */}
//           <div className="flex flex-col gap-6">
//             <div className="w-full text-center">
//             <div
//               className={`text-2xl lg:text-2xl py-3 md:text-3xl font-bold flex items-center justify-center gap-2 ${
//                 isLightMode ? "text-blue-600" : "text-green-400"
//               }`}
//             >
//               <LuShieldCheck />
//               CodeDoodle Meeting
//             </div>
//           </div>
//             <div className="flex flex-col gap-8 lg:flex-row lg:gap-0 md:flex-col sm:flex-col h-full justify-center items-center w-full">
//             <div className="w-full  aspect-video rounded-xl overflow-hidden">
//               {myStream && (
//                 <ReactPlayer
//                   playing
//                   muted
//                   height="100%"
//                   width="100%"
//                   url={myStream}
//                   className="object-cover"
//                 />
//               )}
//             </div>
//             <div className="w-full aspect-video rounded-xl overflow-hidden">
//               {remoteStream && (
//                 <ReactPlayer
//                   playing
//                   height="100%"
//                   width="100%"
//                   url={remoteStream}
//                   className="object-cover"
//                 />
//               )}
//             </div>
//           </div>

//           {/* Stream Buttons */}
//           <div className="w-full flex flex-wrap justify-center items-center gap-4">
//             {myStream && (
//               <button
//                 onClick={sendStreams}
//                 className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded transition transform hover:scale-90"
//               >
//                 Send Stream
//               </button>
//             )}
//             {remoteSocketId && (
//               <button
//                 onClick={handleCallUser}
//                 className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition transform hover:scale-90"
//               >
//                 Call User
//               </button>
//             )}
//           </div>

//           {/* Call Controls */}
//           <div className="flex w-full justify-center gap-12">
//             <div onClick={toggleMic} className="cursor-pointer text-2xl">
//               {micOn ? (
//                 <CiMicrophoneOn
//                   className={`${isLightMode ? "text-blue-900" : "text-white"}`}
//                 />
//               ) : (
//                 <CiMicrophoneOff
//                   className={`${isLightMode ? "text-blue-900" : "text-white"}`}
//                 />
//               )}
//             </div>
//             <div onClick={toggleCamera} className="cursor-pointer text-2xl">
//               {cameraOn ? (
//                 <FaCamera
//                   className={`${isLightMode ? "text-blue-900" : "text-white"}`}
//                 />
//               ) : (
//                 <BiSolidCameraOff
//                   className={`${isLightMode ? "text-blue-900" : "text-white"}`}
//                 />
//               )}
//             </div>
//             <div onClick={cutCall} className="cursor-pointer text-2xl">
//               <MdOutlineCallEnd
//                 className={`${isLightMode ? "text-blue-900" : "text-white"}`}
//               />
//             </div>
//           </div>

//           {/* Connection Status */}
//           <div className="w-full pb-1 text-lg text-center">
//             {remoteSocketId ? (
//               <span className="text-green-600 font-semibold">Connected</span>
//             ) : (
//               <span className="text-red-600 font-semibold">
//                 No one in the Meeting
//               </span>
//             )}
//           </div>
//           </div>
//         </div>

//         {/* Chat Section */}
//         <div
//           className={`w-full md:w-1/3 flex flex-col h-screen  border-l ${
//             isLightMode ? "bg-slate-100" : "bg-gray-900"
//           }  `}
//         >
//           <div className="h-screen">
//             <div className="h-12 flex items-center justify-center bg-gray-800 text-white font-semibold">
//             Chat Box
//           </div>

//           <div className="flex-grow p-4 h-5/6 overflow-y-auto hide-scrollbar">
//             {messages.map((item, key) => {
//               const isMe = item.SID === mySocket;
//               return (
//                 <div
//                   key={key}
//                   className={`mb-3 flex ${
//                     isMe ? "justify-end" : "justify-start"
//                   }`}
//                 >
//                   <div className="flex items-start gap-2 max-w-[80%]">
//                     <div
//                       className={`h-9 w-9 rounded-full flex items-center justify-center font-bold text-white ${
//                         isMe ? "bg-blue-600" : "bg-gray-600"
//                       }`}
//                     >
//                       <FaUser />
//                     </div>
//                     <div
//                       className={`px-4 py-2 rounded-2xl text-sm shadow ${
//                         isMe
//                           ? "bg-blue-500 text-white"
//                           : "bg-gray-200 text-gray-800"
//                       }`}
//                     >
//                       {item.message}
//                     </div>
//                   </div>
//                 </div>
//               );
//             })}
//           </div>

//           {/* Input Field */}
//           <div
//             className={`flex items-center gap-2 p-3 ${
//               isLightMode ? "bg-white" : "bg-gray-950"
//             }`}
//           >
//             <input
//               type="text"
//               value={currMsg}
//               onChange={(e) => setcurrMsg(e.target.value)}
//               className={`flex-grow px-3 py-2 rounded-md border text-sm focus:outline-none ${
//                 isLightMode
//                   ? "border-gray-300 focus:ring-blue-400 text-blue-600"
//                   : "border-gray-700 focus:ring-green-400 text-black"
//               }`}
//               placeholder="Start chatting..."
//             />
//             <button
//               onClick={sendMessage}
//               className={`p-2 rounded-md transition hover:scale-90 ${
//                 isLightMode
//                   ? "bg-blue-500 hover:bg-blue-600"
//                   : "bg-green-500 hover:bg-green-600"
//               } text-white`}
//             >
//               <IoSend className="text-xl" />
//             </button>
//           </div>
//           </div>
//         </div>
//       </div>
//     </>
//   );
// };
// import React, { useEffect, useCallback, useState } from "react";
// import { CiMicrophoneOff } from "react-icons/ci";
// import { BiSolidCameraOff } from "react-icons/bi";
// import { MdOutlineCallEnd } from "react-icons/md";
// import { FaCamera } from "react-icons/fa";
// import ReactPlayer from "react-player";
// import peer from "../service/peer";
// import { useSocket } from "../context/SocketProvider";
// import { IoSend } from "react-icons/io5";
// import { Toaster, toast } from "react-hot-toast";
// import { CiMicrophoneOn } from "react-icons/ci";
// import "../../App.css";
// import { FaUser } from "react-icons/fa";
// import { useNavigate } from "react-router-dom";
// import { LuShieldCheck } from "react-icons/lu";

// export const LeftSide = ({ room, email, isLightMode }) => {
//   const socket = useSocket();
//   const Navigate = useNavigate();
//   const [mySocket, setmySocket] = useState();
//   const [remoteSocketId, setRemoteSocketId] = useState(null);
//   const [myStream, setMyStream] = useState(null);
//   const [remoteStream, setRemoteStream] = useState(null);
//   const [incomingCall, setIncomingCall] = useState(null);
//   const [messages, setMessages] = useState([]);
//   const [currMsg, setcurrMsg] = useState("");
//   const [showPrompt, setShowPrompt] = useState(false);
//   const [micOn, setMicOn] = useState(true);
//   const [cameraOn, setCameraOn] = useState(true);

//   const toggleMic = () => {
//     if (!myStream) return;
//     if(micOn) {
//       const micMsg = `${email} turned off the mic`;
//       socket.emit("micMsg",({remoteSocketId,micMsg}));
//     }
//     else {
//       const micMsg = `${email} turned on the mic`;
//       socket.emit("micMsg",({remoteSocketId,micMsg}));
//     }
//     myStream.getAudioTracks().forEach((track) => {
//       track.enabled = !track.enabled;
//       setMicOn(track.enabled);
//     });
//   };

//   useEffect(() => {
//     if (socket) {
//       setmySocket(socket.id);
//     }
//   }, [socket]);

//   const toggleCamera = () => {
//     if (!myStream) return;
//     const newCameraState = !cameraOn;
//     myStream.getVideoTracks().forEach((track) => {
//       track.enabled = !track.enabled;
//     });
//     setCameraOn(newCameraState);
//     socket.emit("camera:toggle", { to: remoteSocketId, email, newCameraState });
//   };

//   const cutCall = () => {
//     if (myStream) {
//       myStream.getTracks().forEach((track) => track.stop());
//     }
//     setMyStream(null);
//     setRemoteStream(null);
//     socket.emit("call:ended", { to: remoteSocketId });
//     toast("📴 Call Ended");
//     Navigate("/");
//   };

//   const handleUserJoined = useCallback(({ email, id }) => {
//     // console.log(`Email ${email} joined room`);
//     toast.success(`${email} joined the Meeting..`);
//     setRemoteSocketId(id);
//   }, []);

//   const handleCallUser = useCallback(async () => {
//     toast.success("Call sent. Waiting for response...");
//     const stream = await navigator.mediaDevices.getUserMedia({
//       audio: true,
//       video: true,
//     });
//     const offer = await peer.getOffer();
//     socket.emit("user:call", { to: remoteSocketId, offer });
//     setMyStream(stream);
//   }, [remoteSocketId, socket]);

//   const handleAcceptCall = async () => {
//     if (!incomingCall) return;
//     const { from, offer } = incomingCall;
//     setShowPrompt(false);
//     setRemoteSocketId(from);
//     const stream = await navigator.mediaDevices.getUserMedia({
//       audio: true,
//       video: true,
//     });
//     setMyStream(stream);
//     const ans = await peer.getAnswer(offer);
//     socket.emit("call:accepted", { to: from, ans });
//     toast.success("Send the Stream");
//   };

//   const handleDeclineCall = () => {
//     setShowPrompt(false);
//     setIncomingCall(null);
//   };

//   const renderAcceptDeclinePrompt = () => {
//     if (!showPrompt) return null;

//     return (
//       <div className="fixed top-0 left-0 w-full h-full backdrop-blur-md flex items-center justify-center z-50">
//         <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center gap-4">
//           <p className="text-lg font-semibold text-gray-800">
//             Incoming Call...
//           </p>
//           <div className="flex gap-4">
//             <button
//               onClick={handleAcceptCall}
//               className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded transition duration-200 hover:scale-90 hover:active:scale-80 transform cursor-pointer"
//             >
//               Accept
//             </button>
//             <button
//               onClick={handleDeclineCall}
//               className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition duration-200 hover:scale-90 hover:active:scale-80 transform cursor-pointer"
//             >
//               Decline
//             </button>
//           </div>
//         </div>
//       </div>
//     );
//   };

//   const handleIncommingCall = useCallback(({ from, offer }) => {
//     toast.success("📲 Incoming Call...");
//     setIncomingCall({ from, offer });
//     setShowPrompt(true);
//   }, []);

//   const sendStreams = useCallback(() => {

//     toast.success("Stream sent..");

//     for (const track of myStream.getTracks()) {
//       peer.peer.addTrack(track, myStream);
//     }
//   }, [myStream]);

//   const handleCallAccepted = useCallback(
//     ({ from, ans }) => {
//       peer.setLocalDescription(ans);
//       // console.log("Call Accepted!");
//       sendStreams();
//     },
//     [sendStreams]
//   );

//   const handleNegoNeeded = useCallback(async () => {
//     const offer = await peer.getOffer();
//     socket.emit("peer:nego:needed", { offer, to: remoteSocketId });
//   }, [remoteSocketId, socket]);

//   useEffect(() => {
//     peer.peer.addEventListener("negotiationneeded", handleNegoNeeded);
//     return () => {
//       peer.peer.removeEventListener("negotiationneeded", handleNegoNeeded);
//     };
//   }, [handleNegoNeeded]);

//   const handleNegoNeedIncomming = useCallback(
//     async ({ from, offer }) => {
//       const ans = await peer.getAnswer(offer);
//       socket.emit("peer:nego:done", { to: from, ans });
//     },
//     [socket]
//   );

//   const handleNegoNeedFinal = useCallback(async ({ ans }) => {
//     await peer.setLocalDescription(ans);
//   }, []);

//   useEffect(() => {
//     peer.peer.addEventListener("track", async (ev) => {
//       const remoteStream = ev.streams;
//       // console.log("GOT TRACKS!!");
//       setRemoteStream(remoteStream[0]);
//     });
//   }, []);

//   useEffect(() => {
//     socket.on("call:ended", () => {
//       if (myStream) {
//         myStream.getTracks().forEach((track) => track.stop());
//       }
//       setMyStream(null);
//       setRemoteStream(null);
//       toast("📴 Call Ended");
//       Navigate("/");
//     });

//     return () => {
//       socket.off("call:ended");
//     };
//   }, [socket, myStream]);

//   const giveMutedMessage = ({ from, email, newCameraState }) => {
//     // console.log(email);
//     if (newCameraState) {
//       const msg = email + " turned On the Camera";
//       toast.success(msg);
//     } else {
//       const msg = email + " turned Off the Camera";
//       toast.success(msg);
//     }
//   };

//   const changeMessages = ({ from, currMsg }) => {
//     // console.log("agya bhai mein idhar");
//     setMessages((prevMessages) => [
//       ...prevMessages,
//       {
//         icon: from[0].toUpperCase(),
//         SID: from,
//         message: currMsg,
//       },
//     ]);
//   };

//   function notifyMic({from,micMsg}){
//     toast.success(micMsg);
//   }

//   useEffect(() => {
//     socket.on("user:joined", handleUserJoined);
//     socket.on("incomming:call", handleIncommingCall);
//     socket.on("call:accepted", handleCallAccepted);
//     socket.on("peer:nego:needed", handleNegoNeedIncomming);
//     socket.on("peer:nego:final", handleNegoNeedFinal);
//     socket.on("camera:toggle", giveMutedMessage);
//     socket.on("messages:sent", changeMessages);
//     socket.on("micMsg",notifyMic);

//     return () => {
//       socket.off("user:joined", handleUserJoined);
//       socket.off("incomming:call", handleIncommingCall);
//       socket.off("call:accepted", handleCallAccepted);
//       socket.off("peer:nego:needed", handleNegoNeedIncomming);
//       socket.off("peer:nego:final", handleNegoNeedFinal);
//       socket.off("camera:toggle", giveMutedMessage);
//       socket.off("messages:sent", changeMessages);
//       socket.off("micMsg",notifyMic);
//     };
//   }, [
//     socket,
//     handleUserJoined,
//     handleIncommingCall,
//     handleCallAccepted,
//     handleNegoNeedIncomming,
//     handleNegoNeedFinal,
//   ]);

//   const sendMessage = (e) => {
//     if(!currMsg || !currMsg.trim()) return;
//     setMessages((prevMessages) => [
//       ...prevMessages,
//       {
//         icon: email[0].toUpperCase(),
//         SID: mySocket,
//         message: currMsg,
//       },
//     ]);

//     socket.emit("messages:sent", { to: remoteSocketId, currMsg });
//     setcurrMsg("");
//   };

//   // Wrap the JSX inside a responsive container
//   return (
//     <>
//       <Toaster />
//       {renderAcceptDeclinePrompt()}
//       <div
//         className={`flex flex-col md:flex-row  h-full items-center w-full bg-gradient-to-br from-sky-700 via-blue-800 to-gray-900`}
//       >
//         {/* Video + Controls Section */}
//         <div className={`flex h-[100vh] flex-col bg-gradient-to-br from-sky-700 via-blue-800 to-gray-900  items-center  w-full md:w-2/3`}>

//           {/* Video Streams */}
//           <div className="gap-6 p-3 flex flex-col justify-between h-full">
//             <div className="w-full text-center">
//             <div
//               className={`text-2xl lg:text-2xl py-3 md:text-3xl font-bold flex items-center justify-center gap-2 text-white`}
//             >
//               <LuShieldCheck />
//               IntelliConnect
//             </div>
//           </div>
//             <div className="flex flex-col gap-8 lg:flex-row lg:gap-0 md:flex-col sm:flex-col h-full justify-center items-center w-full">
//             <div className="w-full  aspect-video rounded-xl overflow-hidden">
//               {myStream && (
//                 <ReactPlayer
//                   playing
//                   muted
//                   height="100%"
//                   width="100%"
//                   url={myStream}
//                   className="object-cover"
//                 />
//               )}
//             </div>
//             <div className="w-full aspect-video rounded-xl overflow-hidden">
//               {remoteStream && (
//                 <ReactPlayer
//                   playing
//                   height="100%"
//                   width="100%"
//                   url={remoteStream}
//                   className="object-cover"
//                 />
//               )}
//             </div>
//           </div>

//           {/* Stream Buttons */}
//           <div className="w-full flex flex-wrap justify-center items-center gap-4">
//             {myStream && (
//               <button
//                 onClick={sendStreams}
//                 className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded transition transform hover:scale-90"
//               >
//                 Send Stream
//               </button>
//             )}
//             {remoteSocketId && (
//               <button
//                 onClick={handleCallUser}
//                 className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition transform hover:scale-90"
//               >
//                 Call User
//               </button>
//             )}
//           </div>

//           {/* Call Controls */}
//           <div className="flex w-full justify-center gap-12">
//             <div onClick={toggleMic} className="cursor-pointer text-2xl">
//               {micOn ? (
//                 <CiMicrophoneOn
//                   className={`${isLightMode ? "text-blue-900" : "text-white"}`}
//                 />
//               ) : (
//                 <CiMicrophoneOff
//                   className={`${isLightMode ? "text-blue-900" : "text-white"}`}
//                 />
//               )}
//             </div>
//             <div onClick={toggleCamera} className="cursor-pointer text-2xl">
//               {cameraOn ? (
//                 <FaCamera
//                   className={`${isLightMode ? "text-blue-900" : "text-white"}`}
//                 />
//               ) : (
//                 <BiSolidCameraOff
//                   className={`${isLightMode ? "text-blue-900" : "text-white"}`}
//                 />
//               )}
//             </div>
//             <div onClick={cutCall} className="cursor-pointer text-2xl">
//               <MdOutlineCallEnd
//                 className={`${isLightMode ? "text-blue-900" : "text-white"}`}
//               />
//             </div>
//           </div>

//           {/* Connection Status */}
//           <div className="w-full pb-1 text-lg text-center">
//             {remoteSocketId ? (
//               <span className="text-green-600 font-semibold">Connected</span>
//             ) : (
//               <span className="text-red-600 font-semibold">
//                 No one in the Meeting
//               </span>
//             )}
//           </div>
//           </div>
//         </div>

//         {/* Chat Section */}
//         <div
//           className={`w-full md:w-1/3 flex flex-col h-full  border-l `}
//         >
//           <div className="h-[100vh] flex flex-col justify-between">
//             <div className="h-12 flex items-center justify-center bg-gradient-to-br from-sky-700 via-blue-800 to-gray-900 text-white font-semibold">
//             Chat Box
//           </div>

//           <div className="flex-grow p-4 h-5/6 bg-gradient-to-br from-sky-700 via-blue-800 to-gray-900 overflow-y-auto hide-scrollbar">
//             {messages.map((item, key) => {
//               const isMe = item.SID === mySocket;
//               return (
//                 <div
//                   key={key}
//                   className={`mb-3 flex ${
//                     isMe ? "justify-end" : "justify-start"
//                   }`}
//                 >
//                   <div className="flex items-start gap-2 max-w-[80%]">
//                     <div
//                       className={`h-9 w-9 rounded-full flex items-center justify-center font-bold text-white ${
//                         isMe ? "bg-blue-600" : "bg-gray-600"
//                       }`}
//                     >
//                       <FaUser />
//                     </div>
//                     <div
//                       className={`px-4 py-2 rounded-2xl text-sm shadow ${
//                         isMe
//                           ? "bg-blue-500 text-white"
//                           : "bg-gray-200 text-gray-800"
//                       }`}
//                     >
//                       {item.message}
//                     </div>
//                   </div>
//                 </div>
//               );
//             })}
//           </div>

//           {/* Input Field */}
//           <div
//             className={`flex items-center gap-2 p-3 bg-transparent`}
//           >
//             <input
//               type="text"
//               value={currMsg}
//               onChange={(e) => setcurrMsg(e.target.value)}
//               className={`flex-grow px-3 py-2 rounded-md border text-sm focus:outline-none border-yellow-700 focus:ring-yellow-400 text-white`}
//               placeholder="Start chatting..."
//             />
//             <button
//               onClick={sendMessage}
//               className={`p-2 rounded-md cursor-pointer transition hover:scale-90 bg-yellow-600 hover:bg-yellow-400 text-white`}
//             >
//               <IoSend className="text-xl" />
//             </button>
//           </div>
//           </div>
//         </div>
//       </div>
//     </>
//   );
// };
import { useEffect, useCallback, useState } from "react";
import { CiMicrophoneOff, CiMicrophoneOn } from "react-icons/ci";
import { BiSolidCameraOff } from "react-icons/bi";
import { MdOutlineCallEnd, MdOutlineEmojiEmotions, MdArrowBack } from "react-icons/md";
import { FaCamera } from "react-icons/fa";
import { IoSend } from "react-icons/io5";
import { LuShieldCheck } from "react-icons/lu";
import { FaRegComment, FaCommentSlash } from "react-icons/fa6";
import { PiRectangle } from "react-icons/pi";
import ReactPlayer from "react-player";
import { AnimatePresence, motion } from "framer-motion";
import { Toaster, toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
//added
import {useRef} from "react";

import peer from "../service/peer";
import { useSocket } from "../context/SocketProvider";
import "../../App.css";

// Chat Message UI Component (No changes here)
const ChatMessage = ({ message, isMe, author }) => (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex items-start gap-2.5 ${isMe ? "justify-end" : "justify-start"}`}
    >
      <div className={`flex flex-col gap-1 w-full max-w-xs ${isMe ? "items-end" : "items-start"}`}>
        <span className="text-xs text-gray-400 px-2">{author}</span>
        <div className={`p-3 rounded-xl ${isMe ? "bg-blue-600 rounded-br-none" : "bg-slate-700 rounded-bl-none"}`}>
          <p className="text-sm font-normal text-white break-words">{message}</p>
        </div>
      </div>
    </motion.div>
  );

export const LeftSide = ({ room, email }) => {
    // USER'S ORIGINAL LOGIC
    const socket = useSocket();
    const Navigate = useNavigate();
  
    const [Enemy, setEnemy] = useState("");
    const [mySocket, setMySocket] = useState();
    const [remoteSocketId, setRemoteSocketId] = useState(null);
    const [myStream, setMyStream] = useState(null);
    const [remoteStream, setRemoteStream] = useState(null);
    const [incomingCall, setIncomingCall] = useState(null);
    const [messages, setMessages] = useState([]);
    const [currMsg, setcurrMsg] = useState("");
    const [showPrompt, setShowPrompt] = useState(false);
    const [micOn, setMicOn] = useState(true);
    const [cameraOn, setCameraOn] = useState(true);
    const [CommentOn, setCommentOn] = useState(false);
    const [isEmojiOpen, setisEmojiOpen] = useState(false);

    //added
    const audioRef = useRef(null);
    
    // ===> 2. DONO PLAYERS KE LIYE ALAG-ALAG PIP STATE BANAYE GAYE HAIN
    const [remotePipEnabled, setRemotePipEnabled] = useState(false);
    const [myPipEnabled, setMyPipEnabled] = useState(false);

    const handleToggleRemotePip = () => {
        setRemotePipEnabled(prev => !prev);
    };

    const handleToggleMyPip = () => {
        setMyPipEnabled(prev => !prev);
    };

    const AllEmojis = ["😀","😂","👍","👎","😢","❤️","🎉","🔥","💯","👏"];
    const chunkedEmojis = [];
    for (let i = 0; i < AllEmojis.length; i += 5) {
      chunkedEmojis.push(AllEmojis.slice(i, i + 5));
    }
  
    const toggleComments = () => {
      setCommentOn((prev) => !prev);
    };
  
    const toggleMic = () => {
      if (!myStream) return;
      if (micOn) {
        const micMsg = `${email} turned off the mic`;
        socket.emit("micMsg", { remoteSocketId, micMsg });
      } else {
        const micMsg = `${email} turned on the mic`;
        socket.emit("micMsg", { remoteSocketId, micMsg });
      }
      myStream.getAudioTracks().forEach((track) => {
        track.enabled = !track.enabled;
        setMicOn(track.enabled);
      });
    };
  
    useEffect(() => {
      if (socket) {
        setMySocket(socket.id);
      }
    }, [socket]);
  
    const toggleCamera = () => {
      if (!myStream) return;
      const newCameraState = !cameraOn;
      myStream.getVideoTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      setCameraOn(newCameraState);
      socket.emit("camera:toggle", { to: remoteSocketId, email, newCameraState });
    };
  
    const cutCall = () => {

        // if(audioRef.current){
        //     audioRef.current.pause();
        //     audioRef.current.currentTime=0;
        // }


        //added after 3 days

        if(audioRef.current){
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }
        
      if (myStream) {
        myStream.getTracks().forEach((track) => track.stop());
      }
      setMyStream(null);
      setRemoteStream(null);
      socket.emit("call:ended", { to: remoteSocketId });
      toast("📴 Call Ended");
      Navigate("/");
    };
  
    const handleUserJoined = useCallback(({ email, id }) => {
      toast.success(`${email} joined the Meeting..`);
      setRemoteSocketId(id);
      setEnemy(email); // <--- FIX #1: BAS YEH LINE ADD KI HAI
    }, []);
  
    const handleCallUser = useCallback(async () => {
      toast.success("Call sent. Waiting for response...");
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      const offer = await peer.getOffer();
      socket.emit("user:call", { to: remoteSocketId, offer });
      socket.emit("send:opponent_from_calling", { opponentName: email });
      setMyStream(stream);
    }, [remoteSocketId, socket, email]);
  
    const handleAcceptCall = async () => {
      if (!incomingCall) return;
      const { from, offer } = incomingCall;
      setShowPrompt(false);
      setRemoteSocketId(from);
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      setMyStream(stream);
      const ans = await peer.getAnswer(offer);
      socket.emit("call:accepted", { to: from, ans });
      toast.success("Send the Stream");

        //added

        if(audioRef.current){
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }
        
    };
  
    const handleDeclineCall = () => {
      setShowPrompt(false);
      setIncomingCall(null);

        //added

        if(audioRef.current){
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }
        
    };
  
    const renderAcceptDeclinePrompt = () => {
      if (!showPrompt) return null;


        //added
        if(!audioRef.current){
            audioRef.current = new Audio("/PhoneRingtone.mp3");
            audioRef.current.loop = true;
        }

        audioRef.current.play();  //added playing button
        
      return (
          <AnimatePresence>
              <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
              >
                  <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      className="bg-slate-800 border border-slate-700 rounded-2xl p-6 w-full max-w-sm text-center shadow-lg"
                  >
                      <h3 className="text-xl font-bold text-white">Incoming Call</h3>
                      <p className="text-slate-300 mt-2">Would you like to accept the call?</p>
                      <div className="flex gap-4 justify-center mt-6">
                          <button onClick={handleAcceptCall} className="px-6 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition active:scale-95">Accept</button>
                          <button onClick={handleDeclineCall} className="px-6 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition active:scale-95">Decline</button>
                      </div>
                  </motion.div>
              </motion.div>
          </AnimatePresence>
      );
    };

  
    const handleIncommingCall = useCallback(({ from, offer }) => {
      toast.success("📲 Incoming Call...");
      setIncomingCall({ from, offer });
      setShowPrompt(true);
    }, []);
  
    const sendStreams = useCallback(() => {
      toast.success("Stream sent..");
      for (const track of myStream.getTracks()) {
        peer.peer.addTrack(track, myStream);
      }
    }, [myStream]);
  
    const handleCallAccepted = useCallback(({ from, ans }) => {
      peer.setLocalDescription(ans);
    }, []);
  
    const handleNegoNeeded = useCallback(async () => {
      const offer = await peer.getOffer();
      socket.emit("peer:nego:needed", { offer, to: remoteSocketId });
    }, [remoteSocketId, socket]);
  
    useEffect(() => {
      peer.peer.addEventListener("negotiationneeded", handleNegoNeeded);
      return () => {
        peer.peer.removeEventListener("negotiationneeded", handleNegoNeeded);
      };
    }, [handleNegoNeeded]);
  
    const handleNegoNeedIncomming = useCallback(async ({ from, offer }) => {
      const ans = await peer.getAnswer(offer);
      socket.emit("peer:nego:done", { to: from, ans });
    },[socket]);
  
    const handleNegoNeedFinal = useCallback(async ({ ans }) => {
      await peer.setLocalDescription(ans);
    }, []);
  
    useEffect(() => {
      peer.peer.addEventListener("track", async (ev) => {
        const remoteStream = ev.streams;
        setRemoteStream(remoteStream[0]);
      });
    }, []);
  
    useEffect(() => {
      socket.on("call:ended", () => {
        if (myStream) {
          myStream.getTracks().forEach((track) => track.stop());
        }
        setMyStream(null);
        setRemoteStream(null);
        toast("📴 Call Ended");
        Navigate("/");
      });
      return () => {
        socket.off("call:ended");
      };
    }, [socket, myStream, Navigate]);
  
    const giveMutedMessage = useCallback(({ from, email, newCameraState }) => {
      const msg = email + (newCameraState ? " turned On the Camera" : " turned Off the Camera");
      toast.success(msg);
    }, []);
  
    const changeMessages = useCallback(({ from, currMsg }) => {
      setMessages((prevMessages) => [
        ...prevMessages,
        { icon: from[0].toUpperCase(), SID: from, message: currMsg, author: Enemy },
      ]);
    }, [Enemy]);
  
    const notifyMic = useCallback(({ from, micMsg }) => {
      toast.success(micMsg);
    }, []);
  
    const getOpponentName = useCallback(({ from, opponentName }) => {
      setEnemy(opponentName);
    }, []);
  
    const getAllUserList = useCallback((allUsers) => {
      for(let ele of allUsers){
        if(ele.socketid !== mySocket){
          setEnemy(ele.email); // <--- FIX #2: 'username' KO 'email' KAR DIYA HAI
        }
      }
    }, [mySocket]);
  
    useEffect(() => {
      socket.on("user:joined", handleUserJoined);
      socket.on("incomming:call", handleIncommingCall);
      socket.on("call:accepted", handleCallAccepted);
      socket.on("peer:nego:needed", handleNegoNeedIncomming);
      socket.on("peer:nego:final", handleNegoNeedFinal);
      socket.on("camera:toggle", giveMutedMessage);
      socket.on("messages:sent", changeMessages);
      socket.on("micMsg", notifyMic);
      socket.on("get:opponent_from_calling", getOpponentName);
      socket.on("all:users",getAllUserList);
      return () => {
        socket.off("user:joined", handleUserJoined);
        socket.off("incomming:call", handleIncommingCall);
        socket.off("call:accepted", handleCallAccepted);
        socket.off("peer:nego:needed", handleNegoNeedIncomming);
        socket.off("peer:nego:final", handleNegoNeedFinal);
        socket.off("camera:toggle", giveMutedMessage);
        socket.off("messages:sent", changeMessages);
        socket.off("micMsg", notifyMic);
        socket.off("get:opponent_from_calling", getOpponentName);
        socket.off("all:users",getAllUserList);
      };
    }, [socket, handleUserJoined, handleIncommingCall, handleCallAccepted, handleNegoNeedIncomming, handleNegoNeedFinal, giveMutedMessage, changeMessages, notifyMic, getOpponentName, getAllUserList]);
  
    const sendMessage = () => {
      if (!currMsg || !currMsg.trim()) return;
      setMessages((prev) => [
        ...prev,
        { icon: email[0].toUpperCase(), SID: mySocket, message: currMsg, author: email },
      ]);
      socket.emit("messages:sent", { to: remoteSocketId, currMsg });
      setcurrMsg("");
    };
  
    const addInText = (e) => {
      setcurrMsg(currMsg + e.target.innerText);
      setisEmojiOpen(false);
    };
    // END OF USER'S LOGIC
  
    const isConnected = !!remoteSocketId;
  
    return (
      <>
        <Toaster position="top-center" reverseOrder={false} />
        {renderAcceptDeclinePrompt()}
  
        <div className="h-screen w-screen bg-gray-900 text-white flex flex-col md:flex-row overflow-hidden">
          {/* Main Video Area */}
          <div className="flex-1 flex flex-col relative w-full h-full md:h-screen">
            <header className="absolute top-4 left-0 w-full px-4 z-10 flex justify-between items-center">
                <div className="flex items-center gap-2 text-white bg-black/30 backdrop-blur-sm px-3 py-1.5 rounded-lg">
                  <LuShieldCheck className="text-emerald-400" />
                  <span className="font-semibold">CodeDoodle</span>
                </div>
                {!isConnected?(<div className="flex items-center gap-2 bg-black/30 backdrop-blur-sm px-3 py-1.5 rounded-lg">
                  <span className={`h-2.5 w-2.5 rounded-full ${isConnected ? "bg-green-500 animate-pulse" : "bg-red-500"}`}></span>
                  <span>{"Waiting..."}</span>
                </div>):(null)}
            </header>
            
            <div className="flex-1 w-full h-full bg-black flex items-center justify-center relative">
              {remoteStream ? (
                <>
                  <ReactPlayer 
                    playing 
                    muted={false} 
                    height="100%" 
                    width="100%" 
                    url={remoteStream} 
                    controls={false}
                    pip={remotePipEnabled}
                    onDisablePip={() => setRemotePipEnabled(false)}
                  />
                  <div className="absolute left-4 bottom-4 text-sm bg-black/50 px-3 py-1 rounded-lg z-10">
                      {Enemy || "Remote User"}
                  </div>
                  <button
                    onClick={handleToggleRemotePip}
                    className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full hover:bg-black/75 transition-colors z-10"
                    title="Toggle Picture-in-Picture"
                  >
                    <PiRectangle size={20} />
                  </button>
                </>
              ) : (
                 <div className="text-center text-slate-400">
                   <h2 className="text-2xl font-bold">
                     {isConnected ? `Ready to connect` : "Waiting for another user to join..."}
                   </h2>
                 </div>
              )}
            </div>
  
            {myStream && (
               <motion.div 
                 drag 
                 initial={{ y: 100, opacity: 0}} 
                 animate={{ y: 0, opacity: 1}} 
                 className="absolute bottom-24 right-6 w-40 md:w-64 h-auto rounded-xl overflow-hidden shadow-2xl border-2 border-white/20 cursor-grab active:cursor-grabbing z-20"
               >
                 {cameraOn ? 
                    <>
                      <ReactPlayer 
                        playing 
                        muted 
                        height="100%" 
                        width="100%" 
                        url={myStream} 
                        controls={false}
                        pip={myPipEnabled}
                        onDisablePip={() => setMyPipEnabled(false)}
                      />
                      <button
                        onClick={handleToggleMyPip}
                        className="absolute top-2 right-2 bg-black/50 text-white p-1.5 rounded-full hover:bg-black/75 transition-colors z-10"
                        title="Toggle Picture-in-Picture"
                      >
                        <PiRectangle size={16} />
                      </button>
                    </>
                    :
                    <div className="w-full h-full bg-slate-800 aspect-video flex flex-col items-center justify-center">
                      <BiSolidCameraOff size={24} className="text-white mb-1" />
                      <p className="text-xs">Camera off</p>
                    </div>
                 }
                 <div className="absolute left-2 bottom-2 text-xs bg-black/50 px-2 py-0.5 rounded-md z-10">
                     You ({email})
                 </div>
               </motion.div>
            )}
  
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 z-30">
                 <AnimatePresence>
                   {isConnected && (
                     <motion.div 
                       initial={{ y: 20, opacity: 0 }}
                       animate={{ y: 0, opacity: 1 }}
                       exit={{ y: 20, opacity: 0 }}
                       className="flex items-center gap-3"
                     >
                       {myStream && <button onClick={sendStreams} className="px-4 py-2 text-sm bg-slate-600 hover:bg-slate-700 rounded-full transition">Send Stream</button>}
                       {!myStream && <button onClick={handleCallUser} className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 rounded-full transition">Call User</button>}
                     </motion.div>
                   )}
                 </AnimatePresence>
  
                 <motion.div initial={{ y: 100, opacity: 0}} animate={{ y: 0, opacity: 1}} transition={{ delay: 0.2 }} className="flex items-center gap-4 bg-black/40 backdrop-blur-md p-3 rounded-full border border-white/10">
                     <button onClick={toggleMic} title={micOn ? "Mute" : "Unmute"} className={`w-12 h-12 flex items-center justify-center rounded-full transition-all ${micOn ? 'bg-blue-600 hover:bg-blue-700' : 'bg-red-600 hover:bg-red-700'}`}>
                       {micOn ? <CiMicrophoneOn size={24} /> : <CiMicrophoneOff size={24} />}
                     </button>
                     <button onClick={toggleCamera} title={cameraOn ? "Turn off camera" : "Turn on camera"} className={`w-12 h-12 flex items-center justify-center rounded-full transition-all ${cameraOn ? 'bg-blue-600 hover:bg-blue-700' : 'bg-red-600 hover:bg-red-700'}`}>
                       {cameraOn ? <FaCamera size={20} /> : <BiSolidCameraOff size={24} />}
                     </button>
                     <button onClick={toggleComments} title={CommentOn ? "Close Chat" : "Open Chat"} className={`w-12 h-12 flex items-center justify-center rounded-full transition-all ${CommentOn ? 'bg-blue-600' : 'bg-slate-600 hover:bg-slate-700'}`}>
                       {CommentOn ? <FaCommentSlash size={20} /> : <FaRegComment size={20} />}
                     </button>
                     <button onClick={cutCall} title="End Call" className="w-16 h-12 flex items-center justify-center rounded-full bg-red-600 hover:bg-red-700 transition-all">
                       <MdOutlineCallEnd size={28} />
                     </button>
                 </motion.div>
            </div>
          </div>
  
          <AnimatePresence>
            {CommentOn && (
              <motion.div 
                key="chat-panel" 
                initial={{ y: "100%", x:0 }}
                animate={{ y: 0, x: 0 }}
                exit={{ y: "100%", x:0 }}
                transition={{ type: "spring", stiffness: 400, damping: 40 }} 
                className="fixed inset-0 md:relative md:inset-auto md:w-80 h-full bg-slate-800 border-l border-slate-700 flex flex-col z-40 md:!transform-none"
              >
                <div className="p-4 border-b border-slate-700 flex-shrink-0 flex items-center gap-4">
                    <button onClick={toggleComments} className="md:hidden p-1 rounded-full text-white hover:bg-slate-700">
                      <MdArrowBack size={24}/>
                    </button>
                    <h3 className="font-bold text-lg">Chat</h3>
                </div>
  
                <div className="flex-1 p-4 overflow-y-auto space-y-4 hide-scrollbar">
                  {messages.map((msg, index) => (
                    <ChatMessage key={index} message={msg.message} author={msg.SID === mySocket ? email : Enemy} isMe={msg.SID === mySocket} />
                  ))}
                </div>
                <div className="p-2 border-t border-slate-700 flex items-center gap-2 flex-shrink-0 relative">
                     <div className="relative">
                       <button onClick={() => setisEmojiOpen(prev => !prev)} className="p-2 text-slate-300 hover:text-white">
                          <MdOutlineEmojiEmotions size={24} />
                       </button>
                       <AnimatePresence>
                           {isEmojiOpen && (
                             <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 10, opacity: 0 }} className="absolute bottom-12 left-0 bg-slate-700 p-2 rounded-lg border border-slate-600 shadow-lg z-50">
                                 <div className="flex flex-col gap-2">
                                   {chunkedEmojis.map((row, rowIndex) => (
                                      <div key={rowIndex} className="flex gap-2">
                                        {row.map((emoji, emojiIndex) => (
                                           <span key={emojiIndex} onClick={addInText} className="p-1 cursor-pointer hover:scale-125 transition-transform text-xl">{emoji}</span>
                                        ))}
                                      </div>
                                   ))}
                                 </div>
                             </motion.div>
                           )}
                       </AnimatePresence>
                     </div>
                   <input type="text" value={currMsg} onChange={(e) => setcurrMsg(e.target.value)} onKeyPress={(e) => e.key === "Enter" && sendMessage()} placeholder="Type a message..." className="w-full bg-slate-700 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                   <button onClick={sendMessage} className="p-3 bg-blue-600 rounded-lg hover:bg-blue-700 transition disabled:opacity-50" disabled={!currMsg.trim()}>
                     <IoSend />
                   </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </>
    );
};
  
export default LeftSide;
