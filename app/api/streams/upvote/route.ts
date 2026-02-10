import prisma from "@/app/db";
import { authOptions } from "@/app/lib/auth";
import { UpvoteSchema } from "@/app/utils/types";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST (req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        const body = await req.json()

        const { success, data } = UpvoteSchema.safeParse(body)

        if(!session) {
            return NextResponse.json({
                message:  "Unauthenticated"
            }, {
                status: 403
            })
        }
        
        if(!success) {
            return NextResponse.json({
                message: "Wrong inputs to upvote song"
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
                spaceId: songExist.spaceId,
                userId: Number(session?.user.id)
            }
        })

        if(!userExistInSpace) {
            return NextResponse.json({
                message: "Forbiden"
            }, {
                status: 403
            })
        }

        const upVoteDb = await prisma.upVote.create({
            data: {
                songId: songExist.id,
                userId: Number(session?.user.id)
            }
        })

        return NextResponse.json({
            upVoteDb
        })
    } catch (error) {
        return NextResponse.json({
            message: "Error occured while upvote"
        }, {
            status: 500
        })
    }
}