"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { IeiMark } from "@/components/IeiMark";
import { useBrandBuildStore } from "@/lib/store";
import {
  IconMicrophone,
  IconPlayerPause,
  IconCheck,
} from "@tabler/icons-react";

const PROMPTS = [
  { num: 1, title: "What is it?", description: "In one sentence, what do you do or sell?" },
  { num: 2, title: "Who is it for?", description: "Picture one ideal client. Describe them." },
  { num: 3, title: "Why you?", description: "What makes your version different from what already exists?" },
  { num: 4, title: "How do you sound?", description: "Three words for the personality you want." },
  { num: 5, title: "How will they find you?", description: "Where will your first 10 clients come from?" },
  { num: 6, title: "What does winning look like?", description: "In 12 months, what is true if this worked?" },
];

export default function VoiceIntakePage() {
  const router = useRouter();
  const store = useBrandBuildStore();
  const [recording, setRecording] = useState(false);
  const [paused, setPaused] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [transcript, setTranscript] = useState("");
  const [completedPrompts, setCompletedPrompts] = useState<number[]>([]);
  const [levels, setLevels] = useState<number[]>(Array(12).fill(8));
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number>(0);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audioCtx = new AudioContext();
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 32;
      source.connect(analyser);
      analyserRef.current = analyser;

      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunks, { type: "audio/webm" });
        // Upload audio
        const formData = new FormData();
        formData.append("audio", blob, "recording.webm");
        formData.append("session_id", store.sessionId);
        try {
          const res = await fetch("/api/intake/voice/upload", {
            method: "POST",
            body: formData,
          });
          if (res.ok) {
            const data = await res.json();
            if (data.transcript) {
              setTranscript(data.transcript);
              store.setTranscript(data.transcript);
            }
          }
        } catch {
          // Silent
        }
      };

      recorder.start(5000); // 5s chunks
      setRecording(true);
      setPaused(false);

      timerRef.current = setInterval(() => {
        setSeconds((s) => s + 1);
      }, 1000);

      // Animate levels
      function updateLevels() {
        if (analyserRef.current) {
          const data = new Uint8Array(analyserRef.current.frequencyBinCount);
          analyserRef.current.getByteFrequencyData(data);
          const newLevels = Array.from({ length: 12 }, (_, i) => {
            const val = data[i % data.length] || 0;
            return Math.max(4, (val / 255) * 40);
          });
          setLevels(newLevels);
        }
        animFrameRef.current = requestAnimationFrame(updateLevels);
      }
      updateLevels();
    } catch {
      // Mic access denied
    }
  }

  function togglePause() {
    if (!mediaRecorderRef.current) return;
    if (paused) {
      mediaRecorderRef.current.resume();
      setPaused(false);
      timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    } else {
      mediaRecorderRef.current.pause();
      setPaused(true);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  }

  async function handleDone() {
    if (timerRef.current) clearInterval(timerRef.current);
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    setRecording(false);

    // Fire build
    try {
      const res = await fetch("/api/build/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: store.sessionId,
          intake_mode: "voice",
          user_answers: { transcript: store.transcript || transcript },
        }),
      });
      if (res.ok) {
        const data = await res.json();
        store.setBuildId(data.build_id);
        store.setBuildStatus("processing");
      }
    } catch {}
    router.push("/building");
  }

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--black)" }}>
      <nav className="px-6 py-4">
        <IeiMark size="sm" />
      </nav>

      <div className="flex-1 flex items-start justify-center px-6 py-8">
        <div className="w-full max-w-[900px]">
          <div className="kicker mb-3" style={{ color: "var(--yellow)" }}>
            VOICE MODE · GUIDED
          </div>
          <h1
            className="font-display mb-2"
            style={{ fontSize: 30, fontWeight: 700, color: "var(--chalk)" }}
          >
            Tell us about your idea.
          </h1>
          <p className="text-sm mb-8" style={{ color: "var(--ash)" }}>
            Talk like you would to a friend. Cover the prompts on the right when they feel right. No order required.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-[1.1fr_1fr] gap-6">
            {/* LEFT: Recorder */}
            <div className="card p-6" style={{ background: "var(--carbon)" }}>
              <div className="flex flex-col items-center mb-6">
                {!recording ? (
                  <button
                    onClick={startRecording}
                    className="flex items-center justify-center rounded-full transition-all"
                    style={{
                      width: 84,
                      height: 84,
                      background: "var(--yellow)",
                      color: "var(--black)",
                    }}
                  >
                    <IconMicrophone size={34} />
                  </button>
                ) : (
                  <div
                    className="flex items-center justify-center rounded-full"
                    style={{
                      width: 84,
                      height: 84,
                      background: paused ? "var(--slate)" : "var(--yellow)",
                      color: paused ? "var(--yellow)" : "var(--black)",
                    }}
                  >
                    <IconMicrophone size={34} />
                  </div>
                )}
                <p className="font-mono text-xs mt-3" style={{ color: "var(--ash)" }}>
                  {!recording
                    ? "Tap to start recording"
                    : paused
                    ? "Paused. Tap resume."
                    : "Recording. Tap to pause."}
                </p>
                {recording && (
                  <span
                    className="font-mono mt-1"
                    style={{ fontSize: 20, color: "var(--yellow)" }}
                  >
                    {formatTime(seconds)}
                  </span>
                )}
              </div>

              {/* Waveform */}
              <div className="flex items-end justify-center gap-1 mb-6" style={{ height: 40 }}>
                {levels.map((h, i) => (
                  <div
                    key={i}
                    style={{
                      width: 4,
                      height: h,
                      background: "var(--yellow)",
                      borderRadius: 2,
                      transition: "height 100ms ease",
                    }}
                  />
                ))}
              </div>

              {/* Controls */}
              <div className="flex gap-3 justify-center">
                {recording && (
                  <button onClick={togglePause} className="btn btn-ghost btn-sm">
                    <IconPlayerPause size={14} />
                    {paused ? "Resume" : "Pause"}
                  </button>
                )}
                {recording && (
                  <button onClick={handleDone} className="btn btn-primary btn-sm">
                    Done. Process.
                  </button>
                )}
              </div>

              {/* Transcript */}
              {transcript && (
                <div className="mt-6 pt-4 border-t" style={{ borderColor: "var(--border)" }}>
                  <span className="kicker text-[9px] mb-2 block">LIVE TRANSCRIPT</span>
                  <p className="text-sm leading-relaxed" style={{ color: "var(--chalk)" }}>
                    {transcript}
                  </p>
                </div>
              )}
            </div>

            {/* RIGHT: Guided prompts */}
            <div>
              <h3
                className="font-display font-semibold text-sm mb-4"
                style={{ color: "var(--chalk)" }}
              >
                Cover these as you talk
              </h3>
              <div className="space-y-3">
                {PROMPTS.map((p) => {
                  const done = completedPrompts.includes(p.num);
                  return (
                    <button
                      key={p.num}
                      onClick={() =>
                        setCompletedPrompts((prev) =>
                          done ? prev.filter((n) => n !== p.num) : [...prev, p.num]
                        )
                      }
                      className="flex items-start gap-3 w-full text-left p-3 rounded-lg transition-all"
                      style={{
                        background: done ? "var(--carbon)" : "transparent",
                        opacity: done ? 0.5 : 1,
                      }}
                    >
                      <div
                        className="flex items-center justify-center rounded-full flex-shrink-0"
                        style={{
                          width: 28,
                          height: 28,
                          background: done ? "var(--green)" : "transparent",
                          border: done ? "none" : "1.5px solid var(--yellow)",
                          color: done ? "var(--black)" : "var(--yellow)",
                          fontSize: 12,
                          fontWeight: 600,
                        }}
                      >
                        {done ? <IconCheck size={14} /> : p.num}
                      </div>
                      <div>
                        <span
                          className="font-display font-semibold text-sm"
                          style={{ color: done ? "var(--ash)" : "var(--chalk)" }}
                        >
                          {p.title}
                        </span>
                        <p className="text-xs mt-0.5" style={{ color: "var(--ash)" }}>
                          {p.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
