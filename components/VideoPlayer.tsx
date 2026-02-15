import { YtVideoPlayer } from "./ytvideoPlayer"
import { QueueHeader } from "./QueueHeader"
import { Queue } from "./Queue"
import { AddLink } from "./AddLink"

export const VideoPlayer = ({roomId}: {
    roomId: string
}) => {
    return <main  className="grid lg:grid-cols-12 gap-0 h-[calc(100vh-65px)] overflow-hidden">
        <YtVideoPlayer />

        <section className="lg:col-span-5 flex flex-col bg-black/20 h-full overflow-hidden">
            <QueueHeader />

            <Queue />

            <AddLink roomId={roomId}/>
        </section>
    </main>
}