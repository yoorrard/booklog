import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import { NewClassForm } from "./new-class-form";

export default async function ClassesPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: classes } = await supabase
    .from("classes")
    .select("id, name, grade, join_code, created_at")
    .eq("teacher_id", user!.id)
    .order("created_at", { ascending: false });

  const ids = (classes ?? []).map(c => c.id);
  const counts = new Map<string, number>();
  if (ids.length) {
    const { data: students } = await supabase.from("students").select("class_id").in("class_id", ids);
    (students ?? []).forEach(s => counts.set(s.class_id, (counts.get(s.class_id) ?? 0) + 1));
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <section>
        <h1 className="text-2xl font-bold">우리 반 관리</h1>
        <p className="mt-1 text-sm text-ink-600">학급을 만들고 학생을 일괄 생성해 아이디를 배부하세요.</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {(classes ?? []).map(c => (
            <Link key={c.id} href={`/teacher/classes/${c.id}`} className="card block p-5 transition hover:shadow-pop">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-ink-500">{c.grade ?? "학급"} · {formatDate(c.created_at)}</div>
                  <div className="mt-1 text-base font-bold">{c.name}</div>
                </div>
                <span className="chip"><b className="mr-1 font-mono">{c.join_code}</b></span>
              </div>
              <div className="mt-3 text-sm text-ink-600">재학생 {counts.get(c.id) ?? 0}명</div>
            </Link>
          ))}
          {(!classes || classes.length === 0) && (
            <div className="card col-span-full p-8 text-center text-ink-500">
              아직 학급이 없어요. 오른쪽에서 첫 학급을 만들어 보세요.
            </div>
          )}
        </div>
      </section>

      <aside>
        <div className="card p-5">
          <h2 className="text-base font-bold">새 학급 만들기</h2>
          <p className="mt-0.5 text-sm text-ink-600">학급명·학년을 입력하면 초대 코드가 자동 발급됩니다.</p>
          <div className="mt-4">
            <NewClassForm />
          </div>
        </div>
      </aside>
    </div>
  );
}
