/**
 * Script-to-Video Agent
 *
 * Parses Asset A (Video Script) blocks from content engine week markdown,
 * converts them into timed scene arrays that Remotion compositions consume
 * as inputProps. Each scene has spoken text, text overlay, visual cue, and
 * precise timing in seconds.
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export interface VideoScene {
  id: string;
  section: "hook" | "body" | "cta";
  startSec: number;
  durationSec: number;
  spokenText: string;
  textOverlay: string;
  visualCue: string;
}

export interface VideoEpisode {
  dayLabel: string;
  weekNumber: number;
  title: string;
  estimatedRuntime: number;
  scenes: VideoScene[];
}

export interface RemotionVideoProps {
  compositionId: string;
  fps: number;
  durationInFrames: number;
  scenes: Array<{
    id: string;
    section: string;
    from: number;
    durationInFrames: number;
    spokenText: string;
    textOverlay: string;
    visualCue: string;
  }>;
  meta: {
    dayLabel: string;
    weekNumber: number;
    title: string;
  };
}

// ─── Internal types for parsing ───────────────────────────────────────────────

interface RawBeat {
  spokenText: string;
  visualCue: string;
}

interface RawAssetA {
  dayLabel: string;
  weekNumber: number;
  runtime: number;
  hookText: string;
  hookOverlay: string;
  bodyBeats: RawBeat[];
  ctaText: string;
  ctaOverlay: string;
}

// ─── Parser ───────────────────────────────────────────────────────────────────

/**
 * Regex to extract Asset A blocks from week markdown.
 * Matches the fenced block between the two `---` delimiters.
 */
const ASSET_A_REGEX =
  /---\s*\nASSET A: VIDEO SCRIPT\n([\s\S]*?)---\s*\n([\s\S]*?)(?=---\s*$|---\s*\nASSET [BC])/gm;

/**
 * Extracts the header metadata from the Asset A frontmatter.
 */
function parseHeader(header: string): { dayLabel: string; weekNumber: number; runtime: number } {
  const dayMatch = header.match(/Day:\s*(.+)/i);
  const weekMatch = header.match(/Week:\s*(\d+)/i);
  const runtimeMatch = header.match(/Runtime:\s*(\d+)/i);

  return {
    dayLabel: dayMatch?.[1]?.trim() ?? "Unknown",
    weekNumber: parseInt(weekMatch?.[1] ?? "1", 10),
    runtime: parseInt(runtimeMatch?.[1] ?? "45", 10),
  };
}

/**
 * Parses a single Asset A block into structured raw data.
 */
