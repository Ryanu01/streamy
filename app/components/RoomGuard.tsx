"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCurrentRoom } from "@/app/hooks/useCurrentRoom";

interface RoomGuardProps {
  children: React.ReactNode;
  allowedWhenInRoom?: boolean;
  redirectTo?: string;
}

 
export function RoomGuard({ 
  children, 
  allowedWhenInRoom = true,
  redirectTo 
}: RoomGuardProps) {
  const router = useRouter();
  const { currentRoomId, isLoading, isInRoom } = useCurrentRoom();

  useEffect(() => {
    if (isLoading) return;

    const inRoom = isInRoom();

 
    if (inRoom && !allowedWhenInRoom) {
      router.push(`/main/${currentRoomId}`);
      return;
    }

    if (!inRoom && allowedWhenInRoom && redirectTo) {
      router.push(redirectTo);
      return;
    }
  }, [isLoading, isInRoom, allowedWhenInRoom, currentRoomId, redirectTo, router]);

 
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0B0B0B] flex items-center justify-center">
        <div className="text-[#CCFF00] text-sm font-bold uppercase tracking-widest">
          Loading...
        </div>
      </div>
    );
  }


  if (!allowedWhenInRoom && isInRoom()) {
    return (
      <div className="min-h-screen bg-[#0B0B0B] flex items-center justify-center">
        <div className="text-center">
          <div className="text-[#CCFF00] text-sm font-bold uppercase tracking-widest mb-4">
            Already in a room
          </div>
          <div className="text-white/40 text-xs">
            Redirecting to your room...
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
