import { YtVideoPlayer } from "./ytvideoPlayer"
import { QueueHeader } from "./QueueHeader"
import { Queue } from "./Queue"
import { AddLink } from "./AddLink"
import { Song } from "@/app/types"

interface VideoPlayerProps {
  roomId: string
  songs: Song[]
  currentSong: Song | null
  isLoading: boolean
  isHost: boolean
  onUpvote: (songId: number) => void
  onDownvote: (songId: number) => void
  onSkip: () => void
}

export const VideoPlayer = ({
  roomId,
  songs,
  currentSong,
  isLoading,
  isHost,
  onUpvote,
  onDownvote,
  onSkip
}: VideoPlayerProps) => {
  return (
    <main className="grid lg:grid-cols-12 gap-0 h-[calc(100vh-65px)] overflow-hidden">
      <YtVideoPlayer 
        currentSong={currentSong} 
        onSkip={onSkip} 
        isHost={isHost} 
      />

      <section className="lg:col-span-5 flex flex-col bg-black/20 h-full overflow-hidden">
        <QueueHeader />

        <Queue 
          songs={songs}
          isLoading={isLoading}
          onUpvote={onUpvote}
          onDownvote={onDownvote}
        />

        <AddLink roomId={roomId} />
      </section>
    </main>
  )
}
