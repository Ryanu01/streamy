import prisma from "@/app/db";
import { authOptions } from "@/app/lib/auth";
import { CreateSpaceSchema } from "@/app/utils/types";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const { data, success } = CreateSpaceSchema.safeParse(body)

        if (!success) {
            return NextResponse.json({
                message: "Invalid schema while creating space"
            }, {
                status: 400
            })
        }

        const userExist = await prisma.user.findFirst({
            where: {
                id: Number(data.hostId)
            }
        })

        if (!userExist) {
            return NextResponse.json({
                message: "User does not exist"
            }, {
                status: 404
            })
        }

        const space = await prisma.$transaction(async (tnx) => {
            const createSpace = await tnx.space.create({
                data: {
                    hostId: userExist.id,
                    name: data.name
                }
            })

            await tnx.spaceMember.create({
                data: {
                    spaceId: createSpace.id,
                    userId: userExist.id,
                    role: "HOST"
                }
            })

            return createSpace
        })



        return NextResponse.json({
            message: "Space created successfully",
            space
        })
    } catch (error) {
        console.log(error);

        return NextResponse.json({
            message: "Error while creating space"
        }, {
            status: 500
        })
    }
}

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.id) {
            return NextResponse.json({
                message: "Unauthorized"
            }, {
                status: 401
            });
        }

        const spaceDb = await prisma.space.findMany({
            where: {
                hostId: Number(session?.user?.id)
            }
        })

        if(!spaceDb) {
            return NextResponse.json({
                message: "No space found for the user"
            }, {
                status: 404
            })
        }

        return NextResponse.json({
            spaces: spaceDb
        })
    } catch (error) {
        return NextResponse.json({
            message: "Error occured while showing users space"
        }, {
            status: 500
        })
    }
}