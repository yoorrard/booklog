import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import { NewBookButton } from "./new-book-button";

export default async function MyShelf() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const uid = user!.id;

  const { data: books } = await supabase
    .from("books")
    .select("id, title, author, cover_url, status, pages, created_at")
    .eq("student_id", uid)
    .order("created_at", { ascending: false });

  const ids = (books ?? []).map(b => b.id);
  const counts = new Map<string, number>();
  if (ids.length) {
    const { data: recs } = await supabase.from("records").select("book_id").in("book_id", ids);
    (recs ?? []).forEach(r => counts.set(r.book_id, (counts.get(r.book_id) ?? 0) + 1));
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">내 책장</h1>
          <p className="mt-1 text-sm text-ink-600">읽는 책의 표지를 올리고, 그 책에 대한 다양한 기록을 남겨요.</p>
        </div>
        <NewBookButton />
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {(books ?? []).map(b => (
          <Link key={b.id} href={`/student/books/${b.id}`} className="card overflow-hidden transition hover:-translate-y-0.5 hover:shadow-pop">
            <div className="relative aspect-[2/3] bg-gradient-to-br from-brand-400 to-accent-500">
              {b.cover_url ? (
                <Image src={b.cover_url} alt="" fill sizes="200px" className="object-cover" />
              ) : (
                <div className="grid size-full place-items-center px-3 text-center font-extrabold text-white">{b.title}</div>
              )}
              <span className="absolute right-1.5 top-1.5 rounded-full bg-black/60 px-2 py-0.5 text-[10px] text-white">
                {b.status === "done" ? "완독" : b.status === "reading" ? "읽는 중" : "잠깐 멈춤"}
              </span>
            </div>
            <div className="p-3">
              <div className="line-clamp-2 text-sm font-bold">{b.title}</div>
              <div className="text-xs text-ink-500">{b.author || "—"}</div>
              <div className="mt-1.5 flex items-center justify-between text-[11px] text-ink-500">
                <span>📝 기록 {counts.get(b.id) ?? 0}</span>
                <span>{formatDate(b.created_at)}</span>
              </div>
            </div>
          </Link>
        ))}
        {(!books || books.length === 0) && (
          <div className="card col-span-full p-10 text-center text-ink-500">
            <div className="text-4xl">📚</div>
            <div className="mt-2 text-sm">아직 책장이 비어 있어요. <b>새 책 추가</b>로 첫 책을 올려볼까요?</div>
          </div>
        )}
      </div>
    </div>
  );
}
