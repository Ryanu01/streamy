import { io } from "socket.io-client";

let socket: any;

if (typeof window !== "undefined") {
  const globalWithSocket = globalThis as typeof globalThis & {
    _socket?: any;
  };

  if (!globalWithSocket._socket) {
    globalWithSocket._socket = io("http://localhost:3000", {
      transports: ["websocket"],
    });
  }

  socket = globalWithSocket._socket;
}

export { socket };