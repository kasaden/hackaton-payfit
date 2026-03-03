"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  LayoutDashboard,
  TrendingUp,
  Sparkles,
  BarChart3,
  PieChart,
  Presentation,
  LogOut,
} from "lucide-react";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";

const navItems = [
  { href: "/dashboard", label: "Vue d'ensemble", icon: LayoutDashboard },
  { href: "/dashboard/trends", label: "Tendances", icon: TrendingUp },
  { href: "/dashboard/generator", label: "Générateur", icon: Sparkles },
  { href: "/dashboard/benchmark", label: "Benchmark", icon: BarChart3 },
  {
    href: "/dashboard/quiz-analytics",
    label: "Quiz Analytics",
    icon: PieChart,
  },
  {
    href: "/dashboard/presentation",
    label: "Présentation",
    icon: Presentation,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <aside className="hidden md:flex fixed left-0 top-0 h-full w-64 bg-white border-r flex-col z-40">
      {/* Logo */}
      <div className="p-6">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/logo-seo-copilot.png"
            alt="Logo"
            width={32}
            height={32}
            className="rounded-lg"
          />
          <div>
            <span className="font-semibold text-sm">PayFit</span>{" "}
            <span className="text-[#0066CC] font-semibold text-sm">
              SEO Copilot
            </span>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-1">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-colors ${
                isActive
                  ? "bg-blue-50 text-[#0066CC] font-medium"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="p-3">
        <Separator className="mb-3" />
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-gray-600 hover:bg-gray-50 w-full transition-colors cursor-pointer"
        >
          <LogOut className="w-5 h-5" />
          Déconnexion
        </button>
      </div>
    </aside>
  );
}
