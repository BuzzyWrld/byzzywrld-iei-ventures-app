"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { IeiMark } from "@/components/IeiMark";
import { useBrandBuildStore } from "@/lib/store";
import { IconSparkles } from "@tabler/icons-react";

interface Question {
  id: string;
  title: string;
  subtitle: string;
  tip: string;
  inputType: "text+textarea" | "dropdown+tags" | "textarea+tags" | "3inputs" | "3chips" | "repeating" | "textarea" | "color+font";
  tags?: string[];
  placeholder?: string;
  placeholders?: string[];
}

const QUESTIONS: Question[] = [
  {
    id: "q1",
    title: "What's the brand name and what does it do in one sentence?",
    subtitle: "Start with the name, then the simplest explanation of what this thing is.",
    tip: "Keep it to one sentence. The simpler, the sharper the brand output.",
    inputType: "text+textarea",
    placeholder: "e.g., Apex Studio — brand systems for early-stage founders",
  },
  {
    id: "q2",
    title: "What industry or category does it sit in?",
    subtitle: "This drives your palette, typography, and competitive positioning.",
    tip: "If you span multiple categories, pick the primary one. We'll account for overlap.",
    inputType: "dropdown+tags",
    tags: ["Tech & SaaS", "Creative Agency", "E-commerce", "Finance", "Health & Wellness", "Education", "Real Estate", "Media", "Food & Bev", "Professional Services"],
  },
  {
    id: "q3",
    title: "Who is this for? Describe one ideal client.",
    subtitle: "Picture one person. What do they do, what do they care about, what keeps them up at night?",
    tip: "The more specific, the better. 'Founders in their first 12 months who raised seed' beats 'entrepreneurs.'",
    inputType: "textarea+tags",
    tags: ["Founders", "Executives", "Creators", "Small Business", "Enterprise", "Gen Z", "Millennials", "B2B", "B2C", "Tech & SaaS"],
    placeholder: "Describe your ideal client in 2-3 sentences...",
  },
  {
    id: "q4",
    title: "Name 2 or 3 competitors or brands you want to be compared to.",
    subtitle: "These aren't enemies — they're positioning landmarks. Who sets the bar in your space?",
    tip: "Think about brands your audience already trusts. We'll differentiate you from them.",
    inputType: "3inputs",
    placeholders: ["Competitor 1", "Competitor 2", "Competitor 3"],
  },
  {
    id: "q5",
    title: "In 3 words, what personality should the brand have?",
    subtitle: "These words will drive your tone of voice, type choices, and visual direction.",
    tip: "Think adjectives: Bold, Minimal, Warm, Technical, Playful, Premium, Raw...",
    inputType: "3chips",
    tags: ["Bold", "Minimal", "Warm", "Technical", "Playful", "Premium", "Raw", "Direct", "Built", "Refined", "Energetic", "Clean"],
  },
  {
    id: "q6",
    title: "What are the 2 or 3 main products or services?",
    subtitle: "We'll build messaging and positioning around each one.",
    tip: "If you have more than 3, pick the ones that drive the most revenue or attention.",
    inputType: "repeating",
    placeholders: ["Product or service name..."],
  },
  {
    id: "q7",
    title: "What's the biggest pain point your client deals with today?",
    subtitle: "The problem you solve. This becomes the foundation of your messaging.",
    tip: "Use their words, not yours. How would your client describe this pain to a friend?",
    inputType: "textarea",
    placeholder: "What keeps your ideal client up at night?",
  },
  {
    id: "q8",
    title: "What does success look like in 12 months?",
    subtitle: "Revenue, clients, recognition — paint the picture. We'll reverse-engineer the strategy.",
    tip: "Be specific. '20 paying clients at $5K MRR' beats 'grow the business.'",
    inputType: "textarea",
    placeholder: "In 12 months, what is true if this worked?",
  },
  {
    id: "q9",
    title: "Any colors, fonts, or visual preferences you want us to honor?",
    subtitle: "Optional. If you have existing brand elements, tell us here. Otherwise we'll generate everything.",
    tip: "Skip this if you want a completely fresh direction. We'll build from your industry and personality.",
    inputType: "color+font",
  },
];

