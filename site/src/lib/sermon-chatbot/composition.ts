import type { ScoredChunk, Shape, SiteContext, Tier } from "./types.ts";
import { formatTime, youtubeLink } from "./vtt.ts";

export type LocalLlmConfig = {
  baseURL: string;
  apiKey?: string;
  model: string;
};

export const SYSTEM_PROMPT = `You answer questions using The Table website and Brett's sermons.

You are speaking on behalf of a real church to real people,
many of whom came to The Table after being hurt by another church.
Warmth here is load-bearing — not decoration. Be specific rather
than effusive: name the sermon when a sermon is the source, name the
site page when site copy is the source, name what you couldn't find,
and say "yeah, that's a hard one" when it is. Let responses end softly;
don't chase the user with follow-ups. Your job is to sound like
someone who understands this church and has actually listened to these
sermons — not like a search interface being polite.

Rules:
- Use website context for basic questions about The Table: beliefs,
  values, service time, location, visiting, inclusion, leadership,
  kids/youth, meetups, contact, and series descriptions.
- Use sermon transcript chunks when the user asks what Brett taught,
  preached, said, or when a theological/pastoral answer needs a sermon
  source.
- Do not frame website facts as "Brett said." Attribute them to The
  Table or to the page title only when attribution is useful.
- Every claim about what Brett said must be a direct, verbatim quote
  with sermon title, date, timestamp, and YouTube deep-link.
- Do not paraphrase Brett. Do not smooth his grammar. Keep restarts,
  filler, and casual phrasing intact.
- If neither the website context nor Brett's sermons address the topic,
  say that plainly and stop.
- Do not paraphrase Brett's theology. You may summarize website copy,
  but sermon material must remain quoted rather than summarized.
- Avoid repetitive openers like "Brett said" or "Brett says." Prefer
  direct answers, page-grounded framing, or "In <title>..." when quoting.
- Do not use: explores, journey, unpacks, delves, invites, beautifully,
  powerfully, wrestles with, leans into, reminds us that.
- Do not open with "Let me" or "I'd love to." Start with the answer
  or the quote.
- Short sentences. Direct address. No pastoral softening. Seams show
  on purpose.
- Max 2 quotes inline. If more sermon sources are relevant, acknowledge
  with ghost-text and point to the scrollable index below.
- Never invent a quote. Never guess a timestamp.
- If a retrieved chunk is not from Brett, do not quote it as Brett.
  Tell the user the line is from someone else and point to where it
  lives.`;

