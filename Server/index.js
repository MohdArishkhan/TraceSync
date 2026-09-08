require("dotenv").config();
const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const { createClient } = require("@supabase/supabase-js");
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
const documentRoutes = require("./Routings/documentRoutes");
const roomRoutes = require("./Routings/roomRoutes");
const compression = require("compression");
const firstHitRoute = require("./Routings/FirstHitRoute");


app.use(compression());
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  }),
);

// Initialize Supabase Client for backend operations
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

app.use("/api/auth", myRouter);
app.use("/Code-reviewer", myRouter2);
app.use("/api/userData", router3);
app.use("/api/file", router4);
app.use("/api/chats/", router5);
app.use("/api/theme", router6);
app.use("/api/feedback", Router7);
app.use("/api/execute", codeExecutionRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/analytics", firstHitRoute);
app.use(artificialRoutes);
// connectDB();

app.get("/", (req, res) => {
  res.send("This is my Home Page");
});

const saveTimeouts = new Map();
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
  socket.on("trigger-db-save", ({ roomid, codeContent }) => {
    if (saveTimeouts.has(roomid)) {
      clearTimeout(saveTimeouts.get(roomid));
    }

    // 2. Start a fresh 2-second countdown
    const timer = setTimeout(async () => {
      try {
        console.log(`[AutoSave] Saving room ${roomid} to Supabase...`);

        // Execute the actual Supabase update query
        const { error } = await supabase
          .from("documents")
          .update({
            code_content: codeContent,
            updated_at: new Date().toISOString(),
          })
          .eq("id", roomid);

        if (error) throw error;

        console.log(`[AutoSave] Room ${roomid} saved successfully!`);
      } catch (error) {
        console.error(`[AutoSave Error]:`, error.message);
      } finally {
        saveTimeouts.delete(roomid);
      }
    }, 2000);

    saveTimeouts.set(roomid, timer);
  });
  // ----------------------------------------------------

  socket.on("join", async ({ roomid, username }) => {
    dataMappings[socket.id] = username;
    socket.join(roomid);

    const allClients = helper(roomid);

    // 1. Notify everyone in the room (including the joiner) about the updated member list
    io.to(roomid).emit("joined", {
      clients: allClients,
      socketid: socket.id,
      username: username,
    });

    // 2. Fetch the current room document from Supabase
    try {
      const { data: document, error } = await supabase
        .from("documents")
        .select("code_content, visual_state, language")
        .eq("id", roomid)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error(`[Join Error] Fetching room ${roomid}:`, error.message);
      }

      // 3. Send the existing code and state ONLY to the user who just connected
      socket.emit("initial-code", {
        code: document?.code_content || "",
        visualState: document?.visual_state || {},
        language: document?.language || "javascript",
      });
    } catch (err) {
      console.error("[Join Fetch Exception]:", err.message);
    }
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
    io.to(to).emit("peer:nego:needed", { from: socket.id, offer });
  });

  socket.on("peer:nego:done", ({ to, ans }) => {
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
    socket.broadcast.emit("messages:sent", { from: socket.id, currMsg });
  });

  socket.on("micMsg", ({ socketid, micMsg }) => {
    socket.broadcast.emit("micMsg", { from: socket.id, micMsg });
  });

  socket.on("user-leave", () => {
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

  socket.on("yjs-update", ({ roomid, username, update }) => {
    if (roomid && update) {
      // Broadcast the binary array to everyone else in the room
      socket.to(roomid).emit("yjs-update", { update, username });
      // Tell UI someone is typing
      socket.to(roomid).emit("show-who-changed", { whoChanged: username });
    }
  });

  socket.on("disconnect", () => {
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
  console.log("Server is running...");
});
