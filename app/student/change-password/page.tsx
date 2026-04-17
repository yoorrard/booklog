"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { AuthShell } from "@/components/auth-shell";

export default function ChangePasswordPage() {
  const router = useRouter();
  const supabase = createClient();
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    if (pw.length < 8) { setErr("새 비밀번호는 8자 이상이어야 합니다."); return; }
    if (pw === "123456") { setErr("기본 비밀번호와 다른 값을 사용하세요."); return; }
    if (pw !== pw2) { setErr("비밀번호 확인이 일치하지 않습니다."); return; }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: pw });
    if (error) { setErr(error.message); setLoading(false); return; }

    const res = await fetch("/api/student/complete-onboarding", { method: "POST" });
    if (!res.ok) { setErr("상태 업데이트에 실패했습니다."); setLoading(false); return; }
    router.replace("/student");
  }

  return (
    <AuthShell title="새 비밀번호 설정" subtitle="처음 로그인했어요! 나만의 비밀번호로 바꿔볼까요?">
      <form onSubmit={submit} className="space-y-3.5">
        <div className="flex items-center gap-2 rounded-xl border border-brand-200 bg-brand-50 px-3 py-2 text-sm text-brand-700">
          <ShieldCheck className="size-4" />
          비밀번호는 8자 이상, 기억하기 쉬운 걸로 정하세요.
        </div>
        <div>
          <label className="label">새 비밀번호</label>
          <input className="input" type="password" value={pw} onChange={e => setPw(e.target.value)} required />
        </div>
        <div>
          <label className="label">새 비밀번호 확인</label>
          <input className="input" type="password" value={pw2} onChange={e => setPw2(e.target.value)} required />
        </div>
        {err && <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{err}</div>}
        <button className="btn btn-brand w-full" disabled={loading}>
          {loading && <Loader2 className="size-4 animate-spin" />} 비밀번호 저장
        </button>
      </form>
    </AuthShell>
  );
}
