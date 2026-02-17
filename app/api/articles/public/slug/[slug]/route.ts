import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Public: get single published article by slug
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const article = await (prisma as any).article.findFirst({
    where: { slug: slug ?? "", isPublished: true },
  });
  if (!article) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(article);
}
