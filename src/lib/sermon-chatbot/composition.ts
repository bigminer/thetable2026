import Anthropic from "@anthropic-ai/sdk";
import type { ScoredChunk, Shape, Tier } from "./types.ts";
import { formatTime, youtubeLink } from "./vtt.ts";

const CLAUDE_MODEL = "claude-sonnet-4-6";

export const SYSTEM_PROMPT = `You answer questions using Brett's sermons at The Table.

You are speaking on behalf of a real pastor to a real congregation,
many of whom came to The Table after being hurt by another church.
Warmth here is load-bearing — not decoration. Be specific rather
than effusive: name the sermon, name what you couldn't find, say
"yeah, that's a hard one" when it is. Let responses end softly;
don't chase the user with follow-ups. Your job is to sound like
someone who has actually listened to these sermons and cares that
the person asking is okay — not like a search interface being polite.

Rules:
- Every claim about what Brett said must be a direct, verbatim quote
  with sermon title, date, timestamp, and YouTube deep-link.
- Do not paraphrase Brett. Do not smooth his grammar. Keep restarts,
  filler, and casual phrasing intact.
- If Brett hasn't preached on the topic, say exactly that and stop.
  Do not pivot to adjacent themes unless one genuinely exists, and
  then name it in one line.
- Do not paraphrase Brett's theology. You have no thesis; he does.
- Do not use: explores, journey, unpacks, delves, invites, beautifully,
  powerfully, wrestles with, leans into, reminds us that.
- Do not open with "Let me" or "I'd love to." Start with the answer
  or the quote.
- Short sentences. Direct address. No pastoral softening. Seams show
  on purpose.
- Max 2 quotes inline. If more sources are relevant, acknowledge with
  ghost-text and point to the scrollable index below.
- Never invent a quote. Never guess a timestamp.
- If a retrieved chunk is not from Brett, do not quote it as Brett.
  Tell the user the line is from someone else and point to where it
  lives.`;

export async function compose(
  anthropic: Anthropic,
  query: string,
  chunks: ScoredChunk[],
  tier: Tier,
  shape: Shape,
): Promise<string> {
  const contextBlock = chunks
    .map((c, i) => {
      return [
        `[chunk ${i + 1}] score=${c.score.toFixed(3)}`,
        `source_type: ${c.source_type}`,
        `source_title: "${c.source_title}"`,
        `source_date: ${c.source_date}`,
        `speaker: ${c.speaker}`,
        `timestamp: ${formatTime(c.start_seconds)}–${formatTime(c.end_seconds)}`,
        `youtube_deep_link: ${youtubeLink(c.youtube_id, c.start_seconds)}`,
        `text:`,
        `"${c.text}"`,
      ].join("\n");
    })
    .join("\n\n---\n\n");

  const distinctSermons = new Set(chunks.map((c) => c.content_id)).size;

  const shapeGuidance = {
    single: `This query resolved to ONE source. Use the single-high pattern: one opener sentence + one verbatim quote with inline attribution + a soft close.`,
    parallel: `This query resolved to a handful of sources where Brett has come back to the same theme. Use the parallel pattern: two verbatim quotes from DIFFERENT sources, linked by a short framing like "Brett's come back to this" or "same instinct, different words." Both quotes must carry inline attribution.`,
    sprawl: `This query is topical/diffuse — many sources touch it, no single one owns it. Use the sprawl pattern: one anchor quote + an honest acknowledgment that the topic is diffuse + a ghost-text list of other sources where it surfaces (no more than 4-5 titles).`,
  }[shape];

  const tierGuidance =
    tier === "low"
      ? `Retrieval returned LOW confidence (top score < 0.32). This is a HARD-STOP refusal.

STRICT RULES FOR LOW-TIER RESPONSES:
- Ignore the retrieved chunks entirely. Whatever they say is noise for this question — do NOT describe them, summarize them, or mention what they contain.
- Return ONE to TWO short sentences. No more. No pivoting.
- Do NOT pivot to adjacent themes ("if you're really asking about X..." or "that's a different question about Y"). The spec forbids this. If Brett didn't preach on it, that is the full answer.
- Do NOT suggest the user rephrase, ask a different question, or look elsewhere.
- Do NOT describe what Brett does preach on as a contrast.

Pick a phrasing that fits the question:
- "I looked and couldn't find a sermon where Brett takes this up directly."
- "Nothing in the archive addresses this one."
- "That's not a topic Brett has preached on."
- "Honestly, I came up empty."

Ok to add a brief honest framing sentence if the question is obviously outside pastoral teaching (e.g. "That's more of a life logistics question than a sermon topic.") — but keep it short, and do not pivot.

Stop after the refusal.`
      : tier === "medium"
        ? `Retrieval returned MEDIUM confidence. Use the adjacent-content pattern: name the closest source in one line, offer the quote, but signal "not exact match."`
        : `Retrieval returned HIGH confidence. Quote directly.`;

  const userMessage = `User asked: "${query}"

Retrieved ${chunks.length} chunks from ${distinctSermons} source(s).
Tier: ${tier}. Shape: ${shape}.

${tierGuidance}

${shapeGuidance}

---

HARD RULES (override system prompt if conflicting):

1. MAXIMUM 2 VERBATIM QUOTES inline in the response. If more sources are relevant, acknowledge them as ghost-text titles after the main quotes.
2. EVERY QUOTE CARRIES ITS OWN ATTRIBUTION: format \`— <source title>, <date>, <mm:ss>, <youtube link>\` immediately after the quote. Not at the bottom.
3. BETWEEN QUOTES, use framing in YOUR own voice only. Do not summarize Brett's argument.
4. VERBATIM MEANS VERBATIM. Keep "you know", "uh", restarts, casual phrasing.
5. If top score is below 0.32 (low tier), refuse gracefully — no forced quotes.
6. SOURCE TYPE MATTERS FOR ATTRIBUTION:
   - source_type "sermon" — a Sunday service sermon at The Table. Refer to it naturally: "Brett's sermon \\"Title\\"" or "In \\"Title\\" (date)..."
   - source_type "table_talk" — a short devotional from Brett's personal YouTube channel, 2019-2020, pre-Table. Refer to it naturally as a Table Talk, e.g., "In one of his Table Talk videos..." / "In a 2020 Table Talk..." / "From his Table Talk \\"Title\\"..." The user should be able to tell from the prose that this is a different kind of source than a Sunday sermon.
   - If mixing both source types in one response, call the distinction out once so the user knows which is which.

---

RETRIEVED CHUNKS (score order):

${contextBlock}

Compose the response.`;

  const res = await anthropic.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 800,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: userMessage }],
  });

  const textBlock = res.content.find((b) => b.type === "text");
  return textBlock && textBlock.type === "text" ? textBlock.text : "(empty response)";
}
