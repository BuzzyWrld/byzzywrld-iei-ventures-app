import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "IEI Ventures",
  description: "AI-powered brand development and lead generation platform",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
