import GoogleProvider from "next-auth/providers/google";
import prisma from "../db";

export const authOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID ?? "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? ""
        })
    ], 
    callbacks: {
        async signIn({user, account}: any) {
            try {
                if(account.provider === "google") {

                    if(!user.email) {
                        return false
                    }

                    await prisma.user.upsert({
                        where: {
                                email: user.email
                            },
                            update: {
                                name: user.name
                            },
                            create: {
                                name: user.name,
                                email: user.email,
                                authType: "google"
                            }
                    })
                }
                return true
            } catch (error) {
                console.log(error);
                return false
            }
        },
        async jwt ({token, account}: any) {
            try {
                if(account?.provider === "google") {
                    const dbUser = await prisma.user.findUnique({
                        where: {
                            email: token.email
                        }
                    })

                    if(!dbUser) {
                        return null;
                    }

                    token.id = dbUser.id
                }

                return token
            } catch (error) {
                console.log(error);
                return false
                   
            }
        }, 
        async session ({session, token}: any) {
            if(session.user) {
                session.user.id = token.id
            }
            return session
        }
    }
}