import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as { role?: string }).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const body = await request.json();
  const {
    imageUrl,
    titleTh,
    titleEn,
    titleCn,
    subtitleTh,
    subtitleEn,
    subtitleCn,
    linkUrl,
    order,
  } = body;

  const updateData: Record<string, unknown> = {};
  if (typeof imageUrl === "string") {
    const trimmed = imageUrl.trim();
    if (!trimmed) {
      return NextResponse.json(
        { error: "Image URL is required. Please add or upload an image." },
        { status: 400 }
      );
    }
    updateData.imageUrl = trimmed;
  }
  if (titleTh !== undefined) updateData.titleTh = titleTh != null && String(titleTh).trim() !== "" ? String(titleTh).trim() : null;
  if (titleEn !== undefined) updateData.titleEn = titleEn != null && String(titleEn).trim() !== "" ? String(titleEn).trim() : null;
  if (titleCn !== undefined) updateData.titleCn = titleCn != null && String(titleCn).trim() !== "" ? String(titleCn).trim() : null;
  if (subtitleTh !== undefined) updateData.subtitleTh = subtitleTh != null && String(subtitleTh).trim() !== "" ? String(subtitleTh).trim() : null;
  if (subtitleEn !== undefined) updateData.subtitleEn = subtitleEn != null && String(subtitleEn).trim() !== "" ? String(subtitleEn).trim() : null;
  if (subtitleCn !== undefined) updateData.subtitleCn = subtitleCn != null && String(subtitleCn).trim() !== "" ? String(subtitleCn).trim() : null;
  if (linkUrl !== undefined) updateData.linkUrl = linkUrl != null && String(linkUrl).trim() !== "" ? String(linkUrl).trim() : null;
  if (typeof order === "number") updateData.order = order;

  const slide = await prisma.heroSlide.update({
    where: { id },
    data: updateData as Parameters<typeof prisma.heroSlide.update>[0]["data"],
  });
  return NextResponse.json(slide);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as { role?: string }).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  await prisma.heroSlide.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
