"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Mic, RefreshCw, Trophy, AlertCircle, CheckCircle2, ChevronRight } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { tongueTwisters } from '@/lib/data/tongueTwisters';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { useExerciseCompletion } from '@/hooks/useExerciseCompletion';
import { useConfetti } from '@/hooks/useConfetti';

const LANG_MAP: Record<string, string> = {
    tr: 'tr-TR',
    en: 'en-US',
    de: 'de-DE',
    es: 'es-ES',
    fr: 'fr-FR',
    it: 'it-IT',
    ru: 'ru-RU',
    ar: 'ar-SA',
    fa: 'fa-IR',
};

export default function TongueTwistersPage() {
    const router = useRouter();
    const { t, language } = useLanguage();

    // Logic
    const [currentTwister, setCurrentTwister] = useState("");
    const [score, setScore] = useState<number | null>(null);
    const recognitionLang = LANG_MAP[language] || 'en-US';
    const { isListening, transcript, startListening, stopListening, resetTranscript, isSupported } = useSpeechRecognition(recognitionLang);

    const { completeExercise } = useExerciseCompletion();
    const { fireConfetti, fireStars } = useConfetti();

    // Initialize random twister
    useEffect(() => {
        getNewTwister();
    }, [language]);

    const getNewTwister = () => {
        const list = tongueTwisters[language as keyof typeof tongueTwisters] || tongueTwisters['en'];
        const random = list[Math.floor(Math.random() * list.length)];
        setCurrentTwister(random);
        setScore(null);
        resetTranscript();
    };

    const handleToggle = () => {
        if (isListening) {
            stopListening();
            calculateScore();
        } else {
            resetTranscript();
            setScore(null);
            startListening();
        }
    };

    const calculateScore = () => {
        // Simple word matching algorithm
        // Note: Transcript might be slightly delayed, so we wait a tiny bit or assume it's mostly there.
        // For better UX, we could use a specialized effect or debounce, but direct calc is fine for MVP.

        setTimeout(() => {
            const targetWords = currentTwister.toLowerCase().replace(/[.,?!]/g, '').split(/\s+/);
            const userWords = transcript.toLowerCase().replace(/[.,?!]/g, '').split(/\s+/);

            let matchCount = 0;
            userWords.forEach(word => {
                if (targetWords.includes(word)) {
                    matchCount++;
                }
            });

            // Basic accuracy
            // Cap at 100
            const accuracy = Math.min(100, Math.round((matchCount / targetWords.length) * 100));
            setScore(accuracy);

            // Track completion
            if (accuracy >= 50) {
                fireConfetti();
                if (accuracy >= 90) {
                    setTimeout(fireStars, 300);
                }
                completeExercise({
                    exerciseType: 'tongue-twisters',
                    score: accuracy,
                    xpEarned: 20 + Math.floor(accuracy / 10), // Bonus for higher scores
                });
            }
        }, 500);
    };

    return (
        <div className="min-h-screen bg-background pb-safe flex flex-col">
            {/* Header */}
            <div className="w-full px-6 py-4 flex justify-between items-center bg-card border-b border-border">
                <button onClick={() => router.back()} className="p-2 hover:bg-secondary rounded-xl transition-colors">
                    <ArrowLeft className="w-5 h-5 text-foreground rtl-flip" />
                </button>
                <div className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-yellow-500" />
                    <h1 className="font-bold text-foreground">{t('exercises.twisters.title')}</h1>
                </div>
                <button onClick={getNewTwister} className="p-2 hover:bg-secondary rounded-xl transition-colors text-primary">
                    <RefreshCw className="w-5 h-5" />
                </button>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center p-6 gap-8 max-w-lg mx-auto w-full">

                {/* Twister Card */}
                <motion.div
                    key={currentTwister}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-full bg-gradient-to-br from-primary/20 to-secondary p-8 rounded-3xl border border-primary/20 text-center shadow-lg relative overflow-hidden"
                >
                    <div className="absolute top-0 left-0 w-full h-1 bg-primary/50" />
                    <p className="text-2xl md:text-3xl font-bold text-foreground leading-relaxed">
                        &quot;{currentTwister}&quot;
                    </p>
                </motion.div>

                {/* Score Display */}
                <AnimatePresence>
                    {score !== null && (
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            className={`flex flex-col items-center ${score > 70 ? 'text-green-500' : 'text-orange-500'}`}
                        >
                            <div className="text-6xl font-black mb-2">{score}%</div>
                            <span className="font-medium bg-secondary px-3 py-1 rounded-full text-sm">
                                {score > 80 ? t('exercises.twisters.feedbackExcellent') : t('exercises.twisters.feedbackPractice')}
                            </span>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Transcript (Feedback) */}
                <div className="w-full min-h-[100px] p-4 bg-secondary/50 rounded-2xl border border-border/50 text-center relative">
                    {transcript ? (
                        <p className="text-lg text-foreground">{transcript}</p>
                    ) : (
                        <p className="text-muted-foreground italic">{t('exercises.twisters.hint')}</p>
                    )}
                    {isListening && (
                        <div className="absolute top-2 right-2 flex gap-1 items-center">
                            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                            <span className="text-xs text-red-500 font-bold">{t('common.listening')}</span>
                        </div>
                    )}
                </div>

            </div>

            {/* Controls */}
            <div className="p-8 flex justify-center">
                <button
                    onClick={handleToggle}
                    disabled={!isSupported}
                    className={`
                        w-20 h-20 rounded-full flex items-center justify-center shadow-xl transition-all
                        ${isListening
                            ? 'bg-red-500 hover:bg-red-600 animate-pulse'
                            : 'bg-primary hover:bg-primary/90 hover:scale-105'
                        }
                    `}
                >
                    <Mic className={`w-8 h-8 text-white ${isListening ? 'animate-bounce' : ''}`} />
                </button>
            </div>
        </div>
    );
}
