import { PrismaAdapter } from "@next-auth/prisma-adapter";
import GoogleProvider from "next-auth/providers/google";
import prisma from "./prisma";
import { PLANS } from "./plans";

// Admin emails get unlimited access without purchasing a plan
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      // On first sign-in, set admin privileges if applicable
      if (user) {
        const isAdmin = ADMIN_EMAILS.includes(user.email?.toLowerCase());
        if (isAdmin) {
          // Grant admin unlimited access
          await prisma.user.update({
            where: { id: user.id },
            data: {
              plan: "admin",
              videosLimit: 999999,
              videosUsed: 0,
            },
          });
        }
        token.id = user.id;
      }

      // Always refresh plan data from DB so changes (upgrades, resets) are reflected
      if (token.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id },
          select: {
            plan: true,
            videosUsed: true,
            videosLimit: true,
            email: true,
          },
        });
        if (dbUser) {
          token.plan = dbUser.plan;
          token.videosUsed = dbUser.videosUsed;
          token.isAdmin = ADMIN_EMAILS.includes(dbUser.email?.toLowerCase());

          // Auto-heal: if DB videosLimit is stale, sync with plan config
          const planConfig = PLANS[dbUser.plan] || PLANS.free;
          const expectedLimit = token.isAdmin ? 999999 : planConfig.videosPerMonth;
          if (dbUser.videosLimit !== expectedLimit) {
            await prisma.user.update({
              where: { id: token.id },
              data: { videosLimit: expectedLimit },
            });
            token.videosLimit = expectedLimit;
          } else {
            token.videosLimit = dbUser.videosLimit;
          }
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.plan = token.plan;
        session.user.videosUsed = token.videosUsed;
        session.user.videosLimit = token.videosLimit;
        session.user.isAdmin = token.isAdmin || false;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
