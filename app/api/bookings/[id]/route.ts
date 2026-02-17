import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// DELETE /api/bookings/[id] - Delete booking (admin only)
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is authenticated and is admin
    if (!session || (session.user as { role?: string }).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Check if booking exists
    const existingBooking = await prisma.booking.findUnique({
      where: { id },
    });

    if (!existingBooking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Delete booking
    await prisma.booking.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Booking deleted successfully" });
  } catch (error) {
    console.error("Error deleting booking:", error);
    return NextResponse.json({ error: "Failed to delete booking" }, { status: 500 });
  }
}

// PATCH /api/bookings/[id] - Update booking (admin only)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is authenticated and is admin
    if (!session || (session.user as { role?: string }).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { startDate, endDate, status, notes } = body;

    // Check if booking exists
    const existingBooking = await prisma.booking.findUnique({
      where: { id },
    });

    if (!existingBooking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Validate dates if provided
    let start, end;
    if (startDate || endDate) {
      start = startDate ? new Date(startDate) : existingBooking.startDate;
      end = endDate ? new Date(endDate) : existingBooking.endDate;

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return NextResponse.json({ error: "Invalid date format" }, { status: 400 });
      }

      if (start >= end) {
        return NextResponse.json(
          { error: "Start date must be before end date" },
          { status: 400 }
        );
      }

      // Check for overlapping bookings (excluding current booking)
      const overlappingBooking = await prisma.booking.findFirst({
        where: {
          villaId: existingBooking.villaId,
          status: "BOOKED",
          id: { not: id },
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
    }

    // Update booking
    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: {
        ...(startDate && { startDate: start }),
        ...(endDate && { endDate: end }),
        ...(status && { status }),
        ...(notes !== undefined && { notes }),
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

    return NextResponse.json(updatedBooking);
  } catch (error) {
    console.error("Error updating booking:", error);
    return NextResponse.json({ error: "Failed to update booking" }, { status: 500 });
  }
}
