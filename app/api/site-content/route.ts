import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

/** Public: get all site content as key -> { contentTh, contentEn, contentCn, imageUrl, visible } */
export async function GET() {
  const rows = await prisma.siteContent.findMany();
  const map: Record<
    string,
    { contentTh: string | null; contentEn: string | null; contentCn: string | null; imageUrl: string | null; visible: boolean }
  > = {};
  for (const r of rows) {
    map[r.key] = {
      contentTh: r.contentTh,
      contentEn: r.contentEn,
      contentCn: r.contentCn,
      imageUrl: r.imageUrl,
      visible: r.visible,
    };
  }
  return NextResponse.json(map);
}

/** Admin: upsert one row by key */
export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as { role?: string }).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await request.json();
  const { key, contentTh, contentEn, contentCn, imageUrl, visible } = body;
  if (typeof key !== "string" || !key.trim()) {
    return NextResponse.json({ error: "key required" }, { status: 400 });
  }
  const k = key.trim();
  const updateData: Record<string, unknown> = {};
  if (contentTh !== undefined) updateData.contentTh = contentTh ? String(contentTh) : null;
  if (contentEn !== undefined) updateData.contentEn = contentEn ? String(contentEn) : null;
  if (contentCn !== undefined) updateData.contentCn = contentCn ? String(contentCn) : null;
  if (imageUrl !== undefined) updateData.imageUrl = imageUrl ? String(imageUrl) : null;
  if (typeof visible === "boolean") updateData.visible = visible;

  const row = await prisma.siteContent.upsert({
    where: { key: k },
    create: {
      key: k,
      contentTh: (updateData.contentTh as string | null) ?? null,
      contentEn: (updateData.contentEn as string | null) ?? null,
      contentCn: (updateData.contentCn as string | null) ?? null,
      imageUrl: (updateData.imageUrl as string | null) ?? null,
      visible: (updateData.visible as boolean) ?? true,
    },
    update: {
      ...(contentTh !== undefined && { contentTh: contentTh ? String(contentTh) : null }),
      ...(contentEn !== undefined && { contentEn: contentEn ? String(contentEn) : null }),
      ...(contentCn !== undefined && { contentCn: contentCn ? String(contentCn) : null }),
      ...(imageUrl !== undefined && { imageUrl: imageUrl ? String(imageUrl) : null }),
      ...(typeof visible === "boolean" && { visible }),
    },
  });
  return NextResponse.json(row);
}
