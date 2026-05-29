import type { Metadata } from "next";
import { Space_Grotesk, DM_Sans, IBM_Plex_Mono } from "next/font/google";
import { ShellFrame } from "@/components/ShellFrame";
import { currentTenant } from "@/lib/current-tenant";
import type { Tenant } from "@/lib/tenants";
import { currentUser } from "@/lib/auth";
import "./globals.css";

function userInitials(name: string): string {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() ?? "").join("") || "?";
}

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "IEI Ventures",
  description: "AI-powered brand development and lead generation platform",
};

function tenantInlineStyle(tenant: Tenant): string {
  // Only override the role tokens that are non-default. Everything else stays
  // on the values defined in globals.css :root.
  const { colors } = tenant;
  const overrides: Array<[string, string | undefined]> = [
    ["--color-primary", colors.primary],
    ["--color-accent", colors.accent],
    ["--color-surface", colors.surface],
    ["--color-surface-2", colors.surface2],
    ["--color-text", colors.text],
    ["--color-text-muted", colors.textMuted],
    ["--color-border", colors.border],
  ];
  const decls = overrides
    .filter(([, v]) => typeof v === "string" && v.length > 0)
    .map(([k, v]) => `${k}:${v}`)
    .join(";");
  return `:root{${decls}}`;
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [tenant, user] = await Promise.all([currentTenant(), currentUser()]);
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${dmSans.variable} ${ibmPlexMono.variable}`}
      data-tenant={tenant.slug}
    >
      <head>
        <style dangerouslySetInnerHTML={{ __html: tenantInlineStyle(tenant) }} />
      </head>
      <body className="min-h-screen flex flex-col">
        <ShellFrame
          userInitials={user ? userInitials(user.name) : undefined}
          userEmail={user?.email}
        >
          {children}
        </ShellFrame>
      </body>
    </html>
  );
}
