import type { Metadata } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import { ShellFrame } from "@/components/ShellFrame";
import { currentTenant } from "@/lib/current-tenant";
import type { Tenant } from "@/lib/tenants";
import { currentUser } from "@/lib/auth";
import "./globals.css";

function userInitials(name: string): string {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() ?? "").join("") || "?";
}

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
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
      className={`${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable}`}
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
