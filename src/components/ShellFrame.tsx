"use client";

import { usePathname } from "next/navigation";
import { NavBar } from "./NavBar";
import { Footer } from "./Footer";

const BARE_ROUTES = ["/login", "/signup"];

export function ShellFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const bare = BARE_ROUTES.some((p) => pathname.startsWith(p));

  if (bare) {
    return <>{children}</>;
  }

  return (
    <>
      <NavBar />
      <main className="flex-1 max-w-[1280px] w-full mx-auto px-5 md:px-6 py-10">
        {children}
      </main>
      <Footer />
    </>
  );
}
