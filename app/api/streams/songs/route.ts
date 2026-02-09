import prisma from "@/app/db";
import { authOptions } from "@/app/lib/auth";
import { AddSongSchema } from "@/app/utils/types";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

var YT_REGEX = /^(?:https?:\/\/)?(?:www\.)?(?:m\.)?(?:youtube\.com\/(?:watch\?(?!.*\blist=)(?:.*&)?v=|embed\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})(?:[?&]\S+)?$/;


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

        const { success, data } = AddSongSchema.safeParse(body)

        if(!success) {
            return NextResponse.json({
                message: "Invalid schema for adding song"
            }, {
                status: 400
            })
        }

        const spaceExist = await prisma.space.findFirst({
            where: {
                id: Number(data.spaceId)
            }
        })

        if(!spaceExist) {
            return NextResponse.json({
                message: "Space does not exist"
            }, {
                status: 404
            })
        }

        const userIsTheSpaceMember = await prisma.spaceMember.findFirst({
            where: {
                spaceId: spaceExist.id,
                userId: Number(session?.user.id)
            }
        })

        if(!userIsTheSpaceMember) {
            return NextResponse.json({
                message: "Forbidden"
            }, {
                status: 403
            })
        }

        const isYt = data.url.match(YT_REGEX)

        if(!isYt) {
            return NextResponse.json({
                message: "Wrong url"
            }, {
                status: 400
            })
        }

        const extractedId = data.url.split("?v=")[1]

        

        return NextResponse.json({
            message: "Hi"
        })
    } catch (error) {
        return NextResponse.json({
            message: "error"
        }, {
            status: 500
        })
    }
}