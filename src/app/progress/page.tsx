"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useProgress } from "@/hooks/useProgress"
import { supabase } from "@/lib/supabase"
import BottomNav from "@/components/BottomNav"

export default function ProgressPage() {
    const router = useRouter()
    const [userId, setUserId] = useState<string>("")

    useEffect(() => {
        supabase.auth.getUser().then(({ data }) => {
            if (data.user) setUserId(data.user.id)
            else router.push('/auth')
        })
    }, [])

    const { progress, loading } = useProgress(userId)

    // Calendar for Monthly View (just visualization for now)
    const [date, setDate] = useState<Date | undefined>(new Date())

    return (
        <div className="min-h-screen bg-background pb-safe p-6">
            <h1 className="text-2xl font-bold">İlerleme</h1>

            {/* Summary Cards */}
            <div className="grid grid-cols-3 gap-3 my-6">
                <Card className="bg-orange-500/10 border-none shadow-none">
                    <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                        <span className="text-xl">🔥</span>
                        <span className="text-lg font-bold text-orange-600">{progress.streakDays}</span>
                        <span className="text-xs text-orange-600/60 font-medium">Gün Seri</span>
                    </CardContent>
                </Card>
                <Card className="bg-blue-500/10 border-none shadow-none">
                    <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                        <span className="text-xl">⏱️</span>
                        <span className="text-lg font-bold text-blue-600">{progress.weeklyMinutes}</span>
                        <span className="text-xs text-blue-600/60 font-medium">Bu Hafta</span>
                    </CardContent>
                </Card>
                <Card className="bg-emerald-500/10 border-none shadow-none">
                    <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                        <span className="text-xl">🎯</span>
                        <span className="text-lg font-bold text-emerald-600">{progress.completedExercises}</span>
                        <span className="text-xs text-emerald-600/60 font-medium">Tamamlanan</span>
                    </CardContent>
                </Card>
            </div>

            {/* Weekly Chart */}
            <Card className="glass-card shadow-soft border-none mb-6">
                <CardHeader>
                    <CardTitle className="text-base text-foreground font-semibold">Haftalık Aktivite</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[200px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={progress.weeklyData}>
                                <XAxis dataKey="day" fontSize={12} tickLine={false} axisLine={false} tick={{ fill: 'var(--muted-foreground)' }} />
                                <YAxis hide />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', background: 'var(--popover)', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                                    cursor={{ fill: 'var(--muted)' }}
                                />
                                <Bar dataKey="minutes" fill="url(#gradient-bar)" radius={[6, 6, 6, 6]} barSize={16} />
                                <defs>
                                    <linearGradient id="gradient-bar" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="rgb(124 58 237)" />
                                        <stop offset="100%" stopColor="rgb(236 72 153)" />
                                    </linearGradient>
                                </defs>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            {/* Monthly Calendar View */}
            <Card className="glass-card shadow-soft border-none mb-6">
                <CardHeader>
                    <CardTitle className="text-base text-foreground font-semibold">Aylık Takvim</CardTitle>
                </CardHeader>
                <CardContent className="flex justify-center">
                    <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        className="rounded-xl border border-border"
                    />
                </CardContent>
            </Card>

            {/* Recent Activities */}
            <div className="space-y-3">
                <h3 className="font-semibold">Son Aktiviteler</h3>
                {progress.recentActivities.length > 0 ? (
                    progress.recentActivities.map((activity: any, i) => (
                        <div key={i} className="flex items-center justify-between p-3 bg-card rounded-xl border shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                    {activity.exercises?.icon || '📝'}
                                </div>
                                <div>
                                    <div className="font-medium text-sm">{activity.exercises?.title || 'Egzersiz'}</div>
                                    <div className="text-xs text-muted-foreground">
                                        {new Date(activity.completed_at).toLocaleDateString('tr-TR')}
                                    </div>
                                </div>
                            </div>
                            <div className="text-sm font-semibold text-primary">
                                {Math.round(activity.duration_seconds / 60)} dk
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center p-4 text-muted-foreground text-sm">Henüz aktivite yok.</div>
                )}
            </div>

            {/* Achievements Grid */}
            <div className="space-y-3">
                <h3 className="font-semibold">Başarılar</h3>
                <div className="grid grid-cols-4 gap-2">
                    {progress.achievements.map((a: any) => (
                        <div key={a.id} className="flex flex-col items-center">
                            <div className="h-14 w-14 rounded-full bg-yellow-100 flex items-center justify-center text-2xl border-2 border-yellow-200">
                                {a.achievements?.icon}
                            </div>
                        </div>
                    ))}
                    {/* Placeholders for locked achievements if needed */}
                </div>
            </div>
            <BottomNav />
        </div>
    )
}