function parseAssetABlock(header: string, body: string): RawAssetA {
  const meta = parseHeader(header);
  const lines = body.split("\n").map((l) => l.trim()).filter(Boolean);

  let hookText = "";
  let hookOverlay = "";
  const bodyBeats: RawBeat[] = [];
  let ctaText = "";
  let ctaOverlay = "";

  let section: "hook" | "body" | "cta" | "none" = "none";
  let currentBeat: RawBeat = { spokenText: "", visualCue: "" };

  for (const line of lines) {
    // Detect section headers
    if (/^HOOK\b/i.test(line)) {
      section = "hook";
      continue;
    }
    if (/^BODY\b/i.test(line)) {
      section = "body";
      currentBeat = { spokenText: "", visualCue: "" };
      continue;
    }
    if (/^CTA\b/i.test(line)) {
      // Flush last body beat
      if (currentBeat.spokenText) {
        bodyBeats.push({ ...currentBeat });
      }
      section = "cta";
      continue;
    }

    // Parse text-on-screen / visual cue lines
    const textOnScreen = line.match(/^\[Text-on-screen:\s*(.+?)\]$/i);
    const visualCue = line.match(/^\[Visual cue:\s*(.+?)\]$/i);
    const cutTo = line.match(/^\[Cut to:\s*(.+?)\]$/i);

    if (section === "hook") {
      if (textOnScreen) {
        hookOverlay = textOnScreen[1];
      } else if (!line.startsWith("[")) {
        hookText += (hookText ? " " : "") + line;
      }
    } else if (section === "body") {
      if (visualCue || cutTo) {
        currentBeat.visualCue = (visualCue ?? cutTo)![1];
      } else if (/^\[Beat \d/i.test(line)) {
        // New beat marker — flush previous
        if (currentBeat.spokenText) {
          bodyBeats.push({ ...currentBeat });
          currentBeat = { spokenText: "", visualCue: "" };
        }
      } else if (!line.startsWith("[")) {
        currentBeat.spokenText += (currentBeat.spokenText ? " " : "") + line;
      }
    } else if (section === "cta") {
      if (textOnScreen) {
        ctaOverlay = textOnScreen[1];
      } else if (!line.startsWith("[")) {
        ctaText += (ctaText ? " " : "") + line;
      }
    }
  }

  // Flush trailing body beat
  if (section === "body" && currentBeat.spokenText) {
    bodyBeats.push({ ...currentBeat });
  }

  return {
    dayLabel: meta.dayLabel,
    weekNumber: meta.weekNumber,
    runtime: meta.runtime,
    hookText,
    hookOverlay,
    bodyBeats,
    ctaText,
    ctaOverlay,
  };
}

/**
 * Converts parsed raw data into a timed VideoEpisode.
 * Timing: 3s hook, 5s CTA, remaining time split across body beats.
 */
function rawToEpisode(raw: RawAssetA): VideoEpisode {
  const hookDuration = 3;
  const ctaDuration = 5;
  const beatCount = Math.max(raw.bodyBeats.length, 1);
  const bodyTotal = Math.max(raw.runtime - hookDuration - ctaDuration, beatCount * 3);
  const beatDuration = bodyTotal / beatCount;

  const scenes: VideoScene[] = [];
  let cursor = 0;

  // Hook scene
  scenes.push({
    id: "hook",
    section: "hook",
    startSec: cursor,
    durationSec: hookDuration,
    spokenText: raw.hookText,
    textOverlay: raw.hookOverlay || raw.hookText,
    visualCue: "Brand logo reveal + headline animation",
  });
  cursor += hookDuration;

  // Body scenes
  raw.bodyBeats.forEach((beat, i) => {
    scenes.push({
      id: `body-${i + 1}`,
      section: "body",
      startSec: cursor,
      durationSec: Math.round(beatDuration * 10) / 10,
      spokenText: beat.spokenText,
      textOverlay: beat.spokenText.split(".")[0] ?? "",
      visualCue: beat.visualCue || "Text overlay on brand-colored background",
    });
    cursor += beatDuration;
  });

  // CTA scene
  scenes.push({
    id: "cta",
    section: "cta",
    startSec: cursor,
    durationSec: ctaDuration,
    spokenText: raw.ctaText,
    textOverlay: raw.ctaOverlay || raw.ctaText,
    visualCue: "Brand lockup + CTA overlay",
  });

  return {
    dayLabel: raw.dayLabel,
    weekNumber: raw.weekNumber,
    title: raw.dayLabel.split("—").pop()?.trim() ?? raw.dayLabel,
    estimatedRuntime: raw.runtime,
    scenes,
  };
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Parses all Asset A (Video Script) blocks from a week's markdown content.
 * Returns an array of VideoEpisode objects with timed scenes.
 */
export function parseWeekVideoScripts(weekMarkdown: string): VideoEpisode[] {
  const episodes: VideoEpisode[] = [];
  const regex = new RegExp(ASSET_A_REGEX.source, ASSET_A_REGEX.flags);
  let match: RegExpExecArray | null;

  while ((match = regex.exec(weekMarkdown)) !== null) {
    const header = match[1];
    const body = match[2];
    const raw = parseAssetABlock(header, body);
    episodes.push(rawToEpisode(raw));
  }

  return episodes;
}

/**
 * Converts a VideoEpisode to Remotion-compatible inputProps.
 */
export function episodeToRemotionProps(
  episode: VideoEpisode,
  fps: number = 30
): RemotionVideoProps {
  const totalDuration = episode.scenes.reduce((sum, s) => sum + s.durationSec, 0);

  return {
    compositionId: "IEIExplainer",
    fps,
    durationInFrames: Math.ceil(totalDuration * fps),
    scenes: episode.scenes.map((s) => ({
      id: s.id,
      section: s.section,
      from: Math.round(s.startSec * fps),
      durationInFrames: Math.round(s.durationSec * fps),
      spokenText: s.spokenText,
      textOverlay: s.textOverlay,
      visualCue: s.visualCue,
    })),
    meta: {
      dayLabel: episode.dayLabel,
      weekNumber: episode.weekNumber,
      title: episode.title,
    },
  };
}

/**
 * Parses a full week's markdown and returns Remotion props for all 7 video scripts.
 */
export function weekToRemotionBatch(
  weekMarkdown: string,
  fps: number = 30
): RemotionVideoProps[] {
  return parseWeekVideoScripts(weekMarkdown).map((ep) =>
    episodeToRemotionProps(ep, fps)
  );
}
