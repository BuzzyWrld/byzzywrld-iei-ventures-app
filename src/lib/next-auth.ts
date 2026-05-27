import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { setSession } from "@/lib/auth";
import { upsertOAuthUser } from "@/lib/db";

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET,
  trustHost: true,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (!user.email) return false;
      try {
        const dbUser = await upsertOAuthUser({
          email: user.email,
          name: user.name ?? null,
          image: user.image ?? null,
          provider: account?.provider ?? "unknown",
          providerAccountId: account?.providerAccountId ?? null,
        });
        await setSession(dbUser.id);
        return true;
      } catch (err) {
        console.error("[auth] signIn callback failed", err);
        return false;
      }
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      if (new URL(url).origin === baseUrl) return url;
      return `${baseUrl}/onboarding`;
    },
  },
});
