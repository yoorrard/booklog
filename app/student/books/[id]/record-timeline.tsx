"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RecordCard } from "@/components/record-card";
import { THEME_LABELS, THEME_ORDER, type RecordRow, type RecordTheme } from "@/lib/supabase/types";
import { createClient } from "@/lib/supabase/client";

export function RecordTimeline({ initial, bookId }: { initial: RecordRow[]; bookId: string }) {
  const [records, setRecords] = useState<RecordRow[]>(initial);
  const [theme, setTheme] = useState<RecordTheme | "all">("all");
  const [type, setType] = useState<"all" | "short" | "long">("all");
  const router = useRouter();
  const supabase = createClient();

  const filtered = records.filter(r =>
    (theme === "all" || r.theme === theme) &&
    (type === "all" || r.record_type === type)
  );

  async function onDelete(id: string) {
    if (!confirm("이 기록을 지울까요?")) return;
    const { error } = await supabase.from("records").delete().eq("id", id);
    if (error) { alert(error.message); return; }
    setRecords(prev => prev.filter(r => r.id !== id));
    router.refresh();
  }

  return (
    <section>
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <h3 className="mr-2 text-lg font-bold">기록 타임라인</h3>
        <select className="input !w-auto !py-1.5" value={theme} onChange={e => setTheme(e.target.value as any)}>
          <option value="all">모든 테마</option>
          {THEME_ORDER.map(t => <option key={t} value={t}>{THEME_LABELS[t].emoji} {THEME_LABELS[t].label}</option>)}
        </select>
        <select className="input !w-auto !py-1.5" value={type} onChange={e => setType(e.target.value as any)}>
          <option value="all">모든 유형</option>
          <option value="short">한 줄</option>
          <option value="long">긴 기록</option>
        </select>
        <span className="ml-auto text-xs text-ink-500">{filtered.length}개</span>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {filtered.map(r => (
          <RecordCard
            key={r.id}
            record={r}
            book={{}}
            onDelete={() => onDelete(r.id)}
          />
        ))}
        {filtered.length === 0 && (
          <div className="card col-span-full p-8 text-center text-sm text-ink-500">
            조건에 맞는 기록이 아직 없어요. 위에서 첫 기록을 남겨볼까요?
          </div>
        )}
      </div>
    </section>
  );
}
