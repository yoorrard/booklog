"use client";

import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

const COLORS = ["#3b6bfa", "#a855f7", "#22c55e", "#f59e0b", "#ef4444", "#06b6d4", "#ec4899", "#64748b"];

export function GenrePie({ data }: { data: { name: string; value: number }[] }) {
  if (!data.length) return <div className="grid h-full place-items-center text-sm text-ink-500">아직 책이 없어요.</div>;
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={2}>
          {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="#fff" strokeWidth={2} />)}
        </Pie>
        <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #eeeef1", fontSize: 12 }} />
        <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
      </PieChart>
    </ResponsiveContainer>
  );
}
