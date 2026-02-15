import prisma from "@/app/db";
import { authOptions } from "@/app/lib/auth";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET (req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        const spaceId = req.nextUrl.searchParams.get("spaceId");
        if(!session?.user.id) {
            return NextResponse.json({
            message: "Unauthorizead"
            }, {
                status: 403
            })
        }

        const currentStream = await prisma.currentStream.findFirst({
            where: {
                spaceId: Number(spaceId)
            }
        });

        if (currentStream) {
            await prisma.song.update({
                where: {
                    id: currentStream.songId
                },
                data: {
                    played: true,
                    playedTs: new Date()
                }
            });
        }

        const mostUpvotedSong = await prisma.song.findFirst({
            where: {
                spaceId: Number(spaceId),
                played: false
            }, orderBy: {
                upVotes: {
                    _count: "desc"
                }
            }
        })

        if(!mostUpvotedSong) {
            await prisma.currentStream.delete({
                where: {
                    spaceId: Number(spaceId)
                }
            }).catch(() => {
                // Ignore if doesn't exist
            });
            
            return NextResponse.json({
                message: "No more songs in queue"
            }, {
                status: 411
            })
        }

        await Promise.all([
            prisma.currentStream.upsert({
                where: {
                    spaceId: Number(spaceId)
                }, update: {
                    songId: mostUpvotedSong.id
                }, create: {
                    spaceId: Number(spaceId),
                    songId: mostUpvotedSong.id
                }
            }),
            prisma.upVote.deleteMany({
                where: {
                    songId: mostUpvotedSong.id
                }
            })
        ])

        return NextResponse.json({
            mostUpvotedSong
        })
    } catch (error) {
        return NextResponse.json({
            message: "Error while fetching next song"
        }, {
            status: 500
        })
    }
}
