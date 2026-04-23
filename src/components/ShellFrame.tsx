"use client";

import { usePathname } from "next/navigation";
import { NavBar } from "./NavBar";
import { Footer } from "./Footer";

const BARE_ROUTES = ["/login", "/signup"];

export function ShellFrame({
  children,
  userInitials,
  userEmail,
}: {
  children: React.ReactNode;
  userInitials?: string;
  userEmail?: string;
}) {
  const pathname = usePathname();
  const bare = BARE_ROUTES.some((p) => pathname.startsWith(p));

  if (bare) {
    return <>{children}</>;
  }

  return (
    <>
      <NavBar initials={userInitials ?? "?"} email={userEmail} />
      <main className="flex-1 max-w-[1280px] w-full mx-auto px-5 md:px-6 py-10">
        {children}
      </main>
      <Footer />
    </>
  );
}
