import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

// Admin: get single article
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as { role?: string }).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const article = await (prisma as any).article.findUnique({ where: { id } });
  if (!article) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(article);
}

// Admin: update article
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
  const { title, slug, content, coverImage, excerpt, isPublished } = body;

  const updateData: Record<string, unknown> = {};
  if (typeof title === "string") updateData.title = title;
  if (typeof slug === "string") updateData.slug = slug.replace(/\s+/g, "-").toLowerCase();
  if (typeof content === "string") updateData.content = content;
  if (coverImage !== undefined) updateData.coverImage = coverImage ? String(coverImage) : null;
  if (excerpt !== undefined) updateData.excerpt = excerpt ? String(excerpt) : null;
  if (typeof isPublished === "boolean") updateData.isPublished = isPublished;

  const article = await (prisma as any).article.update({
    where: { id },
    data: updateData,
  });
  return NextResponse.json(article);
}

// Admin: delete article
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as { role?: string }).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  await (prisma as any).article.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
