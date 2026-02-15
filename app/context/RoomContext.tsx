"use client";

import React, { createContext, useContext, useReducer, useEffect, useCallback, ReactNode } from "react";
import { Song } from "@/app/types";
import { useSocket } from "@/app/hooks/useSocket";
import { useSession } from "next-auth/react";

interface RoomState {
  queue: Song[];
  currentSong: Song | null;
  isLoading: boolean;
  isHost: boolean;
  error: string | null;
}

type RoomAction =
  | { type: "SET_QUEUE"; payload: Song[] }
  | { type: "SET_CURRENT_SONG"; payload: Song | null }
  | { type: "ADD_SONG"; payload: Song }
  | { type: "UPDATE_VOTES"; payload: { songId: number; upVotes: number; haveUpVoted: boolean; userId: number } }
  | { type: "SET_HOST"; payload: boolean }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "REMOVE_SONG_FROM_QUEUE"; payload: number }
  | { type: "RESET" };

const initialState: RoomState = {
  queue: [],
  currentSong: null,
  isLoading: true,
  isHost: false,
  error: null,
};

function roomReducer(state: RoomState, action: RoomAction): RoomState {
  switch (action.type) {
    case "SET_QUEUE":
      return { ...state, queue: action.payload };
    
    case "SET_CURRENT_SONG":
      return { ...state, currentSong: action.payload };
    
    case "ADD_SONG": {
      // Don't add if already exists or is current song
      if (state.queue.find(s => s.id === action.payload.id) || 
          state.currentSong?.id === action.payload.id) {
        return state;
      }
      const newQueue = [...state.queue, action.payload].sort((a, b) => b.upVotes - a.upVotes);
      return { ...state, queue: newQueue };
    }
    
    case "UPDATE_VOTES": {
      const currentUserId = Number(action.payload.userId);
      const voteChange = action.payload.upVotes; // +1 or -1
      
      const updatedQueue = state.queue.map(song => {
        if (song.id === action.payload.songId) {
          // If this is from socket and not current user, just update the count
          // If this is current user's action, also update haveUpVoted
          const isCurrentUserAction = action.payload.haveUpVoted !== undefined;
          
          return {
            ...song,
            upVotes: Math.max(0, song.upVotes + voteChange),
            haveUpVoted: isCurrentUserAction ? action.payload.haveUpVoted : song.haveUpVoted
          };
        }
        return song;
      });
      
      return { ...state, queue: updatedQueue.sort((a, b) => b.upVotes - a.upVotes) };
    }
    
    case "SET_HOST":
      return { ...state, isHost: action.payload };
    
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };
    
    case "SET_ERROR":
      return { ...state, error: action.payload };
    
    case "REMOVE_SONG_FROM_QUEUE":
      return {
        ...state,
        queue: state.queue.filter(s => s.id !== action.payload)
      };
    
    case "RESET":
      return initialState;
    
    default:
      return state;
  }
}

interface RoomContextType {
  state: RoomState;
  dispatch: React.Dispatch<RoomAction>;
  upvoteSong: (songId: number) => Promise<void>;
  downvoteSong: (songId: number) => Promise<void>;
  skipToNext: () => Promise<void>;
  refreshQueue: () => Promise<void>;
  addSong: (url: string) => Promise<void>;
}

const RoomContext = createContext<RoomContextType | undefined>(undefined);

