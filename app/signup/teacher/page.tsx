"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, Mail, MailCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { AuthShell } from "@/components/auth-shell";
import { GoogleButton } from "@/components/google-button";

export default function TeacherSignupPage() {
  const router = useRouter();
  const supabase = createClient();
  const [form, setForm] = useState({ name: "", school: "", email: "", password: "", confirm: "" });
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    if (!form.name.trim()) { setErr("이름을 입력해 주세요."); return; }
    if (form.password.length < 8) { setErr("비밀번호는 8자 이상이어야 합니다."); return; }
    if (form.password !== form.confirm) { setErr("비밀번호 확인이 일치하지 않습니다."); return; }

    setLoading(true);
    const emailRedirectTo =
      typeof window !== "undefined" ? `${window.location.origin}/auth/callback?next=/teacher` : undefined;
    const { data, error } = await supabase.auth.signUp({
      email: form.email.trim(),
      password: form.password,
      options: {
        emailRedirectTo,
        data: { role: "teacher", display_name: form.name, school: form.school || null }
      }
    });
    if (error) { setErr(error.message); setLoading(false); return; }

    // 이메일 인증이 OFF 로 설정된 환경에서는 session 이 즉시 발급됨
    if (data.session) {
      // 콜백이 돌지 않으므로 부트스트랩 호출
      await fetch("/api/auth/teacher/bootstrap", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name, school: form.school })
      });
      router.replace("/teacher");
      return;
    }

    setSent(form.email.trim());
    setLoading(false);
  }

  if (sent) {
    return (
      <AuthShell title="이메일을 확인해 주세요" subtitle="보낸 메일의 인증 링크를 누르면 가입이 완료돼요.">
        <div className="flex flex-col items-center gap-3 py-2 text-center">
          <div className="grid size-14 place-items-center rounded-2xl bg-brand-50 text-brand-600">
            <MailCheck className="size-7" />
          </div>
          <div className="text-sm text-ink-700">
            <b>{sent}</b> 로 인증 메일을 보냈어요.<br />
            받은 편지함의 <b>“이메일 인증”</b> 링크를 눌러 로그인하세요.
          </div>
          <div className="text-xs text-ink-500">메일이 오지 않았다면 스팸함도 확인해 주세요.</div>
          <Link href="/login/teacher" className="btn btn-ghost mt-2 w-full">로그인 화면으로 가기</Link>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="교사 회원가입" subtitle="학급을 만들고 학생들의 독서 기록을 안전하게 관리해요.">
      <div className="space-y-4">
        <GoogleButton label="Google 계정으로 계속하기" next="/teacher" />
        <Divider>또는 이메일로 가입</Divider>

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
            {loading ? <Loader2 className="size-4 animate-spin" /> : <Mail className="size-4" />} 인증 메일 받고 가입하기
          </button>

          <div className="text-center text-sm text-ink-500">
            이미 계정이 있나요? <Link href="/login/teacher" className="font-semibold text-brand-600">교사 로그인</Link>
          </div>
        </form>
      </div>
    </AuthShell>
  );
}

function Divider({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 text-xs text-ink-400">
      <div className="h-px flex-1 bg-ink-200" />
      {children}
      <div className="h-px flex-1 bg-ink-200" />
    </div>
  );
}
