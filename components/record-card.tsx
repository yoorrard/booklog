import Image from "next/image";
import { THEME_LABELS, type RecordTheme } from "@/lib/supabase/types";
import { formatDateTime } from "@/lib/utils";

const THEME_ACCENT: Record<RecordTheme, string> = {
  free: "from-slate-400 to-slate-600",
  quote: "from-amber-400 to-amber-600",
  feeling: "from-pink-400 to-rose-600",
  summary: "from-violet-400 to-violet-600",
  learn: "from-sky-400 to-sky-600",
  recommend: "from-orange-400 to-orange-600",
  letter: "from-rose-400 to-pink-600",
  character: "from-teal-400 to-emerald-600",
  question: "from-yellow-400 to-orange-500",
  review: "from-brand-400 to-brand-600"
};

export function RecordCard({
  record, book, author, onEdit, onDelete
}: {
  record: {
    id: string;
    content: string;
    title: string | null;
    theme: RecordTheme;
    record_type: "short" | "long";
    stars: number | null;
    mood: string | null;
    created_at: string;
  };
  book: { title?: string; author?: string | null; cover_url?: string | null };
  author?: string;
  onEdit?: () => void;
  onDelete?: () => void;
}) {
  const theme = THEME_LABELS[record.theme];
  return (
    <div className="card group relative flex flex-col overflow-hidden">
      <div className={`h-1.5 bg-gradient-to-r ${THEME_ACCENT[record.theme]}`} />
      <div className="flex items-start gap-3 p-4">
        <div className="relative size-12 shrink-0 overflow-hidden rounded-md bg-ink-200">
          {book?.cover_url ? (
            <Image src={book.cover_url} alt="" fill sizes="48px" className="object-cover" />
          ) : (
            <div className="grid size-full place-items-center text-[10px] text-white" style={{ background: "linear-gradient(135deg,#3b6bfa,#a855f7)" }}>
              {book?.title?.slice(0, 2) ?? "📖"}
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="chip !py-0.5 text-[11px]">{theme.emoji} {theme.label}</span>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-ink-500">
              {record.record_type === "short" ? "SHORT" : "LONG"}
            </span>
            {record.mood && <span>{record.mood}</span>}
            {record.stars ? <span className="text-xs text-amber-500">{"★".repeat(record.stars)}{"☆".repeat(5 - record.stars)}</span> : null}
          </div>
          {record.title && <div className="mt-1.5 truncate text-sm font-bold">{record.title}</div>}
          <p className={`mt-1 whitespace-pre-wrap text-sm text-ink-800 ${record.record_type === "short" ? "line-clamp-3" : "line-clamp-6"}`}>
            {record.content}
          </p>
          <div className="mt-2 flex items-center justify-between text-[11px] text-ink-500">
            <div className="truncate">
              <b className="text-ink-700">{book?.title}</b>{book?.author ? ` · ${book.author}` : ""}
              {author ? <span className="ml-1.5 text-ink-400">· {author}</span> : null}
            </div>
            <span>{formatDateTime(record.created_at)}</span>
          </div>
        </div>
      </div>

      {(onEdit || onDelete) && (
        <div className="absolute right-2 top-2 flex gap-1 opacity-0 transition group-hover:opacity-100">
          {onEdit && <button onClick={onEdit} className="btn btn-ghost !px-2 !py-1 text-xs">수정</button>}
          {onDelete && <button onClick={onDelete} className="btn btn-danger !px-2 !py-1 text-xs">삭제</button>}
        </div>
      )}
    </div>
  );
}
