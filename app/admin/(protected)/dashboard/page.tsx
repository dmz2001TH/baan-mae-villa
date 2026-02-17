"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Home,
  Package,
  TrendingUp,
  Eye,
  MousePointer,
  Award,
  Users,
  BarChart3,
  Calendar,
  Clock,
  Search,
} from "lucide-react";

type Villa = {
  id: string;
  name: string;
  status: string;
  views?: number;
};

type HeroSlide = {
  id: string;
  order: number;
  titleEn: string | null;
  titleTh: string | null;
  linkUrl: string | null;
  clicks?: number;
};

type Analytics = {
  topVillas: { id: string; name: string; views: number }[];
  leadsDaily: { date: string; count: number }[];
  weeklyViews: { week: string; views: number }[];
  statusBreakdown: { PENDING: number; CONTACTED: number; CLOSED: number };
  summary: { totalVillas: number; totalLeads: number; totalViews: number };
};

type Booking = {
  id: string;
  startDate: string;
  endDate: string;
  status: string;
  villa: {
    id: string;
    name: string;
    slug: string;
  };
};

// ——— Pure SVG Bar Chart (no dependencies) ———
function BarChart({
  data,
  labelKey,
  valueKey,
  color = "#f59e0b",
  height = 200,
}: {
  data: Record<string, unknown>[];
  labelKey: string;
  valueKey: string;
  color?: string;
  height?: number;
}) {
  if (!data.length) return <p className="py-8 text-center text-neutral-500">No data</p>;
  const maxVal = Math.max(...data.map((d) => Number(d[valueKey]) || 0), 1);
  const barWidth = Math.max(8, Math.min(32, Math.floor(600 / data.length) - 4));
  const svgWidth = data.length * (barWidth + 4) + 40;

  return (
    <div className="overflow-x-auto">
      <svg
        width={svgWidth}
        height={height + 30}
        className="min-w-full"
        viewBox={`0 0 ${svgWidth} ${height + 30}`}
      >
        {data.map((d, i) => {
          const val = Number(d[valueKey]) || 0;
          const barH = (val / maxVal) * (height - 20);
          const x = 30 + i * (barWidth + 4);
          const y = height - barH;
          return (
            <g key={i}>
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barH}
                rx={3}
                fill={color}
                opacity={0.85}
              >
                <title>
                  {String(d[labelKey])}: {val}
                </title>
              </rect>
              {val > 0 && (
                <text
                  x={x + barWidth / 2}
                  y={y - 4}
                  textAnchor="middle"
                  fontSize={9}
                  fill="#a3a3a3"
                >
                  {val}
                </text>
              )}
              {/* Show label every few bars so it doesn't overlap */}
              {(data.length <= 15 || i % Math.ceil(data.length / 10) === 0) && (
                <text
                  x={x + barWidth / 2}
                  y={height + 14}
                  textAnchor="middle"
                  fontSize={8}
                  fill="#737373"
                >
                  {String(d[labelKey]).slice(5)}
                </text>
              )}
            </g>
          );
        })}
        {/* Y axis line */}
        <line x1={26} y1={0} x2={26} y2={height} stroke="#404040" strokeWidth={1} />
        <line x1={26} y1={height} x2={svgWidth} y2={height} stroke="#404040" strokeWidth={1} />
      </svg>
    </div>
  );
}

