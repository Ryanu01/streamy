"use client"
import { Button } from "@/components/ui/button";
import { Boxes } from "lucide-react";
import { signIn, signOut } from "next-auth/react";
import { ModeToggle } from "./modeToggle";
import SlackIcon from "./ui/slack-icon";

export default function NavBar () {
   
    return <div className="flex justify-between items-center py-4">
        <div className="flex items-center gap-2">
            <div className="flex flex-col gap-4">
            <span className="tracking-tighter text-2xl font-semibold text-primary flex gap-2 items-center">
                <SlackIcon  />
                STREAMY{" "}
            </span>
            </div>
        </div>
        <div>
            <ModeToggle />
        </div>
    </div>
 
}