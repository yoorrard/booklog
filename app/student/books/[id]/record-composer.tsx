"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { THEME_LABELS, THEME_ORDER, type RecordTheme } from "@/lib/supabase/types";
import { cn } from "@/lib/utils";

const MOODS = ["😊", "😃", "🥺", "😲", "🤔", "😢", "😡", "🌈"];

export function RecordComposer({ bookId }: { bookId: string }) {
  const router = useRouter();
  const supabase = createClient();
  const [type, setType] = useState<"short" | "long">("short");
  const [theme, setTheme] = useState<RecordTheme>("free");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [mood, setMood] = useState<string>("");
  const [stars, setStars] = useState(0);
  const [saving, setSaving] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase.from("records").insert({
      book_id: bookId, student_id: user.id,
      record_type: type, theme, title: title || null, content,
      mood: mood || null, stars: stars || null
    });
    setSaving(false);
    if (error) { alert(error.message); return; }
    setTitle(""); setContent(""); setMood(""); setStars(0);
    router.refresh();
  }

  return (
    <form onSubmit={save} className="card p-5">
      <div className="flex flex-wrap items-center gap-2">
        <ToggleRow label="한 줄 기록" active={type === "short"} onClick={() => setType("short")} />
        <ToggleRow label="긴 기록" active={type === "long"} onClick={() => setType("long")} />
        <div className="mx-2 h-4 w-px bg-ink-200" />
        <div className="flex items-center gap-1 text-sm">
          <span className="mr-1 text-xs text-ink-500">기분</span>
          {MOODS.map(m => (
            <button type="button" key={m} onClick={() => setMood(mood === m ? "" : m)}
              className={cn("rounded-md px-1.5 py-0.5 text-base transition", mood === m ? "bg-brand-100 ring-2 ring-brand-400" : "hover:bg-ink-100")}>
              {m}
            </button>
          ))}
        </div>
        <div className="mx-2 h-4 w-px bg-ink-200" />
        <div className="flex items-center gap-1">
          <span className="mr-1 text-xs text-ink-500">별점</span>
          {[1, 2, 3, 4, 5].map(n => (
            <button type="button" key={n} onClick={() => setStars(stars === n ? 0 : n)}
              className={cn("text-lg transition", n <= stars ? "text-amber-400" : "text-ink-300 hover:text-amber-300")}>
              ★
            </button>
          ))}
        </div>
      </div>

      <div className="mt-3 flex gap-1 overflow-x-auto pb-1">
        {THEME_ORDER.map(t => (
          <button key={t} type="button" onClick={() => setTheme(t)}
            className={cn(
              "chip whitespace-nowrap transition",
              theme === t ? "!border-ink-900 !bg-ink-900 !text-white" : "hover:border-brand-300"
            )}>
            <span className="mr-0.5">{THEME_LABELS[t].emoji}</span>{THEME_LABELS[t].label}
          </button>
        ))}
      </div>

      <div className="mt-3 space-y-2">
        <input className="input" placeholder="제목 (선택)" value={title} onChange={e => setTitle(e.target.value)} />
        <textarea
          className="input min-h-[110px] resize-y"
          rows={type === "short" ? 2 : 6}
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder={type === "short"
            ? "오늘 마음에 남은 한 문장을 써보세요."
            : "책을 읽으며 떠올린 생각을 자유롭게 풀어 써보세요."
          }
        />
      </div>

      <div className="mt-3 flex items-center justify-between">
        <div className="text-xs text-ink-500">현재 테마: <b>{THEME_LABELS[theme].label}</b> — {THEME_LABELS[theme].desc}</div>
        <button className="btn btn-brand" disabled={saving || !content.trim()}>
          {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />} 기록 저장
        </button>
      </div>
    </form>
  );
}

function ToggleRow({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className={cn(
      "rounded-full px-3 py-1.5 text-xs font-semibold transition",
      active ? "bg-ink-900 text-white" : "bg-white text-ink-700 ring-1 ring-ink-200 hover:bg-ink-50"
    )}>{label}</button>
  );
}
