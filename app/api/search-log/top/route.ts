import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

// GET: ดึง Top 10 คำค้นหายอดนิยม (Admin only)
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as { role?: string }).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const top = await (prisma as any).searchQuery.findMany({
    orderBy: { count: "desc" },
    take: 10,
  });

  return NextResponse.json(top);
}
