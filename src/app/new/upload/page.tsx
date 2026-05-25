"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { IeiMark } from "@/components/IeiMark";
import { useBrandBuildStore } from "@/lib/store";
import {
  IconCloudUpload,
  IconCheck,
  IconFile,
  IconFileTypePdf,
  IconPhoto,
  IconSparkles,
} from "@tabler/icons-react";
import type { UploadedFile } from "@/lib/store";

function fileIcon(type: string) {
  if (type.includes("pdf")) return <IconFileTypePdf size={18} />;
  if (type.includes("image")) return <IconPhoto size={18} />;
  return <IconFile size={18} />;
}

export default function UploadIntakePage() {
  const router = useRouter();
  const store = useBrandBuildStore();
  const [dragging, setDragging] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const [extractedFields, setExtractedFields] = useState<Record<string, string> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const uploadFile = useCallback(
    async (file: File) => {
      const id = `file_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
      const entry: UploadedFile = {
        id,
        name: file.name,
        size: file.size,
        type: file.type,
        status: "uploading",
      };
      store.addUploadedFile(entry);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("session_id", store.sessionId);

      try {
        const res = await fetch("/api/intake/upload/file", {
          method: "POST",
          body: formData,
        });
        if (res.ok) {
          const data = await res.json();
          store.updateUploadedFile(id, {
            status: "extracted",
            extractedFields: data.extracted_fields,
          });
          if (data.extracted_fields) {
            setExtractedFields((prev) => ({ ...prev, ...data.extracted_fields }));
          }
        } else {
          store.updateUploadedFile(id, { status: "error" });
        }
      } catch {
        store.updateUploadedFile(id, { status: "error" });
      }
    },
    [store]
  );

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const files = Array.from(e.dataTransfer.files);
    files.forEach(uploadFile);
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    files.forEach(uploadFile);
  }

  async function handleProcess() {
    try {
      const res = await fetch("/api/build/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: store.sessionId,
          intake_mode: "upload",
          user_answers: {
            uploaded_files: store.uploadedFiles.map((f) => ({
              name: f.name,
              type: f.type,
              extracted: f.extractedFields,
            })),
            extracted_fields: extractedFields,
          },
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

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--black)" }}>
      <nav className="px-6 py-4">
        <IeiMark size="sm" />
      </nav>

      <div className="flex-1 flex items-start justify-center px-6 py-8">
        <div className="w-full max-w-[640px]">
          <div className="kicker mb-3" style={{ color: "var(--yellow)" }}>
            UPLOAD MODE
          </div>
          <h1
            className="font-display mb-2"
            style={{ fontSize: 30, fontWeight: 700, color: "var(--chalk)" }}
          >
            Drop in what you have.
          </h1>
          <p className="text-sm mb-8" style={{ color: "var(--ash)" }}>
            Logo, website, brand guide, pitch deck. We&apos;ll read everything and build around it.
          </p>

          {/* Drop zone */}
          <div
            className="flex flex-col items-center justify-center p-10 rounded-lg mb-5 cursor-pointer transition-colors"
            style={{
              border: `2px dashed ${dragging ? "var(--yellow)" : "var(--border-y)"}`,
              background: dragging ? "var(--y-dim)" : "rgba(245,206,0,0.03)",
            }}
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
          >
            <IconCloudUpload size={36} style={{ color: "var(--yellow)", marginBottom: 12 }} />
            <p className="text-sm mb-1" style={{ color: "var(--chalk)" }}>
              Drag and drop files here
            </p>
            <p className="text-xs" style={{ color: "var(--ash)" }}>
              PDF, SVG, PNG, DOCX, or paste a URL below
            </p>
            <button
              className="btn btn-ghost btn-sm mt-3"
              onClick={(e) => {
                e.stopPropagation();
                inputRef.current?.click();
              }}
            >
              Browse files
            </button>
            <input
              ref={inputRef}
              type="file"
              multiple
              accept=".pdf,.svg,.png,.jpg,.jpeg,.docx,.pptx"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {/* File list */}
          {store.uploadedFiles.length > 0 && (
            <div className="space-y-2 mb-5">
              {store.uploadedFiles.map((f) => (
                <div
                  key={f.id}
                  className="card flex items-center gap-3 p-3"
                  style={{ background: "var(--carbon)" }}
                >
                  <span style={{ color: "var(--ash)" }}>{fileIcon(f.type)}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate" style={{ color: "var(--chalk)" }}>
                      {f.name}
                    </p>
                    <p className="font-mono text-xs" style={{ color: "var(--ash)" }}>
                      {(f.size / 1024).toFixed(0)} KB
                    </p>
                  </div>
                  {f.status === "uploading" && <span className="spinner" style={{ color: "var(--yellow)" }} />}
                  {f.status === "extracted" && (
                    <span className="flex items-center gap-1 font-mono text-xs" style={{ color: "var(--green)" }}>
                      <IconCheck size={14} /> Extracted
                    </span>
                  )}
                  {f.status === "error" && (
                    <span className="font-mono text-xs" style={{ color: "var(--red)" }}>
                      Error
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* URL input */}
          <div className="mb-5">
            <input
              className="input"
              placeholder="Paste a website URL to analyze..."
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
            />
          </div>

          {/* AI Detected card */}
          {extractedFields && Object.keys(extractedFields).length > 0 && (
            <div
              className="p-4 rounded-lg mb-6"
              style={{
                background: "var(--y-dim)",
                border: "1px solid var(--border-y)",
              }}
            >
              <div className="flex items-center gap-2 mb-3">
                <IconSparkles size={14} style={{ color: "var(--yellow)" }} />
                <span className="font-mono text-xs font-medium" style={{ color: "var(--yellow)" }}>
                  AI Detected From Uploads
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(extractedFields).map(([key, val]) => (
                  <div key={key}>
                    <span className="font-mono text-xs block" style={{ color: "var(--ash)" }}>
                      {key}
                    </span>
                    <span className="text-sm" style={{ color: "var(--chalk)" }}>
                      {val}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between">
            <Link href="/new" className="btn btn-ghost">
              Back to mode select
            </Link>
            <button
              onClick={handleProcess}
              className="btn btn-primary"
              disabled={store.uploadedFiles.length === 0}
            >
              Process and build
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
