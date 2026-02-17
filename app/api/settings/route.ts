import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { SETTING_KEYS } from "@/lib/constants";

type SettingValues = {
  lineNotifyToken: string | null;
  lineChannelAccessToken: string | null;
  lineAdminUserId: string | null;
  facebookPageId: string | null;
  facebookAppId: string | null;
  adminPhoneNumber: string | null;
  lineOfficialUrl: string | null;
};

function trimOrNull(v: unknown): string | null {
  const s = String(v ?? "").trim();
  return s || null;
}

function envOrNull(value: string | undefined): string | null {
  const s = value?.trim() ?? "";
  return s || null;
}

async function getSettingValues(): Promise<SettingValues> {
  const rows = await prisma.setting.findMany({
    where: {
      key: {
        in: Object.values(SETTING_KEYS),
      },
    },
    select: {
      key: true,
      value: true,
    },
  });

  const byKey = new Map<string, string | null>(
    rows.map((row) => [row.key, row.value?.trim() || null])
  );

  return {
    lineNotifyToken:
      byKey.get(SETTING_KEYS.lineNotifyToken) || envOrNull(process.env.LINE_NOTIFY_TOKEN),
    lineChannelAccessToken:
      byKey.get(SETTING_KEYS.lineChannelAccessToken) || envOrNull(process.env.LINE_CHANNEL_ACCESS_TOKEN),
    lineAdminUserId:
      byKey.get(SETTING_KEYS.lineAdminUserId) || envOrNull(process.env.LINE_ADMIN_USER_ID),
    facebookPageId:
      byKey.get(SETTING_KEYS.facebookPageId) || envOrNull(process.env.FACEBOOK_PAGE_ID),
    facebookAppId:
      byKey.get(SETTING_KEYS.facebookAppId) || envOrNull(process.env.FACEBOOK_APP_ID),
    adminPhoneNumber:
      byKey.get(SETTING_KEYS.adminPhoneNumber) ||
      envOrNull(process.env.ADMIN_PHONE_NUMBER) ||
      envOrNull(process.env.PHONE_NUMBER),
    lineOfficialUrl:
      byKey.get(SETTING_KEYS.lineOfficialUrl) ||
      envOrNull(process.env.LINE_OFFICIAL_URL) ||
      envOrNull(process.env.LINE_URL),
  };
}

/** Public GET: returns non-sensitive settings for frontend; admin also gets LINE token */
export async function GET() {
  const session = await getServerSession(authOptions);
  const isAdmin =
    !!session?.user && (session.user as { role?: string }).role === "ADMIN";

  const values = await getSettingValues();

  return NextResponse.json({
    // Backward-compatible keys used by existing frontend code
    id: "site-settings",
    phoneNumber: values.adminPhoneNumber,
    lineId: null,
    lineUrl: values.lineOfficialUrl,
    facebookUrl: null,
    whatsapp: null,

    // New explicit settings keys
    adminPhoneNumber: values.adminPhoneNumber,
    lineOfficialUrl: values.lineOfficialUrl,
    facebookPageId: values.facebookPageId,
    facebookAppId: values.facebookAppId,
    lineNotifyToken: isAdmin ? values.lineNotifyToken : null,
    lineChannelAccessToken: isAdmin ? values.lineChannelAccessToken : null,
    lineAdminUserId: isAdmin ? values.lineAdminUserId : null,
  });
}

/** Admin PATCH: update settings in key-value table */
export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as { role?: string }).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const {
    lineNotifyToken,
    lineChannelAccessToken,
    lineAdminUserId,
    facebookPageId,
    facebookAppId,
    adminPhoneNumber,
    lineOfficialUrl,
  } = body as {
    lineNotifyToken?: unknown;
    lineChannelAccessToken?: unknown;
    lineAdminUserId?: unknown;
    facebookPageId?: unknown;
    facebookAppId?: unknown;
    adminPhoneNumber?: unknown;
    lineOfficialUrl?: unknown;
  };

  const updates: Array<{ key: string; value: string | null }> = [];

  if (lineNotifyToken !== undefined) {
    updates.push({
      key: SETTING_KEYS.lineNotifyToken,
      value: trimOrNull(lineNotifyToken),
    });
  }
  if (lineChannelAccessToken !== undefined) {
    updates.push({
      key: SETTING_KEYS.lineChannelAccessToken,
      value: trimOrNull(lineChannelAccessToken),
    });
  }
  if (lineAdminUserId !== undefined) {
    updates.push({
      key: SETTING_KEYS.lineAdminUserId,
      value: trimOrNull(lineAdminUserId),
    });
  }
  if (facebookPageId !== undefined) {
    updates.push({
      key: SETTING_KEYS.facebookPageId,
      value: trimOrNull(facebookPageId),
    });
  }
  if (facebookAppId !== undefined) {
    updates.push({
      key: SETTING_KEYS.facebookAppId,
      value: trimOrNull(facebookAppId),
    });
  }
  if (adminPhoneNumber !== undefined) {
    updates.push({
      key: SETTING_KEYS.adminPhoneNumber,
      value: trimOrNull(adminPhoneNumber),
    });
  }
  if (lineOfficialUrl !== undefined) {
    updates.push({
      key: SETTING_KEYS.lineOfficialUrl,
      value: trimOrNull(lineOfficialUrl),
    });
  }

  if (updates.length > 0) {
    await prisma.$transaction(
      updates.map((u) =>
        prisma.setting.upsert({
          where: { key: u.key },
          update: { value: u.value },
          create: { key: u.key, value: u.value },
        })
      )
    );
  }

  const values = await getSettingValues();
  return NextResponse.json(values);
}

