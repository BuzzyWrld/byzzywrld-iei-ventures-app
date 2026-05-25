"use client";

import { useRouter } from "next/navigation";
import { IeiMark } from "@/components/IeiMark";
import { useBrandBuildStore } from "@/lib/store";
import { IconMicrophone, IconUpload, IconListDetails } from "@tabler/icons-react";

const MODES = [
  {
    key: "voice" as const,
    icon: IconMicrophone,
    title: "Talk it through",
    description: "Speak naturally about your brand. We'll extract everything we need.",
    tag: "Fastest",
    route: "/new/voice",
  },
  {
    key: "upload" as const,
    icon: IconUpload,
    title: "Upload what you have",
    description: "Drop in a logo, deck, or brand guide. We'll read it and build around it.",
    tag: "Existing Brand",
    route: "/new/upload",
  },
  {
    key: "questionnaire" as const,
    icon: IconListDetails,
    title: "Brand questionnaire",
    description: "9 focused questions. We'll handle the rest with AI inference.",
    tag: "Detailed",
    route: "/new/questionnaire",
  },
];

export default function IntakeModePicker() {
  const router = useRouter();
  const { setIntakeMode, setSessionId, sessionId } = useBrandBuildStore();

  async function handleSelect(mode: (typeof MODES)[number]) {
    setIntakeMode(mode.key);
    // Create a session if one doesn't exist
    if (!sessionId) {
      try {
        const res = await fetch("/api/intake/session", { method: "POST" });
        if (res.ok) {
          const data = await res.json();
          setSessionId(data.session_id);
        }
      } catch {}
    }
    router.push(mode.route);
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--black)" }}>
      <nav className="px-6 py-4">
        <IeiMark size="sm" />
      </nav>

      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-[820px] text-center">
          <div className="kicker mb-3" style={{ color: "var(--yellow)" }}>
            HELP YOU TAKE YOUR IDEA TO INCOME
          </div>
          <h1
            className="font-display mb-3"
            style={{ fontSize: 40, fontWeight: 700, color: "var(--chalk)" }}
          >
            How do you want to start?
          </h1>
          <p className="text-sm mb-10" style={{ color: "var(--ash)", maxWidth: "50ch", margin: "0 auto" }}>
            Three ways in. Same outcome. Pick whichever feels natural.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {MODES.map((mode) => {
              const Icon = mode.icon;
              return (
                <button
                  key={mode.key}
                  onClick={() => handleSelect(mode)}
                  className="card card-hover p-6 flex flex-col items-center text-center transition-all cursor-pointer"
                  style={{ background: "var(--carbon)" }}
                >
                  <div
                    className="flex items-center justify-center mb-4"
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: "50%",
                      border: "1.5px solid var(--yellow)",
                    }}
                  >
                    <Icon size={22} style={{ color: "var(--yellow)" }} />
                  </div>
                  <h3
                    className="font-display font-semibold mb-2"
                    style={{ color: "var(--chalk)", fontSize: 16 }}
                  >
                    {mode.title}
                  </h3>
                  <p className="text-sm mb-4" style={{ color: "var(--ash)" }}>
                    {mode.description}
                  </p>
                  <span
                    className="font-mono text-xs px-2 py-0.5 rounded"
                    style={{
                      background: "var(--y-dim)",
                      color: "var(--yellow)",
                      border: "1px solid var(--border-y)",
                    }}
                  >
                    {mode.tag}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
