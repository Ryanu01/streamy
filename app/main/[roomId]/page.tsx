"use client"

import { Header } from '@/components/MainHeader';
import { VideoPlayer } from '@/components/VideoPlayer';
import { RoomProvider, useRoom } from '@/app/context/RoomContext';
import { useParams } from 'next/navigation';
import { useEffect } from 'react';
import { useCurrentRoom } from '@/app/hooks/useCurrentRoom';

function RoomContent() {
  const { state, upvoteSong, downvoteSong, skipToNext } = useRoom();
  const params = useParams();
  const roomId = params.roomId as string;
  const { enterRoom, isTryingToAccessDifferentRoom } = useCurrentRoom();

  // Track that user entered this room
  useEffect(() => {
    enterRoom(roomId);
  }, [roomId, enterRoom]);

  return (
    <div className="min-h-screen bg-[#0B0B0B] text-slate-100 font-mono overflow-hidden">
      <Header roomId={roomId}/>
      <VideoPlayer 
        roomId={roomId}
        songs={state.queue}
        currentSong={state.currentSong}
        isLoading={state.isLoading}
        isHost={state.isHost}
        onUpvote={upvoteSong}
        onDownvote={downvoteSong}
        onSkip={skipToNext}
      />
    </div>
  );
}

const RoomPage = () => {
  const params = useParams();
  const roomId = params.roomId as string;

  return (
    <RoomProvider roomId={roomId}>
      <RoomContent />
    </RoomProvider>
  );
};

export default RoomPage;
