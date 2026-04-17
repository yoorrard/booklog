"use client";

import { Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function WeeklyTrend({ data }: { data: { week: string; short: number; long: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <defs>
          <linearGradient id="gShort" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3b6bfa" stopOpacity={0.55} />
            <stop offset="100%" stopColor="#3b6bfa" stopOpacity={0.02} />
          </linearGradient>
          <linearGradient id="gLong" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#a855f7" stopOpacity={0.55} />
            <stop offset="100%" stopColor="#a855f7" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eeeef1" />
        <XAxis dataKey="week" tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
        <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #eeeef1", fontSize: 12 }} />
        <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
        <Area type="monotone" dataKey="short" name="한 줄" stroke="#3b6bfa" strokeWidth={2} fill="url(#gShort)" />
        <Area type="monotone" dataKey="long" name="긴 기록" stroke="#a855f7" strokeWidth={2} fill="url(#gLong)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}
