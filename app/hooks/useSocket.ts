"use client";

import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

export function useSocket(roomId: string) {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Create socket connection directly to the custom server
    const socket = io("http://localhost:3000", {
      path: "/socket.io",
      transports: ["websocket", "polling"],
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
      setIsConnected(true);
      // Join the room
      socket.emit("join-room", roomId);
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected");
      setIsConnected(false);
    });

    socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
    });

    return () => {
      socket.emit("leave-room", roomId);
      socket.disconnect();
    };
  }, [roomId]);

  return { socket: socketRef.current, isConnected };
}
