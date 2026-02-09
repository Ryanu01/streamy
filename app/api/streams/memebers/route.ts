import prisma from "@/app/db";
import { AddMemberSchema } from "@/app/utils/types";
import { NextRequest, NextResponse } from "next/server";

export async function POST (req: NextRequest) {
    try {
        const body = await req.json()

        const { success, data } = AddMemberSchema.safeParse(body)

        if(!success) {
            return NextResponse.json({
                message: "Invalid Schema while adding member"
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
                message: "SPACE NOT FOUND"
            }, {
                status: 404
            })
        }

        const userExist = await prisma.user.findFirst({
            where: {
                id: Number(data.userId)
            }
        })

        if(!userExist) {
            return NextResponse.json({
                message: "User does not exist"
            }, {
                status: 404
            })
        }

        const memberDb = await prisma.spaceMember.create({
            data: {
                userId: userExist.id,
                spaceId: Number(data.spaceId)
            }
        })

        return NextResponse.json({
            members: memberDb,
            message: "User added"
        })
    } catch (error) {
        return NextResponse.json({
            message: "Error while adding user to space"
        }, {
            status: 500
        })
    }
}

export async function GET (req: NextRequest) {
    try {
        const spaceId = req.nextUrl.searchParams.get("spaceId");

        const spaceExist = await prisma.space.findFirst({
            where: {
                id: Number(spaceId)
            }
        })

        if(!spaceExist) {
            return NextResponse.json({
                message: "Space does not exist"
            }, {
                status: 404
            })
        }

        const memberCount = await prisma.spaceMember.count({
            where: {
                spaceId: spaceExist.id
            }
        })

        return NextResponse.json({
            memberCount
        })        
    } catch (error) {
        return NextResponse.json({
            message: "Error while getting member count"
        }, {
            status: 500
        })
    }
}