// ——— Donut Chart for status breakdown ———
function DonutChart({
  data,
}: {
  data: { label: string; value: number; color: string }[];
}) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  if (total === 0)
    return <p className="py-8 text-center text-neutral-500">No leads yet</p>;

  const size = 140;
  const stroke = 24;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:gap-8">
      <svg width={size} height={size} className="flex-shrink-0">
        {data.map((d, i) => {
          const pct = d.value / total;
          const dashLength = pct * circumference;
          const dashOffset = -offset;
          offset += dashLength;
          return (
            <circle
              key={i}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={d.color}
              strokeWidth={stroke}
              strokeDasharray={`${dashLength} ${circumference - dashLength}`}
              strokeDashoffset={dashOffset}
              transform={`rotate(-90 ${size / 2} ${size / 2})`}
            />
          );
        })}
        <text
          x={size / 2}
          y={size / 2}
          textAnchor="middle"
          dy="0.35em"
          fontSize={22}
          fontWeight="bold"
          fill="white"
        >
          {total}
        </text>
      </svg>
      <div className="space-y-2">
        {data.map((d, i) => (
          <div key={i} className="flex items-center gap-2 text-sm">
            <span
              className="inline-block h-3 w-3 rounded-full"
              style={{ backgroundColor: d.color }}
            />
            <span className="text-neutral-400">
              {d.label}: <span className="font-semibold text-white">{d.value}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<{
    total: number;
    soldOut: number;
    totalViews: number;
  } | null>(null);
  const [villas, setVillas] = useState<Villa[]>([]);
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [topKeywords, setTopKeywords] = useState<{ id: string; query: string; count: number; lastSearchedAt: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/villas", { credentials: "include", cache: "no-store" }).then((res) => res.json()),
      fetch("/api/hero", { cache: "no-store" }).then((res) => res.json()),
      fetch("/api/analytics", { credentials: "include", cache: "no-store" })
        .then((res) => (res.ok ? res.json() : null))
        .catch(() => null),
      fetch("/api/bookings", { credentials: "include", cache: "no-store" }).then((res) => res.json()),
      fetch("/api/search-log/top", { credentials: "include", cache: "no-store" })
        .then((res) => (res.ok ? res.json() : []))
        .catch(() => []),
    ])
      .then(([villasData, heroData, analyticsData, bookingsData, keywordsData]) => {
        const villaList = Array.isArray(villasData) ? villasData : [];
        const slides = Array.isArray(heroData) ? heroData : [];
        const bookingList = Array.isArray(bookingsData) ? bookingsData : [];
        setVillas(villaList);
        setHeroSlides(slides);
        setAnalytics(analyticsData);
        setBookings(bookingList);
        setTopKeywords(Array.isArray(keywordsData) ? keywordsData : []);
        const total = villaList.length;
        const soldOut = villaList.filter((v: Villa) => v.status === "SOLD_OUT").length;
        const totalViews = villaList.reduce((sum: number, v: Villa) => sum + (Number(v.views) || 0), 0);
        setStats({ total, soldOut, totalViews });
      })
      .catch(() => {
        setStats({ total: 0, soldOut: 0, totalViews: 0 });
        setVillas([]);
        setHeroSlides([]);
        setBookings([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const topVillas = [...villas]
    .sort((a, b) => (b.views ?? 0) - (a.views ?? 0))
    .slice(0, 5);
  const heroByClicks = [...heroSlides].sort((a, b) => (b.clicks ?? 0) - (a.clicks ?? 0));

  return (
    <>
      <div className="border-b border-neutral-800 bg-neutral-900/50 px-4 py-6 sm:px-8">
        <h1 className="text-2xl font-semibold text-white">Dashboard</h1>
        <p className="mt-1 text-sm text-neutral-400">
          Overview of your villa listings and engagement stats
        </p>
      </div>

      <div className="p-4 sm:p-8">
        {loading ? (
          <div className="text-neutral-500">Loading…</div>
        ) : (
          <>
            {/* Stat cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-6">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-yellow-500/10 p-3">
                    <Home className="h-6 w-6 text-yellow-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-neutral-400">Total Villas</p>
                    <p className="text-2xl font-semibold text-white">{stats?.total ?? 0}</p>
                  </div>
                </div>
              </div>
              <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-6">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-amber-500/10 p-3">
                    <Package className="h-6 w-6 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-neutral-400">Sold Out</p>
                    <p className="text-2xl font-semibold text-white">{stats?.soldOut ?? 0}</p>
                  </div>
                </div>
              </div>
              <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-6">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-green-500/10 p-3">
                    <TrendingUp className="h-6 w-6 text-green-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-neutral-400">Available</p>
                    <p className="text-2xl font-semibold text-white">
                      {stats ? stats.total - stats.soldOut : 0}
                    </p>
                  </div>
                </div>
              </div>
              <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-6">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-sky-500/10 p-3">
                    <Eye className="h-6 w-6 text-sky-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-neutral-400">Total Views</p>
                    <p className="text-2xl font-semibold text-white">
                      {(stats?.totalViews ?? 0).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Extra stat: Total Leads */}
            {analytics && (
              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-6">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-purple-500/10 p-3">
                      <Users className="h-6 w-6 text-purple-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-neutral-400">Total Leads</p>
                      <p className="text-2xl font-semibold text-white">
                        {analytics.summary.totalLeads}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Booking Overview */}
            <div className="mt-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-amber-400" />
                  Booking Overview
                </h2>
                <div className="flex gap-2">
                  <Link
                    href="/admin/bookings"
                    className="inline-flex items-center gap-2 rounded-lg border border-neutral-600 px-3 py-2 text-sm font-medium text-neutral-300 transition-colors hover:bg-neutral-800"
                  >
                    Manage Bookings
                  </Link>
                  <Link
                    href="/admin/bookings"
                    className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-3 py-2 text-sm font-medium text-neutral-900 transition-colors hover:bg-amber-400"
                  >
                    Add Booking
                  </Link>
                </div>
              </div>

              <div className="grid gap-6 lg:grid-cols-3">
                {/* Booking Stats */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Monthly Booking Summary */}
                  <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-6">
                    <h3 className="mb-4 flex items-center gap-2 text-base font-medium text-white">
                      <Clock className="h-4 w-4 text-amber-400" />
                      This Month's Bookings
                    </h3>
                    <div className="grid gap-4 sm:grid-cols-3">
                      <div className="text-center p-4 bg-neutral-800/50 rounded-lg">
                        <p className="text-2xl font-bold text-amber-400">
                          {bookings.filter(b => {
                            const bookingDate = new Date(b.startDate);
                            const now = new Date();
                            return bookingDate.getMonth() === now.getMonth() && 
                                   bookingDate.getFullYear() === now.getFullYear();
                          }).length}
                        </p>
                        <p className="text-sm text-neutral-400 mt-1">Total Bookings</p>
                      </div>
                      <div className="text-center p-4 bg-neutral-800/50 rounded-lg">
                        <p className="text-2xl font-bold text-green-400">
                          {bookings.filter(b => {
                            const bookingDate = new Date(b.startDate);
                            const now = new Date();
                            return bookingDate.getMonth() === now.getMonth() && 
                                   bookingDate.getFullYear() === now.getFullYear() &&
                                   b.status === "BOOKED";
                          }).length}
                        </p>
                        <p className="text-sm text-neutral-400 mt-1">Active Bookings</p>
                      </div>
                      <div className="text-center p-4 bg-neutral-800/50 rounded-lg">
                        <p className="text-2xl font-bold text-blue-400">
                          {new Set(
                            bookings
                              .filter(b => {
                                const bookingDate = new Date(b.startDate);
                                const now = new Date();
                                return bookingDate.getMonth() === now.getMonth() && 
                                       bookingDate.getFullYear() === now.getFullYear();
                              })
                              .map(b => b.villa.id)
                          ).size}
                        </p>
                        <p className="text-sm text-neutral-400 mt-1">Unique Villas</p>
                      </div>
                    </div>
                  </div>

                  {/* Recent Bookings Table */}
                  <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-6">
                    <h3 className="mb-4 text-base font-medium text-white">Recent Bookings</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm">
                        <thead>
                          <tr className="border-b border-neutral-800 bg-neutral-800/50">
                            <th className="px-3 py-2 font-medium text-neutral-300">Villa</th>
                            <th className="px-3 py-2 font-medium text-neutral-300">Check-in</th>
                            <th className="px-3 py-2 font-medium text-neutral-300">Check-out</th>
                            <th className="px-3 py-2 font-medium text-neutral-300">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {bookings.length === 0 ? (
                            <tr>
                              <td colSpan={4} className="px-3 py-4 text-center text-neutral-500">
                                No bookings yet
                              </td>
                            </tr>
                          ) : (
                            bookings.slice(0, 5).map((booking) => (
                              <tr key={booking.id} className="border-b border-neutral-800/50 last:border-0">
                                <td className="px-3 py-2">
                                  <Link
                                    href={`/villas/${booking.villa.slug}`}
                                    className="font-medium text-white hover:text-amber-400 transition-colors"
                                  >
                                    {booking.villa.name}
                                  </Link>
                                </td>
                                <td className="px-3 py-2 text-neutral-300">
                                  {new Date(booking.startDate).toLocaleDateString()}
                                </td>
                                <td className="px-3 py-2 text-neutral-300">
                                  {new Date(booking.endDate).toLocaleDateString()}
                                </td>
                                <td className="px-3 py-2">
                                  <span
                                    className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                                      booking.status === "BOOKED"
                                        ? "bg-green-500/20 text-green-400"
                                        : "bg-neutral-600 text-neutral-300"
                                    }`}
                                  >
                                    {booking.status}
                                  </span>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Quick Calendar Widget */}
                <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-6">
                  <h3 className="mb-4 text-base font-medium text-white">Booking Calendar</h3>
                  <div className="space-y-4">
                    {/* Mini Calendar */}
                    <div className="bg-neutral-800/50 rounded-lg p-4">
                      <div className="grid grid-cols-7 gap-1 text-center text-xs">
                        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                          <div key={i} className="text-neutral-500 font-medium py-1">
                            {day}
                          </div>
                        ))}
                        {Array.from({ length: 35 }, (_, i) => {
                          const date = new Date();
                          date.setDate(1); // First day of current month
                          date.setDate(i - date.getDay() + 1);
                          
                          const isCurrentMonth = date.getMonth() === new Date().getMonth();
                          const isToday = date.toDateString() === new Date().toDateString();
                          const isBooked = bookings.some(booking => {
                            const start = new Date(booking.startDate);
                            const end = new Date(booking.endDate);
                            return date >= start && date <= end;
                          });
                          
                          return (
                            <div
                              key={i}
                              className={`
                                py-1 text-xs rounded cursor-default transition-colors
                                ${!isCurrentMonth ? 'text-neutral-700' : 'text-neutral-400'}
                                ${isToday ? 'bg-amber-500 text-black font-bold' : ''}
                                ${isBooked && !isToday ? 'bg-red-600/50 text-white' : ''}
                                ${isBooked && isToday ? 'bg-red-600 text-white' : ''}
                              `}
                            >
                              {isCurrentMonth ? date.getDate() : ''}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Legend */}
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-amber-500 rounded"></div>
                        <span className="text-neutral-400">Today</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-red-600/50 rounded"></div>
                        <span className="text-neutral-400">Booked</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-neutral-700 rounded"></div>
                        <span className="text-neutral-400">Available</span>
                      </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="pt-4 border-t border-neutral-800">
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-neutral-400">Total this month:</span>
                          <span className="text-white font-medium">
                            {bookings.filter(b => {
                              const bookingDate = new Date(b.startDate);
                              const now = new Date();
                              return bookingDate.getMonth() === now.getMonth() && 
                                     bookingDate.getFullYear() === now.getFullYear();
                            }).length}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-neutral-400">Occupancy rate:</span>
                          <span className="text-white font-medium">
                            {villas.length > 0 ? 
                              Math.round(
                                (bookings.filter(b => b.status === "BOOKED").length / 
                                (villas.length * 30)) * 100
                              ) : 0}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ——— Analytics Charts ——— */}
            {analytics && (
              <div className="mt-8 grid gap-6 lg:grid-cols-2">
                {/* Weekly Villa Views (Marketing Insights) */}
                <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-6 lg:col-span-2">
                  <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
                    <BarChart3 className="h-5 w-5 text-amber-400" />
                    ยอดวิววิลล่ารายสัปดาห์ (12 สัปดาห์ล่าสุด) - ข้อมูลสำหรับวางแผนการตลาด
                  </h2>
                  <BarChart
                    data={analytics.weeklyViews as unknown as Record<string, unknown>[]}
                    labelKey="week"
                    valueKey="views"
                    color="#10b981"
                    height={200}
                  />
                  <p className="mt-2 text-xs text-neutral-500">
                    แสดงยอดผู้เข้าชมวิลล่าในแต่ละสัปดาห์เพื่อช่วยวางแผนการตลาดและโปรโมชั่น
                  </p>
                </div>

                {/* Leads per Day (last 30 days) */}
                <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-6">
                  <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
                    <BarChart3 className="h-5 w-5 text-amber-400" />
                    ยอดจองคิวรายวัน (30 วัน)
                  </h2>
                  <BarChart
                    data={analytics.leadsDaily as unknown as Record<string, unknown>[]}
                    labelKey="date"
                    valueKey="count"
                    color="#f59e0b"
                    height={180}
                  />
                </div>

                {/* Status Breakdown Donut */}
                <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-6">
                  <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
                    <Users className="h-5 w-5 text-amber-400" />
                    สถานะ Lead ทั้งหมด
                  </h2>
                  <DonutChart
                    data={[
                      { label: "Pending", value: analytics.statusBreakdown.PENDING, color: "#eab308" },
                      { label: "Contacted", value: analytics.statusBreakdown.CONTACTED, color: "#3b82f6" },
                      { label: "Closed", value: analytics.statusBreakdown.CLOSED, color: "#22c55e" },
                    ]}
                  />
                </div>

                {/* Top 5 Villas Chart */}
                <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-6 lg:col-span-2">
                  <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
                    <Award className="h-5 w-5 text-amber-400" />
                    วิลล่ายอดนิยม (Top 5 by views)
                  </h2>
                  <div className="space-y-3">
                    {analytics.topVillas.map((v, i) => {
                      const maxViews = analytics.topVillas[0]?.views ?? 1;
                      const pct = Math.max(2, (v.views / maxViews) * 100);
                      return (
                        <div key={v.id} className="flex items-center gap-3">
                          <span className="w-5 text-right text-sm font-semibold text-amber-400">
                            {i + 1}
                          </span>
                          <div className="flex-1">
                            <div className="flex items-center justify-between text-sm">
                              <span className="font-medium text-white">{v.name}</span>
                              <span className="text-neutral-400">
                                {v.views.toLocaleString()} views
                              </span>
                            </div>
                            <div className="mt-1 h-2 rounded-full bg-neutral-800">
                              <div
                                className="h-2 rounded-full bg-amber-400 transition-all"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    {analytics.topVillas.length === 0 && (
                      <p className="py-4 text-center text-neutral-500">No villas yet</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Top 5 Villas by views */}
            <div className="mt-8">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
                <Award className="h-5 w-5 text-amber-400" />
                Top 5 Villas (by views)
              </h2>
              <div className="overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900/50">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-neutral-800 bg-neutral-800/50">
                      <th className="px-4 py-3 font-medium text-neutral-300">#</th>
                      <th className="px-4 py-3 font-medium text-neutral-300">Villa</th>
                      <th className="px-4 py-3 font-medium text-neutral-300 text-right">Views</th>
                      <th className="px-4 py-3 font-medium text-neutral-300"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {topVillas.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-4 py-6 text-center text-neutral-500">
                          No villas yet
                        </td>
                      </tr>
                    ) : (
                      topVillas.map((v, i) => (
                        <tr key={v.id} className="border-b border-neutral-800/50 last:border-0">
                          <td className="px-4 py-3 text-neutral-400">{i + 1}</td>
                          <td className="px-4 py-3 font-medium text-white">{v.name}</td>
                          <td className="px-4 py-3 text-right text-amber-400">
                            {(v.views ?? 0).toLocaleString()}
                          </td>
                          <td className="px-4 py-3">
                            <Link
                              href={`/admin/villas/${v.id}/edit`}
                              className="text-sky-400 hover:underline"
                            >
                              Edit
                            </Link>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Hero performance */}
            <div className="mt-8">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
                <MousePointer className="h-5 w-5 text-amber-400" />
                Hero slide performance (clicks)
              </h2>
              <div className="overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900/50">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-neutral-800 bg-neutral-800/50">
                      <th className="px-4 py-3 font-medium text-neutral-300">Order</th>
                      <th className="px-4 py-3 font-medium text-neutral-300">Title</th>
                      <th className="px-4 py-3 font-medium text-neutral-300 text-right">Clicks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {heroByClicks.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="px-4 py-6 text-center text-neutral-500">
                          No hero slides yet
                        </td>
                      </tr>
                    ) : (
                      heroByClicks.map((s) => (
                        <tr key={s.id} className="border-b border-neutral-800/50 last:border-0">
                          <td className="px-4 py-3 text-neutral-400">{s.order + 1}</td>
                          <td className="px-4 py-3 font-medium text-white">
                            {s.titleTh || s.titleEn || "—"}
                          </td>
                          <td className="px-4 py-3 text-right text-amber-400">
                            {(s.clicks ?? 0).toLocaleString()}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ——— Top Search Keywords ——— */}
            <div className="mt-8">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
                <Search className="h-5 w-5 text-amber-400" />
                Top Search Keywords
              </h2>
              <div className="overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900/50">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-neutral-800 bg-neutral-800/50">
                      <th className="px-4 py-3 font-medium text-neutral-300">#</th>
                      <th className="px-4 py-3 font-medium text-neutral-300">Keyword</th>
                      <th className="px-4 py-3 font-medium text-neutral-300 text-right">Searches</th>
                      <th className="px-4 py-3 font-medium text-neutral-300 text-right">Last Searched</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topKeywords.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-4 py-6 text-center text-neutral-500">
                          No search data yet
                        </td>
                      </tr>
                    ) : (
                      topKeywords.map((kw, i) => (
                        <tr key={kw.id} className="border-b border-neutral-800/50 last:border-0">
                          <td className="px-4 py-3 text-neutral-400">{i + 1}</td>
                          <td className="px-4 py-3 font-medium text-white">{kw.query}</td>
                          <td className="px-4 py-3 text-right text-amber-400">{kw.count.toLocaleString()}</td>
                          <td className="px-4 py-3 text-right text-neutral-400">
                            {new Date(kw.lastSearchedAt).toLocaleDateString("th-TH")}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/admin/villas/new"
            className="inline-flex items-center gap-2 rounded-lg bg-yellow-500 px-4 py-2.5 font-medium text-neutral-900 transition-colors hover:bg-yellow-400"
          >
            Add New Villa
          </Link>
          <Link
            href="/admin/villas"
            className="inline-flex items-center gap-2 rounded-lg border border-neutral-600 px-4 py-2.5 font-medium text-neutral-300 transition-colors hover:bg-neutral-800"
          >
            Manage Villas
          </Link>
          <Link
            href="/admin/hero"
            className="inline-flex items-center gap-2 rounded-lg border border-neutral-600 px-4 py-2.5 font-medium text-neutral-300 transition-colors hover:bg-neutral-800"
          >
            Manage Hero
          </Link>
          <Link
            href="/admin/bookings"
            className="inline-flex items-center gap-2 rounded-lg border border-neutral-600 px-4 py-2.5 font-medium text-neutral-300 transition-colors hover:bg-neutral-800"
          >
            Manage Bookings
          </Link>
        </div>
      </div>
    </>
  );
}
