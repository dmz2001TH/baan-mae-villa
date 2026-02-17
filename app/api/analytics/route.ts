import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as { role?: string }).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 1. Top 5 villas by views
  const topVillas = await prisma.villa.findMany({
    select: { id: true, name: true, views: true },
    orderBy: { views: "desc" },
    take: 5,
  });

  // 2. Leads per day (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const recentLeads = await prisma.lead.findMany({
    where: { createdAt: { gte: thirtyDaysAgo } },
    select: { createdAt: true },
    orderBy: { createdAt: "asc" },
  });

  // Group leads by date
  const leadsPerDay: Record<string, number> = {};
  for (const lead of recentLeads) {
    const day = lead.createdAt.toISOString().slice(0, 10); // YYYY-MM-DD
    leadsPerDay[day] = (leadsPerDay[day] ?? 0) + 1;
  }

  // Fill in missing days with 0
  const leadsDaily: { date: string; count: number }[] = [];
  const cursor = new Date(thirtyDaysAgo);
  const today = new Date();
  while (cursor <= today) {
    const key = cursor.toISOString().slice(0, 10);
    leadsDaily.push({ date: key, count: leadsPerDay[key] ?? 0 });
    cursor.setDate(cursor.getDate() + 1);
  }

  // 3. Weekly villa views (last 12 weeks for marketing insights)
  const twelveWeeksAgo = new Date();
  twelveWeeksAgo.setDate(twelveWeeksAgo.getDate() - 12 * 7);

  const weeklyViews = await prisma.villa.findMany({
    where: { createdAt: { gte: twelveWeeksAgo } },
    select: { views: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  });

  // Group by week
  const viewsPerWeek: Record<string, number> = {};
  for (const villa of weeklyViews) {
    const weekStart = new Date(villa.createdAt);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // Start of week (Sunday)
    const weekKey = weekStart.toISOString().slice(0, 10); // YYYY-MM-DD
    viewsPerWeek[weekKey] = (viewsPerWeek[weekKey] ?? 0) + (villa.views || 0);
  }

  // Fill in missing weeks with 0
  const weeklyViewsData: { week: string; views: number }[] = [];
  const weekCursor = new Date(twelveWeeksAgo);
  weekCursor.setDate(weekCursor.getDate() - weekCursor.getDay()); // Align to week start
  while (weekCursor <= today) {
    const key = weekCursor.toISOString().slice(0, 10);
    weeklyViewsData.push({ week: key, views: viewsPerWeek[key] ?? 0 });
    weekCursor.setDate(weekCursor.getDate() + 7);
  }

  // 4. Lead status breakdown
  const allLeads = await prisma.lead.findMany({
    select: { status: true },
  });
  const statusBreakdown = {
    PENDING: 0,
    CONTACTED: 0,
    CLOSED: 0,
  };
  for (const l of allLeads) {
    if (l.status in statusBreakdown) {
      statusBreakdown[l.status as keyof typeof statusBreakdown]++;
    }
  }

  // 5. Summary counts
  const totalVillas = await prisma.villa.count();
  const totalLeads = allLeads.length;
  const viewsAgg = await prisma.villa.aggregate({ _sum: { views: true } });

  return NextResponse.json({
    topVillas,
    leadsDaily,
    weeklyViews: weeklyViewsData,
    statusBreakdown,
    summary: {
      totalVillas,
      totalLeads,
      totalViews: viewsAgg._sum.views ?? 0,
    },
  });
}
