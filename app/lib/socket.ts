import { Server as NetServer } from "http";
import { Server as SocketIOServer } from "socket.io";

export const config = {
  api: {
    bodyParser: false,
  },
};

let io: SocketIOServer | null = null;

export function getIO(): SocketIOServer | null {
  return io;
}

export function initIO(server: NetServer): SocketIOServer {
  if (!io) {
    io = new SocketIOServer(server, {
      path: "/api/socket",
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
      },
    });

    io.on("connection", (socket) => {
      console.log("Client connected:", socket.id);

      socket.on("join-room", (roomId: string) => {
        socket.join(roomId);
        console.log(`Socket ${socket.id} joined room ${roomId}`);
      });

      socket.on("leave-room", (roomId: string) => {
        socket.leave(roomId);
        console.log(`Socket ${socket.id} left room ${roomId}`);
      });

      socket.on("upvote", (data: { roomId: string; songId: number; userId: number }) => {
        console.log(`Upvote received: song ${data.songId} in room ${data.roomId}`);

        socket.to(data.roomId).emit("vote-update", {
          songId: data.songId,
          type: "upvote",
          userId: data.userId,
        });
      });

      socket.on("downvote", (data: { roomId: string; songId: number; userId: number }) => {
        console.log(`Downvote received: song ${data.songId} in room ${data.roomId}`);
        socket.to(data.roomId).emit("vote-update", {
          songId: data.songId,
          type: "downvote",
          userId: data.userId,
        });
      });

      socket.on("queue-update", (data: { roomId: string; song: any }) => {
        console.log(`Queue update in room ${data.roomId}`);
        io?.to(data.roomId).emit("queue-updated", data.song);
      });

      socket.on("song-change", (data: { roomId: string; currentSong: any; nextSong: any }) => {
        console.log(`Song change in room ${data.roomId}`);
        io?.to(data.roomId).emit("current-song-changed", data);
      });

      socket.on("disconnect", () => {
        console.log("Client disconnected:", socket.id);
      });
    });
  }

  return io;
}
