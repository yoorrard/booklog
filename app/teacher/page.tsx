import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { BookOpen, GraduationCap, PenLine, Plus } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default async function TeacherHome() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const uid = user!.id;

  const { data: classes } = await supabase
    .from("classes")
    .select("id, name, grade, join_code, created_at")
    .eq("teacher_id", uid)
    .order("created_at", { ascending: false });

  // RLS 가 교사의 권한 범위로 자동 스코핑하므로 단순 count 쿼리로 충분
  const [{ count: studentCount }, { count: bookCount }, { count: recordCount }] = await Promise.all([
    supabase.from("students").select("id", { count: "exact", head: true }),
    supabase.from("books").select("id", { count: "exact", head: true }),
    supabase.from("records").select("id", { count: "exact", head: true })
  ]);

  const { data: recent } = await supabase
    .from("records")
    .select("id, content, record_type, theme, created_at, student_id, book_id, books(title), students(profiles(display_name))")
    .order("created_at", { ascending: false })
    .limit(8);

  return (
    <div className="space-y-8">
      <section className="grid gap-4 md:grid-cols-4">
        <StatBox label="학급" value={String(classes?.length ?? 0)} icon={<GraduationCap className="size-5" />} />
        <StatBox label="학생" value={String(studentCount ?? 0)} icon={<Users2 />} />
        <StatBox label="등록 도서" value={String(bookCount ?? 0)} icon={<BookOpen className="size-5" />} />
        <StatBox label="전체 기록" value={String(recordCount ?? 0)} icon={<PenLine className="size-5" />} />
      </section>

      <section>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold">학급</h2>
            <p className="text-sm text-ink-600">담당하는 학급을 관리하고 학생을 일괄 초대하세요.</p>
          </div>
          <Link href="/teacher/classes" className="btn btn-brand"><Plus className="size-4" /> 새 학급 만들기</Link>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {(classes ?? []).map(c => (
            <Link key={c.id} href={`/teacher/classes/${c.id}`} className="card block p-5 transition hover:-translate-y-0.5 hover:shadow-pop">
              <div className="text-xs text-ink-500">{c.grade ?? "학급"} · {formatDate(c.created_at)} 개설</div>
              <div className="mt-1 text-base font-bold">{c.name}</div>
              <div className="mt-2 flex items-center justify-between text-sm">
                <span className="chip">초대 코드 <b className="ml-1 font-mono">{c.join_code}</b></span>
                <span className="text-brand-600">관리 →</span>
              </div>
            </Link>
          ))}
          {(!classes || classes.length === 0) && (
            <div className="card col-span-full p-8 text-center text-ink-500">
              아직 학급이 없어요. 오른쪽 위 <b>새 학급 만들기</b>로 첫 학급을 만들어보세요.
            </div>
          )}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-bold">최근 학생 기록</h2>
        <p className="text-sm text-ink-600">학생들의 최신 독서 기록을 한눈에 확인하세요.</p>
        <div className="mt-4 space-y-2">
          {(recent ?? []).map((r: any) => (
            <div key={r.id} className="card flex items-start gap-3 p-4">
              <div className="shrink-0 rounded-lg bg-ink-900 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                {r.record_type === "short" ? "SHORT" : "LONG"}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 text-xs text-ink-500">
                  <span className="font-semibold text-ink-700">{r.students?.profiles?.display_name}</span>
                  <span>·</span>
                  <span>{r.books?.title}</span>
                  <span>·</span>
                  <span>{formatDate(r.created_at)}</span>
                </div>
                <div className="mt-1 line-clamp-2 text-sm text-ink-800">{r.content}</div>
              </div>
            </div>
          ))}
          {(!recent || recent.length === 0) && (
            <div className="card p-6 text-center text-sm text-ink-500">아직 기록이 없어요.</div>
          )}
        </div>
      </section>
    </div>
  );
}

function StatBox({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="card relative overflow-hidden p-5">
      <div className="text-xs font-semibold text-ink-500">{label}</div>
      <div className="mt-1 text-3xl font-extrabold tracking-tight">{value}</div>
      <div className="absolute right-4 top-4 grid size-9 place-items-center rounded-xl bg-brand-50 text-brand-600">
        {icon}
      </div>
    </div>
  );
}

function Users2() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="9" cy="7" r="4" /><path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" /><circle cx="17" cy="7" r="3" /><path d="M22 21v-2a3 3 0 0 0-2.5-2.96" />
    </svg>
  );
}
