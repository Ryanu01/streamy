"use client"
import { Button } from "./ui/button"

export const QueueHeader = () => {
    return <div className="p-6 border-b border-white/10 flex justify-between items-end">
            <div>
              <h3 className="text-xs font-black text-white/30 uppercase tracking-[0.3em]">Next in line</h3>
              <div className="text-xl font-bold">THE QUEUE</div>
            </div>
            <Button size="sm" variant="outline" className="rounded-none border-[#CCFF00] text-[#CCFF00] hover:bg-[#CCFF00] hover:text-black transition-colors">
              + ADD TRACK
            </Button>
          </div>
}