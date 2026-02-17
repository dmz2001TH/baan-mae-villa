import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { sendLineMessage } from "@/lib/line-messaging";
import { SETTING_KEYS } from "@/lib/constants";

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as { role?: string }).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Log fetched config for debugging
    const rows = await prisma.setting.findMany({
      where: { key: { in: [SETTING_KEYS.lineChannelAccessToken, SETTING_KEYS.lineAdminUserId] } },
      select: { key: true, value: true },
    });
    const byKey = new Map(rows.map((r) => [r.key, r.value?.trim() || null]));
    const tokenFromDb = byKey.get(SETTING_KEYS.lineChannelAccessToken) || null;
    const userIdFromDb = byKey.get(SETTING_KEYS.lineAdminUserId) || null;
    const tokenFromEnv = process.env.LINE_CHANNEL_ACCESS_TOKEN?.trim() || null;
    const userIdFromEnv = process.env.LINE_ADMIN_USER_ID?.trim() || null;
    console.log("LINE Messaging config (debug):", {
      tokenFromDb: tokenFromDb ? "SET" : "NULL",
      userIdFromDb: userIdFromDb ? "SET" : "NULL",
      tokenFromEnv: tokenFromEnv ? "SET" : "NULL",
      userIdFromEnv: userIdFromEnv ? "SET" : "NULL",
    });

    // Validation: require both token and userId for Messaging API
    if (!tokenFromDb && !tokenFromEnv) {
      return NextResponse.json(
        { error: "กรุณากรอก LINE Channel Access Token และกดบันทึกตั้งค่าก่อนทดสอบ" },
        { status: 400 }
      );
    }
    if (!userIdFromDb && !userIdFromEnv) {
      return NextResponse.json(
        { error: "กรุณากรอก LINE Admin User ID และกดบันทึกตั้งค่าก่อนทดสอบ" },
        { status: 400 }
      );
    }

    const ok = await sendLineMessage("ทดสอบการส่งข้อความจากหน้า Settings");
    if (!ok) {
      return NextResponse.json(
        { error: "Failed to send LINE message. Check that Channel Access Token and Admin User ID are configured correctly." },
        { status: 400 }
      );
    }
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("LINE test error:", err);
    return NextResponse.json({ error: err?.message || "Failed to send test message." }, { status: 500 });
  }
}
