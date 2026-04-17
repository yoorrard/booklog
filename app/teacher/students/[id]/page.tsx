import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { RecordCard } from "@/components/record-card";
import { formatDate } from "@/lib/utils";
import { BookOpen } from "lucide-react";

export default async function StudentDetail({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: student } = await supabase
    .from("students")
    .select("id, class_id, student_number, login_id, profiles:profiles!inner(display_name), classes:classes!inner(name, grade, teacher_id)")
    .eq("id", params.id)
    .maybeSingle();
  if (!student) return notFound();

  const [{ data: books }, { data: records }] = await Promise.all([
    supabase.from("books").select("id, title, author, cover_url, status, pages, created_at").eq("student_id", params.id).order("created_at", { ascending: false }),
    supabase.from("records").select("id, content, title, record_type, theme, stars, mood, created_at, books(title, cover_url, author)").eq("student_id", params.id).order("created_at", { ascending: false }).limit(50)
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-xs text-ink-500">
            <Link href={`/teacher/classes/${student.class_id}`} className="hover:text-ink-800">{(student.classes as any)?.name}</Link>
            · {(student.classes as any)?.grade} · {student.student_number}번
          </div>
          <h1 className="text-2xl font-bold">{(student.profiles as any)?.display_name}</h1>
          <div className="mt-1 text-xs text-ink-500 font-mono">{student.login_id}</div>
        </div>
        <Link className="btn btn-ghost" href={`/teacher/classes/${student.class_id}`}>← 학급으로</Link>
      </div>

      <section>
        <h2 className="mb-3 text-lg font-bold">등록한 책 ({books?.length ?? 0})</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6">
          {(books ?? []).map(b => (
            <div key={b.id} className="card overflow-hidden">
              <div className="relative aspect-[2/3] bg-gradient-to-br from-brand-400 to-accent-500">
                {b.cover_url ? <Image src={b.cover_url} alt="" fill sizes="150px" className="object-cover" /> : (
                  <div className="grid size-full place-items-center px-2 text-center text-sm font-semibold text-white">{b.title}</div>
                )}
              </div>
              <div className="p-2.5">
                <div className="line-clamp-2 text-sm font-semibold">{b.title}</div>
                <div className="text-xs text-ink-500">{b.author || "—"}</div>
                <div className="mt-1 flex items-center justify-between text-[11px] text-ink-500">
                  <span>{b.status === "done" ? "완독" : b.status === "reading" ? "읽는 중" : "잠깐 멈춤"}</span>
                  <span>{formatDate(b.created_at)}</span>
                </div>
              </div>
            </div>
          ))}
          {(!books || books.length === 0) && (
            <div className="card col-span-full p-6 text-center text-sm text-ink-500">
              <BookOpen className="mx-auto mb-1 size-5" />아직 등록한 책이 없어요.
            </div>
          )}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-bold">최근 기록</h2>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {(records ?? []).map((r: any) => (
            <RecordCard
              key={r.id}
              record={r}
              book={{ title: r.books?.title, author: r.books?.author, cover_url: r.books?.cover_url }}
            />
          ))}
          {(!records || records.length === 0) && (
            <div className="card col-span-full p-6 text-center text-sm text-ink-500">아직 기록이 없어요.</div>
          )}
        </div>
      </section>
    </div>
  );
}
