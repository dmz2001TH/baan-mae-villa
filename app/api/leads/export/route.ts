import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as { role?: string }).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const leads = await prisma.lead.findMany({
    orderBy: { createdAt: "desc" },
    include: { villa: { select: { name: true } } },
  });

  // CSV header
  const headers = ["Name", "Phone", "LINE ID", "Villa", "Visit Date", "Message", "Status", "Created"];

  // Build rows
  const rows = leads.map((lead) => [
    escapeCsv(lead.name),
    escapeCsv(lead.tel),
    escapeCsv(lead.lineId ?? ""),
    escapeCsv(lead.villa?.name ?? ""),
    lead.visitDate ? new Date(lead.visitDate).toLocaleDateString("th-TH") : "",
    escapeCsv(lead.message ?? ""),
    lead.status,
    new Date(lead.createdAt).toLocaleString("th-TH"),
  ]);

  // UTF-8 BOM for Excel Thai support
  const BOM = "\uFEFF";
  const csv = BOM + [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");

  const today = new Date().toISOString().slice(0, 10);

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="leads-${today}.csv"`,
    },
  });
}

function escapeCsv(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}
