"use client";

import { useCallback, useEffect, useState } from "react";

const CURRENT_ROOM_KEY = "streamy_current_room";
const ROOM_ENTRY_TIME_KEY = "streamy_room_entry_time";

export function useCurrentRoom() {
  const [currentRoomId, setCurrentRoomId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load current room from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedRoomId = localStorage.getItem(CURRENT_ROOM_KEY);
      setCurrentRoomId(storedRoomId);
      setIsLoading(false);
    }
  }, []);

  // Enter a room
  const enterRoom = useCallback((roomId: string) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(CURRENT_ROOM_KEY, roomId);
      localStorage.setItem(ROOM_ENTRY_TIME_KEY, Date.now().toString());
      setCurrentRoomId(roomId);
    }
  }, []);

  // Leave current room
  const leaveRoom = useCallback(() => {
    if (typeof window !== "undefined") {
      
      localStorage.removeItem(CURRENT_ROOM_KEY);
      localStorage.removeItem(ROOM_ENTRY_TIME_KEY);
      setCurrentRoomId(null);
    }
  }, []);

  // Check if user is in a room
  const isInRoom = useCallback(() => {
    return currentRoomId !== null;
  }, [currentRoomId]);

  // Check if trying to access a different room
  const isTryingToAccessDifferentRoom = useCallback((targetRoomId: string) => {
    return currentRoomId !== null && currentRoomId !== targetRoomId;
  }, [currentRoomId]);

  return {
    currentRoomId,
    isLoading,
    enterRoom,
    leaveRoom,
    isInRoom,
    isTryingToAccessDifferentRoom,
  };
}
