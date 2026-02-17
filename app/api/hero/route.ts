import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

/** Public: get all hero slides ordered by order asc */
export async function GET() {
  const slides = await prisma.heroSlide.findMany({
    orderBy: { order: "asc" },
  });
  return NextResponse.json(slides);
}

/** Admin: create a new hero slide */
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as { role?: string }).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
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

  const imageUrlStr = typeof imageUrl === "string" ? imageUrl.trim() : "";
  if (!imageUrlStr) {
    return NextResponse.json(
      { error: "Image URL is required. Please add or upload an image." },
      { status: 400 }
    );
  }

  const slide = await prisma.heroSlide.create({
    data: {
      imageUrl: imageUrlStr,
      titleTh: titleTh != null && String(titleTh).trim() !== "" ? String(titleTh).trim() : null,
      titleEn: titleEn != null && String(titleEn).trim() !== "" ? String(titleEn).trim() : null,
      titleCn: titleCn != null && String(titleCn).trim() !== "" ? String(titleCn).trim() : null,
      subtitleTh: subtitleTh != null && String(subtitleTh).trim() !== "" ? String(subtitleTh).trim() : null,
      subtitleEn: subtitleEn != null && String(subtitleEn).trim() !== "" ? String(subtitleEn).trim() : null,
      subtitleCn: subtitleCn != null && String(subtitleCn).trim() !== "" ? String(subtitleCn).trim() : null,
      linkUrl: linkUrl != null && String(linkUrl).trim() !== "" ? String(linkUrl).trim() : null,
      order: typeof order === "number" ? order : 0,
    },
  });
  return NextResponse.json(slide);
}
