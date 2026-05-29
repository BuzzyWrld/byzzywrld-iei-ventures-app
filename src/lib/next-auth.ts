import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { setSession, getSession, getUserById } from "@/lib/auth";
import {
  upsertOAuthUser,
  linkOAuthIdentity,
  ACCOUNT_EXISTS_DIFFERENT_METHOD,
} from "@/lib/db";

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
      // SECURITY: never silently merge OAuth logins into an existing account by
      // email. Linking is handled explicitly in the signIn callback below, and
      // only for an already-authenticated owner.
      allowDangerousEmailAccountLinking: false,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (!user.email) return false;

      // 2) Only trust Google logins whose email is verified by Google.
      if (account?.provider === "google" && profile?.email_verified !== true) {
        console.warn("[auth] rejected Google sign-in with unverified email", {
          email: user.email,
        });
        return false;
      }

      const provider = account?.provider ?? "unknown";
      const providerAccountId = account?.providerAccountId ?? null;

      try {
        const dbUser = await upsertOAuthUser({
          email: user.email,
          name: user.name ?? null,
          image: user.image ?? null,
          provider,
          providerAccountId,
        });
        await setSession(dbUser.id);
        return true;
      } catch (err) {
        // An account with this email exists but the OAuth identity isn't linked.
        if (err instanceof Error && err.message === ACCOUNT_EXISTS_DIFFERENT_METHOD) {
          // Authenticated re-link path: if the visitor is already logged in
          // (iron-session, e.g. via password) AND that session's email matches
          // the OAuth email, they've proven ownership — link safely.
          try {
            const s = await getSession();
            if (s.userId && providerAccountId) {
              const sessionUser = await getUserById(s.userId);
              if (
                sessionUser &&
                sessionUser.email.toLowerCase() === user.email.toLowerCase()
              ) {
                await linkOAuthIdentity({
                  userId: sessionUser.id,
                  provider,
                  providerAccountId,
                  image: user.image ?? null,
                });
                await setSession(sessionUser.id);
                return true;
              }
            }
          } catch (linkErr) {
            console.error("[auth] authenticated link attempt failed", linkErr);
          }

          // Not the authenticated owner → refuse and guide them to log in with
          // their existing method, then link from Settings.
          console.warn("[auth] blocked OAuth auto-link to existing account", {
            email: user.email,
            provider,
          });
          return "/login?error=link_required";
        }

        const stack = err instanceof Error ? err.stack : undefined;
        const message = err instanceof Error ? err.message : String(err);
        console.error("[auth] signIn callback failed", {
          email: user.email,
          provider,
          providerAccountId,
          message,
          stack,
        });
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
