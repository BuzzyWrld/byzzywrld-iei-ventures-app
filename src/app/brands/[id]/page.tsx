import Link from "next/link";
import { notFound } from "next/navigation";
import { getBrand } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function BrandProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = getBrand(id);
  if (!project) notFound();

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
