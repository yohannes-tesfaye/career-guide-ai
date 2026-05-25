"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

const chartConfig = {
  count: { label: "Resources", color: "var(--chart-1)" },
} satisfies ChartConfig;

export function LearningPathChart({
  data,
}: {
  data: { skill: string; count: number }[];
}) {
  if (data.length === 0) return null;

  return (
    <ChartContainer config={chartConfig} className="h-[220px] w-full">
      <BarChart data={data} margin={{ left: 8, right: 8 }}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="skill"
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => (v.length > 12 ? `${v.slice(0, 10)}…` : v)}
        />
        <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar dataKey="count" fill="var(--color-count)" radius={4} />
      </BarChart>
    </ChartContainer>
  );
}
