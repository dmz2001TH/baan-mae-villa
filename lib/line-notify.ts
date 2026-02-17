/**
 * LINE Notify utility
 *
 * Setup:
 * 1. Go to https://notify-bot.line.me/
 * 2. Login → My page → Generate token (choose a LINE group or 1-on-1)
 * 3. Copy the token and add to .env.local:
 *    LINE_NOTIFY_TOKEN=your_token_here
 */

import { prisma } from "@/lib/prisma";

const LINE_NOTIFY_API = "https://notify-api.line.me/api/notify";
const LINE_NOTIFY_SETTING_KEY = "line_notify_token";

async function resolveLineNotifyToken(): Promise<string | null> {
  try {
    const row = await prisma.setting.findUnique({
      where: { key: LINE_NOTIFY_SETTING_KEY },
      select: { value: true },
    });
    const fromDb = row?.value?.trim() || null;
    if (fromDb) return fromDb;
  } catch {
    // Fallback to env if DB lookup fails (e.g., before migration/client refresh)
  }

  const fromEnv = process.env.LINE_NOTIFY_TOKEN?.trim() || null;
  return fromEnv;
}

export async function sendLineNotify(message: string): Promise<boolean> {
  const token = await resolveLineNotifyToken();
  if (!token) {
    console.warn("[LINE Notify] LINE_NOTIFY_TOKEN is not set. Skipping notification.");
    return false;
  }

  try {
    const res = await fetch(LINE_NOTIFY_API, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ message }),
    });

    if (!res.ok) {
      console.error("[LINE Notify] Failed:", res.status, await res.text());
      return false;
    }

    return true;
  } catch (err) {
    console.error("[LINE Notify] Error:", err);
    return false;
  }
}
