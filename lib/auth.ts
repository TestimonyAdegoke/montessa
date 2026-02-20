import { NextAuthOptions } from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import AzureADProvider from "next-auth/providers/azure-ad"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials")
        }

        const rawUser = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
          include: {
            Tenant: true,
          },
        })

        if (!rawUser || !rawUser.password) {
          throw new Error("User not found")
        }

        const user = { ...rawUser, tenant: rawUser.Tenant }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password!
        )

        if (!isPasswordValid) {
          throw new Error("Invalid password")
        }

        if (!user.isActive) {
          throw new Error("Account is disabled")
        }

        if (user.tenant.status !== "ACTIVE") {
          throw new Error("Tenant account is not active")
        }

        // Update last login
        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        })

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
          tenantId: user.tenantId,
        }
      },
    }),
    // Google SSO
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            allowDangerousEmailAccountLinking: true,
          }),
        ]
      : []),
    // Microsoft SSO
    ...(process.env.AZURE_AD_CLIENT_ID && process.env.AZURE_AD_CLIENT_SECRET && process.env.AZURE_AD_TENANT_ID
      ? [
          AzureADProvider({
            clientId: process.env.AZURE_AD_CLIENT_ID,
            clientSecret: process.env.AZURE_AD_CLIENT_SECRET,
            tenantId: process.env.AZURE_AD_TENANT_ID,
            allowDangerousEmailAccountLinking: true,
          }),
        ]
      : []),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session, account }) {
      if (user) {
        token.id = user.id
        // For OAuth users, look up role/tenantId from DB
        if (account && account.provider !== "credentials") {
          const dbUser = await prisma.user.findUnique({
            where: { email: user.email! },
            select: { id: true, role: true, tenantId: true },
          })
          if (dbUser) {
            token.id = dbUser.id
            token.role = dbUser.role
            token.tenantId = dbUser.tenantId
          }
        } else {
          token.role = user.role
          token.tenantId = user.tenantId
        }
      }

      if (trigger === "update" && session) {
        token = { ...token, ...session }
      }

      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.tenantId = token.tenantId as string
      }

      return session
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
}
