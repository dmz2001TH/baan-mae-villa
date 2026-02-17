import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as { role?: string }).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() ?? "";

  const villas = await prisma.villa.findMany({
    where:
      q === ""
        ? undefined
        : {
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { location: { contains: q, mode: "insensitive" } },
            ],
          },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(villas);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as { role?: string }).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const {
    name,
    slug,
    location,
    price,
    bedrooms,
    bathrooms,
    description,
    images,
    isFeatured,
    status,
    discountPercentage,
    nameTh,
    nameEn,
    nameCn,
    descriptionTh,
    descriptionEn,
    descriptionCn,
    locationEn,
    locationCn,
    featuresEn,
    featuresCn,
    facilities,
    mapEmbedUrl,
    nearbyPlaces,
    latitude,
    longitude,
  } = body;

  if (!name || !slug || !location || price == null) {
    return NextResponse.json(
      { error: "Missing required fields: name, slug, location, price" },
      { status: 400 }
    );
  }

  const villa = await prisma.villa.create({
    data: {
      name: String(name),
      slug: String(slug).replace(/\s+/g, "-").toLowerCase(),
      location: String(location),
      price: Number(price),
      bedrooms: Number(bedrooms) || 0,
      bathrooms: Number(bathrooms) || 0,
      description: description ? String(description) : null,
      images: Array.isArray(images) ? images : [],
      isFeatured: Boolean(isFeatured),
      status: status === "SOLD_OUT" ? "SOLD_OUT" : "AVAILABLE",
      discountPercentage: Number(discountPercentage) || 0,
      nameTh: nameTh ? String(nameTh) : null,
      nameEn: nameEn ? String(nameEn) : null,
      nameCn: nameCn ? String(nameCn) : null,
      descriptionTh: descriptionTh ? String(descriptionTh) : null,
      descriptionEn: descriptionEn ? String(descriptionEn) : null,
      descriptionCn: descriptionCn ? String(descriptionCn) : null,
      locationEn: locationEn ? String(locationEn) : null,
      locationCn: locationCn ? String(locationCn) : null,
      featuresEn: featuresEn ? String(featuresEn) : null,
      featuresCn: featuresCn ? String(featuresCn) : null,
      facilities: Array.isArray(facilities) ? facilities : [],
      mapEmbedUrl: mapEmbedUrl ? String(mapEmbedUrl) : null,
      nearbyPlaces: Array.isArray(nearbyPlaces) ? nearbyPlaces : undefined,
      latitude: typeof latitude === "number" ? latitude : null,
      longitude: typeof longitude === "number" ? longitude : null,
    },
  });

  return NextResponse.json(villa);
}
