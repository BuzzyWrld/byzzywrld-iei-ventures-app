import Link from "next/link";
import { listContentRuns } from "@/lib/db";
import { currentTenant } from "@/lib/current-tenant";
import { currentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import type { ContentRun, ContentRunStatus } from "@/lib/skills/content-engine-contract";

export const dynamic = "force-dynamic";

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
function formatShortDate(iso: string): string {
  const d = new Date(iso);
  return `${MONTHS[d.getMonth()]} ${d.getUTCDate()}, ${d.getFullYear()}`;
}

function statusLabel(s: ContentRunStatus): string {
  const map: Record<ContentRunStatus, string> = {
    pending: "Pending",
    analysis: "Analysing",
    week_1: "Week 1",
    week_1_review: "Review W1",
    week_2: "Week 2",
    week_2_review: "Review W2",
    week_3: "Week 3",
    week_3_review: "Review W3",
    week_4: "Week 4",
    week_4_review: "Review W4",
    complete: "Complete",
    failed: "Failed",
  };
  return map[s] ?? s;
}

function runProgress(run: ContentRun): string {
  const w = run.outputs.weeks.filter((wk) => wk.status === "approved").length;
  if (run.status === "complete") return "84 assets";
  if (w > 0) return `${w}/4 weeks approved`;
  return run.progressStage ?? "—";
}

export default async function ContentEnginePage() {
  const user = await currentUser();
  if (!user) redirect("/login");
  const tenant = await currentTenant();
  const runs = listContentRuns({ tenantId: tenant.id, userId: user.id });

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
        <div>
          <div className="kicker mb-1">Content Engine · {tenant.displayName}</div>
          <h1 className="text-[28px] md:text-[32px] font-medium tracking-tight leading-tight">
            Calendar Runs
          </h1>
        </div>
        <Link href="/content-engine/new" className="btn btn-primary">
          New calendar
        </Link>
      </div>

      {runs.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          {/* Desktop table */}
          <div className="card hidden md:block overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: "var(--color-surface-2)" }}>
                  <Th className="pl-5 pr-3">Run</Th>
                  <Th className="px-3">Status</Th>
                  <Th className="px-3 hidden lg:table-cell">Created</Th>
                  <Th className="px-3 hidden lg:table-cell">Progress</Th>
                  <th className="py-2.5 pl-3 pr-5" />
                </tr>
              </thead>
              <tbody>
                {runs.map((r) => (
                  <TableRow key={r.id} run={r} />
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile */}
          <div className="md:hidden flex flex-col gap-3">
            {runs.map((r) => (
              <MobileCard key={r.id} run={r} />
            ))}
          </div>
        </>
      )}
    </>
  );
}

function Th({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <th
      className={`text-left font-mono text-[10.5px] uppercase tracking-[0.14em] py-2.5 ${className}`}
      style={{ color: "var(--color-text-muted)", fontWeight: 500 }}
    >
      {children}
    </th>
  );
}

function StatusBadge({ status }: { status: ContentRunStatus }) {
  const badgeClass =
    status === "complete"
      ? "badge-complete"
      : status === "failed"
      ? "badge-failed"
      : status.endsWith("_review")
      ? "badge-review"
      : "badge-running";

  return <span className={`badge ${badgeClass}`}>{statusLabel(status)}</span>;
}

function TableRow({ run: r }: { run: ContentRun }) {
  return (
    <tr className="border-t" style={{ borderColor: "var(--color-border)" }}>
      <td className="p-0">
        <Link
          href={`/content-engine/${r.id}`}
          className="group flex w-full items-center hover:bg-[var(--color-surface-2)]"
        >
          <div className="flex items-center gap-3 py-3 pl-5 pr-3 w-full">
            <div
              className="w-8 h-8 rounded flex items-center justify-center font-mono text-xs font-bold shrink-0"
              style={{ background: "var(--color-surface-2)", color: "var(--color-accent)" }}
            >
              CE
            </div>
            <div>
              <div className="font-medium tracking-tight">
                {r.intake.label ?? "Untitled Calendar"}
              </div>
              <div className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                {r.id.slice(0, 8)}
              </div>
            </div>
          </div>
        </Link>
      </td>
      <td className="py-3 px-3">
        <StatusBadge status={r.status} />
      </td>
      <td
        className="py-3 px-3 hidden lg:table-cell font-mono text-xs"
        style={{ color: "var(--color-text-muted)" }}
      >
        {formatShortDate(r.createdAt)}
      </td>
      <td
        className="py-3 px-3 hidden lg:table-cell font-mono text-xs"
        style={{ color: "var(--color-text-muted)" }}
      >
        {runProgress(r)}
      </td>
      <td className="py-3 pl-3 pr-5 text-right">
        <Link
          href={`/content-engine/${r.id}`}
          className="font-mono text-xs"
          style={{ color: "var(--color-text-muted)" }}
        >
          Open →
        </Link>
      </td>
    </tr>
  );
}

function MobileCard({ run: r }: { run: ContentRun }) {
  return (
    <Link href={`/content-engine/${r.id}`} className="card card-hover block p-4">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div
          className="w-8 h-8 rounded flex items-center justify-center font-mono text-xs font-bold shrink-0"
          style={{ background: "var(--color-surface-2)", color: "var(--color-accent)" }}
        >
          CE
        </div>
        <StatusBadge status={r.status} />
      </div>
      <div className="font-medium tracking-tight">{r.intake.label ?? "Untitled Calendar"}</div>
      <div
        className="mt-3 font-mono text-[11px] flex justify-between"
        style={{ color: "var(--color-text-muted)" }}
      >
        <span>{formatShortDate(r.createdAt)}</span>
        <span>{runProgress(r)}</span>
      </div>
    </Link>
  );
}

function EmptyState() {
  return (
    <div className="max-w-xl mx-auto text-center py-16">
      <div
        className="w-16 h-16 rounded-xl flex items-center justify-center font-mono text-xl font-bold mx-auto mb-8"
        style={{ background: "var(--color-surface-2)", color: "var(--color-accent)" }}
      >
        CE
      </div>
      <h1
        className="font-serif mt-0 mb-3"
        style={{ fontSize: 36, lineHeight: 1.05 }}
      >
        No calendar runs yet.
      </h1>
      <p className="text-sm mb-8" style={{ color: "var(--color-text-muted)" }}>
        Generate a 4-week content calendar — 84 production-ready assets across video scripts,
        GEO articles, and LinkedIn posts.
      </p>
      <Link href="/content-engine/new" className="btn btn-primary btn-lg">
        Start your first calendar
      </Link>
    </div>
  );
}
