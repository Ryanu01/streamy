"use client"
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  ArrowBigUp, 
  ArrowBigDown, 
  Music2, 
  SkipForward,
  Volume2,
  Lock
} from "lucide-react";
import SlackIcon from '@/components/ui/slack-icon';
import { Header } from '@/components/MainHeader';
import { VideoPlayer } from '@/components/VideoPlayer';

const RoomPage = () => {
  // Mock State for the "Now Playing"
  const [votes, setVotes] = useState(128);

  return (
    <div className="min-h-screen bg-[#0B0B0B] text-slate-100 font-mono overflow-hidden">
      <Header />
      <VideoPlayer />
    </div>
  );
};

export default RoomPage;