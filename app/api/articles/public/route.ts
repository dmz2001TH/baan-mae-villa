import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Public: list published articles
export async function GET() {
  const articles = await (prisma as any).article.findMany({
    where: { isPublished: true },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      slug: true,
      coverImage: true,
      excerpt: true,
      createdAt: true,
    },
  });

  return NextResponse.json(articles);
}
