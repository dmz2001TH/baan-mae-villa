import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { unlink } from "fs/promises";
import path from "path";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as { role?: string }).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const villa = await prisma.villa.findUnique({ where: { id } });
  if (!villa) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(villa);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as { role?: string }).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
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
    threeDTourUrl,
    floorPlanUrl,
    videoTourUrl,
    nearbyPlaces,
    latitude,
    longitude,
  } = body;

  const updateData: Record<string, unknown> = {};
  if (typeof status === "string" && (status === "AVAILABLE" || status === "SOLD_OUT")) {
    updateData.status = status;
  }
  if (typeof name === "string") updateData.name = name;
  if (typeof slug === "string") updateData.slug = slug.replace(/\s+/g, "-").toLowerCase();
  if (typeof location === "string") updateData.location = location;
  if (typeof price === "number") updateData.price = price;
  if (typeof bedrooms === "number") updateData.bedrooms = bedrooms;
  if (typeof bathrooms === "number") updateData.bathrooms = bathrooms;
  if (description !== undefined) updateData.description = description ? String(description) : null;
  if (Array.isArray(images)) updateData.images = images;
  if (typeof isFeatured === "boolean") updateData.isFeatured = isFeatured;
  if (typeof discountPercentage === "number") updateData.discountPercentage = discountPercentage;
  if (nameTh !== undefined) updateData.nameTh = nameTh ? String(nameTh) : null;
  if (nameEn !== undefined) updateData.nameEn = nameEn ? String(nameEn) : null;
  if (nameCn !== undefined) updateData.nameCn = nameCn ? String(nameCn) : null;
  if (descriptionTh !== undefined) updateData.descriptionTh = descriptionTh ? String(descriptionTh) : null;
  if (descriptionEn !== undefined) updateData.descriptionEn = descriptionEn ? String(descriptionEn) : null;
  if (descriptionCn !== undefined) updateData.descriptionCn = descriptionCn ? String(descriptionCn) : null;
  if (locationEn !== undefined) updateData.locationEn = locationEn ? String(locationEn) : null;
  if (locationCn !== undefined) updateData.locationCn = locationCn ? String(locationCn) : null;
  if (featuresEn !== undefined) updateData.featuresEn = featuresEn ? String(featuresEn) : null;
  if (featuresCn !== undefined) updateData.featuresCn = featuresCn ? String(featuresCn) : null;
  if (Array.isArray(facilities)) updateData.facilities = facilities;
  if (mapEmbedUrl !== undefined) updateData.mapEmbedUrl = mapEmbedUrl ? String(mapEmbedUrl) : null;
  if (threeDTourUrl !== undefined) updateData.threeDTourUrl = threeDTourUrl ? String(threeDTourUrl) : null;
  if (floorPlanUrl !== undefined) updateData.floorPlanUrl = floorPlanUrl ? String(floorPlanUrl) : null;
  if (videoTourUrl !== undefined) updateData.videoTourUrl = videoTourUrl ? String(videoTourUrl) : null;
  if (nearbyPlaces !== undefined) updateData.nearbyPlaces = Array.isArray(nearbyPlaces) ? nearbyPlaces : null;
  if (latitude !== undefined) updateData.latitude = typeof latitude === "number" ? latitude : null;
  if (longitude !== undefined) updateData.longitude = typeof longitude === "number" ? longitude : null;

  const villa = await prisma.villa.update({
    where: { id },
    data: updateData as Parameters<typeof prisma.villa.update>[0]["data"],
  });
  return NextResponse.json(villa);
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as { role?: string }).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const url = new URL(request.url);
  const deleteFiles = url.searchParams.get("deleteFiles") === "true";

  const villa = await prisma.villa.findUnique({ where: { id } });
  if (!villa) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (deleteFiles && villa.images.length > 0) {
    const uploadsDir = path.join(process.cwd(), "public");
    for (const imgUrl of villa.images) {
      if (imgUrl.startsWith("/uploads/")) {
        const filePath = path.join(uploadsDir, imgUrl);
        try {
          await unlink(filePath);
        } catch {
          // ignore missing files
        }
      }
    }
  }

  await prisma.villa.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
