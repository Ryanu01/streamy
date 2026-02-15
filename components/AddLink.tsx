"use client"

import { useState } from "react"
import { Button } from "./ui/button"
import { Loader2 } from "lucide-react"
import { useRoom } from "@/app/context/RoomContext"

export const AddLink = ({ roomId }: {
  roomId: string
}) => {
  const [url, setUrl] = useState("")
  const [isAdding, setIsAdding] = useState(false)
  const { addSong } = useRoom()

  const handleAddSong = async () => {
    if (!url.trim()) return
    
    setIsAdding(true)
    try {
      await addSong(url)
      setUrl("")
    } catch (error) {
      console.error("Failed to add song")
    } finally {
      setIsAdding(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && url) {
      handleAddSong()
    }
  }

  return (
    <div className="p-6 bg-[#111] border-t border-white/10">
      <div className="relative">
        <input
          type="text"
          placeholder="PASTE YOUTUBE URL TO QUEUE..."
          className="w-full bg-black border border-white/10 p-4 pr-12 text-xs font-bold focus:outline-none focus:border-[#CCFF00] transition-colors"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isAdding}
        />
        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20">
          <Button 
            size="sm" 
            onClick={handleAddSong}
            disabled={!url || isAdding}
            variant="outline" 
            className="rounded-none border-[#CCFF00] text-[#CCFF00] hover:bg-[#CCFF00] hover:text-black transition-colors"
          >
            {isAdding ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              "+ ADD TRACK"
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
