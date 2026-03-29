"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"

const data = [
  { day: "Seg", production: 820, target: 850 },
  { day: "Ter", production: 865, target: 850 },
  { day: "Qua", production: 790, target: 850 },
  { day: "Qui", production: 880, target: 850 },
  { day: "Sex", production: 845, target: 850 },
  { day: "Sab", production: 720, target: 750 },
  { day: "Dom", production: 650, target: 700 },
]

export function ProductionChart() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <XAxis 
          dataKey="day" 
          stroke="hsl(var(--muted-foreground))"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis 
          stroke="hsl(var(--muted-foreground))"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `${value}`}
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "8px"
          }}
          labelStyle={{ color: "hsl(var(--foreground))" }}
        />
        <Bar 
          dataKey="production" 
          fill="hsl(var(--primary))" 
          radius={[4, 4, 0, 0]}
          name="Producao (ton)"
        />
        <Bar 
          dataKey="target" 
          fill="hsl(var(--muted))" 
          radius={[4, 4, 0, 0]}
          name="Meta (ton)"
        />
      </BarChart>
    </ResponsiveContainer>
  )
}
