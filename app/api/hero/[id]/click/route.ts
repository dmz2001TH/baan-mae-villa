import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Increment hero slide click count (e.g. when user clicks CTA on a slide).
 * GET /api/hero/[id]/click — no auth.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "Missing slide id" }, { status: 400 });
  }

  try {
    const slide = await prisma.heroSlide.update({
      where: { id },
      data: { clicks: { increment: 1 } },
    });
    return NextResponse.json({ clicks: slide.clicks });
  } catch {
    return NextResponse.json({ error: "Slide not found" }, { status: 404 });
  }
}
