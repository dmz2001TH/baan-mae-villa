import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { sendLineMessage } from "@/lib/line-messaging";

// Public: create a new lead (booking/visit request)
export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const {
    name,
    tel,
    lineId,
    visitDate,
    message,
    villaId,
  } = body as {
    name?: unknown;
    tel?: unknown;
    lineId?: unknown;
    visitDate?: unknown;
    message?: unknown;
    villaId?: unknown;
  };

  const nameStr = typeof name === "string" ? name.trim() : String(name ?? "").trim();
  const telStr = typeof tel === "string" ? tel.trim() : String(tel ?? "").trim();

  if (!nameStr || !telStr) {
    return NextResponse.json(
      { error: "Name and telephone are required." },
      { status: 400 }
    );
  }

  let visitDateValue: Date | null = null;
  if (typeof visitDate === "string" && visitDate.trim()) {
    const d = new Date(visitDate);
    if (!Number.isNaN(d.getTime())) {
      visitDateValue = d;
    }
  }

  // Resolve villa name if villaId provided
  let villaName: string | null = null;
  const villaIdStr = villaId ? String(villaId).trim() || null : null;
  if (villaIdStr) {
    const v = await prisma.villa.findUnique({
      where: { id: villaIdStr },
      select: { name: true },
    });
    villaName = v?.name ?? null;
  }

  const lead = await prisma.lead.create({
    data: {
      name: nameStr,
      tel: telStr,
      lineId: lineId ? String(lineId).trim() || null : null,
      visitDate: visitDateValue,
      message: message ? String(message).trim() || null : null,
      villaId: villaIdStr,
    },
  });

  // Send LINE (Messaging API or Notify fallback, fire-and-forget, don't block the response)
  const lineMsg = [
    `\n🏡 ลูกค้าใหม่สนใจ!`,
    `👤 ชื่อ: ${nameStr}`,
    `📞 เบอร์: ${telStr}`,
    lineId ? `💬 LINE: ${String(lineId).trim()}` : null,
    villaName ? `🏠 สนใจ: ${villaName}` : null,
    visitDateValue ? `📅 วันเยี่ยมชม: ${visitDateValue.toLocaleDateString("th-TH")}` : null,
    message ? `💬 ข้อความ: ${String(message).trim()}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  sendLineMessage(lineMsg).catch(() => {});

  return NextResponse.json(lead, { status: 201 });
}

// Admin: list all leads (latest first)
export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as { role?: string }).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const leads = await prisma.lead.findMany({
    include: {
      villa: {
        select: { id: true, name: true, slug: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(leads);
}

