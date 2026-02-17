import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET /api/bookings - Get all bookings (admin only) or bookings for specific villa
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const villaId = searchParams.get("villaId");
    const session = await getServerSession(authOptions);

    // Check if user is authenticated and is admin
    if (!session || (session.user as { role?: string }).role !== "ADMIN") {
      // For non-admin users, only allow fetching bookings for specific villa
      if (!villaId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    if (villaId) {
      // Get bookings for specific villa (public endpoint)
      const bookings = await prisma.booking.findMany({
        where: {
          villaId,
          status: "BOOKED",
        },
        orderBy: {
          startDate: "asc",
        },
        select: {
          id: true,
          startDate: true,
          endDate: true,
          status: true,
        },
      });
      return NextResponse.json(bookings);
    } else {
      // Get all bookings (admin only)
      const bookings = await prisma.booking.findMany({
        include: {
          villa: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });
      return NextResponse.json(bookings);
    }
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return NextResponse.json({ error: "Failed to fetch bookings" }, { status: 500 });
  }
}

// POST /api/bookings - Create new booking (admin only)
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is authenticated and is admin
    if (!session || (session.user as { role?: string }).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { villaId, startDate, endDate, status = "BOOKED", notes } = body;

    // Validate required fields
    if (!villaId || !startDate || !endDate) {
      return NextResponse.json(
        { error: "Missing required fields: villaId, startDate, endDate" },
        { status: 400 }
      );
    }

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return NextResponse.json({ error: "Invalid date format" }, { status: 400 });
    }

    if (start >= end) {
      return NextResponse.json(
        { error: "Start date must be before end date" },
        { status: 400 }
      );
    }

    // Check for overlapping bookings
    const overlappingBooking = await prisma.booking.findFirst({
      where: {
        villaId,
        status: "BOOKED",
        OR: [
          {
            AND: [
              { startDate: { lte: start } },
              { endDate: { gte: start } },
            ],
          },
          {
            AND: [
              { startDate: { lte: end } },
              { endDate: { gte: end } },
            ],
          },
          {
            AND: [
              { startDate: { gte: start } },
              { endDate: { lte: end } },
            ],
          },
        ],
      },
    });

    if (overlappingBooking) {
      return NextResponse.json(
        { error: "Booking dates overlap with existing booking" },
        { status: 409 }
      );
    }

    // Verify villa exists
    const villa = await prisma.villa.findUnique({
      where: { id: villaId },
    });

    if (!villa) {
      return NextResponse.json({ error: "Villa not found" }, { status: 404 });
    }

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        villaId,
        startDate: start,
        endDate: end,
        status,
        notes,
      },
      include: {
        villa: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    return NextResponse.json(booking, { status: 201 });
  } catch (error) {
    console.error("Error creating booking:", error);
    return NextResponse.json({ error: "Failed to create booking" }, { status: 500 });
  }
}
