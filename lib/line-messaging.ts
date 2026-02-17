/**
 * LINE Messaging API utility
 *
 * Setup:
 * 1. Create a LINE Login Channel (Messaging API)
 * 2. Get Channel Access Token (Long-lived)
 * 3. Get Admin User ID (your LINE user ID, starts with U...)
 * 4. Store in Settings UI or .env:
 *    LINE_CHANNEL_ACCESS_TOKEN=...
 *    LINE_ADMIN_USER_ID=...
 */

import { prisma } from "@/lib/prisma";
import { SETTING_KEYS } from "@/lib/constants";

const LINE_MESSAGING_API = "https://api.line.me/v2/bot/message/push";

async function resolveLineMessagingConfig(): Promise<{ token: string | null; adminUserId: string | null }> {
  let token: string | null = null;
  let adminUserId: string | null = null;
  try {
    const rows = await prisma.setting.findMany({
      where: { key: { in: [SETTING_KEYS.lineChannelAccessToken, SETTING_KEYS.lineAdminUserId] } },
      select: { key: true, value: true },
    });
    const byKey = new Map(rows.map((r: any) => [r.key, r.value?.trim() || null]));
    token = byKey.get(SETTING_KEYS.lineChannelAccessToken) || null;
    adminUserId = byKey.get(SETTING_KEYS.lineAdminUserId) || null;
  } catch {
    // Fallback to env if DB lookup fails
  }
  if (!token) token = process.env.LINE_CHANNEL_ACCESS_TOKEN?.trim() || null;
  if (!adminUserId) adminUserId = process.env.LINE_ADMIN_USER_ID?.trim() || null;
  return { token, adminUserId };
}

/**
 * Send a message via LINE Messaging API to the configured Admin User ID.
 * Returns true if sent successfully.
 */
export async function sendLineMessage(message: string): Promise<boolean> {
  const { token, adminUserId } = await resolveLineMessagingConfig();
  if (!token || !adminUserId) {
    console.error("[LINE Messaging] Missing token or admin user ID");
    return false;
  }
  try {
    const res = await fetch(LINE_MESSAGING_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        to: adminUserId,
        messages: [{ type: "text", text: message }],
      }),
    });
    if (!res.ok) {
      const err = await res.text();
      console.error("[LINE Messaging] API error:", res.status, err);
      return false;
    }
    console.log("[LINE Messaging] Message sent successfully");
    return true;
  } catch (err) {
    console.error("[LINE Messaging] Network error:", err);
    return false;
  }
}
