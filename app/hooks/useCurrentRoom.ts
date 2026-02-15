"use client";

import { useCallback, useEffect, useState } from "react";

const CURRENT_ROOM_KEY = "streamy_current_room";
const ROOM_ENTRY_TIME_KEY = "streamy_room_entry_time";

export function useCurrentRoom() {
  const [currentRoomId, setCurrentRoomId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedRoomId = localStorage.getItem(CURRENT_ROOM_KEY);
      setCurrentRoomId(storedRoomId);
      setIsLoading(false);
    }
  }, []);

  const enterRoom = useCallback((roomId: string) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(CURRENT_ROOM_KEY, roomId);
      localStorage.setItem(ROOM_ENTRY_TIME_KEY, Date.now().toString());
      setCurrentRoomId(roomId);
    }
  }, []);

  const leaveRoom = useCallback(() => {
    if (typeof window !== "undefined") {
      
      localStorage.removeItem(CURRENT_ROOM_KEY);
      localStorage.removeItem(ROOM_ENTRY_TIME_KEY);
      setCurrentRoomId(null);
    }
  }, []);

  const isInRoom = useCallback(() => {
    return currentRoomId !== null;
  }, [currentRoomId]);

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
