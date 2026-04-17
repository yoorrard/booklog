import { createClient } from "@/lib/supabase/server";
import { ThemeDistribution } from "@/components/charts/theme-distribution";
import { WeeklyTrend } from "@/components/charts/weekly-trend";
import { LeaderBoard } from "@/components/charts/leader-board";
import { THEME_LABELS, type RecordTheme } from "@/lib/supabase/types";

export default async function InsightsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const uid = user!.id;

  const { data: classes } = await supabase.from("classes").select("id, name").eq("teacher_id", uid);
  const classIds = (classes ?? []).map(c => c.id);
  const { data: students } = classIds.length
    ? await supabase.from("students").select("id, class_id, profiles:profiles!inner(display_name)").in("class_id", classIds)
    : { data: [] as any[] };

  const studentIds = (students ?? []).map((s: any) => s.id);

  const [{ data: records }, { data: books }] = studentIds.length
    ? await Promise.all([
        supabase.from("records").select("id, theme, record_type, created_at, student_id").in("student_id", studentIds),
        supabase.from("books").select("id, student_id, status, pages").in("student_id", studentIds)
      ])
    : [{ data: [] as any[] }, { data: [] as any[] }] as any;

  // 테마 분포
  const themeCount: Record<string, number> = {};
  (records ?? []).forEach((r: any) => {
    themeCount[r.theme] = (themeCount[r.theme] ?? 0) + 1;
  });
  const themeData = Object.keys(THEME_LABELS).map(k => ({
    key: k,
    label: THEME_LABELS[k as RecordTheme].label,
    value: themeCount[k] ?? 0
  }));

  // 최근 8주 추이
  const weeks: { week: string; short: number; long: number }[] = [];
  const now = new Date();
  for (let i = 7; i >= 0; i--) {
    const start = new Date(now); start.setDate(now.getDate() - i * 7 - 6);
    const end = new Date(now); end.setDate(now.getDate() - i * 7);
    const short = (records ?? []).filter((r: any) => inRange(r.created_at, start, end) && r.record_type === "short").length;
    const long = (records ?? []).filter((r: any) => inRange(r.created_at, start, end) && r.record_type === "long").length;
    weeks.push({ week: `${start.getMonth() + 1}/${start.getDate()}`, short, long });
  }

  // 상위 학생 (기록 수)
  const perStudent: Record<string, { name: string; records: number; books: number }> = {};
  (students ?? []).forEach((s: any) => {
    perStudent[s.id] = { name: s.profiles?.display_name ?? "?", records: 0, books: 0 };
  });
  (records ?? []).forEach((r: any) => {
    if (perStudent[r.student_id]) perStudent[r.student_id].records += 1;
  });
  (books ?? []).forEach((b: any) => {
    if (perStudent[b.student_id]) perStudent[b.student_id].books += 1;
  });
  const leaders = Object.values(perStudent).sort((a, b) => b.records - a.records).slice(0, 10);

  const totalPages = (books ?? []).filter((b: any) => b.status === "done").reduce((s: number, b: any) => s + (b.pages ?? 0), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">기록 인사이트</h1>
        <p className="text-sm text-ink-600">우리 반의 독서 활동을 데이터로 확인해요.</p>
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        <MiniStat label="학생" value={students?.length ?? 0} />
        <MiniStat label="전체 기록" value={records?.length ?? 0} />
        <MiniStat label="등록 도서" value={books?.length ?? 0} />
        <MiniStat label="누적 페이지(완독)" value={totalPages} suffix="p" />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
        <div className="card p-5">
          <h2 className="text-base font-bold">테마별 기록 분포</h2>
          <p className="text-xs text-ink-500">어떤 관점으로 많이 기록했는지 확인해요.</p>
          <div className="mt-4 h-[280px]"><ThemeDistribution data={themeData} /></div>
        </div>

        <div className="card p-5">
          <h2 className="text-base font-bold">최근 8주 기록 추이</h2>
          <p className="text-xs text-ink-500">주 단위 한 줄/긴 기록의 흐름을 확인해요.</p>
          <div className="mt-4 h-[280px]"><WeeklyTrend data={weeks} /></div>
        </div>
      </div>

      <div className="card p-5">
        <h2 className="text-base font-bold">독서 리더보드</h2>
        <p className="text-xs text-ink-500">기록 수 상위 10명 · 모든 학생을 조용히 응원해요.</p>
        <LeaderBoard data={leaders} />
      </div>
    </div>
  );
}

function MiniStat({ label, value, suffix }: { label: string; value: number; suffix?: string }) {
  return (
    <div className="card p-4">
      <div className="text-xs text-ink-500">{label}</div>
      <div className="mt-0.5 text-2xl font-extrabold tracking-tight">
        {value.toLocaleString()}<span className="ml-0.5 text-sm text-ink-500">{suffix}</span>
      </div>
    </div>
  );
}

function inRange(iso: string, start: Date, end: Date) {
  const t = new Date(iso).getTime();
  return t >= start.setHours(0, 0, 0, 0) && t <= end.setHours(23, 59, 59, 999);
}
