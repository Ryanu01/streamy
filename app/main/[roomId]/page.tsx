import { Header } from '@/components/MainHeader';
import { VideoPlayer } from '@/components/VideoPlayer';

const RoomPage = async ({params}: {
    params: Promise<{roomId: string}>
}) => {
  // Mock State for the "Now Playing"

  const { roomId } = await params
  return (
    <div className="min-h-screen bg-[#0B0B0B] text-slate-100 font-mono overflow-hidden">
      <Header roomId={roomId}/>
      <VideoPlayer roomId={roomId}/>
    </div>
  );
};

export default RoomPage;