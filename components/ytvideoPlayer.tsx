"use client"

import { Music2, SkipForward, Volume2, VolumeX, Crown } from "lucide-react"
import { Card } from "./ui/card"
import { Button } from "./ui/button"
import { Song } from "@/app/types"
import { useState, useCallback, useEffect, useRef } from "react"

interface YtVideoPlayerProps {
  currentSong: Song | null
  onSkip: () => void
  isHost: boolean
}

export const YtVideoPlayer = ({ currentSong, onSkip, isHost }: YtVideoPlayerProps) => {
  const [isMuted, setIsMuted] = useState(false)
  const [iframeKey, setIframeKey] = useState(0)
  const prevSongIdRef = useRef<number | null>(null)
  const autoSkipTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Handle skip
  const handleSkip = useCallback(() => {
    if (!isHost) return
    
    console.log("Skipping to next song...")
    // Clear any existing auto-skip timer
    if (autoSkipTimerRef.current) {
      clearTimeout(autoSkipTimerRef.current)
      autoSkipTimerRef.current = null
    }
    setIframeKey(prev => prev + 1)
    onSkip()
  }, [isHost, onSkip])

  // Reset iframe when song changes
  useEffect(() => {
    if (!currentSong) {
      prevSongIdRef.current = null
      return
    }

    const currentSongId = currentSong.id
    
    // Only update iframe if this is a different song
    if (prevSongIdRef.current !== currentSongId) {
      console.log("New song loaded:", currentSong.title, "ID:", currentSongId)
      prevSongIdRef.current = currentSongId
      
      // Clear existing timer
      if (autoSkipTimerRef.current) {
        clearTimeout(autoSkipTimerRef.current)
        autoSkipTimerRef.current = null
      }
      
      setIframeKey(prev => prev + 1)
      
      // Auto-skip after video duration (default 4 minutes for now)
      // In production, you'd get actual duration from YouTube API
      autoSkipTimerRef.current = setTimeout(() => {
        console.log("Auto-skipping after duration...")
        handleSkip()
      }, 240000) // 4 minutes
    }
    
    return () => {
      if (autoSkipTimerRef.current) {
        clearTimeout(autoSkipTimerRef.current)
      }
    }
  }, [currentSong?.id, handleSkip])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (autoSkipTimerRef.current) {
        clearTimeout(autoSkipTimerRef.current)
      }
    }
  }, [])

  if (!currentSong) {
    return (
      <section className="lg:col-span-7 border-r border-white/10 p-8 flex flex-col justify-center bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] from-white/2 to-transparent">
        <div className="relative mx-auto w-full max-w-2xl">
          <div className="absolute -top-4 -left-4 w-8 h-8 border-t-2 border-l-2 border-[#CCFF00]" />
          <div className="absolute -bottom-4 -right-4 w-8 h-8 border-b-2 border-r-2 border-[#CCFF00]" />
          
          <Card className="rounded-none bg-black border-white/10 overflow-hidden relative shadow-2xl shadow-[#CCFF00]/5">
            <div className="aspect-video relative overflow-hidden bg-[#111] flex items-center justify-center">
              <div className="text-center">
                <Music2 className="w-16 h-16 text-[#CCFF00]/30 mx-auto mb-4" />
                <div className="text-white/40 text-sm font-bold uppercase tracking-widest">
                  No song playing
                </div>
                <div className="text-white/20 text-xs mt-2">
                  Add songs to the queue to get started
                </div>
              </div>
            </div>
            <div className="p-6 bg-[#111] border-t border-white/10">
              <div className="mb-4">
                <h2 className="text-2xl font-black tracking-widest uppercase text-white/30">
                  WAITING...
                </h2>
                <p className="text-white/20 text-sm font-bold uppercase tracking-widest">
                  ADD SONGS TO QUEUE
                </p>
              </div>
            </div>
          </Card>
        </div>
      </section>
    )
  }

  // YouTube embed URL - show video for host, thumbnail for others
  const youtubeEmbedUrl = isHost
    ? `https://www.youtube.com/embed/${currentSong.extractedId}?autoplay=1&mute=${isMuted ? 1 : 0}&controls=1&rel=0&enablejsapi=1`
    : null

  return (
    <section className="lg:col-span-7 border-r border-white/10 p-8 flex flex-col justify-center bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] from-white/2 to-transparent">
      <div className="relative mx-auto w-full max-w-2xl group">
        <div className="absolute -top-4 -left-4 w-8 h-8 border-t-2 border-l-2 border-[#CCFF00]" />
        <div className="absolute -bottom-4 -right-4 w-8 h-8 border-b-2 border-r-2 border-[#CCFF00]" />
        
        <Card className="rounded-none bg-black border-white/10 overflow-hidden relative shadow-2xl shadow-[#CCFF00]/5">
          <div className="aspect-video relative overflow-hidden bg-[#111]">
            {/* YouTube video iframe for host - visible with controls */}
            {isHost && youtubeEmbedUrl && (
              <iframe
                key={iframeKey}
                src={youtubeEmbedUrl}
                title={currentSong.title}
                className="absolute inset-0 w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            )}
            
            {/* Display the stored image for non-host users */}
            {!isHost && currentSong.bigImg && (
              <img 
                src={currentSong.bigImg} 
                alt={currentSong.title}
                className="w-full h-full object-cover opacity-80"
              />
            )}
            
            {!isHost && !currentSong.bigImg && (
              <div className="w-full h-full bg-[#111] flex items-center justify-center">
                <Music2 className="w-16 h-16 text-[#CCFF00]/30" />
              </div>
            )}
            
            {/* Scanline overlay effect */}
            <div className="absolute inset-0 pointer-events-none opacity-20 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-size-[100%_2px,3px_100%]" />
            
            {/* Music icon overlay for non-host */}
            {!isHost && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="p-4 rounded-full border border-white/20 bg-black/40 backdrop-blur-sm">
                  <Music2 className="w-12 h-12 text-[#CCFF00] animate-pulse" />
                </div>
              </div>
            )}

            {/* Host badge */}
            {isHost && (
              <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/60 px-3 py-1 border border-[#CCFF00]/30 z-10">
                <Crown className="w-4 h-4 text-[#CCFF00]" />
                <span className="text-xs font-bold text-[#CCFF00] uppercase">Host</span>
              </div>
            )}
          </div>
          
          <div className="p-6 bg-[#111] border-t border-white/10">
            <div className="mb-4">
              <h2 className="text-2xl font-black tracking-widest uppercase text-[#CCFF00] truncate">
                {currentSong.title}
              </h2>
              <p className="text-white/40 text-sm font-bold uppercase tracking-widest">
                ADDED BY: USER #{currentSong.addedById}
              </p>
            </div>
            
            <div className="flex justify-between items-center">
              <div className="flex gap-4 items-center">
                {/* Volume control - only for host */}
                {isHost && (
                  <>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="hover:text-[#CCFF00]"
                      onClick={() => setIsMuted(!isMuted)}
                    >
                      {isMuted ? (
                        <VolumeX className="w-5 h-5" />
                      ) : (
                        <Volume2 className="w-5 h-5" />
                      )}
                    </Button>
                    <div className="w-24 h-1 bg-white/10 my-auto rounded-full relative overflow-hidden">
                      <div 
                        className="absolute inset-y-0 left-0 bg-[#CCFF00]/50 transition-all"
                        style={{ width: isMuted ? '0%' : '70%' }}
                      />
                    </div>
                  </>
                )}
              </div>
              
              <div className="flex items-center gap-6">
                {/* Skip button - only for host */}
                {isHost && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="hover:text-[#CCFF00] flex items-center gap-2 px-4"
                    onClick={handleSkip}
                    title="Skip to next song"
                  >
                    <SkipForward className="w-6 h-6" />
                    <span className="text-xs font-bold uppercase">Next</span>
                  </Button>
                )}
              </div>
            </div>
            
            {/* Non-host message */}
            {!isHost && (
              <div className="text-center text-xs text-white/30 pt-4 border-t border-white/5 mt-4">
                Only the host can control playback
              </div>
            )}
          </div>
        </Card>
      </div>
    </section>
  )
}
