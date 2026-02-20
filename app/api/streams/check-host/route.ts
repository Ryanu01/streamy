import prisma from "@/app/db";
import { authOptions } from "@/app/lib/auth";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({
        message: "Unauthorized" 
      },{ 
        status: 401 
      });
    }

    const spaceId = req.nextUrl.searchParams.get("spaceId");
    
    if (!spaceId) {
      return NextResponse.json(
        { message: "Space ID required" },
        { status: 400 }
      );
    }

    const space = await prisma.space.findFirst({
      where: {
        id: Number(spaceId),
      },
      include: {
        spaceMembers: {
          where: {
            userId: Number(session.user.id),
          },
        },
      },
    });

    if (!space) {
      return NextResponse.json(
        { message: "Space not found" },
        { status: 404 }
      );
    }

    const isHost = space.hostId === Number(session.user.id);
    const userRole = space.spaceMembers[0]?.role || null;

    return NextResponse.json({
      isHost,
      userRole,
      hostId: space.hostId,
    });
  } catch (error) {
    console.error("Error checking host status:", error);
    return NextResponse.json(
      { message: "Error checking host status" },
      { status: 500 }
    );
  }
}
