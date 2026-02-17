export type SiteSettings = {
  id: string;
  phoneNumber: string | null;
  lineId: string | null;
  lineUrl: string | null;
  facebookUrl: string | null;
  whatsapp: string | null;
};

/** Fetch global site settings (phone, line, etc.). Public, no auth required. */
export async function fetchSiteSettings(): Promise<SiteSettings | null> {
  try {
    const res = await fetch("/api/settings", { cache: "no-store" });
    if (!res.ok) return null;
    const data = (await res.json()) as SiteSettings;
    return data;
  } catch {
    return null;
  }
}

