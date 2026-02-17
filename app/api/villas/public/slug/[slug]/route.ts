import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Public API: get one villa by slug for detail page. No auth required.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const villa = await prisma.villa.findFirst({
    where: { slug: slug ?? "" },
  });
  if (!villa) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(villa);
}
