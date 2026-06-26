const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const myRouter = require("./Routings/authRoutes");
const app = express();
const connectDB = require("./Config/mongodb");
const myRouter2 = require("./Routings/CodeReviewerRoute");
const router3 = require("./Routings/userDataRoutes");
const cookieParser = require("cookie-parser");
const router4 = require("./Routings/fileRoutes");
const router5 = require("./Routings/ChatsRoute");
const router6 = require("./Routings/ThemeRoutes");
const Router7 = require("./Routings/ContactRoutes");
const codeExecutionRoutes = require("./Routings/codeExecutionRoutes");
const artificialRoutes = require("./Routings/ArtificialRoutes");
const compression = require("compression");
require("dotenv").config();

app.use(compression());
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true                 
}));



// res.cookie('token', token, {
  // httpOnly: true,
  // secure: process.env.NODE_ENV === 'production',
  // sameSite: 'none',  // to allow cross-site cookies on HTTPS
// });
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

app.use("/api/auth", myRouter);
app.use("/Code-reviewer", myRouter2);
app.use("/api/userData",router3);
app.use("/api/file",router4);
app.use("/api/chats/",router5);
app.use("/api/theme",router6);
app.use("/api/feedback",Router7);
app.use("/api/execute", codeExecutionRoutes);
app.use(artificialRoutes);
connectDB();

app.get("/",(req,res)=>{
  res.send("This is my Home Page");
})

const emailToSocketIdMap = new Map();
const socketidToEmailMap = new Map();


const dataMappings = {};

const helper = (roomid) => {
  const room = io.sockets.adapter.rooms.get(roomid);
  if (!room) return [];

  return Array.from(room).map((socketid) => ({
    username: dataMappings[socketid] || null,
    socketid: socketid,
  }));
};

io.on("connection", (socket) => {
  // console.log(`User connected ${socket.id}`);

  socket.on("join", ({ roomid, username }) => {
    dataMappings[socket.id] = username;
    socket.join(roomid);

    const allClients = helper(roomid);
    // console.log(allClients);

    io.to(roomid).emit("joined", {
      clients: allClients,
      socketid: socket.id,
      username: username,
    });
  });

  socket.on("room:join", (data) => {
    const { email, room } = data;
    emailToSocketIdMap.set(email, socket.id);
    socketidToEmailMap.set(socket.id, email);
    io.to(room).emit("user:joined", { email, id: socket.id });
    socket.join(room);
    io.to(socket.id).emit("room:join", data);
  });

  socket.on("user:call", ({ to, offer }) => {
    io.to(to).emit("incomming:call", { from: socket.id, offer });
  });

  socket.on("call:accepted", ({ to, ans }) => {
    io.to(to).emit("call:accepted", { from: socket.id, ans });
  });

  socket.on("peer:nego:needed", ({ to, offer }) => {
    // console.log("peer:nego:needed", offer);
    io.to(to).emit("peer:nego:needed", { from: socket.id, offer });
  });

  socket.on("peer:nego:done", ({ to, ans }) => {
    // console.log("peer:nego:done", ans);
    io.to(to).emit("peer:nego:final", { from: socket.id, ans });
  });

  socket.on("call:ended", ({ to }) => {
    io.to(to).emit("call:ended");
  });

  socket.on("camera:toggle", ({ to, email, newCameraState }) => {
    socket
      .to(to)
      .emit("camera:toggle", { from: socket.id, email, newCameraState });
  });

  socket.on("messages:sent", ({ to, currMsg }) => {
    // console.log(currMsg);
    socket.broadcast.emit("messages:sent", { from: socket.id, currMsg });
  });
  
  socket.on("micMsg",({socketid,micMsg})=>{
    socket.broadcast.emit("micMsg",{from:socket.id,micMsg});
  })

  socket.on("user-leave", () => {
    // console.log("disconnecting activated...");

    const rooms = [...socket.rooms];

    if (dataMappings[socket.id]) {
      rooms.forEach((roomid) => {
        socket.to(roomid).emit("user-leaved", {
          username: dataMappings[socket.id],
          socketid: socket.id,
        });
      });

      delete dataMappings[socket.id];
    }
    socket.leave();
  });

  socket.on("code-change", ({ username,roomid, code }) => {
    // console.log("Code-change activated");
    if (roomid && code !== undefined) {
      socket.to(roomid).emit("code-changed", {whoChanged:username,ChangerSocketId:socket.id,code });
      socket.to(roomid).emit("show-who-changed",{whoChanged:username});
    }
  });

  socket.on("disconnect", () => {
    // console.log(`User disconnected ${socket.id}`);
    delete dataMappings[socket.id];
  });

  socket.on("sync-code", ({ socketid, code }) => {
    io.to(socketid).emit("code-changed", { code });
  });
});

app.get("/homePage", (req, res) => {
  res.send("This is my Home Page");
});

server.listen(process.env.PORT || 3000, () => {
  // console.log("Server is running...");
});

// app.listen(process.env.PORT, (req, res) => {
  // console.log("App is running...");
// });
