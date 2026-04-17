import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { RecordComposer } from "./record-composer";
import { RecordTimeline } from "./record-timeline";
import { BookActions } from "./book-actions";
import { formatDate } from "@/lib/utils";

export default async function BookDetail({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: book } = await supabase
    .from("books")
    .select("id, title, author, cover_url, status, pages, genre, publisher, started_at, finished_at, created_at, student_id")
    .eq("id", params.id)
    .maybeSingle();
  if (!book) return notFound();

  const { data: records } = await supabase
    .from("records")
    .select("id, book_id, student_id, record_type, theme, title, content, mood, stars, created_at")
    .eq("book_id", params.id)
    .order("created_at", { ascending: false });

  return (
    <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
      <aside className="space-y-4">
        <div className="card overflow-hidden">
          <div className="relative aspect-[2/3] bg-gradient-to-br from-brand-400 to-accent-500">
            {book.cover_url ? (
              <Image src={book.cover_url} alt="" fill sizes="260px" className="object-cover" />
            ) : (
              <div className="grid size-full place-items-center px-3 text-center text-base font-extrabold text-white">{book.title}</div>
            )}
          </div>
          <div className="p-4">
            <h1 className="text-base font-bold">{book.title}</h1>
            <div className="mt-0.5 text-xs text-ink-500">{book.author || "—"}</div>
            <div className="mt-3 space-y-1 text-xs text-ink-600">
              <Meta k="상태" v={book.status === "done" ? "다 읽음" : book.status === "reading" ? "읽는 중" : "잠깐 멈춤"} />
              <Meta k="분야" v={book.genre ?? "-"} />
              <Meta k="쪽수" v={book.pages ? `${book.pages} p` : "-"} />
              <Meta k="등록일" v={formatDate(book.created_at)} />
            </div>
          </div>
        </div>
        <BookActions bookId={book.id} initial={{
          title: book.title, author: book.author, pages: book.pages, genre: book.genre,
          cover_url: book.cover_url, status: book.status
        }} />
        <Link href="/student" className="btn btn-ghost w-full">← 책장으로</Link>
      </aside>

      <section className="space-y-4">
        <RecordComposer bookId={book.id} />
        <RecordTimeline initial={records ?? []} bookId={book.id} />
      </section>
    </div>
  );
}

function Meta({ k, v }: { k: string; v: string }) {
  return <div className="flex justify-between"><span className="text-ink-500">{k}</span><b className="text-ink-800">{v}</b></div>;
}
