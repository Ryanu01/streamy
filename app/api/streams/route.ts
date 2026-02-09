import prisma from "@/app/db";
import { CreateSpaceSchema } from "@/app/utils/types";
import { NextRequest, NextResponse } from "next/server";

export async function POST (req: NextRequest) {
    try {
        const body = await req.json()
        const { data, success } = CreateSpaceSchema.safeParse(body)
        
        if(!success) {
            return NextResponse.json({
                message: "Invalid schema while creating space"
            }, {
                status: 411
            })
        }

        const createSpace = await prisma.space.create({
            data: {
                hostId: Number(data.hostId),
                name: data.name
            }
        })

        return NextResponse.json({
            message: "Space created successfully",
            space: createSpace
        })
    } catch (error) {
        return NextResponse.json({
            message: "Error while creating space"
        }, {
            status: 500
        })
    }
}