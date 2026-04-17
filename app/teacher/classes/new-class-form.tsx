"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export function NewClassForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [grade, setGrade] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null); setLoading(true);
    const res = await fetch("/api/teacher/classes", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, grade })
    });
    const j = await res.json();
    setLoading(false);
    if (!res.ok) { setErr(j.error ?? "생성 실패"); return; }
    setName(""); setGrade("");
    router.refresh();
    router.push(`/teacher/classes/${j.class.id}`);
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <div>
        <label className="label">학급 이름</label>
        <input className="input" value={name} onChange={e => setName(e.target.value)} placeholder="3학년 2반 책친구" required />
      </div>
      <div>
        <label className="label">학년 (선택)</label>
        <input className="input" value={grade} onChange={e => setGrade(e.target.value)} placeholder="3학년" />
      </div>
      {err && <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{err}</div>}
      <button className="btn btn-brand w-full" disabled={loading || !name.trim()}>
        {loading && <Loader2 className="size-4 animate-spin" />} 학급 만들기
      </button>
    </form>
  );
}
