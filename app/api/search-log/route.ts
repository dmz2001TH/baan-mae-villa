import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST: บันทึกคำค้นหา (upsert — ถ้าคำเดิมซ้ำให้บวก count)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const query = String(body.query ?? "").trim().toLowerCase();

    if (!query || query.length < 2) {
      return NextResponse.json({ error: "Query too short" }, { status: 400 });
    }

    const result = await (prisma as any).searchQuery.upsert({
      where: { query },
      update: {
        count: { increment: 1 },
        lastSearchedAt: new Date(),
      },
      create: {
        query,
        count: 1,
        lastSearchedAt: new Date(),
      },
    });

    return NextResponse.json({ ok: true, id: result.id });
  } catch (err: any) {
    console.error("Search log error:", err);
    return NextResponse.json({ error: "Failed to log search" }, { status: 500 });
  }
}
