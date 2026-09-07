import type { Cue } from "./types.ts";

export function parseTimestamp(s: string): number {
  const m = s.match(/(\d+):(\d+):(\d+)\.(\d+)/);
  if (!m) return NaN;
  return Number(m[1]) * 3600 + Number(m[2]) * 60 + Number(m[3]) + Number(m[4]) / 1000;
}

export function parseHms(hms: string): number {
  const parts = hms.split(":").map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) return NaN;
  return parts[0] * 3600 + parts[1] * 60 + parts[2];
}

export function toHms(total: number): string {
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = Math.floor(total % 60);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function youtubeLink(id: string, start: number): string {
  return `https://www.youtube.com/watch?v=${id}&t=${start}s`;
}

/**
 * Parse a YouTube/Whisper VTT into clean cues. Strips inline timing tags,
 * filters echo cues, and keeps only the last content line of each cue
 * (where new words appear in YouTube auto-captions).
 */
export function parseVtt(vtt: string): Cue[] {
  const cues: Cue[] = [];
  const blocks = vtt.split(/\r?\n\r?\n+/);
  for (const block of blocks) {
    const lines = block.split("\n").filter((l) => l.length > 0);
    const timeLineIdx = lines.findIndex((l) => l.includes("-->"));
    if (timeLineIdx === -1) continue;
    const tsMatch = lines[timeLineIdx].match(
      /(\d+:\d+:\d+\.\d+)\s*-->\s*(\d+:\d+:\d+\.\d+)/,
    );
    if (!tsMatch) continue;
    const start = parseTimestamp(tsMatch[1]);
    const end = parseTimestamp(tsMatch[2]);
    if (end - start < 0.1) continue;
    const contentLines = lines
      .slice(timeLineIdx + 1)
      .map((l) => l.trim())
      .filter((l) => l.length > 0);
    if (contentLines.length === 0) continue;
    const lastLine = contentLines[contentLines.length - 1];
    let text = lastLine
      .replace(/<\d+:\d+:\d+\.\d+>/g, "")
      .replace(/<\/?c[^>]*>/g, "")
      .replace(/&gt;&gt;/g, ">>")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/\s+/g, " ")
      .trim()
      .replace(/^>>\s*/, "");
    if (!text) continue;
    cues.push({ start, end, text });
  }
  return cues;
}
