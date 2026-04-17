import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { RecordCard } from "@/components/record-card";
import { THEME_LABELS, THEME_ORDER, type RecordTheme } from "@/lib/supabase/types";

export default async function ClassRecordsPage({ params, searchParams }: { params: { id: string }; searchParams: { theme?: string; type?: string } }) {
  const supabase = createClient();
  const { data: klass } = await supabase
    .from("classes").select("id, name").eq("id", params.id).maybeSingle();
  if (!klass) return notFound();

  const theme = (searchParams.theme as RecordTheme) || null;
  const type = searchParams.type === "short" || searchParams.type === "long" ? searchParams.type : null;

  let query = supabase
    .from("records")
    .select("id, content, title, record_type, theme, stars, mood, created_at, books!inner(title, cover_url, author), students!inner(class_id, profiles:profiles!inner(display_name))")
    .eq("students.class_id", params.id)
    .order("created_at", { ascending: false })
    .limit(200);
  if (theme) query = query.eq("theme", theme);
  if (type) query = query.eq("record_type", type);
  const { data: records } = await query;

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <div className="text-xs text-ink-500"><Link href={`/teacher/classes/${params.id}`} className="hover:text-ink-800">{klass.name}</Link> · 학급 기록</div>
          <h1 className="mt-1 text-2xl font-bold">학급 전체 기록</h1>
        </div>
        <Link className="btn btn-ghost" href={`/teacher/classes/${params.id}`}>← 학급 관리</Link>
      </div>

      <div className="card flex flex-wrap items-center gap-2 p-3">
        <FilterChip href={`/teacher/classes/${params.id}/records`} active={!theme && !type}>전체</FilterChip>
        {THEME_ORDER.map(t => (
          <FilterChip key={t} href={`/teacher/classes/${params.id}/records?theme=${t}${type ? `&type=${type}` : ""}`} active={theme === t}>
            {THEME_LABELS[t].emoji} {THEME_LABELS[t].label}
          </FilterChip>
        ))}
        <span className="mx-2 h-4 w-px bg-ink-200" />
        <FilterChip href={`/teacher/classes/${params.id}/records?type=short${theme ? `&theme=${theme}` : ""}`} active={type === "short"}>한 줄</FilterChip>
        <FilterChip href={`/teacher/classes/${params.id}/records?type=long${theme ? `&theme=${theme}` : ""}`} active={type === "long"}>긴 기록</FilterChip>
      </div>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {(records ?? []).map((r: any) => (
          <RecordCard
            key={r.id}
            record={{
              id: r.id,
              content: r.content,
              title: r.title,
              theme: r.theme,
              record_type: r.record_type,
              stars: r.stars,
              mood: r.mood,
              created_at: r.created_at
            }}
            book={{ title: r.books?.title, author: r.books?.author, cover_url: r.books?.cover_url }}
            author={r.students?.profiles?.display_name}
          />
        ))}
        {(!records || records.length === 0) && (
          <div className="card col-span-full p-8 text-center text-ink-500">조건에 맞는 기록이 없어요.</div>
        )}
      </div>
    </div>
  );
}

function FilterChip({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link href={href} className={`chip ${active ? "!border-ink-900 !bg-ink-900 !text-white" : ""}`}>{children}</Link>
  );
}
