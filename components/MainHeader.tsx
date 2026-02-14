"use client"

import {  Share2, Users2 } from "lucide-react"
import { Badge } from "@/components/ui/badge";

import SlackIcon from "./ui/slack-icon"
import { Button } from "./ui/button"

export const Header = () => {
    return <header className="flex justify-between items-center px-8 py-4 border-b border-white/10 bg-black/40 backdrop-blur-xl relative z-50">
        <div className="flex items-center gap-6">
          <span className="flex text-[#CCFF00] font-black tracking-tighter text-xl decoration-2 ">
            <SlackIcon className='w-8 h-8'/>{" "}
            <div className='pt-1'>
                STREAMY
            </div>
          </span>
          <Badge variant="outline" className="rounded-none border-[#CCFF00]/30 text-[#CCFF00] bg-[#CCFF00]/5 gap-2">
            <Users2 className="w-3 h-3" /> 24 LISTENING
          </Badge>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" size="sm" className="rounded-none border-white/10 gap-2 hover:bg-white/5">
            <Share2 className="w-4 h-4" /> INVITE
          </Button>
          <Button size="sm" className="rounded-none bg-red-600 hover:bg-red-700 text-white font-bold">
            LEAVE
          </Button>
        </div>
      </header>
}