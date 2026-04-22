import Link from "next/link";
import { listBrands } from "@/lib/db";

export const dynamic = "force-dynamic";

export default function Home() {
  const brands = listBrands();
  return (
    <div style={{ padding: 24, fontFamily: "system-ui, sans-serif" }}>
      <h1>IEI Ventures — Projects</h1>
      <p>
        <Link href="/new">+ New brand</Link>
      </p>
      {brands.length === 0 ? (
        <p>No projects yet.</p>
      ) : (
        <ul>
          {brands.map((b) => (
            <li key={b.id}>
              <Link href={`/brands/${b.id}`}>{b.intake.companyName}</Link>{" "}
              <small>
                [{b.status}] — {b.intake.industry} —{" "}
                {new Date(b.createdAt).toLocaleString()}
              </small>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
