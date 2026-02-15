import prisma from "@/app/db";
import { authOptions } from "@/app/lib/auth";
import { LeaveRoomSchema } from "@/app/utils/types";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST (req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.id) {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            );
        }

        const body = await req.json()
        const { success, data } = LeaveRoomSchema.safeParse(body)

        if(!success) {
            return NextResponse.json({
                message: "Invalid Schema while a member tries to leave"
            }, {
                status: 400
            })
        }

        const spaceMember = await prisma.spaceMember.delete({
            where: {
                userId_spaceId: {
                    userId: session?.user?.id,
                    spaceId: Number(data.spaceId)
                }
            }
        })

        return NextResponse.json({
            message: "Remover user"
        })
    } catch (error) {
        return NextResponse.json({ 
            message: "Error checking host status" 
        }, {
             status: 500 
        });
    }
}