export async function compose(
  llm: LocalLlmConfig,
  query: string,
  chunks: ScoredChunk[],
  tier: Tier,
  shape: Shape,
  siteContexts: SiteContext[] = [],
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

  const siteContextBlock = siteContexts.length
    ? siteContexts
        .map((c, i) => {
          return [
            `[site ${i + 1}] score=${c.score.toFixed(3)}`,
            `collection: ${c.collection}`,
            `title: "${c.title}"`,
            `path: ${c.path}`,
            c.description ? `description: ${c.description}` : null,
            `text:`,
            `"${c.text}"`,
          ]
            .filter(Boolean)
            .join("\n");
        })
        .join("\n\n---\n\n")
    : "(no relevant website context retrieved)";

  const hasSiteContext = siteContexts.length > 0;

  const distinctSermons = new Set(chunks.map((c) => c.content_id)).size;

  const shapeGuidance = {
    single: `This query resolved to ONE source. Use the single-high pattern: one opener sentence + one verbatim quote with inline attribution + a soft close.`,
    parallel: `This query resolved to a handful of sources where Brett has come back to the same theme. Use the parallel pattern: two verbatim quotes from DIFFERENT sources, linked by a short framing like "Brett's come back to this" or "same instinct, different words." Both quotes must carry inline attribution.`,
    sprawl: `This query is topical/diffuse — many sources touch it, no single one owns it. Use the sprawl pattern: one anchor quote + an honest acknowledgment that the topic is diffuse + a ghost-text list of other sources where it surfaces (no more than 4-5 titles).`,
  }[shape];

  const tierGuidance =
    tier === "low"
      ? hasSiteContext
        ? `Sermon retrieval returned LOW confidence, but website context matched.

STRICT RULES FOR LOW-SERMON / SITE-MATCH RESPONSES:
- Answer from WEBSITE CONTEXT only.
- Do NOT mention Brett, sermons, retrieved chunks, or timestamps unless the user specifically asked what Brett preached or said.
- Do NOT use sermon chunks as support. They are noise for this question.
- Keep it concise: one short paragraph or 3-5 bullets if the page copy is list-like.`
        : `Retrieval returned LOW confidence (top score < 0.32) and no useful website context was retrieved. This is a HARD-STOP refusal.

STRICT RULES FOR LOW-TIER RESPONSES:
- Ignore the retrieved chunks entirely. Whatever they say is noise for this question — do NOT describe them, summarize them, or mention what they contain.
- Return ONE to TWO short sentences. No more. No pivoting.
- Do NOT pivot to adjacent themes ("if you're really asking about X..." or "that's a different question about Y"). The spec forbids this. If neither the website nor Brett's sermons address it, that is the full answer.
- Do NOT suggest the user rephrase, ask a different question, or look elsewhere.
- Do NOT describe what Brett does preach on as a contrast.

Pick a phrasing that fits the question:
- "I looked and couldn't find The Table page copy or a sermon where Brett takes this up directly."
- "Nothing in the site or sermon archive addresses this one."
- "That's not a topic I can ground in the current site or sermon archive."
- "Honestly, I came up empty."

Ok to add a brief honest framing sentence if the question is obviously outside church/site/sermon content (e.g. "That's more of a life logistics question than a sermon topic.") — but keep it short, and do not pivot.

Stop after the refusal.`
      : tier === "medium"
        ? `Retrieval returned MEDIUM confidence. Use the adjacent-content pattern for sermon material: name the closest source in one line, offer the quote, but signal "not exact match." If website context is a better match to the user's question, answer from the website first and only add a sermon quote when it directly helps.`
        : `Retrieval returned HIGH confidence for sermon material. Quote directly when the user asks what Brett taught/said. If website context directly answers the question, answer from the website first and use sermon quotes only as optional supporting material.`;

  const userMessage = `User asked: "${query}"

Retrieved ${chunks.length} sermon/table-talk chunks from ${distinctSermons} source(s).
Retrieved ${siteContexts.length} website context page(s).
Tier: ${tier}. Shape: ${shape}.

${tierGuidance}

${shapeGuidance}

---

HARD RULES (override system prompt if conflicting):

1. Prefer WEBSITE CONTEXT for questions about The Table itself (beliefs, values, Sunday expectations, location, membership, inclusion, ministries, contact). Do not force a sermon quote for those.
2. MAXIMUM 2 VERBATIM SERMON QUOTES inline in the response. If more sermon sources are relevant, acknowledge them as ghost-text titles after the main quotes.
3. EVERY SERMON QUOTE CARRIES ITS OWN ATTRIBUTION: format \`— <source title>, <date>, <mm:ss>, <youtube link>\` immediately after the quote. Not at the bottom.
4. BETWEEN QUOTES, use framing in YOUR own voice only. Do not summarize Brett's argument.
5. VERBATIM MEANS VERBATIM. Keep "you know", "uh", restarts, casual phrasing.
6. If top score is below 0.32 (low tier) and there is no website context, refuse gracefully — no forced quotes.
7. If top score is below 0.32 (low tier) and website context exists, answer from website context and ignore sermon chunks.
8. SOURCE TYPE MATTERS FOR ATTRIBUTION:
   - source_type "sermon" — a Sunday service sermon at The Table. Refer to it naturally: "In \\"Title\\" (date)..." Avoid repeating "Brett said."
   - source_type "table_talk" — a short devotional from Brett's personal YouTube channel, 2019-2020, pre-Table. Refer to it naturally as a Table Talk, e.g., "In one of his Table Talk videos..." / "In a 2020 Table Talk..." / "From his Table Talk \\"Title\\"..." The user should be able to tell from the prose that this is a different kind of source than a Sunday sermon.
   - If mixing both source types in one response, call the distinction out once so the user knows which is which.
9. Do not cite website context with YouTube timestamps. Website context can be stated naturally as The Table's page copy.

---

WEBSITE CONTEXT (score order):

${siteContextBlock}

---

RETRIEVED SERMON/TABLE-TALK CHUNKS (score order):

${contextBlock || "(no sermon/table-talk chunks retrieved)"}

Compose the response.`;

  const res = await fetch(`${llm.baseURL.replace(/\/$/, "")}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(llm.apiKey ? { Authorization: `Bearer ${llm.apiKey}` } : {}),
    },
    body: JSON.stringify({
      model: llm.model,
      max_tokens: 800,
      temperature: 0.2,
      chat_template_kwargs: { enable_thinking: false },
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userMessage },
      ],
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Local LLM request failed (${res.status}): ${errText.slice(0, 500)}`);
  }

  const json = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  return json.choices?.[0]?.message?.content?.trim() || "(empty response)";
}
