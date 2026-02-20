"use client"
import NavBar from "@/components/NavBar";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface Space {
    name: string;
    id: number;
    hostId: number;
    createdAt: Date;
}

export default function Myspace () {
    const [spaceCount, setSpaceCount] = useState<Space[]>([])
    const { data: session } = useSession();

    useEffect(() => {
        if (session) {
            fetch("/api/streams")
                .then(res => res.json())
                .then(data => {
                    if (data.spaces) {
                        setSpaceCount(data.spaces);
                    }
                });
        }
    }, [session]);

    return (
        <div>
            <NavBar />
            <div className="p-4 sm:p-6 md:p-8">
                <h1 className="text-2xl font-bold mb-4">My Spaces ({spaceCount?.length})</h1>
                {spaceCount.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {spaceCount.map((space) => (
                            <Link href={`/main/${space.id}`} key={space.id} passHref>
                                <Card className="cursor-pointer hover:shadow-lg transition-shadow h-full flex flex-col">
                                    <CardHeader className="grow">
                                        <CardTitle>{space.name}</CardTitle>
                                        <CardDescription>
                                            Created on {new Date(space.createdAt).toLocaleDateString()}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm font-medium">Go to Space</p>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center text-center h-64">
                        <p className="text-muted-foreground">You haven't created any spaces yet.</p>
                        <Link href="/#create-space" passHref>
                           <p className="text-blue-500 hover:underline mt-2">Create one now</p>
                        </Link>
                  </div>
                )}
            </div>
        </div>
    );
}
