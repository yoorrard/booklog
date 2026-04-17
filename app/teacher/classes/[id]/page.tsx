import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BulkStudentPanel } from "./bulk-panel";
import { StudentRow } from "./student-row";
import { formatDate } from "@/lib/utils";
import { BookOpen, PenLine } from "lucide-react";

export default async function ClassDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: klass } = await supabase
    .from("classes")
    .select("id, name, grade, join_code, created_at")
    .eq("id", params.id)
    .maybeSingle();
  if (!klass) return notFound();

  const { data: students } = await supabase
    .from("students")
    .select("id, student_number, login_id, must_change_password, profiles:profiles!inner(display_name)")
    .eq("class_id", params.id)
    .order("student_number");

  const ids = (students ?? []).map(s => s.id);
  const stats = new Map<string, { books: number; records: number; lastAt: string | null }>();
  if (ids.length) {
    const [{ data: bookAgg }, { data: recordAgg }] = await Promise.all([
      supabase.from("books").select("student_id").in("student_id", ids),
      supabase.from("records").select("student_id, created_at").in("student_id", ids)
    ]);
    (bookAgg ?? []).forEach(b => {
      const cur = stats.get(b.student_id) ?? { books: 0, records: 0, lastAt: null };
      cur.books += 1; stats.set(b.student_id, cur);
    });
    (recordAgg ?? []).forEach(r => {
      const cur = stats.get(r.student_id) ?? { books: 0, records: 0, lastAt: null };
      cur.records += 1;
      if (!cur.lastAt || new Date(r.created_at) > new Date(cur.lastAt)) cur.lastAt = r.created_at;
      stats.set(r.student_id, cur);
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-xs text-ink-500">{klass.grade ?? "학급"} · {formatDate(klass.created_at)}</div>
          <h1 className="text-2xl font-bold">{klass.name}</h1>
          <div className="mt-2 flex items-center gap-2">
            <span className="chip">초대 코드 <b className="ml-1 font-mono">{klass.join_code}</b></span>
            <Link className="chip" href={`/teacher/classes/${klass.id}/records`}>
              <PenLine className="size-3.5" /> 학급 기록 전체 보기
            </Link>
          </div>
        </div>
        <div className="flex gap-2">
          <Link className="btn btn-ghost" href="/teacher/classes">← 모든 학급</Link>
        </div>
      </div>

      <BulkStudentPanel classId={klass.id} joinCode={klass.join_code} existingNumbers={(students ?? []).map(s => s.student_number)} />

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold">학생 명단 ({students?.length ?? 0}명)</h2>
          <div className="text-xs text-ink-500">첫 로그인 후 비밀번호 변경 미완료는 <b className="text-amber-600">미변경</b> 으로 표시돼요.</div>
        </div>
        <div className="card overflow-hidden">
          <div className="grid grid-cols-[60px_1fr_1.4fr_auto_auto_auto] items-center border-b border-ink-100 bg-ink-50 px-4 py-2.5 text-xs font-semibold text-ink-500">
            <div>번호</div><div>이름</div><div>로그인 아이디</div><div className="text-right">책</div><div className="text-right">기록</div><div className="text-right pr-1">관리</div>
          </div>
          <div className="divide-y divide-ink-100">
            {(students ?? []).map(s => (
              <StudentRow
                key={s.id}
                classId={klass.id}
                student={{
                  id: s.id,
                  number: s.student_number,
                  name: (s.profiles as any)?.display_name,
                  login_id: s.login_id,
                  must_change_password: s.must_change_password,
                  books: stats.get(s.id)?.books ?? 0,
                  records: stats.get(s.id)?.records ?? 0,
                  last_at: stats.get(s.id)?.lastAt ?? null
                }}
              />
            ))}
            {(!students || students.length === 0) && (
              <div className="px-4 py-8 text-center text-sm text-ink-500">
                <BookOpen className="mx-auto mb-2 size-5" />
                아직 등록된 학생이 없어요. 위의 <b>학생 일괄 생성</b>으로 명단을 넣어보세요.
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
