"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Search } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function NewBookButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button className="btn btn-brand" onClick={() => setOpen(true)}><Plus className="size-4" /> 새 책 추가</button>
      {open && <NewBookModal onClose={() => setOpen(false)} />}
    </>
  );
}

type SearchItem = { title: string; authors?: string[]; thumbnail?: string };

function NewBookModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const supabase = createClient();
  const [q, setQ] = useState("");
  const [searching, setSearching] = useState(false);
  const [items, setItems] = useState<SearchItem[]>([]);

  const [form, setForm] = useState({
    title: "", author: "", pages: "", genre: "문학",
    cover_url: "", status: "reading" as "reading" | "done" | "pause"
  });
  const [saving, setSaving] = useState(false);

  async function doSearch() {
    if (!q.trim()) return;
    setSearching(true); setItems([]);
    try {
      const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(q)}&maxResults=12&langRestrict=ko`);
      const j = await res.json();
      const arr: SearchItem[] = (j.items ?? []).map((it: any) => ({
        title: it.volumeInfo?.title ?? "",
        authors: it.volumeInfo?.authors,
        thumbnail: (it.volumeInfo?.imageLinks?.thumbnail ?? it.volumeInfo?.imageLinks?.smallThumbnail ?? "").replace("http://", "https://")
      })).filter(i => i.title);
      setItems(arr);
    } catch { setItems([]); }
    setSearching(false);
  }

  function pick(it: SearchItem) {
    setForm(f => ({ ...f, title: it.title, author: (it.authors ?? []).join(", "), cover_url: it.thumbnail ?? "" }));
  }

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]; if (!f) return;
    const reader = new FileReader();
    reader.onload = () => setForm(prev => ({ ...prev, cover_url: String(reader.result) }));
    reader.readAsDataURL(f);
  }

  async function save() {
    if (!form.title.trim()) return;
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSaving(false); return; }
    const { error } = await supabase.from("books").insert({
      student_id: user.id,
      title: form.title.trim(),
      author: form.author || null,
      pages: form.pages ? Number(form.pages) : null,
      genre: form.genre,
      cover_url: form.cover_url || null,
      status: form.status
    });
    setSaving(false);
    if (error) { alert(error.message); return; }
    onClose();
    router.refresh();
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" onClick={onClose}>
      <div className="card w-full max-w-2xl animate-fadeIn overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-ink-100 px-5 py-3.5">
          <h3 className="text-base font-bold">새 책 추가</h3>
          <button className="text-ink-500 hover:text-ink-800" onClick={onClose}>✕</button>
        </div>

        <div className="max-h-[70vh] space-y-4 overflow-y-auto p-5">
          <div>
            <label className="label">책 검색 (Google Books)</label>
            <div className="flex gap-2">
              <input className="input" value={q} onChange={e => setQ(e.target.value)} onKeyDown={e => e.key === "Enter" && doSearch()} placeholder="제목이나 지은이로 검색" />
              <button className="btn btn-ghost" onClick={doSearch} disabled={searching}>
                {searching ? <Loader2 className="size-4 animate-spin" /> : <Search className="size-4" />} 검색
              </button>
            </div>
            {items.length > 0 && (
              <div className="mt-2 grid max-h-56 grid-cols-2 gap-2 overflow-y-auto pr-1">
                {items.map((it, i) => (
                  <button key={i} onClick={() => pick(it)} className="flex items-center gap-2 rounded-lg border border-ink-100 bg-white p-2 text-left hover:border-brand-300 hover:bg-brand-50">
                    {it.thumbnail ? <img src={it.thumbnail} className="h-16 w-12 rounded object-cover" /> : <div className="h-16 w-12 rounded bg-ink-100" />}
                    <div className="min-w-0">
                      <div className="truncate text-xs font-semibold">{it.title}</div>
                      <div className="truncate text-[11px] text-ink-500">{(it.authors ?? []).join(", ")}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="label">제목 *</label>
              <input className="input" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
            </div>
            <div>
              <label className="label">지은이</label>
              <input className="input" value={form.author} onChange={e => setForm(f => ({ ...f, author: e.target.value }))} />
            </div>
            <div>
              <label className="label">전체 쪽수</label>
              <input className="input" type="number" min={0} value={form.pages} onChange={e => setForm(f => ({ ...f, pages: e.target.value }))} />
            </div>
            <div>
              <label className="label">분야</label>
              <select className="input" value={form.genre} onChange={e => setForm(f => ({ ...f, genre: e.target.value }))}>
                {["문학", "과학", "역사", "예술", "그림책", "동시·시", "만화", "기타"].map(g => <option key={g}>{g}</option>)}
              </select>
            </div>
            <div>
              <label className="label">상태</label>
              <select className="input" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as any }))}>
                <option value="reading">읽는 중</option>
                <option value="done">다 읽음</option>
                <option value="pause">잠깐 멈춤</option>
              </select>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-[140px_1fr]">
            <div>
              <label className="label">표지</label>
              <div className="aspect-[2/3] overflow-hidden rounded-lg border border-dashed border-ink-200 bg-ink-50">
                {form.cover_url ? <img src={form.cover_url} className="size-full object-cover" alt="" /> : <div className="grid size-full place-items-center text-xs text-ink-500">미리보기</div>}
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label className="btn btn-ghost w-full cursor-pointer justify-start">
                파일 업로드
                <input type="file" accept="image/*" className="hidden" onChange={onFile} />
              </label>
              <input className="input" placeholder="표지 이미지 주소 붙여넣기" value={form.cover_url} onChange={e => setForm(f => ({ ...f, cover_url: e.target.value }))} />
              <button className="btn btn-ghost w-full" onClick={() => setForm(f => ({ ...f, cover_url: "" }))}>표지 지우기</button>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-ink-100 bg-ink-50/50 px-5 py-3">
          <button className="btn btn-ghost" onClick={onClose}>취소</button>
          <button className="btn btn-brand" onClick={save} disabled={saving || !form.title.trim()}>
            {saving && <Loader2 className="size-4 animate-spin" />} 저장
          </button>
        </div>
      </div>
    </div>
  );
}
