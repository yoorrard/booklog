import { redirect } from "next/navigation";
import { BarChart3, Home, Users } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { AppNav } from "@/components/app-nav";

export default async function TeacherLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login/teacher");

  const { data: profile } = await supabase.from("profiles").select("display_name, role").eq("id", user.id).maybeSingle();
  if (!profile || profile.role !== "teacher") redirect("/login/teacher");

  return (
    <div>
      <AppNav
        role="teacher"
        displayName={profile.display_name}
        items={[
          { href: "/teacher", label: "대시보드", icon: <Home className="size-4" /> },
          { href: "/teacher/classes", label: "우리 반", icon: <Users className="size-4" /> },
          { href: "/teacher/insights", label: "기록 인사이트", icon: <BarChart3 className="size-4" /> }
        ]}
      />
      <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
    </div>
  );
}
