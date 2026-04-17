import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { RecordCard } from "@/components/record-card";
import { THEME_LABELS, THEME_ORDER, type RecordTheme } from "@/lib/supabase/types";

export default async function StudentRecordsPage({ searchParams }: { searchParams: { theme?: string; type?: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const theme = (searchParams.theme as RecordTheme) || null;
  const type = searchParams.type === "short" || searchParams.type === "long" ? searchParams.type : null;

  let query = supabase
    .from("records")
    .select("id, content, title, record_type, theme, stars, mood, created_at, books!inner(title, author, cover_url)")
    .eq("student_id", user!.id)
    .order("created_at", { ascending: false });
  if (theme) query = query.eq("theme", theme);
  if (type) query = query.eq("record_type", type);

  const { data: records } = await query;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">기록 모아보기</h1>
        <p className="mt-1 text-sm text-ink-600">테마와 유형으로 내 기록을 한눈에 모아보세요.</p>
      </div>

      <div className="card flex flex-wrap items-center gap-2 p-3">
        <FilterChip href="/student/records" active={!theme && !type}>전체</FilterChip>
        {THEME_ORDER.map(t => (
          <FilterChip key={t} href={`/student/records?theme=${t}${type ? `&type=${type}` : ""}`} active={theme === t}>
            {THEME_LABELS[t].emoji} {THEME_LABELS[t].label}
          </FilterChip>
        ))}
        <span className="mx-2 h-4 w-px bg-ink-200" />
        <FilterChip href={`/student/records?type=short${theme ? `&theme=${theme}` : ""}`} active={type === "short"}>한 줄</FilterChip>
        <FilterChip href={`/student/records?type=long${theme ? `&theme=${theme}` : ""}`} active={type === "long"}>긴 기록</FilterChip>
      </div>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {(records ?? []).map((r: any) => (
          <RecordCard
            key={r.id}
            record={r}
            book={{ title: r.books?.title, author: r.books?.author, cover_url: r.books?.cover_url }}
          />
        ))}
        {(!records || records.length === 0) && (
          <div className="card col-span-full p-8 text-center text-ink-500">
            조건에 맞는 기록이 없어요.
          </div>
        )}
      </div>
    </div>
  );
}

function FilterChip({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return <Link href={href} className={`chip ${active ? "!border-ink-900 !bg-ink-900 !text-white" : ""}`}>{children}</Link>;
}
