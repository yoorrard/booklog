import Link from "next/link";
import { BookOpen, Users, BarChart3, Shield, Sparkles, GraduationCap } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Link href="/" className="flex items-center gap-2">
          <div className="grid size-9 place-items-center rounded-xl bg-ink-900 text-white">
            <BookOpen className="size-5" />
          </div>
          <span className="text-lg font-bold tracking-tight">Booklog</span>
        </Link>
        <nav className="flex items-center gap-2">
          <Link href="/login/student" className="btn btn-ghost">학생 로그인</Link>
          <Link href="/login/teacher" className="btn btn-ghost">교사 로그인</Link>
          <Link href="/signup/teacher" className="btn btn-brand">교사 회원가입</Link>
        </nav>
      </header>

      <section className="mx-auto max-w-6xl px-6 pb-20 pt-10 sm:pt-20">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <span className="chip mb-5 border-brand-200 bg-brand-50 text-brand-700">
              <Sparkles className="size-3.5" /> 학급용 독서 기록 플랫폼
            </span>
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
              한 권, 한 문장,<br />그리고 <span className="bg-gradient-to-r from-brand-500 to-accent-500 bg-clip-text text-transparent">우리 반의 독서 지도</span>.
            </h1>
            <p className="mt-5 text-base leading-relaxed text-ink-600 sm:text-lg">
              선생님은 단 한 번 학급을 만들고, 학생들은 배부받은 아이디로 로그인해
              표지·한줄평·긴 감상·테마별 기록을 쌓아갑니다. 기록은 모두 안전한 데이터베이스에
              저장되어 교사 대시보드에서 한눈에 보입니다.
            </p>
            <div className="mt-8 flex flex-wrap gap-2">
              <Link href="/signup/teacher" className="btn btn-brand">교사로 시작하기</Link>
              <Link href="/login/student" className="btn btn-ghost">학생 로그인</Link>
            </div>

            <div className="mt-10 grid grid-cols-3 gap-3 text-center">
              <Stat n="10+" label="테마 기록" />
              <Stat n="1인 1책장" label="개인화된 책 표지 시각화" />
              <Stat n="실시간" label="교사 대시보드" />
            </div>
          </div>

          <div className="relative">
            <div className="card relative overflow-hidden p-6">
              <div className="absolute -right-20 -top-20 size-64 rounded-full bg-gradient-to-br from-brand-200 to-accent-200 opacity-40 blur-2xl" />
              <div className="relative">
                <div className="mb-4 flex items-center justify-between">
                  <div className="text-sm font-semibold text-ink-600">3학년 2반 · 우리 반 책장</div>
                  <div className="chip">오늘 기록 12</div>
                </div>
                <div className="grid grid-cols-4 gap-3">
                  {covers.map((c, i) => (
                    <div
                      key={i}
                      className="aspect-[2/3] rounded-lg bg-gradient-to-br shadow-sm"
                      style={{ backgroundImage: c }}
                    />
                  ))}
                </div>
                <div className="mt-4 rounded-xl border border-ink-100 bg-ink-50 p-3 text-sm">
                  <b className="text-ink-700">💬 인상 깊은 구절</b>
                  <p className="mt-1 text-ink-600">“나는 이야기로 자라는 중이다.” — 어린 왕자, 3학년 김도서</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-24">
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">교실을 위한 단단한 구조</h2>
        <p className="mt-2 text-ink-600">관리는 간단하게, 기록은 풍부하게. 수천 명 규모의 동시 사용도 안정적입니다.</p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Feature icon={<GraduationCap />} title="교사 중심 계정 관리"
            desc="학급을 만들고, 학생 아이디를 일괄 생성해 인쇄·배부하세요. 초기 비밀번호는 123456, 최초 로그인 시 학생이 직접 변경합니다." />
          <Feature icon={<BookOpen />} title="표지로 채우는 책장"
            desc="학생은 책 표지를 올리고, 한 줄 기록부터 긴 감상까지 자유롭게 남길 수 있어요." />
          <Feature icon={<Sparkles />} title="10가지 테마 기록"
            desc="인상 깊은 구절·배운 점·주인공에게 편지 등 다양한 시선으로 독서를 풍부하게." />
          <Feature icon={<BarChart3 />} title="데이터 시각화"
            desc="읽은 권수·누적 페이지·테마 분포·월별 추세를 차트로 한눈에." />
          <Feature icon={<Users />} title="교사 대시보드"
            desc="우리 반 모든 학생의 활동·기록을 안전하게 열람하고 응원할 수 있어요." />
          <Feature icon={<Shield />} title="안전한 데이터"
            desc="Supabase Postgres + Row Level Security로 타학급·타학생 데이터는 원천 차단합니다." />
        </div>
      </section>

      <footer className="border-t border-ink-100 bg-white/50">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6 text-sm text-ink-500">
          <span>© {new Date().getFullYear()} Booklog · 학급 독서통장</span>
          <div className="flex gap-4">
            <Link href="/login/teacher" className="hover:text-ink-800">교사 로그인</Link>
            <Link href="/login/student" className="hover:text-ink-800">학생 로그인</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function Stat({ n, label }: { n: string; label: string }) {
  return (
    <div className="rounded-xl bg-white p-3 shadow-sm ring-1 ring-ink-100">
      <div className="text-lg font-extrabold tracking-tight">{n}</div>
      <div className="text-xs text-ink-500">{label}</div>
    </div>
  );
}

function Feature({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="card p-5 transition hover:-translate-y-0.5 hover:shadow-pop">
      <div className="grid size-10 place-items-center rounded-xl bg-ink-900 text-white">{icon}</div>
      <h3 className="mt-3 text-base font-bold">{title}</h3>
      <p className="mt-1 text-sm text-ink-600">{desc}</p>
    </div>
  );
}

const covers = [
  "linear-gradient(135deg,#3b6bfa,#223693)",
  "linear-gradient(135deg,#a855f7,#7e22ce)",
  "linear-gradient(135deg,#f59e0b,#b45309)",
  "linear-gradient(135deg,#10b981,#047857)",
  "linear-gradient(135deg,#ef4444,#991b1b)",
  "linear-gradient(135deg,#06b6d4,#155e75)",
  "linear-gradient(135deg,#ec4899,#9d174d)",
  "linear-gradient(135deg,#64748b,#1e293b)"
];
