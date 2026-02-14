"use client"

import { Lock, Music2, SkipForward, Volume2 } from "lucide-react"
import { Card } from "./ui/card"
import { Progress } from "./ui/progress"
import { Button } from "./ui/button"

export const YtVideoPlayer = () => {
    return <section className="lg:col-span-7 border-r border-white/10 p-8 flex flex-col justify-center bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] from-white/2 to-transparent">
          <div className="relative mx-auto w-full max-w-2xl group">

            <div className="absolute -top-4 -left-4 w-8 h-8 border-t-2 border-l-2 border-[#CCFF00]" />
            <div className="absolute -bottom-4 -right-4 w-8 h-8 border-b-2 border-r-2 border-[#CCFF00]" />
            
            <Card className="rounded-none bg-black border-white/10 overflow-hidden relative shadow-2xl shadow-[#CCFF00]/5">
              <div className="aspect-video relative overflow-hidden bg-[#111]">
                <img 
                  src="https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=2070&auto=format&fit=crop" 
                  alt="Track Thumbnail"
                  className="w-full h-full object-cover opacity-60 grayscale-[0.5] group-hover:grayscale-0 transition-all duration-700"
                />
                <div className="absolute inset-0 pointer-events-none opacity-20 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-size-[100%_2px,3px_100%]" />
                
                <div className="absolute inset-0 flex items-center justify-center">
                   <div className="p-4 rounded-full border border-white/20 bg-black/40 backdrop-blur-sm">
                      <Music2 className="w-12 h-12 text-[#CCFF00] animate-pulse" />
                   </div>
                </div>
              </div>
              <div className="p-6 bg-[#111] border-t border-white/10">
                <div className="mb-4">
                  <h2 className="text-2xl font-black tracking-widest uppercase  text-[#CCFF00]">
                    STAINLESS TIES
                  </h2>
                  <p className="text-white/40 text-sm font-bold uppercase tracking-widest">ARTIST: NIGHTMODE_EXEC</p>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-4 text-xs font-bold text-white/30">
                    <span>02:45</span>
                    <Progress value={65} className="h-1 bg-white/5" />
                    <style>{`.bg-primary { background-color: #CCFF00 !important; }`}</style>
                    <span>04:12</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex gap-4">
                      <Volume2 className="w-5 h-5 text-white/40" />
                      <div className="w-24 h-1 bg-white/10 my-auto rounded-full" />
                    </div>
                    <div className="flex items-center gap-6">
                      <Button variant="ghost" size="icon" className="hover:text-[#CCFF00]"><Lock className="w-5 h-5" /></Button>
                      <Button variant="ghost" size="icon" className="hover:text-[#CCFF00]"><SkipForward className="w-6 h-6" /></Button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </section>
}