"use client"

import { ArrowBigDown, ArrowBigUp, ArrowBigUpDash, ArrowBigUpDashIcon, Loader2 } from "lucide-react"
import { Song } from "@/app/types"
import ArrowBigDownDashIcon from "./ui/arrow-big-down-dash-icon"

interface QueueProps {
  songs: Song[]
  isLoading: boolean
  onUpvote: (songId: number) => void
  onDownvote: (songId: number) => void
}

export const Queue = ({ songs, isLoading, onUpvote, onDownvote }: QueueProps) => {
  if (isLoading) {
    return (
      <div className="flex-1 min-h-0 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#CCFF00] animate-spin" />
      </div>
    )
  }

  if (songs.length === 0) {
    return (
      <div className="flex-1 min-h-0 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-white/40 text-sm font-bold uppercase tracking-widest mb-2">
            Queue Empty
          </div>
          <div className="text-white/20 text-xs">
            Add songs to get started
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-2 scrollbar-hide">
      {songs.map((song, i) => (
        <div 
          key={song.id} 
          className="group flex items-center gap-4 p-4 bg-white/2 border border-white/5 hover:border-[#CCFF00]/50 transition-all"
        >
          <div className="text-2xl font-black text-white/10 w-8 group-hover:text-[#CCFF00]/20">
            {i + 1}
          </div>

          <div className="flex-1 min-w-0">
            <div className={`font-bold text-sm tracking-wide truncate ${i === 0 ? "text-[#CCFF00]" : "text-white"}`}>
              {song.title}
            </div>
            <div className="text-[10px] text-white/30 font-bold uppercase truncate">
              Added by User #{song.addedById}
            </div>
          </div>

          <div className="flex flex-col items-center bg-black/40 p-1 px-2 border border-white/5">
            <button 
              onClick={() => onUpvote(song.id)}
              className={`transition-colors ${song.haveUpVoted ? "text-[#CCFF00]" : "text-white/60 hover:text-[#CCFF00]"}`}
              disabled={song.haveUpVoted}
            >
              <ArrowBigUpDashIcon className="w-5 h-5" />
            </button>
            <span className="text-xs font-black my-1 text-white">{song.upVotes || 0}</span>
            <button 
              onClick={() => onDownvote(song.id)}
              className={`transition-colors ${!song.haveUpVoted ? "text-white/60 hover:text-red-500" : "text-white/20"}`}
              disabled={!song.haveUpVoted}
            >
              <ArrowBigDownDashIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
