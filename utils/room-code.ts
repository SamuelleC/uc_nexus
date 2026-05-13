function looksLikeUuidOrLongId(s: string): boolean {
  if (s.length < 20) return false;
  return /[0-9a-f]{8}-[0-9a-f-]{4,}/i.test(s);
}

/**
 * Shorten verbose room labels to a compact code (e.g. "room-F801 lec seats" → "F801").
 * Falls back to the trimmed original string when no pattern matches.
 */
export function normalizeRoomCode(raw: string | null | undefined): string {
  if (raw == null) return "";
  const s = String(raw).trim();
  if (!s) return "";

  // "room-F801", "room: F801", "room F801", "ROOM - M301"
  const afterRoom = s.match(/room[-:\s]+([A-Za-z0-9/]+)/i);
  if (afterRoom) {
    const chunk = afterRoom[1].split("/")[0].trim();
    const token = chunk.replace(/[^A-Za-z0-9].*$/, "");
    if (token.length >= 2) return token.toUpperCase();
  }

  // Typical campus codes: F801, M301, IT103, CC2-LAB1
  const letterDigits = s.match(/\b([A-Z]{1,6}\d{2,4}[A-Z0-9]{0,4})\b/i);
  if (letterDigits) return letterDigits[1].toUpperCase();

  // Plain numeric room (301, 1204) — skip digit extraction inside UUIDs
  if (!looksLikeUuidOrLongId(s)) {
    const digits = s.match(/\b(\d{3,4})\b/);
    if (digits) return digits[1];
  }

  return s;
}

export function roomCodeOrOriginal(raw: string | null | undefined): string {
  if (raw == null) return "";
  const trimmed = String(raw).trim();
  if (!trimmed) return "";
  const code = normalizeRoomCode(trimmed);
  return code.length > 0 ? code : trimmed;
}
