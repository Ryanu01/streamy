import { z } from "zod"

export const CreateSpaceSchema = z.object({
    hostId: z.string(),
    name: z.string()
})

export const AddMemberSchema = z.object({
    spaceId: z.string(),
    userId: z.string()
})

export const AddSongSchema = z.object({
    spaceId: z.string(),
    url: z.string()
})