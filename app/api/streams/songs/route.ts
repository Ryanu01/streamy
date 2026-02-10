import prisma from "@/app/db";
import { authOptions } from "@/app/lib/auth";
import { AddSongSchema } from "@/app/utils/types";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { GetVideoDetails } from "youtube-search-api";

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
        const result = await GetVideoDetails(extractedId)
        const thumbnails = result.thumbnail.thumbnails


        thumbnails.sort((a: {width: number}, b: {width: number}) => a.width < b.width ? -1 : 1 )

        const songDb = await prisma.song.create({
            data: {
                spaceId: spaceExist.id,
                addedById: Number(session?.user.id),
                extractedId,
                title: result.title,
                smallImg: thumbnails.length > 1 ? thumbnails[thumbnails.length - 2].url : thumbnails[thumbnails.length - 1].url ?? "https://imgs.search.brave.com/QpSeSwiufBTr4QlTzZrh9lSQW2HmMxceS0avU2ZhVX8/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9tYXJr/ZXRwbGFjZS5jYW52/YS5jb20vTUFER3h2/SE1JQjAvNC90aHVt/Ym5haWxfbGFyZ2Uv/Y2FudmEtY2xvc2Ut/dXAtcGhvdG8tb2Yt/YS1mdW5ueS1jYXQt/TUFER3h2SE1JQjAu/anBn",
                bigImg: thumbnails[thumbnails.length - 1].url ??  "https://imgs.search.brave.com/QpSeSwiufBTr4QlTzZrh9lSQW2HmMxceS0avU2ZhVX8/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9tYXJr/ZXRwbGFjZS5jYW52/YS5jb20vTUFER3h2/SE1JQjAvNC90aHVt/Ym5haWxfbGFyZ2Uv/Y2FudmEtY2xvc2Ut/dXAtcGhvdG8tb2Yt/YS1mdW5ueS1jYXQt/TUFER3h2SE1JQjAu/anBn"
            }
        })



        return NextResponse.json({
            songDb
        })
    } catch (error) {
        console.log(error);
        
        return NextResponse.json({
            error,
            message: "error"
        }, {
            status: 500
        })
    }
}

export async function GET (req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if(!session) {
            return NextResponse.json({
                message: "Unauthorized"
            }, {
                status: 401
            })           
        }

        const spaceId = req.nextUrl.searchParams.get("spaceId")

        if(!spaceId) {
            return NextResponse.json({
            message: "No Creator ID"
        }, {
            status: 400
        })
        }

        const currentUserId = Number(session?.user.id)
        const [streams, acitveStreams] = await Promise.all([
            await prisma.song.findMany({
                where: {
                    spaceId: Number(spaceId),
                    played: false
                }, include: {
                    _count: {
                        select: {
                            upVotes: true
                        }
                    },

                    upVotes: currentUserId ?  {
                        where: {
                            userId: currentUserId
                        }
                    } : false
                } 
            }), prisma.currentStream.findFirst({
                where: {
                    spaceId: Number(spaceId)
                }, include: {
                    song: true
                }
            })
        ])

        if(!streams.length) {
            return NextResponse.json({
                message: "Unable to fetch streams for this spaceId",
                spaceId
            }, {
                status: 400
            })
        }

        return NextResponse.json({
            streams: streams.map(({_count, ...rest}) => ({
                ...rest,
                upVotes: _count.upVotes,
                haveUpVoted: rest.upVotes.length ? true : false
            })), 
            acitveStreams
        })
    } catch (error) {
        
    }
}