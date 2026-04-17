"use client";

export function ReadingHeatmap({ data }: { data: { date: string; count: number }[] }) {
  // 데이터 길이 (최대 12주 * 7일 = 84) 를 12 x 7 그리드로 구성 (열=주, 행=요일)
  const weeks: { date: string; count: number }[][] = [];
  for (let i = 0; i < data.length; i += 7) {
    weeks.push(data.slice(i, i + 7));
  }
  const max = Math.max(1, ...data.map(d => d.count));
  function color(c: number) {
    if (c === 0) return "bg-ink-100";
    const t = c / max;
    if (t < 0.25) return "bg-brand-100";
    if (t < 0.5) return "bg-brand-300";
    if (t < 0.75) return "bg-brand-500";
    return "bg-brand-700";
  }
  return (
    <div className="space-y-2">
      <div className="flex gap-1.5 overflow-x-auto">
        {weeks.map((w, wi) => (
          <div key={wi} className="flex flex-col gap-1">
            {Array.from({ length: 7 }).map((_, di) => {
              const cell = w[di];
              return (
                <div
                  key={di}
                  className={`size-4 rounded-[3px] ${cell ? color(cell.count) : "bg-transparent"}`}
                  title={cell ? `${cell.date} · ${cell.count}개` : ""}
                />
              );
            })}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-1 text-[11px] text-ink-500">
        적음
        <span className="size-3 rounded bg-ink-100" />
        <span className="size-3 rounded bg-brand-100" />
        <span className="size-3 rounded bg-brand-300" />
        <span className="size-3 rounded bg-brand-500" />
        <span className="size-3 rounded bg-brand-700" />
        많음
      </div>
    </div>
  );
}
