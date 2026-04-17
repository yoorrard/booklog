"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { AuthShell } from "@/components/auth-shell";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <StudentLoginPage />
    </Suspense>
  );
}

function StudentLoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/student";
  const supabase = createClient();
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    const res = await fetch("/api/auth/student/resolve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ login_id: loginId.trim() })
    });
    const j = await res.json();
    if (!res.ok || !j.email) { setErr("존재하지 않는 학생 아이디입니다."); setLoading(false); return; }
    const { error } = await supabase.auth.signInWithPassword({ email: j.email, password });
    if (error) { setErr("비밀번호가 올바르지 않습니다."); setLoading(false); return; }
    router.replace(next);
  }

  return (
    <AuthShell title="학생 로그인" subtitle="선생님께 받은 아이디로 로그인하세요. 초기 비밀번호는 123456 이에요.">
      <form onSubmit={submit} className="space-y-3.5">
        <div>
          <label className="label">아이디</label>
          <input className="input" value={loginId} onChange={e => setLoginId(e.target.value)} placeholder="예: 2024-3-2-05" required />
        </div>
        <div>
          <label className="label">비밀번호</label>
          <input className="input" type="password" autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} required />
        </div>
        {err && <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{err}</div>}
        <button className="btn btn-brand w-full" disabled={loading}>
          {loading && <Loader2 className="size-4 animate-spin" />} 로그인
        </button>
        <div className="text-center text-sm text-ink-500">
          <Link href="/login/teacher" className="hover:text-ink-700">선생님이신가요? 교사 로그인 →</Link>
        </div>
      </form>
    </AuthShell>
  );
}
