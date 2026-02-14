"use client"
import { ArrowBigDown, ArrowBigUp } from "lucide-react"

export const Queue = () => {
    return <div className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-hide">
                {[
                  { title: "CIRCUIT BREAKER", artist: "VOLT_AGE", votes: 89, color: "text-[#CCFF00]" },
                  { title: "DATA STREAM", artist: "NULL_VOID", votes: 54, color: "text-white" },
                  { title: "LOGIC BOMB", artist: "ROOT_USER", votes: 42, color: "text-white" },
                  { title: "BUFFER OVERFLOW", artist: "C_PLUS_PLUS", votes: 21, color: "text-white" },
                  { title: "GHOST IN SHELL", artist: "MAJOR_K", votes: 12, color: "text-white/50" },
                ].map((track, i) => (
                  <div key={i} className="group flex items-center gap-4 p-4 bg-white/[0.02] border border-white/5 hover:border-[#CCFF00]/50 transition-all">
                    <div className="text-2xl font-black text-white/10 w-8 group-hover:text-[#CCFF00]/20">{i+1}</div>
                    
                    <div className="flex-1">
                      <div className={`font-bold text-sm tracking-wide ${track.color}`}>{track.title}</div>
                      <div className="text-[10px] text-white/30 font-bold uppercase">{track.artist}</div>
                    </div>
    
                    <div className="flex flex-col items-center bg-black/40 p-1 px-2 border border-white/5">
                      <button className="hover:text-[#CCFF00] transition-colors"><ArrowBigUp className="w-5 h-5" /></button>
                      <span className="text-xs font-black my-1">{track.votes}</span>
                      <button className="hover:text-red-500 transition-colors"><ArrowBigDown className="w-5 h-5" /></button>
                    </div>
                  </div>
                ))}
              </div>
}