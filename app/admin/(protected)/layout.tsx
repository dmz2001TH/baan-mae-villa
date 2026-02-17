import Link from "next/link";
import { LayoutDashboard, Home, ImageIcon, Settings, FileText, Users } from "lucide-react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { AdminSignOut } from "../AdminSignOut";

const navItems = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Manage Villas", href: "/admin/villas", icon: Home },
  { label: "Hero Slides", href: "/admin/hero", icon: ImageIcon },
  { label: "Articles", href: "/admin/articles", icon: FileText },
  { label: "Leads", href: "/admin/leads", icon: Users },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

export default async function AdminProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as { role?: string }).role !== "ADMIN") {
    redirect("/admin/login");
  }

  return (
    <div className="flex min-h-screen bg-neutral-950 text-neutral-200">
      {/* Sidebar */}
      <aside className="flex w-64 flex-shrink-0 flex-col border-r border-neutral-800 bg-neutral-900">
        <div className="border-b border-neutral-800 p-6">
          <Link
            href="/"
            className="text-xl font-semibold tracking-wide text-yellow-500"
          >
            BAAN MAE
          </Link>
          <p className="mt-1 text-xs text-neutral-500">Admin</p>
        </div>
        <nav className="flex-1 space-y-1 p-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-neutral-400 transition-colors hover:bg-neutral-800 hover:text-white"
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-neutral-800 p-4">
          <AdminSignOut />
        </div>
      </aside>

      {/* Main content */}
      <main className="min-w-0 flex-1 overflow-auto">{children}</main>
    </div>
  );
}
