import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { writeFile, mkdir, readFile } from "fs/promises";
import path from "path";
import sharp from "sharp";
import { authOptions } from "@/lib/auth";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
const WATERMARK_PATH = path.join(process.cwd(), "public", "watermark.png");

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

const EXT_BY_TYPE: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/jpg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};

function getExtension(file: File): string | null {
  const ext = EXT_BY_TYPE[file.type];
  if (ext) return ext;
  const name = file.name.toLowerCase();
  if (name.endsWith(".jpg") || name.endsWith(".jpeg")) return ".jpg";
  if (name.endsWith(".png")) return ".png";
  if (name.endsWith(".webp")) return ".webp";
  return null;
}

async function applyWatermark(imageBuffer: Buffer): Promise<Buffer> {
  console.log("applyWatermark started");
  const image = sharp(imageBuffer);
  const metadata = await image.metadata();
  const imgW = metadata.width ?? 800;
  const imgH = metadata.height ?? 600;
  console.log("Image size:", imgW, "x", imgH);

  // Read watermark logo and resize to ~25% of image width
  console.log("Reading watermark from:", WATERMARK_PATH);
  const watermarkBuf = await readFile(WATERMARK_PATH);
  const wmTargetW = Math.round(imgW * 0.25);
  console.log("Watermark target width:", wmTargetW);
  const resizedWm = await sharp(watermarkBuf)
    .resize({ width: wmTargetW, withoutEnlargement: false })
    .ensureAlpha()
    .toBuffer();

  // Get resized watermark dimensions
  const wmMeta = await sharp(resizedWm).metadata();
  const wmW = wmMeta.width ?? wmTargetW;
  const wmH = wmMeta.height ?? 30;
  console.log("Resized watermark size:", wmW, "x", wmH);

  // Apply 30% opacity to watermark
  const fadedWm = await sharp(resizedWm)
    .composite([{
      input: Buffer.from(
        `<svg width="${wmW}" height="${wmH}"><rect width="${wmW}" height="${wmH}" fill="black" opacity="0.7"/></svg>`
      ),
      blend: "dest-in",
    }])
    .toBuffer();
  console.log("Applied opacity mask");

  // Position: bottom-right with padding
  const padding = Math.round(Math.min(imgW, imgH) * 0.03);
  const left = imgW - wmW - padding;
  const top = imgH - wmH - padding;
  console.log("Watermark position:", left, top);

  const result = image
    .composite([{ input: fadedWm, left: Math.max(0, left), top: Math.max(0, top) }])
    .toBuffer();
  console.log("Watermark composite completed");
  return result;
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as { role?: string }).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const allowed = ALLOWED_TYPES.includes(file.type as (typeof ALLOWED_TYPES)[number]);
  const ext = getExtension(file);
  if (!allowed || !ext) {
    return NextResponse.json(
      { error: "Only JPG, PNG and WebP images are allowed" },
      { status: 400 }
    );
  }

  const bytes = await file.arrayBuffer();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let buffer: any = Buffer.from(bytes);

  // Apply watermark by default; send watermark=false in formData to skip
  const skipWatermark = formData.get("watermark") === "false";
  console.log("Upload watermark skip:", skipWatermark);
  if (!skipWatermark) {
    try {
      console.log("Applying watermark...");
      buffer = await applyWatermark(buffer) as Buffer;
      console.log("Watermark applied successfully");
    } catch (err) {
      console.error("Watermark failed, saving original:", err);
    }
  }

  const baseName = file.name.replace(/\.[^.]+$/, "").replace(/[^a-zA-Z0-9.-]/g, "_") || "image";
  const uniqueName = `${Date.now()}-${baseName}${ext}`;

  await mkdir(UPLOAD_DIR, { recursive: true });
  const filePath = path.join(UPLOAD_DIR, uniqueName);
  await writeFile(filePath, buffer);

  const url = `/uploads/${uniqueName}`;
  return NextResponse.json({ url });
}
