import NextAuth from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: number   // 👈 use number because yours is 1
      name?: string | null
      email?: string | null
      image?: string | null
    }
  }
}
