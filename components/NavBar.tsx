"use client"
import { Button } from "@/components/ui/button";
import { signIn, signOut } from "next-auth/react";

export default function NavBar ({text}: {
    text: string
}) {
    return <div className="p-8 ">
        <div className="flex justify-between border-b-2">
            <div className="mt-3">
                Streamy
            </div>
            <div>
                {text === "Logout" ? <Button  className="cursor-pointer mb-2"
                
                onClick={() => {
                    signOut()
                }}>
                    {text}
                </Button> : <Button className="cursor-pointer mb-2" onClick={() => {
                    signIn()
                }} size={"lg"} >{text}</Button> }
                
            </div>
        </div>
    </div>
}