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

  const currentSong = useMemo(() => {
    return queueState.activeStream?.song || null;
  }, [queueState.activeStream?.song?.id]);

  useEffect(() => {
    currentSongRef.current = queueState.activeStream?.song || null;
  }, [queueState.activeStream]);

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

  const fetchQueueOnly = useCallback(async () => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/streams/songs/?spaceId=${roomId}`
      );
      if (!response.ok) throw new Error("Failed to fetch queue");
      
      const data = await response.json();
      
      if (data.streams) {
        const currentSongId = currentSongRef.current?.id;
        
        const filteredStreams = (data.streams || []).filter((s: Song) => s.id !== currentSongId);
        
        const sortedStreams = filteredStreams.sort((a: Song, b: Song) => b.upVotes - a.upVotes);
        
        setQueueState(prev => ({
          ...prev,
          streams: sortedStreams,
        }));
      }
    } catch (error) {
      console.error("Error fetching queue:", error);
    }
  }, [roomId]);

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
        
        const filteredStreams = (data.streams || []).filter((s: Song) => s.id !== currentSongId);
        
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

  useEffect(() => {
    if (isHost !== undefined) {
      fetchFullState();
    }
  }, [fetchFullState, isHost]);

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
      setQueueState((prev) => {
        if (prev.streams.some(s => s.id === newSong.id)) {
          return prev;
        }
        
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
          
          socket?.emit("song-change", {
            roomId,
            currentSong: data.mostUpvotedSong,
            nextSong: null,
          });
        } else {
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
