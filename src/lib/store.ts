"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  status: "uploading" | "extracted" | "error";
  extractedFields?: Record<string, string>;
}

export interface BrandBuildStore {
  sessionId: string;
  userId: string;
  intent: {
    audience: "solo" | "agency" | "";
    brandCount: "one" | "multiple" | "";
    needsDashboard: boolean | null;
    techStack: string[];
  };
  intakeMode: "voice" | "upload" | "questionnaire" | "";
  answers: Record<string, unknown>;
  uploadedFiles: UploadedFile[];
  transcript: string;
  brandJson: Record<string, unknown> | null;
  buildId: string;
  buildStatus: "draft" | "processing" | "ready" | "error";
  buildProgress: number;
  buildStep: string;

  // Actions
  setSessionId: (id: string) => void;
  setUserId: (id: string) => void;
  setIntent: (patch: Partial<BrandBuildStore["intent"]>) => void;
  setIntakeMode: (mode: BrandBuildStore["intakeMode"]) => void;
  setAnswer: (questionId: string, value: unknown) => void;
  setAnswers: (answers: Record<string, unknown>) => void;
  addUploadedFile: (file: UploadedFile) => void;
  updateUploadedFile: (id: string, patch: Partial<UploadedFile>) => void;
  setTranscript: (text: string) => void;
  setBuildStatus: (status: BrandBuildStore["buildStatus"]) => void;
  setBuildId: (id: string) => void;
  setBuildProgress: (progress: number, step: string) => void;
  setBrandJson: (json: Record<string, unknown>) => void;
  reset: () => void;
}

const initialState = {
  sessionId: "",
  userId: "",
  intent: {
    audience: "" as const,
    brandCount: "" as const,
    needsDashboard: null,
    techStack: [] as string[],
  },
  intakeMode: "" as const,
  answers: {},
  uploadedFiles: [],
  transcript: "",
  brandJson: null,
  buildId: "",
  buildStatus: "draft" as const,
  buildProgress: 0,
  buildStep: "",
};

export const useBrandBuildStore = create<BrandBuildStore>()(
  persist(
    (set) => ({
      ...initialState,

      setSessionId: (id) => set({ sessionId: id }),
      setUserId: (id) => set({ userId: id }),
      setIntent: (patch) =>
        set((s) => ({ intent: { ...s.intent, ...patch } })),
      setIntakeMode: (mode) => set({ intakeMode: mode }),
      setAnswer: (questionId, value) =>
        set((s) => ({ answers: { ...s.answers, [questionId]: value } })),
      setAnswers: (answers) =>
        set((s) => ({ answers: { ...s.answers, ...answers } })),
      addUploadedFile: (file) =>
        set((s) => ({ uploadedFiles: [...s.uploadedFiles, file] })),
      updateUploadedFile: (id, patch) =>
        set((s) => ({
          uploadedFiles: s.uploadedFiles.map((f) =>
            f.id === id ? { ...f, ...patch } : f
          ),
        })),
      setTranscript: (text) => set({ transcript: text }),
      setBuildStatus: (status) => set({ buildStatus: status }),
      setBuildId: (id) => set({ buildId: id }),
      setBuildProgress: (progress, step) =>
        set({ buildProgress: progress, buildStep: step }),
      setBrandJson: (json) => set({ brandJson: json }),
      reset: () => set(initialState),
    }),
    {
      name: "iei-brand-build",
      partialize: (state) => {
        const { reset, setSessionId, setUserId, setIntent, setIntakeMode, setAnswer, setAnswers, addUploadedFile, updateUploadedFile, setTranscript, setBuildStatus, setBuildId, setBuildProgress, setBrandJson, ...data } = state;
        return data;
      },
    }
  )
);
