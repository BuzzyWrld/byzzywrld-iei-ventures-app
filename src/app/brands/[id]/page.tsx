"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";
import type { BrandProject } from "@/lib/types";

export default function BrandProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [project, setProject] = useState<BrandProject | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | null = null;

    async function tick() {
      try {
        const res = await fetch(`/api/brands/${id}`);
        if (!res.ok) {
          setError(`HTTP ${res.status}`);
          return;
        }
        const { project } = (await res.json()) as { project: BrandProject };
        if (cancelled) return;
        setProject(project);
        if (project.status === "pending" || project.status === "running") {
          timer = setTimeout(tick, 1500);
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : String(err));
      }
    }
    tick();
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [id]);

  if (error) return <p style={{ padding: 24 }}>Error: {error}</p>;
  if (!project) return <p style={{ padding: 24 }}>Loading…</p>;

  const outputs = Object.entries(project.outputs).filter(
    ([, v]) => typeof v === "string"
  ) as [string, string][];

  return (
    <div style={{ padding: 24, fontFamily: "system-ui, sans-serif", maxWidth: 720 }}>
      <p>
        <Link href="/">← All projects</Link>
      </p>
      <h1>{project.intake.companyName}</h1>
      <p>
        <strong>Status:</strong> {project.status}
        {project.progressStage && (project.status === "running" || project.status === "pending")
          ? ` — ${project.progressStage}${
              project.progressPct ? ` (${Math.round(project.progressPct * 100)}%)` : ""
            }`
          : ""}
        {project.error ? ` — ${project.error}` : ""}
      </p>

      <h2>Intake</h2>
      <pre style={{ background: "#f4f4f4", padding: 12, overflow: "auto" }}>
        {JSON.stringify(project.intake, null, 2)}
      </pre>

      <h2>Outputs</h2>
      {outputs.length === 0 ? (
        <p>No outputs yet.</p>
      ) : (
        <ul>
          {outputs.map(([key, url]) => (
            <li key={key}>
              <a href={url} target="_blank" rel="noreferrer">
                {key}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
