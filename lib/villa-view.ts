const VIEW_DEDUP_MS = 60 * 60 * 1000; // 1 hour
const KEY_PREFIX = "villa_view_";

export function shouldSkipView(villaId: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    const raw = localStorage.getItem(KEY_PREFIX + villaId);
    if (!raw) return false;
    const ts = Number(raw);
    return Number.isFinite(ts) && Date.now() - ts < VIEW_DEDUP_MS;
  } catch {
    return false;
  }
}

export function setViewRecorded(villaId: string): void {
  try {
    localStorage.setItem(KEY_PREFIX + villaId, String(Date.now()));
  } catch {}
}

/** Record a view for a villa (POST then set localStorage on success). Call from card click or detail page load.
 *  Waits for fetch to complete and only returns true when API responds with 200. Navigate only after this resolves. */
export async function recordVillaView(villaId: string): Promise<boolean> {
  if (shouldSkipView(villaId)) return false;
  try {
    const res = await fetch(`/api/villas/${villaId}/view`, { method: "POST" });
    if (res.status === 200) {
      setViewRecorded(villaId);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

/** Format views for display: 1.2k style when >= 1000; 0/null → "New" */
export function formatViewLabel(views: number | null | undefined): string {
  const n = Number(views);
  if (n <= 0 || !Number.isFinite(n)) return "New";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M views`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, "")}k views`;
  return `${n.toLocaleString()} views`;
}
