import Link from "next/link";
import { listBrands } from "@/lib/db";
import type { BrandProject } from "@/lib/types";
import { IeiMark } from "@/components/IeiMark";
import { currentTenant } from "@/lib/current-tenant";
import { currentUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];
function formatShortDate(iso: string): string {
  const d = new Date(iso);
  return `${MONTHS[d.getMonth()]} ${d.getUTCDate()}, ${d.getFullYear()}`;
}

function initial(name: string): string {
  return (name.trim()[0] ?? "?").toUpperCase();
}

function outputCount(p: BrandProject): string {
  if (p.status === "running" || p.status === "pending") return "building…";
  if (p.status === "failed") return "—";
  const n = Object.values(p.outputs).filter(Boolean).length;
  return n > 0 ? `${n} files` : "—";
}

export default async function Home() {
  const user = await currentUser();
  if (!user) redirect("/login");
  const tenant = await currentTenant();
  const projects = listBrands({ tenantId: tenant.id, userId: user.id });
  const counts = {
    total: projects.length,
    running: projects.filter((p) => p.status === "running" || p.status === "pending").length,
    complete: projects.filter((p) => p.status === "complete").length,
    failed: projects.filter((p) => p.status === "failed").length,
  };

  if (projects.length === 0) return <EmptyState />;

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <div className="kicker mb-1">Workspace · {tenant.displayName}</div>
          <h1 className="text-[28px] md:text-[32px] font-medium tracking-tight leading-tight">
            Projects
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/new" className="btn btn-primary">
            New brand
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <Stat label="Total" value={counts.total} />
        <Stat label="Running" value={counts.running} colorVar="--color-status-running" />
        <Stat label="Complete" value={counts.complete} colorVar="--color-status-complete" />
        <Stat label="Failed" value={counts.failed} colorVar="--color-status-failed" />
      </div>

      {/* Desktop table */}
      <div className="card hidden md:block overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: "var(--color-surface-2)" }}>
              <Th className="pl-5 pr-3">Project</Th>
              <Th className="px-3 hidden md:table-cell">Status</Th>
              <Th className="px-3 hidden lg:table-cell">Created</Th>
              <Th className="px-3 hidden lg:table-cell">Outputs</Th>
              <th className="py-2.5 pl-3 pr-5" />
            </tr>
          </thead>
          <tbody>
            {projects.map((p) => (
              <TableRow key={p.id} project={p} />
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile list */}
      <div className="md:hidden flex flex-col gap-3">
        {projects.map((p) => (
          <MobileCard key={p.id} project={p} />
        ))}
      </div>
    </>
  );
}

function Stat({ label, value, colorVar }: { label: string; value: number; colorVar?: string }) {
  return (
    <div className="card p-4">
      <div className="kicker mb-1">{label}</div>
      <div
        className="text-2xl font-medium"
        style={colorVar ? { color: `var(${colorVar})` } : undefined}
      >
        {value}
      </div>
    </div>
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

function StatusBadge({ status }: { status: BrandProject["status"] }) {
  const label = status[0].toUpperCase() + status.slice(1);
  return <span className={`badge badge-${status}`}>{label}</span>;
}

function TableRow({ project: p }: { project: BrandProject }) {
  return (
    <tr className="border-t" style={{ borderColor: "var(--color-border)" }}>
      <td className="p-0">
        <Link
          href={`/brands/${p.id}`}
          className="group flex w-full items-center hover:bg-[var(--color-surface-2)]"
        >
          <div className="flex items-center gap-3 py-3 pl-5 pr-3 w-full">
            <IeiMark size="md" label={initial(p.intake.companyName)} style={{ background: "var(--color-surface-2)" }} />
            <div>
              <div className="font-medium tracking-tight">{p.intake.companyName}</div>
              <div className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                {p.intake.industry}
              </div>
            </div>
          </div>
        </Link>
      </td>
      <td className="py-3 px-3 hidden md:table-cell">
        <StatusBadge status={p.status} />
      </td>
      <td
        className="py-3 px-3 hidden lg:table-cell font-mono text-xs"
        style={{ color: "var(--color-text-muted)" }}
      >
        {formatShortDate(p.createdAt)}
      </td>
      <td
        className="py-3 px-3 hidden lg:table-cell font-mono text-xs"
        style={{ color: "var(--color-text-muted)" }}
      >
        {outputCount(p)}
      </td>
      <td className="py-3 pl-3 pr-5 text-right">
        <Link
          href={`/brands/${p.id}`}
          className="font-mono text-xs"
          style={{ color: "var(--color-text-muted)" }}
        >
          Open →
        </Link>
      </td>
    </tr>
  );
}

function MobileCard({ project: p }: { project: BrandProject }) {
  return (
    <Link href={`/brands/${p.id}`} className="card card-hover p-4 block">
      <div className="flex items-start justify-between gap-3 mb-3">
        <IeiMark size="md" label={initial(p.intake.companyName)} style={{ background: "var(--color-surface-2)" }} />
        <StatusBadge status={p.status} />
      </div>
      <div className="font-medium tracking-tight">{p.intake.companyName}</div>
      <div className="text-xs" style={{ color: "var(--color-text-muted)" }}>
        {p.intake.industry}
      </div>
      <div
        className="mt-3 font-mono text-[11px] flex justify-between"
        style={{ color: "var(--color-text-muted)" }}
      >
        <span>{formatShortDate(p.createdAt)}</span>
        <span>{outputCount(p)}</span>
      </div>
    </Link>
  );
}

function EmptyState() {
  return (
    <div className="max-w-xl mx-auto text-center py-16">
      <IeiMark size="lg" />
      <h1
        className="font-serif mt-8 mb-3"
        style={{ fontSize: 40, lineHeight: 1.05 }}
      >
        No projects yet.
      </h1>
      <p className="text-sm mb-8" style={{ color: "var(--color-text-muted)" }}>
        Start a brand build — the intake takes a few minutes.
      </p>
      <Link href="/new" className="btn btn-primary btn-lg">
        Start a brand build
      </Link>
    </div>
  );
}
