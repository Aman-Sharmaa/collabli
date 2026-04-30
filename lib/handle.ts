const HANDLE_RE = /^[a-z0-9][a-z0-9_]{1,28}[a-z0-9]$/;

export function normalizeHandle(raw: string): string {
  return String(raw || "")
    .trim()
    .toLowerCase()
    .replace(/^@+/, "")
    .replace(/[^a-z0-9_]/g, "");
}

export function isValidHandle(raw: string): boolean {
  const h = normalizeHandle(raw);
  return h.length >= 3 && h.length <= 30 && HANDLE_RE.test(h);
}
