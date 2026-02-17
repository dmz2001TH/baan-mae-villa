import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Public API for villas: home page (all or limited), collection page (search/filters).
 * No auth required.
 * Query: q (name/location), featured, minPrice, maxPrice, bedrooms, limit
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const featured = searchParams.get("featured");
  const limitParam = searchParams.get("limit");
  const limit = limitParam ? Math.min(Math.max(1, Number(limitParam)), 50) : undefined;
  const q = searchParams.get("q")?.trim() ?? "";
  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");
  const bedrooms = searchParams.get("bedrooms");

  const conditions: object[] = [];
  if (featured === "true") {
    conditions.push({ isFeatured: true });
  }
  if (q) {
    conditions.push({
      OR: [
        { name: { contains: q, mode: "insensitive" } },
        { location: { contains: q, mode: "insensitive" } },
      ],
    });
  }
  const minP = minPrice ? Number(minPrice) : NaN;
  if (!Number.isNaN(minP) && minP >= 0) {
    conditions.push({ price: { gte: minP } });
  }
  const maxP = maxPrice ? Number(maxPrice) : NaN;
  if (!Number.isNaN(maxP) && maxP >= 0) {
    conditions.push({ price: { lte: maxP } });
  }
  const beds = bedrooms ? Number(bedrooms) : NaN;
  if (!Number.isNaN(beds) && beds >= 0) {
    conditions.push({ bedrooms: { gte: beds } });
  }

  const villas = await prisma.villa.findMany({
    where: conditions.length ? { AND: conditions } : undefined,
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return NextResponse.json(villas);
}
