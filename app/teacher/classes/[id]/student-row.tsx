"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, Loader2, Trash2 } from "lucide-react";
import { formatDate } from "@/lib/utils";

type S = {
  id: string;
  number: number;
  name: string;
  login_id: string;
  must_change_password: boolean;
  books: number;
  records: number;
  last_at: string | null;
};

export function StudentRow({ classId, student }: { classId: string; student: S }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);

  async function resetPw() {
    if (!confirm(`${student.name} 학생의 비밀번호를 123456으로 초기화할까요?`)) return;
    setBusy("pw");
    const res = await fetch(`/api/teacher/classes/${classId}/students`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ student_id: student.id })
    });
    setBusy(null);
    if (!res.ok) { alert("초기화 실패"); return; }
    router.refresh();
  }

  async function remove() {
    if (!confirm(`${student.name} 학생의 계정과 모든 기록이 삭제됩니다. 계속할까요?`)) return;
    setBusy("del");
    const res = await fetch(`/api/teacher/classes/${classId}/students?student_id=${student.id}`, { method: "DELETE" });
    setBusy(null);
    if (!res.ok) { alert("삭제 실패"); return; }
    router.refresh();
  }

  return (
    <div className="grid grid-cols-[60px_1fr_1.4fr_auto_auto_auto] items-center gap-2 px-4 py-2.5 text-sm">
      <div className="font-mono text-ink-500">{student.number}</div>
      <div className="flex items-center gap-2">
        <Link href={`/teacher/students/${student.id}`} className="font-semibold hover:text-brand-600">{student.name}</Link>
        {student.must_change_password && <span className="chip border-amber-200 bg-amber-50 text-amber-700">미변경</span>}
      </div>
      <div className="font-mono text-xs text-ink-500">{student.login_id}</div>
      <div className="text-right text-sm tabular-nums">{student.books}</div>
      <div className="text-right text-sm tabular-nums">{student.records}</div>
      <div className="flex items-center gap-1 pr-1">
        <Link className="btn btn-ghost !px-2 !py-1 text-xs" href={`/teacher/students/${student.id}`}>보기</Link>
        <button className="btn btn-ghost !px-2 !py-1 text-xs" onClick={resetPw} disabled={busy !== null} title="비밀번호 초기화">
          {busy === "pw" ? <Loader2 className="size-3 animate-spin" /> : <KeyRound className="size-3.5" />}
        </button>
        <button className="btn btn-danger !px-2 !py-1 text-xs" onClick={remove} disabled={busy !== null} title="삭제">
          {busy === "del" ? <Loader2 className="size-3 animate-spin" /> : <Trash2 className="size-3.5" />}
        </button>
      </div>
      {student.last_at && <div className="col-span-full -mt-1 text-[11px] text-ink-400">최근 기록 {formatDate(student.last_at)}</div>}
    </div>
  );
}
