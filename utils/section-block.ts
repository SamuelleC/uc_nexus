/**
 * Parse `{year}-{block}` from noisy section strings (e.g. `CITCS1BLOCK1-A` → 1, A).
 */
function parseYearBlockFromCore(core: string): {
  year: string;
  suffix: string;
} | null {
  const s = core.trim();
  if (!s) return null;

  // Suffix-aligned: …BLOCK1-A, …1-H (hyphenated block at end)
  const end = /(\d{1,2}-[A-Za-z0-9]+)\s*$/i.exec(s);
  if (end) {
    const [, tok] = end;
    const [y, ...restParts] = tok.split("-");
    if (!y || restParts.length === 0) return null;
    return {
      year: String(parseInt(y, 10)),
      suffix: restParts.join("-").replace(/\s+/g, "").toUpperCase(),
    };
  }

  // Rightmost `1-H` token anywhere (handles missing $ anchor cases)
  const re = /(\d{1,2}-[A-Za-z0-9]+)/gi;
  let m: RegExpExecArray | null;
  let last: RegExpExecArray | null = null;
  while ((m = re.exec(s)) !== null) last = m;
  if (last) {
    const tok = last[1];
    const [y, ...restParts] = tok.split("-");
    if (!y || restParts.length === 0) return null;
    return {
      year: String(parseInt(y, 10)),
      suffix: restParts.join("-").replace(/\s+/g, "").toUpperCase(),
    };
  }

  // Whole string is already `1-H` style
  if (/^\d{1,2}-/i.test(s)) {
    const m2 = /^(\d{1,2})-(.+)$/i.exec(s);
    if (m2) {
      return {
        year: String(parseInt(m2[1], 10)),
        suffix: m2[2].replace(/\s+/g, "").toUpperCase(),
      };
    }
  }

  // Trailing `1A` / `1 A` (no hyphen), e.g. legacy `CITCS 1A`
  const tail = /(\d{1,2})\s*([A-Za-z0-9]+)\s*$/i.exec(s);
  if (tail) {
    return {
      year: String(parseInt(tail[1], 10)),
      suffix: tail[2].replace(/\s+/g, "").toUpperCase(),
    };
  }

  return null;
}

/**
 * Display label "Block 1-A" from section strings such as `1-A`, `BLOCK 1-a`,
 * `CITCS1BLOCK1-A`, or trailing patterns like `CITCS 1A`.
 */
export function formatBlockSectionDisplay(
  raw: string | null | undefined,
): string {
  const t = (raw ?? "").trim();
  if (!t) return "—";

  const stripped = t.replace(/^block\s*/i, "").trim();
  const core = stripped.length > 0 ? stripped : t;

  const parsed = parseYearBlockFromCore(core);
  if (parsed) {
    return `Block ${parsed.year}-${parsed.suffix}`;
  }

  const rest = core.replace(/\s+/g, "").toUpperCase();
  if (rest.length > 0 && rest.length <= 16) {
    return `Block ${rest}`;
  }

  return "—";
}
