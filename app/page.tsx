"use client"
import { motion } from "framer-motion";
import NavBar from "@/components/NavBar";
import { redirect, useRouter } from "next/navigation";

export default async function Home() {
    const router = useRouter()
    return <div className="max-w-7xl mx-auto flex flex-col gap-4 p-4">
        {redirect("/landing")}
        <NavBar/>
    </div>
}