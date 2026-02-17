import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

// Admin: list all articles
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as { role?: string }).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const articles = await (prisma as any).article.findMany({
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(articles);
}

// Admin: create article
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as { role?: string }).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { title, slug, content, coverImage, excerpt, isPublished } = body;

  if (!title || !slug || !content) {
    return NextResponse.json(
      { error: "Missing required fields: title, slug, content" },
      { status: 400 }
    );
  }

  try {
    const article = await (prisma as any).article.create({
      data: {
        title: String(title),
        slug: String(slug).replace(/\s+/g, "-").toLowerCase(),
        content: String(content),
        coverImage: coverImage ? String(coverImage) : null,
        excerpt: excerpt ? String(excerpt) : null,
        isPublished: Boolean(isPublished),
      },
    });
    return NextResponse.json(article);
  } catch (err: any) {
    console.error("Article create error:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to create article" },
      { status: 500 }
    );
  }
}
