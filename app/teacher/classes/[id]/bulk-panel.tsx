"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Printer, Sparkles, UploadCloud } from "lucide-react";

type Row = { number: string; name: string; login_id?: string };

export function BulkStudentPanel({
  classId, joinCode, existingNumbers
}: { classId: string; joinCode: string; existingNumbers: number[] }) {
  const router = useRouter();
  const [raw, setRaw] = useState("");
  const [auto, setAuto] = useState(true);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ created: { login_id: string; name: string; number: number }[]; failures: any[] } | null>(null);

  const parsed: Row[] = useMemo(() => parseInput(raw, existingNumbers), [raw, existingNumbers]);

  async function submit() {
    if (!parsed.length) return;
    setLoading(true);
    const res = await fetch(`/api/teacher/classes/${classId}/students`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        students: parsed.map(p => ({
          number: Number(p.number),
          name: p.name,
          login_id: auto ? undefined : (p.login_id && p.login_id.trim() ? p.login_id.trim() : undefined)
        }))
      })
    });
    const j = await res.json();
    setLoading(false);
    if (!res.ok) { alert(j.error ?? "생성 실패"); return; }
    setResult(j);
    setRaw("");
    router.refresh();
  }

  function printRoster() {
    if (!result?.created?.length) return;
    const w = window.open("", "_blank");
    if (!w) return;
    const rows = result.created
      .sort((a, b) => a.number - b.number)
      .map(r => `<tr><td>${r.number}</td><td>${escape(r.name)}</td><td style="font-family:monospace">${escape(r.login_id)}</td><td style="font-family:monospace">123456</td></tr>`)
      .join("");
    w.document.write(`
      <html><head><title>학생 계정 배부표</title>
      <style>
        body{font-family:'Pretendard Variable','Inter',sans-serif;padding:32px;color:#1d1d24}
        h1{font-size:18px;margin:0 0 4px}
        .sub{color:#636370;font-size:12px;margin-bottom:16px}
        table{width:100%;border-collapse:collapse;font-size:13px}
        th,td{border:1px solid #ddd;padding:8px 10px;text-align:left}
        th{background:#f3f4f6}
        .note{margin-top:14px;color:#636370;font-size:12px;line-height:1.5}
      </style></head><body>
      <h1>학급 독서통장 · 학생 계정 배부표</h1>
      <div class="sub">초기 비밀번호는 모두 <b>123456</b> 입니다. 최초 로그인 시 반드시 비밀번호를 변경하도록 안내해 주세요.</div>
      <table><thead><tr><th>번호</th><th>이름</th><th>로그인 아이디</th><th>초기 비밀번호</th></tr></thead><tbody>${rows}</tbody></table>
      <div class="note">* 접속 주소는 학교에서 안내받은 서비스 URL로 접속합니다.<br/>* 아이디는 학생 고유 식별자입니다. 분실 시 교사가 초기화할 수 있습니다.</div>
      </body></html>
    `);
    w.document.close();
    w.focus(); w.print();
  }

  return (
    <section className="card overflow-hidden">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-ink-100 bg-ink-50/60 px-5 py-4">
        <div>
          <h2 className="text-base font-bold">학생 일괄 생성</h2>
          <p className="text-sm text-ink-600">한 줄에 한 명씩 <b>번호, 이름</b> 형식으로 붙여넣으세요. (탭·쉼표 구분 모두 허용)</p>
        </div>
        <label className="chip cursor-pointer">
          <input type="checkbox" className="size-3.5 accent-brand-500" checked={auto} onChange={e => setAuto(e.target.checked)} />
          아이디 자동 생성 ({joinCode}-NN)
        </label>
      </div>

      <div className="grid gap-4 p-5 md:grid-cols-[1fr_340px]">
        <div>
          <label className="label">명단 붙여넣기</label>
          <textarea
            className="input min-h-[180px] font-mono text-[13px]"
            value={raw}
            onChange={e => setRaw(e.target.value)}
            placeholder={`예시 (번호\t이름):
1\t김도서
2\t박책벌레
3\t최독자
...`}
          />
          <div className="mt-2 flex items-center gap-2 text-xs text-ink-500">
            <Sparkles className="size-3.5 text-brand-500" />
            자동 생성 아이디 형식: <span className="chip font-mono">{joinCode}-01</span>
          </div>
        </div>

        <div>
          <label className="label">미리보기 ({parsed.length}명)</label>
          <div className="card max-h-[220px] overflow-y-auto text-sm">
            {parsed.length === 0 ? (
              <div className="p-4 text-center text-ink-500">붙여넣을 명단을 입력하면 여기에 미리보기가 표시돼요.</div>
            ) : (
              <ul className="divide-y divide-ink-100">
                {parsed.map((p, i) => (
                  <li key={i} className="flex items-center justify-between px-3 py-2">
                    <span className="flex items-center gap-2">
                      <span className="w-6 text-right font-mono text-xs text-ink-500">{p.number}</span>
                      <span className="font-medium">{p.name}</span>
                    </span>
                    <span className="font-mono text-xs text-ink-500">
                      {auto ? `${joinCode}-${String(Number(p.number)).padStart(2, "0")}` : (p.login_id || "—")}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="mt-3 flex items-center gap-2">
            <button onClick={submit} disabled={loading || parsed.length === 0} className="btn btn-brand flex-1">
              {loading ? <Loader2 className="size-4 animate-spin" /> : <UploadCloud className="size-4" />} {parsed.length}명 계정 생성
            </button>
          </div>
        </div>
      </div>

      {result && (
        <div className="border-t border-ink-100 bg-brand-50/40 px-5 py-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="text-sm text-ink-700">
              <b className="text-brand-700">{result.created.length}명</b> 계정이 생성되었습니다.
              {result.failures.length > 0 && <span className="ml-2 text-red-600">({result.failures.length}건 실패)</span>}
            </div>
            <button className="btn btn-ghost" onClick={printRoster}><Printer className="size-4" /> 배부표 인쇄</button>
          </div>
          {result.failures.length > 0 && (
            <ul className="mt-2 space-y-1 text-xs text-red-700">
              {result.failures.map((f, i) => (
                <li key={i}>· {f.number}번 {f.name} ({f.login_id}) — {f.reason}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </section>
  );
}

function parseInput(raw: string, existingNumbers: number[]): Row[] {
  const rows = raw.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const used = new Set(existingNumbers);
  const out: Row[] = [];
  for (const line of rows) {
    const parts = line.split(/[\t,]+/).map(s => s.trim()).filter(Boolean);
    if (parts.length < 2) continue;
    const number = parts[0].replace(/\D/g, "");
    const name = parts[1];
    const login_id = parts[2];
    if (!number || !name) continue;
    if (used.has(Number(number))) continue;
    used.add(Number(number));
    out.push({ number, name, login_id });
  }
  return out;
}

function escape(s: string) { return s.replace(/[&<>'"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" } as any)[c]); }