export default function QuestionnairePage() {
  const router = useRouter();
  const store = useBrandBuildStore();
  const [step, setStep] = useState(0);
  const [suggestion, setSuggestion] = useState("");
  const [loadingSuggestion, setLoadingSuggestion] = useState(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const current = QUESTIONS[step];
  const total = QUESTIONS.length;
  const progressPct = ((step + 1) / total) * 100;

  // Current answer value
  const answer = store.answers[current.id] ?? "";

  // Debounced autosave
  const autosave = useCallback(
    (questionId: string, value: unknown) => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(async () => {
        try {
          await fetch("/api/intake/answers/save", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              session_id: store.sessionId,
              answers: { [questionId]: value },
            }),
          });
        } catch {
          // Silent — autosave is best-effort
        }
      }, 800);
    },
    [store.sessionId]
  );

  function updateAnswer(value: unknown) {
    store.setAnswer(current.id, value);
    autosave(current.id, value);
  }

  async function fetchSuggestion() {
    setLoadingSuggestion(true);
    setSuggestion("");
    try {
      const res = await fetch("/api/intake/answers/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: store.sessionId,
          question_id: current.id,
          current_draft: answer,
          prior_answers: store.answers,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setSuggestion(data.suggestion || "");
      }
    } catch {
      // Silent
    } finally {
      setLoadingSuggestion(false);
    }
  }

  async function handleFinish() {
    // Fire build/start
    try {
      const res = await fetch("/api/build/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: store.sessionId,
          intake_mode: "questionnaire",
          user_answers: store.answers,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        store.setBuildId(data.build_id);
        store.setBuildStatus("processing");
      }
    } catch {
      // Continue to loading regardless — polling will pick up state
    }
    router.push("/building");
  }

  function handleNext() {
    if (step === total - 1) {
      handleFinish();
      return;
    }
    setSuggestion("");
    setStep((s) => s + 1);
  }

  function handleBack() {
    if (step > 0) {
      setSuggestion("");
      setStep((s) => s - 1);
    }
  }

  function handleSkip() {
    setSuggestion("");
    if (step === total - 1) {
      handleFinish();
    } else {
      setStep((s) => s + 1);
    }
  }

  // Reset suggestion when step changes
  useEffect(() => {
    setSuggestion("");
  }, [step]);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--black)" }}>
      {/* Top nav */}
      <nav className="flex items-center justify-between px-6 py-4">
        <IeiMark size="sm" />
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs" style={{ color: "var(--ash)" }}>
            Question {step + 1} of {total}
          </span>
          <div
            className="relative overflow-hidden"
            style={{
              width: 140,
              height: 3,
              background: "var(--slate)",
              borderRadius: "var(--r-full)",
            }}
          >
            <div
              style={{
                width: `${progressPct}%`,
                height: "100%",
                background: "var(--yellow)",
                borderRadius: "var(--r-full)",
                transition: "width 300ms ease",
              }}
            />
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-6 py-8">
        <div className="w-full max-w-[640px]">
          <div className="kicker mb-3" style={{ color: "var(--yellow)" }}>
            BRAND QUESTIONNAIRE
          </div>
          <h1
            className="font-display mb-2"
            style={{ fontSize: 30, fontWeight: 700, color: "var(--chalk)" }}
          >
            {current.title}
          </h1>
          <p className="text-sm mb-6" style={{ color: "var(--ash)" }}>
            {current.subtitle}
          </p>

          {/* Input area — varies by question type */}
          <div className="mb-5">
            <QuestionInput
              question={current}
              value={answer}
              onChange={updateAnswer}
            />
          </div>

          {/* Tag chips (when applicable) */}
          {current.tags && current.inputType !== "3chips" && (
            <div className="flex flex-wrap gap-2 mb-5">
              {current.tags.map((tag) => {
                const currentTags: string[] =
                  typeof answer === "object" && answer !== null && "tags" in (answer as Record<string, unknown>)
                    ? ((answer as Record<string, unknown>).tags as string[]) || []
                    : [];
                const selected = currentTags.includes(tag);
                return (
                  <button
                    key={tag}
                    onClick={() => {
                      const newTags = selected
                        ? currentTags.filter((t) => t !== tag)
                        : [...currentTags, tag];
                      const newAnswer =
                        typeof answer === "object" && answer !== null
                          ? { ...(answer as Record<string, unknown>), tags: newTags }
                          : { text: "", tags: newTags };
                      updateAnswer(newAnswer);
                    }}
                    className="pill"
                    style={{
                      background: selected ? "var(--yellow)" : "var(--carbon)",
                      color: selected ? "var(--black)" : "var(--chalk)",
                      borderColor: selected ? "var(--yellow)" : "var(--border)",
                    }}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          )}

          {/* AI Suggestion card */}
          <div
            className="p-4 rounded-lg mb-5"
            style={{
              background: "var(--y-dim)",
              border: "1px solid var(--border-y)",
            }}
          >
            {suggestion ? (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <IconSparkles size={14} style={{ color: "var(--yellow)" }} />
                  <span className="font-mono text-xs font-medium" style={{ color: "var(--yellow)" }}>
                    AI Suggestion
                  </span>
                </div>
                <p className="text-sm" style={{ color: "var(--chalk)" }}>
                  {suggestion}
                </p>
              </div>
            ) : (
              <button
                onClick={fetchSuggestion}
                className="flex items-center gap-2 text-sm"
                style={{ color: "var(--yellow)" }}
                disabled={loadingSuggestion}
              >
                <IconSparkles size={14} />
                {loadingSuggestion ? "Thinking..." : "Get AI suggestion"}
              </button>
            )}
          </div>

          {/* Quick tip */}
          <div
            className="p-3 rounded-lg mb-6 text-sm"
            style={{ background: "var(--carbon)", color: "var(--ash)" }}
          >
            <span className="font-mono text-xs" style={{ color: "var(--yellow)" }}>
              Quick tip
            </span>
            <p className="mt-1">{current.tip}</p>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <button
              onClick={handleBack}
              className="btn btn-ghost"
              style={{ visibility: step > 0 ? "visible" : "hidden" }}
            >
              Back
            </button>
            <div className="flex items-center gap-3">
              <button
                onClick={handleSkip}
                className="text-sm underline"
                style={{ color: "var(--ash)" }}
              >
                Skip for now
              </button>
              <button onClick={handleNext} className="btn btn-primary">
                {step === total - 1 ? "Save and continue" : "Save and continue"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Question Input Component ─────────────────────────────── */

function QuestionInput({
  question,
  value,
  onChange,
}: {
  question: Question;
  value: unknown;
  onChange: (v: unknown) => void;
}) {
  const textVal = typeof value === "string" ? value : typeof value === "object" && value !== null && "text" in (value as Record<string, unknown>) ? String((value as Record<string, unknown>).text) : "";

  switch (question.inputType) {
    case "text+textarea":
      return (
        <div className="space-y-3">
          <input
            className="input"
            placeholder="Brand name"
            value={typeof value === "object" && value !== null ? String((value as Record<string, unknown>).name || "") : ""}
            onChange={(e) =>
              onChange({
                ...(typeof value === "object" && value !== null ? value : {}),
                name: e.target.value,
              })
            }
          />
          <textarea
            className="textarea"
            placeholder={question.placeholder}
            value={typeof value === "object" && value !== null ? String((value as Record<string, unknown>).essence || "") : ""}
            onChange={(e) =>
              onChange({
                ...(typeof value === "object" && value !== null ? value : {}),
                essence: e.target.value,
              })
            }
          />
        </div>
      );

    case "dropdown+tags":
      return (
        <select
          className="select"
          value={typeof value === "object" && value !== null ? String((value as Record<string, unknown>).industry || "") : String(value || "")}
          onChange={(e) => {
            if (typeof value === "object" && value !== null) {
              onChange({ ...(value as Record<string, unknown>), industry: e.target.value });
            } else {
              onChange({ industry: e.target.value, tags: [] });
            }
          }}
        >
          <option value="">Select an industry...</option>
          {(question.tags || []).map((t) => (
            <option key={t} value={t.toLowerCase().replace(/[^a-z]+/g, "_")}>{t}</option>
          ))}
        </select>
      );

    case "textarea+tags":
    case "textarea":
      return (
        <textarea
          className="textarea"
          rows={4}
          placeholder={question.placeholder}
          value={textVal}
          onChange={(e) => {
            if (typeof value === "object" && value !== null) {
              onChange({ ...(value as Record<string, unknown>), text: e.target.value });
            } else {
              onChange(e.target.value);
            }
          }}
        />
      );

    case "3inputs": {
      const arr = Array.isArray(value) ? value : ["", "", ""];
      return (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <input
              key={i}
              className="input"
              placeholder={question.placeholders?.[i] || `Item ${i + 1}`}
              value={String(arr[i] || "")}
              onChange={(e) => {
                const newArr = [...arr];
                newArr[i] = e.target.value;
                onChange(newArr);
              }}
            />
          ))}
        </div>
      );
    }

    case "3chips": {
      const selected: string[] = Array.isArray(value) ? value : [];
      return (
        <div className="flex flex-wrap gap-2">
          {(question.tags || []).map((tag) => {
            const isSelected = selected.includes(tag);
            const canSelect = selected.length < 3 || isSelected;
            return (
              <button
                key={tag}
                disabled={!canSelect && !isSelected}
                onClick={() => {
                  if (isSelected) {
                    onChange(selected.filter((t) => t !== tag));
                  } else if (selected.length < 3) {
                    onChange([...selected, tag]);
                  }
                }}
                className="pill"
                style={{
                  background: isSelected ? "var(--yellow)" : "var(--carbon)",
                  color: isSelected ? "var(--black)" : "var(--chalk)",
                  borderColor: isSelected ? "var(--yellow)" : "var(--border)",
                  opacity: canSelect ? 1 : 0.4,
                }}
              >
                {tag}
              </button>
            );
          })}
          {selected.length > 0 && (
            <span className="font-mono text-xs self-center ml-2" style={{ color: "var(--ash)" }}>
              {selected.length}/3 selected
            </span>
          )}
        </div>
      );
    }

    case "repeating": {
      const items: string[] = Array.isArray(value) ? value : [""];
      return (
        <div className="space-y-3">
          {items.map((item, i) => (
            <input
              key={i}
              className="input"
              placeholder={question.placeholders?.[0] || "Item..."}
              value={String(item)}
              onChange={(e) => {
                const newItems = [...items];
                newItems[i] = e.target.value;
                onChange(newItems);
              }}
            />
          ))}
          {items.length < 5 && (
            <button
              onClick={() => onChange([...items, ""])}
              className="text-sm"
              style={{ color: "var(--yellow)" }}
            >
              + Add another
            </button>
          )}
        </div>
      );
    }

    case "color+font":
      return (
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1.5 block" style={{ color: "var(--chalk)" }}>
              Preferred colors (optional)
            </label>
            <input
              className="input"
              placeholder="e.g., Navy blue, gold accents"
              value={typeof value === "object" && value !== null ? String((value as Record<string, unknown>).colors || "") : ""}
              onChange={(e) =>
                onChange({
                  ...(typeof value === "object" && value !== null ? value : {}),
                  colors: e.target.value,
                })
              }
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block" style={{ color: "var(--chalk)" }}>
              Font preferences (optional)
            </label>
            <input
              className="input"
              placeholder="e.g., Modern sans-serif, nothing too playful"
              value={typeof value === "object" && value !== null ? String((value as Record<string, unknown>).fonts || "") : ""}
              onChange={(e) =>
                onChange({
                  ...(typeof value === "object" && value !== null ? value : {}),
                  fonts: e.target.value,
                })
              }
            />
          </div>
        </div>
      );

    default:
      return null;
  }
}
