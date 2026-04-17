import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppNav } from "@/components/app-nav";
import { BarChart3, BookOpen, PenLine } from "lucide-react";

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login/student");
  const { data: profile } = await supabase.from("profiles").select("display_name, role").eq("id", user.id).maybeSingle();
  if (!profile || profile.role !== "student") redirect("/login/student");

  return (
    <div>
      <AppNav
        role="student"
        displayName={profile.display_name}
        items={[
          { href: "/student", label: "내 책장", icon: <BookOpen className="size-4" /> },
          { href: "/student/records", label: "기록 모아보기", icon: <PenLine className="size-4" /> },
          { href: "/student/stats", label: "나의 통장", icon: <BarChart3 className="size-4" /> }
        ]}
      />
      <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
    </div>
  );
}
