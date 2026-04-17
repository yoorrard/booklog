"use client";

export function LeaderBoard({ data }: { data: { name: string; records: number; books: number }[] }) {
  const max = Math.max(1, ...data.map(d => d.records));
  return (
    <div className="mt-3 space-y-2">
      {data.map((d, i) => (
        <div key={i} className="grid grid-cols-[36px_1fr_160px_72px] items-center gap-3 text-sm">
          <div className="grid size-7 place-items-center rounded-full bg-ink-900 text-[11px] font-bold text-white">{i + 1}</div>
          <div className="truncate font-medium">{d.name}</div>
          <div className="h-2 rounded-full bg-ink-100">
            <div className="h-full rounded-full bg-gradient-to-r from-brand-500 to-accent-500" style={{ width: `${(d.records / max) * 100}%` }} />
          </div>
          <div className="text-right text-xs text-ink-500 tabular-nums">📝 {d.records} · 📚 {d.books}</div>
        </div>
      ))}
      {data.length === 0 && <div className="text-center text-sm text-ink-500">아직 데이터가 없어요.</div>}
    </div>
  );
}
