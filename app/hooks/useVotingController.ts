"use client";

import { useCallback, useEffect, useState, useRef, useMemo } from "react";
import { useSession } from "next-auth/react";
import { Song, QueueState } from "@/app/types";
import { useSocket } from "./useSocket";

export function useVotingController(roomId: string) {
  const { data: session } = useSession();
  const { socket, isConnected } = useSocket(roomId);
  const [queueState, setQueueState] = useState<QueueState>({
    streams: [],
    activeStream: null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isHost, setIsHost] = useState(false);
  const currentSongRef = useRef<Song | null>(null);

  // Memoize current song to prevent reference changes
  const currentSong = useMemo(() => {
    return queueState.activeStream?.song || null;
  }, [queueState.activeStream?.song?.id]);

  // Keep ref in sync with state
  useEffect(() => {
    currentSongRef.current = queueState.activeStream?.song || null;
  }, [queueState.activeStream]);

  // Check if user is host
  useEffect(() => {
    const checkHostStatus = async () => {
      try {
        const response = await fetch(
          `http://localhost:3000/api/streams/check-host?spaceId=${roomId}`
        );
        if (response.ok) {
          const data = await response.json();
          setIsHost(data.isHost);
        }
      } catch (error) {
        console.error("Error checking host status:", error);
      }
    };

    if (session?.user?.id) {
      checkHostStatus();
    }
  }, [roomId, session?.user?.id]);

  // Fetch only queue (streams), preserve current song
  const fetchQueueOnly = useCallback(async () => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/streams/songs/?spaceId=${roomId}`
      );
      if (!response.ok) throw new Error("Failed to fetch queue");
      
      const data = await response.json();
      
      if (data.streams) {
        // Get current song ID from ref to avoid state dependency
        const currentSongId = currentSongRef.current?.id;
        
        // Filter out the currently playing song from the queue
        const filteredStreams = (data.streams || []).filter((s: Song) => s.id !== currentSongId);
        
        // Sort by upvotes (descending)
        const sortedStreams = filteredStreams.sort((a: Song, b: Song) => b.upVotes - a.upVotes);
        
        // Only update the streams, preserve activeStream
        setQueueState(prev => ({
          ...prev,
          streams: sortedStreams,
        }));
      }
    } catch (error) {
      console.error("Error fetching queue:", error);
    }
  }, [roomId]);

  // Fetch full state (including current song) - only for initial load
  const fetchFullState = useCallback(async () => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/streams/songs/?spaceId=${roomId}`
      );
      if (!response.ok) throw new Error("Failed to fetch queue");
      
      const data = await response.json();
      
      if (data.streams || data.acitveStreams) {
        const backendCurrentStream = data.acitveStreams || null;
        const currentSongId = backendCurrentStream?.song?.id;
        
        // Filter out the currently playing song from the queue
        const filteredStreams = (data.streams || []).filter((s: Song) => s.id !== currentSongId);
        
        // Sort by upvotes (descending)
        const sortedStreams = filteredStreams.sort((a: Song, b: Song) => b.upVotes - a.upVotes);
        
        setQueueState({
          streams: sortedStreams,
          activeStream: backendCurrentStream,
        });
      }
    } catch (error) {
      console.error("Error fetching queue:", error);
    } finally {
      setIsLoading(false);
    }
  }, [roomId]);

  // Initial fetch only once when host status is known
  useEffect(() => {
    if (isHost !== undefined) {
      fetchFullState();
    }
  }, [fetchFullState, isHost]);

  // Listen for real-time vote updates
  useEffect(() => {
    if (!socket) return;

    const handleVoteUpdate = (data: { songId: number; type: "upvote" | "downvote"; userId: number }) => {
      setQueueState((prev) => {
        const currentUserId = Number(session?.user?.id);
        
        const updatedStreams = prev.streams.map((song) => {
          if (song.id === data.songId) {
            const voteChange = data.type === "upvote" ? 1 : -1;
            const newUpVotes = Math.max(0, song.upVotes + voteChange);
            
            const newHaveUpVoted = data.userId === currentUserId 
              ? (data.type === "upvote")
              : song.haveUpVoted;
            
            return {
              ...song,
              upVotes: newUpVotes,
              haveUpVoted: newHaveUpVoted,
            };
          }
          return song;
        });

        const sortedStreams = updatedStreams.sort((a, b) => b.upVotes - a.upVotes);

        return {
          ...prev,
          streams: sortedStreams,
        };
      });
    };

    const handleQueueUpdated = (newSong: Song) => {
      console.log("New song added via socket:", newSong.title);
      // Add new song to queue without affecting current song
      setQueueState((prev) => {
        // Check if song already exists
        if (prev.streams.some(s => s.id === newSong.id)) {
          return prev;
        }
        
        // Don't add if it's the current song
        if (prev.activeStream?.song?.id === newSong.id) {
          return prev;
        }
        
        const newStreams = [...prev.streams, newSong];
        const sortedStreams = newStreams.sort((a, b) => b.upVotes - a.upVotes);
        
        return {
          ...prev,
          streams: sortedStreams,
        };
      });
    };

    const handleCurrentSongChanged = () => {
      // Only update current song, not the queue
      fetchFullState();
    };

    socket.on("vote-update", handleVoteUpdate);
    socket.on("queue-updated", handleQueueUpdated);
    socket.on("current-song-changed", handleCurrentSongChanged);

    return () => {
      socket.off("vote-update", handleVoteUpdate);
      socket.off("queue-updated", handleQueueUpdated);
      socket.off("current-song-changed", handleCurrentSongChanged);
    };
  }, [socket, session?.user?.id, fetchFullState]);

  // Upvote function
  const upvote = useCallback(
    async (songId: number) => {
      if (!session?.user?.id) return;

      try {
        setQueueState((prev) => {
          const updatedStreams = prev.streams.map((song) =>
            song.id === songId
              ? { ...song, upVotes: song.upVotes + 1, haveUpVoted: true }
              : song
          );
          return {
            ...prev,
            streams: updatedStreams.sort((a, b) => b.upVotes - a.upVotes),
          };
        });

        socket?.emit("upvote", {
          roomId,
          songId,
          userId: Number(session.user.id),
        });

        await fetch("/api/streams/upvote", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ songId: songId.toString() }),
        });
      } catch (error) {
        console.error("Error upvoting:", error);
        fetchQueueOnly();
      }
    },
    [socket, roomId, session?.user?.id, fetchQueueOnly]
  );

  // Downvote function
  const downvote = useCallback(
    async (songId: number) => {
      if (!session?.user?.id) return;

      try {
        setQueueState((prev) => {
          const updatedStreams = prev.streams.map((song) =>
            song.id === songId && song.upVotes > 0
              ? { ...song, upVotes: song.upVotes - 1, haveUpVoted: false }
              : song
          );
          return {
            ...prev,
            streams: updatedStreams.sort((a, b) => b.upVotes - a.upVotes),
          };
        });

        socket?.emit("downvote", {
          roomId,
          songId,
          userId: Number(session.user.id),
        });

        await fetch("/api/streams/downVote", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ songId: songId.toString() }),
        });
      } catch (error) {
        console.error("Error downvoting:", error);
        fetchQueueOnly();
      }
    },
    [socket, roomId, session?.user?.id, fetchQueueOnly]
  );

  // Skip to next song (for host only)
  const skipToNext = useCallback(async () => {
    if (!isHost) {
      console.log("Only host can skip songs");
      return;
    }
    
    try {
      console.log("Skipping to next song...");
      const response = await fetch(
        `http://localhost:3000/api/streams/next?spaceId=${roomId}`,
        { method: "GET" }
      );
      
      if (response.ok) {
        const data = await response.json();
        console.log("Skip response:", data);
        
        if (data.mostUpvotedSong) {
          // Update state immediately with new current song
          setQueueState(prev => {
            const newQueue = prev.streams.filter(s => s.id !== data.mostUpvotedSong.id);
            
            return {
              streams: newQueue,
              activeStream: {
                spaceId: Number(roomId),
                songId: data.mostUpvotedSong.id,
                song: data.mostUpvotedSong
              }
            };
          });
          
          // Emit socket event to notify others
          socket?.emit("song-change", {
            roomId,
            currentSong: data.mostUpvotedSong,
            nextSong: null,
          });
        } else {
          // No more songs
          setQueueState(prev => ({
            ...prev,
            activeStream: null
          }));
        }
      } else {
        console.error("Skip failed:", response.status);
      }
    } catch (error) {
      console.error("Error skipping to next:", error);
    }
  }, [roomId, socket, isHost]);

  // Memoize queue to prevent unnecessary re-renders
  const queue = useMemo(() => queueState.streams, [queueState.streams]);

  return {
    queue,
    currentSong,
    isLoading,
    isConnected,
    isHost,
    upvote,
    downvote,
    skipToNext,
    refreshQueue: fetchQueueOnly,
  };
}
