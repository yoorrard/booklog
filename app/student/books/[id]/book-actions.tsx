"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Pencil, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Init = {
  title: string; author: string | null; pages: number | null; genre: string | null;
  cover_url: string | null; status: "reading" | "done" | "pause";
};

export function BookActions({ bookId, initial }: { bookId: string; initial: Init }) {
  const router = useRouter();
  const supabase = createClient();
  const [edit, setEdit] = useState(false);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState<Init>(initial);

  async function save() {
    setBusy(true);
    const { error } = await supabase.from("books").update({
      title: form.title.trim(),
      author: form.author,
      pages: form.pages ? Number(form.pages) : null,
      genre: form.genre,
      cover_url: form.cover_url,
      status: form.status
    }).eq("id", bookId);
    setBusy(false);
    if (error) { alert(error.message); return; }
    setEdit(false);
    router.refresh();
  }

  async function remove() {
    if (!confirm("책과 모든 기록이 함께 삭제됩니다. 계속할까요?")) return;
    setBusy(true);
    const { error } = await supabase.from("books").delete().eq("id", bookId);
    setBusy(false);
    if (error) { alert(error.message); return; }
    router.replace("/student");
  }

  if (!edit) {
    return (
      <div className="flex gap-2">
        <button className="btn btn-ghost flex-1" onClick={() => setEdit(true)}><Pencil className="size-3.5" /> 책 정보 수정</button>
        <button className="btn btn-danger" onClick={remove} disabled={busy}><Trash2 className="size-3.5" /></button>
      </div>
    );
  }

  return (
    <div className="card space-y-2 p-4">
      <input className="input" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
      <input className="input" value={form.author ?? ""} onChange={e => setForm(f => ({ ...f, author: e.target.value }))} placeholder="지은이" />
      <div className="grid grid-cols-2 gap-2">
        <input className="input" type="number" min={0} value={form.pages ?? ""} onChange={e => setForm(f => ({ ...f, pages: e.target.value ? Number(e.target.value) : null }))} placeholder="쪽수" />
        <select className="input" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as any }))}>
          <option value="reading">읽는 중</option>
          <option value="done">다 읽음</option>
          <option value="pause">잠깐 멈춤</option>
        </select>
      </div>
      <input className="input" value={form.cover_url ?? ""} onChange={e => setForm(f => ({ ...f, cover_url: e.target.value }))} placeholder="표지 이미지 주소" />
      <div className="flex gap-2">
        <button className="btn btn-ghost flex-1" onClick={() => { setEdit(false); setForm(initial); }}>취소</button>
        <button className="btn btn-brand flex-1" onClick={save} disabled={busy}>
          {busy && <Loader2 className="size-4 animate-spin" />} 저장
        </button>
      </div>
    </div>
  );
}
