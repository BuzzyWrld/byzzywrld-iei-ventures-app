"use client";

import { useState } from "react";

/**
 * "Send to Canva" — downloads the SVG and opens Canva's create flow in a
 * new tab so the user can drop the file in. Not a real OAuth-backed
 * auto-import (that requires the Canva Connect API and app registration)
 * but gets them from our app into Canva in one click with the file ready.
 *
 * Shows a brief toast explaining the next step.
 */
export function SendToCanvaButton({ logoUrl }: { logoUrl: string }) {
  const [showToast, setShowToast] = useState(false);

  async function send() {
    // Kick off download first — use an <a download> programmatically so it
    // works even when the logoUrl is same-origin behind our auth.
    try {
      const res = await fetch(logoUrl);
      const blob = await res.blob();
      const objUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = objUrl;
      a.download = "logo.svg";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(objUrl);
    } catch {
      // If fetch fails, fall back to opening the URL directly.
      window.open(logoUrl, "_blank");
    }
    // Open Canva's create page in a new tab.
    window.open("https://www.canva.com/design?create=1", "_blank", "noopener");
    setShowToast(true);
    setTimeout(() => setShowToast(false), 6000);
  }

  return (
    <>
      <button type="button" onClick={send} className="btn btn-primary btn-sm">
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          {/* Simplified Canva C-shape mark */}
          <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm.8 15.3c-3 0-5.2-2.3-5.2-5.4 0-3.1 2.2-5.3 5.1-5.3 1.9 0 3.3.9 3.9 2.4.1.3 0 .5-.3.6l-1.2.4c-.3.1-.5 0-.7-.3-.4-.7-1-1.1-1.8-1.1-1.5 0-2.6 1.2-2.6 3.2 0 2.1 1.1 3.3 2.7 3.3.8 0 1.5-.3 1.9-1 .2-.3.4-.3.7-.2l1.1.4c.3.1.4.4.3.7-.6 1.4-2.1 2.3-3.9 2.3Z" />
        </svg>
        Send to Canva
      </button>
      {showToast && (
        <div
          className="fixed bottom-6 right-6 z-50 card p-4 max-w-xs shadow-lg"
          style={{
            borderColor: "var(--color-primary)",
            boxShadow: "var(--sh-2)",
            animation: "fadeIn 200ms ease",
          }}
        >
          <div className="font-medium mb-1">Logo downloaded</div>
          <div className="text-sm" style={{ color: "var(--color-text-muted)" }}>
            Canva opened in a new tab. Drag your <code>logo.svg</code> into the
            design canvas to import it.
          </div>
        </div>
      )}
    </>
  );
}
