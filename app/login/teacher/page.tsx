"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { AuthShell } from "@/components/auth-shell";
import { GoogleButton } from "@/components/google-button";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <TeacherLoginPage />
    </Suspense>
  );
}

function TeacherLoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/teacher";
  const externalError = params.get("error");
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(externalError ? decodeURIComponent(externalError) : null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      const msg = error.message?.toLowerCase().includes("confirm")
        ? "이메일 인증이 아직 완료되지 않았어요. 받은 메일의 인증 링크를 먼저 눌러주세요."
        : "이메일 또는 비밀번호가 올바르지 않습니다.";
      setErr(msg); setLoading(false); return;
    }
    router.replace(next);
  }

  return (
    <AuthShell title="교사 로그인" subtitle="이메일 또는 Google 계정으로 로그인해 주세요.">
      <div className="space-y-4">
        <GoogleButton label="Google 계정으로 로그인" next={next} />
        <Divider>또는 이메일로 로그인</Divider>

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
      </div>
    </AuthShell>
  );
}

function Divider({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 text-xs text-ink-400">
      <div className="h-px flex-1 bg-ink-200" />{children}<div className="h-px flex-1 bg-ink-200" />
    </div>
  );
}
