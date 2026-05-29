"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { IeiMark } from "@/components/IeiMark";
import { useBrandBuildStore } from "@/lib/store";

export default function BuildingPage() {
  const router = useRouter();
  const store = useBrandBuildStore();
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!store.buildId) {
      // No build started — redirect back
      router.replace("/new");
      return;
    }

    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/build/status/${store.buildId}`);
        if (!res.ok) return;
        const data = await res.json();

        store.setBuildProgress(data.progress ?? 0, data.current_step ?? "");

        if (data.status === "ready") {
          store.setBuildStatus("ready");
          if (data.brand_json) {
            store.setBrandJson(data.brand_json);
          }
          if (pollRef.current) clearInterval(pollRef.current);
          router.push("/dashboard");
        } else if (data.status === "error") {
          store.setBuildStatus("error");
          if (pollRef.current) clearInterval(pollRef.current);
        }
      } catch {
        // Keep polling
      }
    }, 3000);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [store.buildId]);

  const progressPct = Math.round(store.buildProgress * 100);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6"
      style={{ background: "var(--black)" }}
    >
      <IeiMark size="lg" />

      {/* Waveform animation */}
      <div className="flex items-end gap-1 my-8" style={{ height: 48 }}>
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="waveform-bar"
            style={{
              width: 4,
              background: "var(--yellow)",
              borderRadius: 2,
              animationDelay: `${i * 0.1}s`,
            }}
          />
        ))}
      </div>

      <h1
        className="font-display text-center mb-2"
        style={{ fontSize: 28, fontWeight: 700, color: "var(--chalk)" }}
      >
        Building your foundation.
      </h1>
      <p className="text-sm text-center mb-6" style={{ color: "var(--ash)" }}>
        About 90 seconds. We&apos;re generating your brand identity, voice, and assets.
      </p>

      {/* Progress bar */}
      <div
        className="w-full max-w-[300px] mb-4"
        style={{ height: 4, background: "var(--slate)", borderRadius: "var(--r-full)" }}
      >
        <div
          style={{
            width: `${progressPct}%`,
            height: "100%",
            background: "var(--yellow)",
            borderRadius: "var(--r-full)",
            transition: "width 500ms ease",
          }}
        />
      </div>

      {store.buildStep && (
        <p className="font-mono text-xs" style={{ color: "var(--yellow)" }}>
          {store.buildStep}
        </p>
      )}

      {store.buildStatus === "error" && (
        <div className="mt-6 p-4 rounded-lg text-sm text-center" style={{ background: "rgba(248,113,113,0.1)", border: "1px solid var(--red)", color: "var(--red)" }}>
          Something went wrong. <button onClick={() => router.push("/new")} className="underline">Try again</button>
        </div>
      )}

      <style>{`
        @keyframes wave {
          0%, 100% { height: 8px; }
          50% { height: 36px; }
        }
        .waveform-bar {
          animation: wave 1.2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