export function RoomProvider({ roomId, children }: { roomId: string; children: ReactNode }) {
  const [state, dispatch] = useReducer(roomReducer, initialState);
  const { socket, isConnected } = useSocket(roomId);
  const { data: session } = useSession();

  // Check host status
  useEffect(() => {
    const checkHostStatus = async () => {
      try {
        const response = await fetch(
          `http://localhost:3000/api/streams/check-host?spaceId=${roomId}`
        );
        if (response.ok) {
          const data = await response.json();
          dispatch({ type: "SET_HOST", payload: data.isHost });
        }
      } catch (error) {
        console.error("Error checking host status:", error);
      }
    };

    if (session?.user?.id) {
      checkHostStatus();
    }
  }, [roomId, session?.user?.id]);

  // Fetch initial state
  const fetchFullState = useCallback(async () => {
    dispatch({ type: "SET_LOADING", payload: true });
    try {
      const response = await fetch(
        `http://localhost:3000/api/streams/songs/?spaceId=${roomId}`
      );
      if (!response.ok) throw new Error("Failed to fetch queue");
      
      const data = await response.json();
      
      if (data.streams !== undefined) {
        const currentSongId = data.acitveStreams?.song?.id;
        const filteredQueue = (data.streams || []).filter((s: Song) => s.id !== currentSongId);
        const sortedQueue = filteredQueue.sort((a: Song, b: Song) => b.upVotes - a.upVotes);
        
        dispatch({ type: "SET_QUEUE", payload: sortedQueue });
        dispatch({ type: "SET_CURRENT_SONG", payload: data.acitveStreams?.song || null });
      }
    } catch (error) {
      console.error("Error fetching queue:", error);
      dispatch({ type: "SET_ERROR", payload: "Failed to load queue" });
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, [roomId]);

  // Initial load
  useEffect(() => {
    fetchFullState();
  }, [fetchFullState]);

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

    const handleVoteUpdate = (data: { songId: number; type: "upvote" | "downvote"; userId: number }) => {
      const voteChange = data.type === "upvote" ? 1 : -1;
      
      dispatch({ 
        type: "UPDATE_VOTES", 
        payload: {
          songId: data.songId,
          upVotes: voteChange, // This will be added to existing
          haveUpVoted: data.type === "upvote",
          userId: data.userId
        }
      });
    };

    const handleQueueUpdated = (newSong: Song) => {
      console.log("New song received via socket:", newSong.title);
      dispatch({ type: "ADD_SONG", payload: newSong });
    };

    const handleCurrentSongChanged = (data: { currentSong: Song | null }) => {
      console.log("Current song changed:", data.currentSong?.title);
      dispatch({ type: "SET_CURRENT_SONG", payload: data.currentSong });
      if (data.currentSong) {
        dispatch({ type: "REMOVE_SONG_FROM_QUEUE", payload: data.currentSong.id });
      }
    };

    socket.on("vote-update", handleVoteUpdate);
    socket.on("queue-updated", handleQueueUpdated);
    socket.on("current-song-changed", handleCurrentSongChanged);

    return () => {
      socket.off("vote-update", handleVoteUpdate);
      socket.off("queue-updated", handleQueueUpdated);
      socket.off("current-song-changed", handleCurrentSongChanged);
    };
  }, [socket]);

  // Actions
  const upvoteSong = useCallback(async (songId: number) => {
    if (!session?.user?.id || !socket) return;

    const currentUserId = Number(session.user.id);

    // Optimistic update
    dispatch({ 
      type: "UPDATE_VOTES", 
      payload: {
        songId,
        upVotes: 1,
        haveUpVoted: true,
        userId: currentUserId
      }
    });

    socket.emit("upvote", { roomId, songId, userId: currentUserId });

    try {
      await fetch("/api/streams/upvote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ songId: songId.toString() }),
      });
    } catch (error) {
      console.error("Error upvoting:", error);
    }
  }, [socket, roomId, session?.user?.id]);

  const downvoteSong = useCallback(async (songId: number) => {
    if (!session?.user?.id || !socket) return;

    const currentUserId = Number(session.user.id);

    // Optimistic update
    dispatch({ 
      type: "UPDATE_VOTES", 
      payload: {
        songId,
        upVotes: -1,
        haveUpVoted: false,
        userId: currentUserId
      }
    });

    socket.emit("downvote", { roomId, songId, userId: currentUserId });

    try {
      await fetch("/api/streams/downVote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ songId: songId.toString() }),
      });
    } catch (error) {
      console.error("Error downvoting:", error);
    }
  }, [socket, roomId, session?.user?.id]);

  const addSong = useCallback(async (url: string) => {
    try {
      const response = await fetch(`http://localhost:3000/api/streams/songs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, spaceId: roomId }),
      });

      if (response.ok) {
        const data = await response.json();
        if (socket && data.songDb) {
          socket.emit("queue-update", { roomId, song: data.songDb });
        }
      }
    } catch (error) {
      console.error("Error adding song:", error);
      throw error;
    }
  }, [roomId, socket]);

  const skipToNext = useCallback(async () => {
    if (!state.isHost) {
      console.log("Only host can skip");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:3000/api/streams/next?spaceId=${roomId}`,
        { method: "GET" }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.mostUpvotedSong) {
          dispatch({ type: "SET_CURRENT_SONG", payload: data.mostUpvotedSong });
          dispatch({ type: "REMOVE_SONG_FROM_QUEUE", payload: data.mostUpvotedSong.id });
          
          socket?.emit("song-change", {
            roomId,
            currentSong: data.mostUpvotedSong,
            nextSong: null,
          });
        }
      }
    } catch (error) {
      console.error("Error skipping:", error);
    }
  }, [roomId, socket, state.isHost]);

  const refreshQueue = useCallback(async () => {
    await fetchFullState();
  }, [fetchFullState]);

  return (
    <RoomContext.Provider value={{
      state,
      dispatch,
      upvoteSong,
      downvoteSong,
      skipToNext,
      refreshQueue,
      addSong,
    }}>
      {children}
    </RoomContext.Provider>
  );
}

export function useRoom() {
  const context = useContext(RoomContext);
  if (!context) {
    throw new Error("useRoom must be used within RoomProvider");
  }
  return context;
}
