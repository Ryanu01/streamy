
import NavBar from "@/components/NavBar";
import { getServerSession } from "next-auth";
import { useSession } from "next-auth/react";
import { authOptions } from "../lib/auth";

export default async function DashBoard() {

    const session = await getServerSession(authOptions)
    return <div>
        <NavBar text={session?.user ? "Logout" : "Login"}/>
    </div>
}