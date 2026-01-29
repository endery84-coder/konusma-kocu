"use client";

import {
    RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer
} from 'recharts';

interface SkillsMapChartProps {
    data: { subject: string; A: number; fullMark: number }[];
}

export default function SkillsMapChart({ data }: SkillsMapChartProps) {
    return (
        <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
                <PolarGrid strokeOpacity={0.2} />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: '#888' }} />
                <Radar
                    name="Skills"
                    dataKey="A"
                    stroke="currentColor"
                    className="text-primary"
                    fill="currentColor"
                    fillOpacity={0.4}
                />
            </RadarChart>
        </ResponsiveContainer>
    );
}
