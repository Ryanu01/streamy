"use client"
import { Button } from "@/components/ui/button";
import { Boxes } from "lucide-react";
import { signIn, signOut, useSession } from "next-auth/react";
import { ModeToggle } from "./modeToggle";
import SlackIcon from "./ui/slack-icon";
import GithubIcon from "./ui/github-icon";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function NavBar() {
    const { data: session } = useSession()
    const router = useRouter()
    return <nav className="relative font-mono z-40 flex justify-between items-center p-6 border-b border-white/10 bg-black/50 backdrop-blur-md">
        <span className="flex cursor-pointer  text-3xl font-black tracking-tighter text-[#CCFF00]"
            onClick={() => {
                router.push("landing")
            }} 
        >
            <SlackIcon className='w-8 h-8' />{" "}STREAMY

        </span>
        <div className="flex gap-4">
            <div className="pr-5 pt-0.5">
                <Link href={"https://github.com/Ryanu01/streamy"} target='_blank'>
                    <GithubIcon />
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

}