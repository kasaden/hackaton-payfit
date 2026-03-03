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
  ScrollText,
  FileText,
  Eye,
} from "lucide-react";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";

type NavItem =
  | { type: "link"; href: string; label: string; icon: React.ComponentType<{ className?: string }> }
  | { type: "separator"; label: string };

const navItems: NavItem[] = [
  { type: "link", href: "/dashboard", label: "Vue d'ensemble", icon: LayoutDashboard },

  { type: "separator", label: "Contenu" },
  { type: "link", href: "/dashboard/trends", label: "Tendances", icon: TrendingUp },
  { type: "link", href: "/dashboard/generator", label: "Générateur", icon: Sparkles },
  { type: "link", href: "/dashboard/articles", label: "Articles", icon: FileText },
  { type: "link", href: "/dashboard/prompts", label: "Prompts", icon: ScrollText },

  { type: "separator", label: "Analytics" },
  { type: "link", href: "/dashboard/veille", label: "Veille Concurrentielle", icon: Eye },
  { type: "link", href: "/dashboard/benchmark", label: "Benchmark", icon: BarChart3 },
  { type: "link", href: "/dashboard/quiz-analytics", label: "Quiz Analytics", icon: PieChart },

  { type: "separator", label: "Projet" },
  { type: "link", href: "/dashboard/presentation", label: "Présentation", icon: Presentation },
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
      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
        {navItems.map((item, index) => {
          if (item.type === "separator") {
            return (
              <div key={item.label} className={index === 0 ? "pt-1" : "pt-4"}>
                <p className="px-4 pb-1 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                  {item.label}
                </p>
              </div>
            );
          }
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-2 rounded-lg text-sm transition-colors ${
                isActive
                  ? "bg-blue-50 text-[#0066CC] font-medium"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <item.icon className="w-4 h-4" />
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
