"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BookOpen, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

export function AppNav({
  role,
  displayName,
  items
}: {
  role: "teacher" | "student";
  displayName: string;
  items: { href: string; label: string; icon?: React.ReactNode }[];
}) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  async function logout() {
    await supabase.auth.signOut();
    router.replace("/");
  }

  return (
    <header className="sticky top-0 z-30 border-b border-ink-100 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-6 px-6 py-3">
        <Link href={role === "teacher" ? "/teacher" : "/student"} className="flex items-center gap-2">
          <div className="grid size-8 place-items-center rounded-lg bg-ink-900 text-white">
            <BookOpen className="size-4" />
          </div>
          <span className="text-sm font-extrabold tracking-tight">Booklog</span>
        </Link>

        <nav className="scrollbar-thin flex flex-1 gap-1 overflow-x-auto">
          {items.map(i => {
            const active = pathname === i.href || (i.href !== "/teacher" && i.href !== "/student" && pathname.startsWith(i.href));
            return (
              <Link
                key={i.href}
                href={i.href}
                className={cn(
                  "inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium transition",
                  active ? "bg-ink-900 text-white shadow-sm" : "text-ink-600 hover:bg-ink-100"
                )}
              >
                {i.icon}
                {i.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <div className="hidden text-right sm:block">
            <div className="text-xs text-ink-500">{role === "teacher" ? "선생님" : "학생"}</div>
            <div className="text-sm font-semibold">{displayName}</div>
          </div>
          <button className="btn btn-ghost !px-2.5 !py-1.5" onClick={logout} title="로그아웃">
            <LogOut className="size-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
