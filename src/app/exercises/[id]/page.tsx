"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    ArrowLeft, Play, Clock, Target, BookOpen,
    CheckCircle2, Lock, Star, ChevronRight
} from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import BottomNav from '@/components/BottomNav';

const difficultyLabels = ['', 'Kolay', 'Orta', 'Zor', 'Uzman'];
const difficultyColors = ['', 'text-emerald-500', 'text-amber-500', 'text-orange-500', 'text-red-500'];

export default function ExerciseDetailPage() {
    const router = useRouter();
    const params = useParams();
    const exerciseId = params?.id as string;

    const [exercise, setExercise] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isStarted, setIsStarted] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [isPremiumUser, setIsPremiumUser] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Get current user
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    setUserId(user.id);
                    const { data: profile } = await supabase
                        .from('users')
                        .select('is_premium')
                        .eq('id', user.id)
                        .single();
                    setIsPremiumUser(profile?.is_premium || false);
                }

                // Get exercise
                const { data, error } = await supabase
                    .from('exercises')
                    .select('*')
                    .eq('id', exerciseId)
                    .single();

                if (error) {
                    console.error('Exercise fetch error:', error);
                    return;
                }

                console.log('Fetched exercise:', data); // Debug
                setExercise(data);
            } catch (error) {
                console.error('Error:', error);
            } finally {
                setLoading(false);
            }
        };

        if (exerciseId) {
            fetchData();
        }
    }, [exerciseId]);

    // Parse instructions into steps
    const steps = exercise?.instructions
        ?.split('\n')
        .filter((s: string) => s.trim())
        .map((s: string) => s.replace(/^\d+\.\s*/, '')) || [];

    const handleStart = () => {
        if (exercise?.is_premium && !isPremiumUser) {
            router.push('/premium');
            return;
        }

        if (exercise?.category === 'akicilik' || exercise?.category === 'okuma') {
            router.push('/record');
        } else {
            setIsStarted(true);
        }
    };

    const handleComplete = async () => {
        if (!userId) return;

        try {
            // Save progress
            await supabase.from('user_progress').insert({
                user_id: userId,
                exercise_id: exerciseId,
                completed_at: new Date().toISOString(),
                duration_seconds: (exercise?.duration_minutes || 5) * 60,
                score: 100,
            });

            // Update user stats
            const { data: currentUser } = await supabase
                .from('users')
                .select('total_practice_minutes')
                .eq('id', userId)
                .single();

            await supabase
                .from('users')
                .update({
                    total_practice_minutes: (currentUser?.total_practice_minutes || 0) + (exercise?.duration_minutes || 5)
                })
                .eq('id', userId);

            router.push('/exercises?completed=true');
        } catch (error) {
            console.error('Error saving progress:', error);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!exercise) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
                <p className="text-muted-foreground mb-4">Egzersiz bulunamadı</p>
                <button
                    onClick={() => router.push('/exercises')}
                    className="text-primary font-medium"
                >
                    Egzersizlere dön
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background pb-24">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-xl border-b border-border">
                <div className="flex items-center gap-4 p-4">
                    <button onClick={() => router.back()} className="p-2 hover:bg-secondary rounded-xl">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h1 className="font-semibold text-foreground">Egzersiz</h1>
                </div>
            </div>

            {/* Hero */}
            <div className="relative">
                <div className="h-32 bg-gradient-to-br from-teal-500 to-cyan-500" />
                <div className="absolute -bottom-10 left-4 right-4">
                    <div className="bg-card rounded-2xl p-4 shadow-lg border border-border">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-teal-500/10 rounded-2xl flex items-center justify-center text-3xl">
                                {exercise.icon || '🎯'}
                            </div>
                            <div className="flex-1">
                                {exercise.is_premium && !isPremiumUser && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-500/10 text-amber-500 text-xs font-medium rounded-full mb-1">
                                        <Lock className="w-3 h-3" /> Premium
                                    </span>
                                )}
                                <h1 className="text-lg font-bold text-foreground">{exercise.title}</h1>
                                <p className="text-sm text-muted-foreground">{exercise.description}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="px-4 pt-14 space-y-4">
                {/* Stats */}
                <div className="grid grid-cols-3 gap-2">
                    <div className="bg-card rounded-xl p-3 text-center border border-border">
                        <Clock className="w-5 h-5 text-blue-500 mx-auto mb-1" />
                        <p className="text-sm font-semibold text-foreground">{exercise.duration_minutes} dk</p>
                        <p className="text-xs text-muted-foreground">Süre</p>
                    </div>
                    <div className="bg-card rounded-xl p-3 text-center border border-border">
                        <Target className="w-5 h-5 text-teal-500 mx-auto mb-1" />
                        <p className={`text-sm font-semibold ${difficultyColors[exercise.difficulty]}`}>
                            {difficultyLabels[exercise.difficulty]}
                        </p>
                        <p className="text-xs text-muted-foreground">Zorluk</p>
                    </div>
                    <div className="bg-card rounded-xl p-3 text-center border border-border">
                        <Star className="w-5 h-5 text-amber-500 mx-auto mb-1" />
                        <p className="text-sm font-semibold text-foreground">+{exercise.duration_minutes * 10}</p>
                        <p className="text-xs text-muted-foreground">Puan</p>
                    </div>
                </div>

                {/* Instructions or Active View */}
                {!isStarted ? (
                    <>
                        <div className="bg-card rounded-2xl p-4 border border-border">
                            <h2 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                                <BookOpen className="w-5 h-5 text-primary" />
                                Nasıl Yapılır?
                            </h2>
                            <div className="space-y-2">
                                {steps.map((step: string, index: number) => (
                                    <div key={index} className="flex items-start gap-3">
                                        <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                                            <span className="text-xs font-semibold text-primary">{index + 1}</span>
                                        </div>
                                        <p className="text-sm text-foreground">{step}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={handleStart}
                            className={`w-full py-4 font-semibold rounded-2xl flex items-center justify-center gap-2 shadow-lg ${exercise.is_premium && !isPremiumUser
                                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white'
                                    : 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white'
                                }`}
                        >
                            {exercise.is_premium && !isPremiumUser ? (
                                <>
                                    <Lock className="w-5 h-5" />
                                    Premium'a Geç
                                </>
                            ) : (
                                <>
                                    <Play className="w-5 h-5" />
                                    Egzersize Başla
                                </>
                            )}
                        </button>
                    </>
                ) : (
                    /* Active Exercise View */
                    <div className="bg-card rounded-2xl p-5 border border-border">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-sm text-muted-foreground">
                                Adım {currentStep + 1} / {steps.length}
                            </span>
                            <div className="flex gap-1">
                                {steps.map((_: any, i: number) => (
                                    <div
                                        key={i}
                                        className={`w-2 h-2 rounded-full ${i <= currentStep ? 'bg-primary' : 'bg-secondary'
                                            }`}
                                    />
                                ))}
                            </div>
                        </div>

                        <div className="min-h-[100px] flex items-center justify-center">
                            <p className="text-lg text-foreground text-center">
                                {steps[currentStep]}
                            </p>
                        </div>

                        <div className="flex gap-3 mt-6">
                            {currentStep > 0 && (
                                <button
                                    onClick={() => setCurrentStep(prev => prev - 1)}
                                    className="flex-1 py-3 bg-secondary text-foreground font-medium rounded-xl"
                                >
                                    Önceki
                                </button>
                            )}
                            {currentStep < steps.length - 1 ? (
                                <button
                                    onClick={() => setCurrentStep(prev => prev + 1)}
                                    className="flex-1 py-3 bg-primary text-white font-medium rounded-xl"
                                >
                                    Sonraki
                                </button>
                            ) : (
                                <button
                                    onClick={handleComplete}
                                    className="flex-1 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-medium rounded-xl flex items-center justify-center gap-2"
                                >
                                    <CheckCircle2 className="w-5 h-5" />
                                    Tamamla
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <BottomNav />
        </div>
    );
}
