"use client"

import { useEffect, useState } from "react"
import { Button } from "./ui/button"

export const AddLink = ({ roomId }: {
  roomId: string
}) => {

  const [url, setUrl] = useState("")

  useEffect(() => {
    fetch(`http://localhost:3000/api/streams/songs/?spaceId=${roomId}`)
      .then(res => {
        return res.json()
      }).then(data => {
        console.log(data.streams);
      })
  }, [roomId])
  return <div className="p-6 bg-[#111] border-t border-white/10">
    <div className="relative">
      <input
        type="text"
        placeholder="PASTE YOUTUBE URL TO QUEUE..."
        className="w-full bg-black border border-white/10 p-4 pr-12 text-xs font-bold focus:outline-none focus:border-[#CCFF00] transition-colors"
        onChange={(e) => {
          setUrl(e.target.value)
        }}
      />
      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20">
        <Button size="sm" onClick={() => {
            fetch(`http://localhost:3000/api/streams/songs`, {
              method: "POST",
              body: JSON.stringify({url, spaceId: roomId.toString()})
            })
        }} disabled={url ? false: true} variant="outline" className="rounded-none border-[#CCFF00] text-[#CCFF00] hover:bg-[#CCFF00] hover:text-black transition-colors">
          + ADD TRACK
        </Button>
      </div>
    </div>
  </div>
}