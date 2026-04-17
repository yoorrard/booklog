"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { AuthShell } from "@/components/auth-shell";

export default function TeacherLoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/teacher";
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { setErr("이메일 또는 비밀번호가 올바르지 않습니다."); setLoading(false); return; }
    router.replace(next);
  }

  return (
    <AuthShell title="교사 로그인" subtitle="등록한 이메일로 로그인해 주세요.">
      <form onSubmit={submit} className="space-y-3.5">
        <div>
          <label className="label">이메일</label>
          <input className="input" type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} required />
        </div>
        <div>
          <label className="label">비밀번호</label>
          <input className="input" type="password" autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} required />
        </div>
        {err && <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{err}</div>}
        <button className="btn btn-brand w-full" disabled={loading}>
          {loading && <Loader2 className="size-4 animate-spin" />} 로그인
        </button>
        <div className="flex justify-between text-sm text-ink-500">
          <Link href="/signup/teacher" className="font-semibold text-brand-600">교사 회원가입</Link>
          <Link href="/login/student" className="hover:text-ink-700">학생 로그인 →</Link>
        </div>
      </form>
    </AuthShell>
  );
}
