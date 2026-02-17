import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { hash } from "bcryptjs";
import "dotenv/config";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const email = process.env.ADMIN_EMAIL ?? "admin@baanmae.com";
  const password = process.env.ADMIN_PASSWORD ?? "admin123";
  const hashed = await hash(password, 12);

  await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      password: hashed,
      name: "Admin",
      role: "ADMIN",
    },
  });

  console.log("Admin user ready:", email);

  // Seed sample villas with coordinates (Pattaya/Jomtien area)
  const sampleVillas = [
    {
      name: "Sea View Villa Jomtien",
      slug: "sea-view-villa-jomtien",
      location: "Jomtien Beach, Pattaya",
      price: 8500000,
      bedrooms: 3,
      bathrooms: 3,
      description: "Luxury villa with stunning sea views",
      images: ["/placeholder-villa.jpg"],
      latitude: 12.8797,
      longitude: 100.8878,
      isFeatured: true,
    },
    {
      name: "Modern Pool Villa Pattaya",
      slug: "modern-pool-villa-pattaya",
      location: "Central Pattaya",
      price: 12000000,
      bedrooms: 4,
      bathrooms: 4,
      description: "Contemporary design with private pool",
      images: ["/placeholder-villa.jpg"],
      latitude: 12.9236,
      longitude: 100.8825,
      isFeatured: true,
    },
    {
      name: "Garden Villa Na Jomtien",
      slug: "garden-villa-na-jomtien",
      location: "Na Jomtien",
      price: 6500000,
      bedrooms: 2,
      bathrooms: 2,
      description: "Peaceful villa surrounded by tropical gardens",
      images: ["/placeholder-villa.jpg"],
      latitude: 12.8234,
      longitude: 100.9123,
    },
  ];

  for (const villa of sampleVillas) {
    await prisma.villa.upsert({
      where: { slug: villa.slug },
      update: {},
      create: villa,
    });
  }

  console.log("Sample villas seeded with coordinates");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
