"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { ArrowLeft, Play, Pause, X, RotateCcw, Wind } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useConfetti } from '@/hooks/useConfetti';
import { useExerciseCompletion } from '@/hooks/useExerciseCompletion';

type BreathingPhase = 'idle' | 'ready' | 'inhale' | 'hold-in' | 'exhale' | 'hold-out' | 'completed';

export default function BreathingExercisePage() {
    const router = useRouter();
    const { t } = useLanguage();

    const [phase, setPhase] = useState<BreathingPhase>('idle');
    const [timeLeft, setTimeLeft] = useState(0); // Phase timer
    const [totalTime, setTotalTime] = useState(0); // Total practice time
    const [cycles, setCycles] = useState(0);
    const [isActive, setIsActive] = useState(false);
    const { fireConfetti, fireStars } = useConfetti();
    const { completeExercise } = useExerciseCompletion();

    // Audio refs (optional, placeholders for now)
    // const audioRef = useRef<HTMLAudioElement>(null);

    // Configuration (4-7-8 Technique)
    const config = {
        inhale: 4,
        holdIn: 7,
        exhale: 8,
        holdOut: 0, // Optional
        ready: 3,
    };

    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (isActive && phase !== 'completed' && phase !== 'idle') {
            interval = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        handlePhaseTransition(); // Move to next phase
                        return 0;
                    }
                    return prev - 1;
                });

                setTotalTime(t => t + 1);
            }, 1000);
        }

        return () => clearInterval(interval);
    }, [isActive, phase]);

    const handlePhaseTransition = () => {
        switch (phase) {
            case 'ready':
                setPhase('inhale');
                setTimeLeft(config.inhale);
                break;
            case 'inhale':
                setPhase('hold-in');
                setTimeLeft(config.holdIn);
                break;
            case 'hold-in':
                setPhase('exhale');
                setTimeLeft(config.exhale);
                break;
            case 'exhale':
                setCycles(c => c + 1);
                setPhase('inhale'); // Loop back to inhale for 4-7-8
                setTimeLeft(config.inhale);
                break;
            default:
                break;
        }
    };

    const startExercise = () => {
        setPhase('ready');
        setTimeLeft(config.ready);
        setIsActive(true);
        setCycles(0);
        setTotalTime(0);
    };

    const stopExercise = async () => {
        setIsActive(false);
        setPhase('completed');

        // Track completion
        const durationMinutes = Math.round(totalTime / 60);
        await completeExercise({
            exerciseType: 'breathing',
            durationMinutes: durationMinutes || 1,
            xpEarned: 25 + (cycles * 5), // Bonus XP per cycle
        });

        // Fire celebration confetti
        setTimeout(() => {
            fireConfetti();
            if (cycles >= 3) {
                setTimeout(fireStars, 500);
            }
        }, 200);
    };

    const getPhaseText = () => {
        switch (phase) {
            case 'idle': return t('exercises.breathing.start');
            case 'ready': return t('exercises.breathing.ready');
            case 'inhale': return t('exercises.breathing.inhale');
            case 'hold-in': return t('exercises.breathing.hold');
            case 'exhale': return t('exercises.breathing.exhale');
            case 'completed': return t('exercises.breathing.completed');
            default: return '';
        }
    };

    const getPhaseColor = () => {
        switch (phase) {
            case 'inhale': return 'from-cyan-400 to-blue-500';
            case 'hold-in': return 'from-purple-400 to-indigo-500';
            case 'exhale': return 'from-teal-400 to-emerald-500';
            default: return 'from-slate-700 to-slate-600';
        }
    };

    // Animation variants
    const circleVariants: Variants = {
        idle: { scale: 1, opacity: 0.5 },
        ready: { scale: 1.1, opacity: 0.8 },
        inhale: { scale: 2.5, transition: { duration: config.inhale, ease: "easeInOut" } },
        "hold-in": { scale: 2.5, transition: { duration: config.holdIn, ease: "linear" } }, // Keep expanded
        exhale: { scale: 1, transition: { duration: config.exhale, ease: "easeInOut" } },
        completed: { scale: 0, opacity: 0 }
    };

    // Text scale animations
    const textVariants = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -20 }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-between py-12 relative overflow-hidden">
            {/* Background Ambient Effect */}
            <motion.div
                animate={{
                    opacity: phase === 'idle' ? 0.3 : 0.6,
                    scale: phase === 'inhale' ? 1.2 : 1
                }}
                transition={{ duration: 4 }}
                className={`absolute inset-0 bg-gradient-to-br ${getPhaseColor()} blur-[100px] opacity-30 pointer-events-none`}
            />

            {/* Header */}
            <div className="w-full px-6 flex justify-between items-center z-10">
                <button onClick={() => router.back()} className="p-3 bg-white/10 rounded-full hover:bg-white/20 transition-colors">
                    <ArrowLeft className="w-6 h-6 text-white rtl-flip" />
                </button>
                <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full backdrop-blur-md">
                    <Wind className="w-4 h-4 text-cyan-400" />
                    <span className="text-white/90 text-sm font-medium">{t('exercises.breathing.title')}</span>
                </div>
                <div className="w-12" /> {/* Spacer */}
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col items-center justify-center relative z-10 w-full">

                {/* The Breathing Circle */}
                <div className="relative w-72 h-72 flex items-center justify-center">
                    {/* Outer Glow Rings */}
                    {[1, 2, 3].map((i) => (
                        <motion.div
                            key={i}
                            variants={circleVariants}
                            animate={phase}
                            className={`absolute inset-0 rounded-full border border-white/10 ${i === 1 ? 'border-dashed' : ''}`}
                            style={{ scale: 1 + i * 0.2 }}
                        />
                    ))}

                    {/* Main Circle */}
                    <motion.div
                        variants={circleVariants}
                        animate={phase}
                        className={`w-32 h-32 rounded-full bg-gradient-to-br ${getPhaseColor()} shadow-[0_0_50px_rgba(255,255,255,0.3)] flex items-center justify-center`}
                    >
                        {/* Inner pulse */}
                        <div className="w-full h-full rounded-full bg-white/20 animate-pulse" />
                    </motion.div>

                    {/* Central Text/Timer */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <AnimatePresence mode='wait'>
                            <motion.div
                                key={phase} // Re-animate on phase change
                                variants={textVariants}
                                initial="initial"
                                animate="animate"
                                exit="exit"
                                className="text-center"
                            >
                                <h2 className="text-4xl font-bold text-white drop-shadow-md mb-2">
                                    {getPhaseText()}
                                </h2>
                                {(isActive && phase !== 'ready') && (
                                    <p className="text-6xl font-light text-white/90 font-mono">
                                        {timeLeft}
                                    </p>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>

                {/* Instruction / Stats */}
                <div className="mt-16 text-center space-y-2">
                    {!isActive && phase === 'idle' && (
                        <p className="text-slate-400 max-w-xs mx-auto">
                            {t('exercises.breathing.guide')}
                        </p>
                    )}
                    {isActive && (
                        <p className="text-slate-400">
                            {t('exercises.breathing.stats', { cycles: cycles, time: `${Math.floor(totalTime / 60)}:${(totalTime % 60).toString().padStart(2, '0')}` })}
                        </p>
                    )}
                </div>

                {/* Controls */}
                <div className="absolute bottom-12 w-full px-6">
                    {phase === 'idle' ? (
                        <button
                            onClick={startExercise}
                            className="w-full py-5 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-3xl text-white text-xl font-bold shadow-lg shadow-cyan-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                        >
                            <Play className="w-6 h-6 fill-current" />
                            {t('common.start')}
                        </button>
                    ) : phase === 'completed' ? (
                        <div className="space-y-4">
                            <div className="bg-white/10 rounded-3xl p-6 text-center backdrop-blur-md">
                                <h3 className="text-2xl font-bold text-white mb-2">{t('exercises.breathing.greatJob')}</h3>
                                <p className="text-slate-300 mb-4">
                                    {t('exercises.breathing.summary', { time: totalTime })}
                                </p>
                                <div className="flex items-center justify-center gap-2 text-yellow-400 font-bold text-xl">
                                    <span>+{(totalTime / 10).toFixed(0)} XP</span>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => router.push('/')}
                                    className="flex-1 py-4 bg-white/10 rounded-2xl text-white font-semibold hover:bg-white/20 transition-colors"
                                >
                                    {t('common.finish')}
                                </button>
                                <button
                                    onClick={() => setPhase('idle')}
                                    className="flex-1 py-4 bg-cyan-500 rounded-2xl text-white font-semibold hover:bg-cyan-600 transition-colors flex items-center justify-center gap-2"
                                >
                                    <RotateCcw className="w-5 h-5" />
                                    {t('exercises.breathing.again')}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <button
                            onClick={stopExercise}
                            className="w-full py-4 bg-red-500/10 border border-red-500/20 rounded-3xl text-red-400 font-semibold hover:bg-red-500/20 transition-all flex items-center justify-center gap-2"
                        >
                            <X className="w-5 h-5" />
                            {t('common.finish')}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
