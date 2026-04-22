"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function NewBrandPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    const payload = Object.fromEntries(form.entries());

    const res = await fetch("/api/brands", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? `Error ${res.status}`);
      setSubmitting(false);
      return;
    }
    const { project } = await res.json();
    router.push(`/brands/${project.id}`);
  }

  return (
    <div style={{ padding: 24, fontFamily: "system-ui, sans-serif", maxWidth: 640 }}>
      <h1>New Brand — Intake</h1>
      <form onSubmit={onSubmit} style={{ display: "grid", gap: 12, marginTop: 16 }}>
        <Field name="companyName" label="Company name" required />
        <Field name="industry" label="Industry" required />
        <Field name="targetAudience" label="Target audience" required />
        <Field name="toneOfVoice" label="Tone of voice (comma-separated)" required />
        <Field name="competitors" label="Competitors" />
        <Field
          name="archetype"
          label="Brand archetype (hero / sage / creator / caregiver)"
        />
        <Field name="palettePreference" label="Palette preference" />
        <label>
          <div>Notes</div>
          <textarea name="notes" rows={3} style={{ width: "100%" }} />
        </label>
        <button type="submit" disabled={submitting}>
          {submitting ? "Running skill…" : "Generate brand"}
        </button>
        {error && <p style={{ color: "red" }}>{error}</p>}
      </form>
    </div>
  );
}

function Field({
  name,
  label,
  required,
}: {
  name: string;
  label: string;
  required?: boolean;
}) {
  return (
    <label>
      <div>
        {label}
        {required ? " *" : ""}
      </div>
      <input name={name} required={required} style={{ width: "100%" }} />
    </label>
  );
}
