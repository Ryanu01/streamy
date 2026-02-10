import prisma from "@/app/db";
import { authOptions } from "@/app/lib/auth";
import { DownvoteSchema } from "@/app/utils/types";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST (req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if(!session) {
            return NextResponse.json({
                message: "Unauthorized"
            }, {
                status: 401
            })
        }

        const body = await req.json()
        const { success, data } = DownvoteSchema.safeParse(body)

        if(!success) {
            return NextResponse.json({
                message: "Invalid data while down voting"
            }, {
                status: 400
            })
        }

        const songExist = await prisma.song.findFirst({
            where: {
                id: Number(data.songId)
            }
        })        

        if(!songExist) {
            return NextResponse.json({
                message: "Song does not exist"
            }, {
                status: 404
            })
        }

        const userExistInSpace = await prisma.spaceMember.findFirst({
            where: {
                userId: Number(session?.user.id),
                spaceId: songExist.spaceId
            }
        })

        if(!userExistInSpace) {
            return NextResponse.json({
                message: "Forbiden"
            }, {
                status: 403
            })
        }

        await prisma.upVote.delete({
            where: {
                userId_songId: {
                    userId: Number(session?.user.id),
                    songId: songExist.id
                }
            }
        })

        return NextResponse.json({
            message: "Down vote done"
        })
    } catch (error) {
        return NextResponse.json({
            message: "Error while down vote"
        }, {
            status: 500
        })
    }
}