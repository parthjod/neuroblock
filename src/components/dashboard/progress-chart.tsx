"use client";

import { Line, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import type { Session } from "@/lib/types";
import { format } from "date-fns";

type ProgressChartProps = {
  sessions: Session[];
};

export default function ProgressChart({ sessions }: ProgressChartProps) {
  const chartData = sessions
    .map((session) => ({
      date: format(new Date(session.date), "MMM d"),
      RTS: session.recoveryTrendScore,
    }))
    .reverse();

    if (sessions.length === 0) {
        return (
          <div className="h-[300px] w-full flex items-center justify-center text-muted-foreground">
            No session data available to display chart.
          </div>
        );
    }

  return (
    <div className="h-[300px] w-full">
        <ResponsiveContainer>
            <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} domain={[0, 100]} />
            <Tooltip
                contentStyle={{
                    backgroundColor: "hsl(var(--background))",
                    borderColor: "hsl(var(--border))",
                    color: "hsl(var(--foreground))",
                }}
            />
            <Legend wrapperStyle={{ fontSize: '14px' }} />
            <Line
                type="monotone"
                dataKey="RTS"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                activeDot={{ r: 8 }}
                dot={{ r: 4 }}
            />
            </LineChart>
        </ResponsiveContainer>
    </div>
  );
}
