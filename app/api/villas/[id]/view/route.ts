import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

async function incrementView(id: string) {
  const villa = await prisma.villa.update({
    where: { id },
    data: { views: { increment: 1 } },
  });
  return villa.views;
}

/**
 * Increment villa view count. Supports GET (legacy) and POST.
 * Client should use POST and enforce 1-hour dedup via localStorage.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "Missing villa id" }, { status: 400 });
  }
  try {
    const views = await incrementView(id);
    console.log("[view GET] villa id:", id, "-> views after increment:", views);
    return NextResponse.json({ views });
  } catch (err) {
    console.error("[view GET] Prisma error for villa id:", id, err);
    return NextResponse.json({ error: "Villa not found" }, { status: 404 });
  }
}

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "Missing villa id" }, { status: 400 });
  }
  try {
    const views = await incrementView(id);
    console.log("[view POST] villa id:", id, "-> views after increment:", views);
    return NextResponse.json({ views });
  } catch (err) {
    console.error("[view POST] Prisma error for villa id:", id, err);
    return NextResponse.json({ error: "Villa not found" }, { status: 404 });
  }
}
