"use client";

import {
    BarChart, Bar, XAxis, Tooltip, ResponsiveContainer
} from 'recharts';

interface WeeklyActivityChartProps {
    data: { name: string; min: number }[];
}

export default function WeeklyActivityChart({ data }: WeeklyActivityChartProps) {
    return (
        <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
                <XAxis dataKey="name" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                />
                <Bar dataKey="min" fill="currentColor" className="text-primary" radius={[4, 4, 0, 0]} />
            </BarChart>
        </ResponsiveContainer>
    );
}
