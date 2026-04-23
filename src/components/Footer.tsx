import Link from "next/link";
import { IeiMark } from "./IeiMark";

export function Footer() {
  return (
    <footer className="border-t mt-12" style={{ borderColor: "var(--color-border)" }}>
      <div className="max-w-[1280px] mx-auto px-5 md:px-6 py-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <IeiMark size="sm" />
          <span className="font-mono text-xs" style={{ color: "var(--color-text-muted)" }}>
            © 2026 IEI Ventures
          </span>
        </div>
        <nav
          className="flex items-center gap-5 text-sm"
          style={{ color: "var(--color-text-muted)" }}
          aria-label="Footer"
        >
          <Link href="/docs" className="hover:text-[var(--color-text)]">
            Docs
          </Link>
          <a href="https://github.com/hbarbosa25/IEI-Ventures" className="hover:text-[var(--color-text)]">
            GitHub
          </a>
          <Link href="/contact" className="hover:text-[var(--color-text)]">
            Contact
          </Link>
          <Link href="/privacy" className="hover:text-[var(--color-text)]">
            Privacy
          </Link>
        </nav>
      </div>
    </footer>
  );
}
