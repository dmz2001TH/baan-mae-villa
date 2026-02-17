import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { LeadStatus } from "@prisma/client";

// Admin: update lead status (and optionally visitDate/message)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as { role?: string }).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "Missing lead id" }, { status: 400 });
  }

  const body = await request.json().catch(() => ({}));
  const {
    status,
    visitDate,
    message,
  } = body as {
    status?: unknown;
    visitDate?: unknown;
    message?: unknown;
  };

  const data: {
    status?: LeadStatus;
    visitDate?: Date | null;
    message?: string | null;
  } = {};

  if (status !== undefined) {
    const s = String(status).toUpperCase();
    if (!["PENDING", "CONTACTED", "CLOSED"].includes(s)) {
      return NextResponse.json(
        { error: "Invalid status" },
        { status: 400 }
      );
    }
    data.status = s as LeadStatus;
  }

  if (visitDate !== undefined) {
    if (visitDate === null || visitDate === "") {
      data.visitDate = null;
    } else if (typeof visitDate === "string") {
      const d = new Date(visitDate);
      if (!Number.isNaN(d.getTime())) {
        data.visitDate = d;
      }
    }
  }

  if (message !== undefined) {
    const v = String(message).trim();
    data.message = v || null;
  }

  const lead = await prisma.lead.update({
    where: { id },
    data,
  });

  return NextResponse.json(lead);
}

