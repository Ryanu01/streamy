const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");
const { Server } = require("socket.io");

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

let io;

app.prepare().then(() => {
  const httpServer = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error("Error occurred handling", req.url, err);
      res.statusCode = 500;
      res.end("Internal server error");
    }
  });


  io = new Server(httpServer, {
    path: "/socket.io",
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
    transports: ["websocket", "polling"],
  });

  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    socket.on("join-room", (roomId) => {
      console.log("Socket connected:", socket.id);
      if (socket.rooms.has(roomId)) {
        return;
      }

      socket.join(roomId);
      const room = io.sockets.adapter.rooms.get(roomId);
      const count = room ? room.size / 2 : 0

      io.to(roomId).emit("member-count", count);
      console.log(`Socket ${socket.id} joined room ${roomId}`);
    });

    socket.on("leave-room", (roomId) => {

      socket.leave(roomId);
      const room = io.sockets.adapter.rooms.get(roomId)
      const count = room ? room.size - 1 / 2 : 0

      io.to(roomId).emit("member-count", count);

      console.log(`Socket ${socket.id} left room ${roomId}`);
    });

    socket.on("upvote", (data) => {
      console.log(`Upvote received: song ${data.songId} in room ${data.roomId}`);
      socket.to(data.roomId).emit("vote-update", {
        songId: data.songId,
        type: "upvote",
        userId: data.userId,
      });
    });

    socket.on("downvote", (data) => {
      console.log(`Downvote received: song ${data.songId} in room ${data.roomId}`);
      socket.to(data.roomId).emit("vote-update", {
        songId: data.songId,
        type: "downvote",
        userId: data.userId,
      });
    });

    socket.on("queue-update", (data) => {
      console.log(`Queue update in room ${data.roomId}`);
      io.to(data.roomId).emit("queue-updated", data.song);
    });

    socket.on("song-change", (data) => {
      console.log(`Song change in room ${data.roomId}`);
      io.to(data.roomId).emit("current-song-changed", data);
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });

  httpServer
    .once("error", (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
});
