"use client";

import { Line, LineChart, ResponsiveContainer, YAxis } from "recharts";

export function Sparkline({ prices, positive }: { prices: number[]; positive: boolean }) {
  if (!prices || prices.length === 0) {
    return <div className="w-24 h-10 flex items-center text-[10px] text-slate-600">—</div>;
  }
  const data = prices.map((p, i) => ({ i, p }));
  const color = positive ? "#00FF66" : "#FF3366";

  return (
    <div className="w-24 h-10">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <YAxis hide domain={["dataMin", "dataMax"]} />
          <Line
            type="monotone"
            dataKey="p"
            stroke={color}
            strokeWidth={1.5}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
