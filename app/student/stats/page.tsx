import { createClient } from "@/lib/supabase/server";
import { ThemeDistribution } from "@/components/charts/theme-distribution";
import { WeeklyTrend } from "@/components/charts/weekly-trend";
import { GenrePie } from "@/components/charts/genre-pie";
import { ReadingHeatmap } from "@/components/charts/reading-heatmap";
import { THEME_LABELS, type RecordTheme } from "@/lib/supabase/types";

export default async function StudentStats() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const uid = user!.id;

  const [{ data: records }, { data: books }] = await Promise.all([
    supabase.from("records").select("id, theme, record_type, created_at").eq("student_id", uid),
    supabase.from("books").select("id, status, pages, genre, created_at").eq("student_id", uid)
  ]);

  const totalDone = (books ?? []).filter(b => b.status === "done").length;
  const totalPages = (books ?? []).filter(b => b.status === "done").reduce((s, b) => s + (b.pages ?? 0), 0);

  const themeCount: Record<string, number> = {};
  (records ?? []).forEach(r => (themeCount[r.theme] = (themeCount[r.theme] ?? 0) + 1));
  const themeData = Object.keys(THEME_LABELS).map(k => ({ key: k, label: THEME_LABELS[k as RecordTheme].label, value: themeCount[k] ?? 0 }));

  const genreCount: Record<string, number> = {};
  (books ?? []).forEach(b => (genreCount[b.genre ?? "기타"] = (genreCount[b.genre ?? "기타"] ?? 0) + 1));
  const genreData = Object.entries(genreCount).map(([name, value]) => ({ name, value }));

  const now = new Date();
  const weeks: { week: string; short: number; long: number }[] = [];
  for (let i = 7; i >= 0; i--) {
    const start = new Date(now); start.setDate(now.getDate() - i * 7 - 6);
    const end = new Date(now); end.setDate(now.getDate() - i * 7);
    weeks.push({
      week: `${start.getMonth() + 1}/${start.getDate()}`,
      short: (records ?? []).filter(r => inRange(r.created_at, start, end) && r.record_type === "short").length,
      long: (records ?? []).filter(r => inRange(r.created_at, start, end) && r.record_type === "long").length
    });
  }

  // 히트맵: 최근 84일
  const heat: { date: string; count: number }[] = [];
  for (let i = 83; i >= 0; i--) {
    const d = new Date(now); d.setDate(now.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const count = (records ?? []).filter(r => r.created_at.slice(0, 10) === key).length;
    heat.push({ date: key, count });
  }

  // 연속 기록일
  let streak = 0;
  for (let i = heat.length - 1; i >= 0; i--) {
    if (heat[i].count > 0) streak++; else break;
  }

  // 배지
  const badges = [
    { id: "b1", label: "첫 기록", unlocked: (records ?? []).length >= 1 },
    { id: "b10", label: "10 기록", unlocked: (records ?? []).length >= 10 },
    { id: "b50", label: "50 기록", unlocked: (records ?? []).length >= 50 },
    { id: "bk3", label: "3권 완독", unlocked: totalDone >= 3 },
    { id: "bk10", label: "10권 완독", unlocked: totalDone >= 10 },
    { id: "p500", label: "누적 500쪽", unlocked: totalPages >= 500 },
    { id: "streak7", label: "7일 연속", unlocked: streak >= 7 },
    { id: "theme5", label: "5가지 테마", unlocked: Object.values(themeCount).filter(v => v > 0).length >= 5 }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">나의 독서 통장</h1>
        <p className="text-sm text-ink-600">그동안 쌓아온 독서 자취를 한눈에 확인해요.</p>
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        <StatCard label="내 책" value={books?.length ?? 0} hint="등록한 책" />
        <StatCard label="완독" value={totalDone} hint="완독한 책" />
        <StatCard label="누적 페이지" value={totalPages} hint="완독 기준" />
        <StatCard label="연속 기록" value={streak} hint={`${streak}일 연속`} />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
        <div className="card p-5">
          <h2 className="text-base font-bold">테마별 기록</h2>
          <p className="text-xs text-ink-500">어떤 관점으로 기록했는지 살펴봐요.</p>
          <div className="mt-4 h-[260px]"><ThemeDistribution data={themeData} /></div>
        </div>
        <div className="card p-5">
          <h2 className="text-base font-bold">분야별 독서</h2>
          <p className="text-xs text-ink-500">내가 자주 고르는 분야예요.</p>
          <div className="mt-4 h-[260px]"><GenrePie data={genreData} /></div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <div className="card p-5">
          <h2 className="text-base font-bold">최근 8주 기록 흐름</h2>
          <div className="mt-4 h-[240px]"><WeeklyTrend data={weeks} /></div>
        </div>
        <div className="card p-5">
          <h2 className="text-base font-bold">배지</h2>
          <p className="text-xs text-ink-500">꾸준함은 최고의 힘이에요.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {badges.map(b => (
              <span key={b.id} className={`chip ${b.unlocked ? "!border-brand-200 !bg-brand-50 !text-brand-700" : "opacity-60"}`}>
                {b.unlocked ? "🏅" : "🔒"} {b.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="card p-5">
        <h2 className="text-base font-bold">12주 기록 히트맵</h2>
        <p className="text-xs text-ink-500">매일의 기록이 한 칸씩 쌓여요.</p>
        <div className="mt-4"><ReadingHeatmap data={heat} /></div>
      </div>
    </div>
  );
}

function StatCard({ label, value, hint }: { label: string; value: number; hint?: string }) {
  return (
    <div className="card p-5">
      <div className="text-xs font-semibold text-ink-500">{label}</div>
      <div className="mt-0.5 text-3xl font-extrabold tracking-tight tabular-nums">{value.toLocaleString()}</div>
      {hint && <div className="text-xs text-ink-500">{hint}</div>}
    </div>
  );
}

function inRange(iso: string, start: Date, end: Date) {
  const t = new Date(iso).getTime();
  return t >= start.setHours(0, 0, 0, 0) && t <= end.setHours(23, 59, 59, 999);
}
