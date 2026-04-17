"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { AuthShell } from "@/components/auth-shell";

export default function TeacherSignupPage() {
  const router = useRouter();
  const supabase = createClient();
  const [form, setForm] = useState({ name: "", school: "", email: "", password: "", confirm: "" });
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    if (form.password.length < 8) { setErr("비밀번호는 8자 이상이어야 합니다."); return; }
    if (form.password !== form.confirm) { setErr("비밀번호 확인이 일치하지 않습니다."); return; }
    if (!form.name.trim()) { setErr("이름을 입력해 주세요."); return; }

    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email: form.email.trim(),
      password: form.password,
      options: { data: { role: "teacher", display_name: form.name, school: form.school } }
    });
    if (error || !data.user) {
      setLoading(false);
      setErr(error?.message ?? "회원가입 중 오류가 발생했습니다.");
      return;
    }

    const res = await fetch("/api/auth/teacher/bootstrap", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: form.name, school: form.school })
    });
    if (!res.ok) {
      setLoading(false);
      const j = await res.json().catch(() => ({}));
      setErr(j.error ?? "프로필 생성에 실패했습니다.");
      return;
    }
    router.replace("/teacher");
  }

  return (
    <AuthShell title="교사 회원가입" subtitle="학급을 만들고 학생들의 독서 기록을 안전하게 관리해요.">
      <form onSubmit={submit} className="space-y-3.5">
        <div>
          <label className="label">이름</label>
          <input className="input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="홍길동" />
        </div>
        <div>
          <label className="label">학교 (선택)</label>
          <input className="input" value={form.school} onChange={e => setForm(f => ({ ...f, school: e.target.value }))} placeholder="서울책읽는초등학교" />
        </div>
        <div>
          <label className="label">이메일</label>
          <input className="input" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="teacher@school.kr" required />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="label">비밀번호</label>
            <input className="input" type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="8자 이상" required />
          </div>
          <div>
            <label className="label">비밀번호 확인</label>
            <input className="input" type="password" value={form.confirm} onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))} required />
          </div>
        </div>

        {err && <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{err}</div>}

        <button className="btn btn-brand w-full" disabled={loading}>
          {loading && <Loader2 className="size-4 animate-spin" />} 가입하고 시작하기
        </button>

        <div className="text-center text-sm text-ink-500">
          이미 계정이 있나요? <Link href="/login/teacher" className="font-semibold text-brand-600">교사 로그인</Link>
        </div>
      </form>
    </AuthShell>
  );
}
