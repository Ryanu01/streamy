"use client"

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ArrowBigUp, ArrowBigDown, Share2, Plus, ArrowBigUpDash, ArrowBigUpDashIcon } from "lucide-react";
import SlackIcon from '@/components/ui/slack-icon';
import { ModeToggle } from '@/components/modeToggle';
import { signIn, signOut, useSession } from 'next-auth/react';
import { redirect, useRouter } from 'next/navigation';
import { ToolTipcomponent } from '@/components/ToolTipComponent';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { RoomGuard } from "@/app/components/RoomGuard";
import { useCurrentRoom } from "@/app/hooks/useCurrentRoom";
import { EncryptedText } from '@/components/ui/encrypted-text';
import GithubIcon from '@/components/ui/github-icon';
import Link from 'next/link';
import ArrowBigDownDashIcon from '@/components/ui/arrow-big-down-dash-icon';

const LandingPageContent = () => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [roomName, setRoomName] = useState("")
  const [roomId, setRoomId] = useState<String>("")

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const { data: session } = useSession()

  const router = useRouter()

  return (
    <div className="relative min-h-screen bg-[#0B0B0B] text-slate-100 overflow-hidden font-mono">

      <div
        className="pointer-events-none fixed inset-0 z-30 opacity-60"
        style={{
          background: `radial-gradient(600px circle at ${mousePos.x}px ${mousePos.y}px, rgba(204, 255, 0, 0.15), transparent 80%)`,
        }}
      />

      <div className="absolute inset-0 z-10 opacity-20 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)`,
          backgroundSize: '20px 20px',
          imageRendering: 'pixelated'
        }}
      />

      <nav className="relative z-40 flex justify-between items-center p-6 border-b border-white/10 bg-black/50 backdrop-blur-md">
        <span className="flex text-2xl font-black tracking-tighter text-[#CCFF00]">

          <SlackIcon className='w-8 h-8' />{" "}STREAMY

        </span>
        <div className="flex gap-4">
          <div className="pr-5 pt-0.5">
            <Link href={"https://github.com/Ryanu01/streamy"} target='_blank'>
            <GithubIcon  />
            </Link>

          </div>
          {session?.user ? <Button
            onClick={() => {
              signOut()
            }}
            className="bg-[#CCFF00] pt-3 cursor-pointer text-black hover:bg-[#b3e600] rounded-none font-bold">
            Logout
          </Button> : <Button
            onClick={() => {
              signIn()
            }}
            className="bg-[#CCFF00] cursor-pointer text-black hover:bg-[#b3e600] rounded-none font-bold">
            Login
          </Button>}
        </div>
      </nav>

      <main className="relative z-20 container mx-auto px-6 pt-24 pb-12 grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <h1 className="text-7xl md:text-8xl font-black leading-none tracking-tighter mb-6">
            <EncryptedText
            text='THE '
            />
            <EncryptedText
            className="text-[#CCFF00]"
            text='AUX'
            />
            <br />
            <EncryptedText
            text='IS A BATTLEFIELD.'
            />
            
          </h1>
          <p className="text-xl text-slate-400 max-w-md mb-8 border-l-2 border-[#CCFF00] pl-4">
            Create a room. Invite the crew. Upvote the anthems, bury the skips. The crowd decides what plays next.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            {session?.user?.id ?

              <Dialog>

                <DialogTrigger asChild>
                  <Button size="lg" className="h-14 px-8 bg-[#CCFF00] text-black hover:bg-[#b3e600] rounded-none text-lg font-bold shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] active:translate-y-1 active:shadow-none transition-all">
                    START A ROOM
                  </Button>
                </DialogTrigger>

                <DialogContent className="sm:max-w-sm">
                  <DialogHeader>
                    <DialogTitle>
                      Create a Room
                    </DialogTitle>
                    <DialogDescription>
                      Enter the details below to start a new room.
                    </DialogDescription>
                  </DialogHeader>

                  <div className='flex flex-col gap-4 mt-4'>
                    <Input onChange={(e) => {
                      setRoomName(e.target.value)
                    }} placeholder='Room Name' />
                  </div>

                  <DialogFooter className='mt-4'>
                    <Button onClick={async () => {
                      try {
                        const res = await fetch("/api/streams", {
                          method: "POST",
                          headers: {
                            "Content-Type": "application/json",
                          },
                          body: JSON.stringify({
                            hostId: session?.user?.id?.toString(),
                            name: roomName,
                          }),
                        });

                        const data = await res.json();


                        router.push(`main/${data.space.id}`)
                      } catch (error) {
                        console.error("Error creating room:", error);
                      }

                    }} className='bg-[#CCFF00] text-black'>Create Room</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              : <ToolTipcomponent warning='Please sign in'>
                <span>
                  <Button size="lg" disabled={true} className="h-14 px-8 bg-[#CCFF00] text-black hover:bg-[#b3e600] rounded-none text-lg font-bold shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] active:translate-y-1 active:shadow-none transition-all">
                    START A ROOM
                  </Button>
                </span>
              </ToolTipcomponent>
            }
            <div className="flex">
              <Input
                onChange={(e) => {
                  setRoomId(e.target.value)
                }}
                placeholder="ENTER ROOM ID"
                className="h-14 bg-white/5 border-white/10 rounded-none w-48 focus-visible:ring-[#CCFF00]"
              />
              {session?.user.id ?
                <Button disabled={roomId ? false : true} size="lg" variant="outline"  onClick={() => {
                      fetch(`http://localhost:3000/api/streams/members`, {
                        method: "POST",
                        body: JSON.stringify({spaceId: roomId.toString(), userId: session?.user.id.toString()})
                      }).then(res => {
                        return res.json()
                      })

                      router.push(`main/${roomId}`)
                    }} className="h-14 rounded-none border-l-0 border-white/10 hover:bg-[#CCFF00] hover:text-black">
                  JOIN
                </Button> : <ToolTipcomponent warning='Please sign in'>
                  <span>
                    <Button disabled={true} size="lg" variant="outline" className="h-14 rounded-none border-l-0 border-white/10 hover:bg-[#CCFF00] hover:text-black">
                      JOIN
                    </Button>
                  </span>
                </ToolTipcomponent>}
            </div>
          </div>
        </div>

        <div className="relative">
          <div className="absolute -inset-1 bg-[#CCFF00] opacity-20 blur-xl animate-pulse" />
          <Card className="relative bg-[#151515] border-white/10 rounded-none p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-ping" />
                <span className="text-xs font-bold tracking-[0.2em] text-white/50 uppercase">Live Leaderboard</span>
              </div>
              <Share2 className="w-4 h-4 text-[#CCFF00]" />
            </div>

            <div className="space-y-4">
              {[
                { title: "N95", artist: "Kendrick Lamar", votes: 42, active: true },
                { title: "Stop Breathing", artist: "Playboi Carti", votes: 38, active: false },
                { title: "After Hours", artist: "The Weeknd", votes: 12, active: false },
              ].map((song, i) => (
                <div key={i} className={`flex items-center justify-between p-4 border ${song.active ? 'border-[#CCFF00] bg-[#CCFF00]/5' : 'border-white/5 bg-white/2'}`}>
                  <div className="flex items-center gap-4">
                    <span className="text-white/20 font-bold">0{i + 1}</span>
                    <div>
                      <div className="font-bold text-sm">{song.title}</div>
                      <div className="text-xs text-white/40">{song.artist}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right mr-2">
                      <div className={`text-sm font-black ${song.active ? 'text-[#CCFF00]' : ''}`}>{song.votes}</div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <ArrowBigUpDashIcon className={`w-5 h-5 cursor-pointer hover:fill-[#CCFF00] ${song.active ? 'fill-[#CCFF00] text-[#CCFF00]' : 'text-white/20'}`} />
                      <ArrowBigDownDashIcon className="w-5 h-5 text-white/20 cursor-pointer hover:fill-red-500" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Button className="w-full mt-6 bg-white/5 hover:bg-white/10 border-white/10 border rounded-none text-white gap-2">
              <Plus className="w-4 h-4" /> ADD TO QUEUE
            </Button>
          </Card>
        </div>
      </main>
    <footer className="relative z-20 bg-black overflow-hidden mt-12">


  <div className="absolute inset-0 pointer-events-none opacity-10">
    <div className="absolute w-full h-[2px] bg-[#CCFF00] animate-[scan_6s_linear_infinite]" />
  </div>

  <div
    className="absolute inset-0 opacity-[0.04] pointer-events-none"
    style={{
      backgroundImage:
        "linear-gradient(#CCFF00 1px, transparent 1px), linear-gradient(90deg, #CCFF00 1px, transparent 1px)",
      backgroundSize: "40px 40px",
    }}
  />

  <div className="relative container mx-auto px-6 py-8 flex flex-col md:flex-row justify-between items-center gap-6">

    <div className="flex flex-col md:flex-row items-center gap-4 text-center md:text-left">
      <div className="text-xl font-black tracking-tight text-[#CCFF00] glitch">
        STREAMY.exe
      </div>

      <div className="text-xs text-[#CCFF00] opacity-80 animate-pulse">
        ▍LIVE SIGNAL
      </div>
    </div>

    <div className="flex items-center gap-6 text-sm text-white/40">
  <Link
    href="https://github.com/Ryanu01"
    target="_blank"
    className="group relative"
  >
    <span className="group-hover:text-[#CCFF00] transition">
      GitHub
    </span>
    <span className="absolute left-0 -bottom-1 h-[1px] w-0 bg-[#CCFF00] group-hover:w-full transition-all duration-300" />
  </Link>

  <Link
    href="https://x.com/Ryangomes0109"
    target="_blank"
    className="group relative"
  >
    <span className="group-hover:text-[#CCFF00] transition">
      X
    </span>
    <span className="absolute left-0 -bottom-1 h-[1px] w-0 bg-[#CCFF00] group-hover:w-full transition-all duration-300" />
  </Link>
</div>


    <div className="text-xs text-white/20">
      © {new Date().getFullYear()} STREAMY
    </div>

  </div>
</footer>

    </div>
  );
};

const LandingPage = () => {
  return (
    <RoomGuard allowedWhenInRoom={false}>
      <LandingPageContent />
    </RoomGuard>
  );
};

export default LandingPage;
